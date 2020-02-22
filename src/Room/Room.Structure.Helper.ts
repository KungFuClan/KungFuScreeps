import {
    WALL_LIMIT,
    ERROR_WARN,
    UserException,
    CreepAllHelper,
    TOWER_MIN_DAMAGE_THRESHOLD,
    TOWER_MAX_DAMAGE_THRESHOLD,
    MemoryApi_Room,
    MemoryApi_Creep,
    MemoryApi_Jobs,
    TOWER_ALLOWED_TO_REPAIR,
    militaryDataHelper,
    ERROR_ERROR,
} from "Utils/Imports/internals";

export class RoomHelper_Structure {

    /**
     * check if the object exists within a room
     * @param room the room we want to check
     * @param objectConst the object we want to check for
     */
    public static isExistInRoom(room: Room, objectConst: StructureConstant): boolean {
        return MemoryApi_Room.getStructures(room.name, s => s.structureType === objectConst).length > 0;
    }

    /**
     * get the stored amount from the target
     * @param target the target we want to check the storage of
     * @param resourceType the resource we want to check the storage for
     */
    public static getStoredAmount(target: any, resourceType: ResourceConstant): number | undefined {
        if (target instanceof Creep) {
            return target.store[resourceType];
        } else if (target.hasOwnProperty("store")) {
            return target.store[resourceType];
        } else if (resourceType === RESOURCE_ENERGY && target.hasOwnProperty("energy")) {
            return target.energy;
        }
        // Throw an error to identify when this fail condition is met
        throw new UserException(
            "Failed to getStoredAmount of a target",
            "ID: " + target.id + "\n" + JSON.stringify(target),
            ERROR_ERROR
        );
    }

    /**
     * get the capacity from the target
     * @param target the target we want to check the capacity of
     */
    public static getStoredCapacity(target: any): number {
        if (target instanceof Creep) {
            return target.store.getCapacity();
        } else if (target.hasOwnProperty("store")) {
            return target.storeCapacity;
        } else if (target.hasOwnProperty("energyCapacity")) {
            return target.energyCapacity;
        }

        return -1;
    }

    /**
     * Calculate the tower scale (portion of damage/heal/repair) at the range to target
     * @param distance The number of tiles away the target is
     */
    public static getTowerRangeScaleFactor(distance: number): number {
        if (distance <= TOWER_OPTIMAL_RANGE) {
            return 1;
        }

        if (distance >= TOWER_FALLOFF_RANGE) {
            return 1 - TOWER_FALLOFF;
        }

        // Falloff is linear between optimal range and maximum range
        const scaleDifferencePerTile = TOWER_FALLOFF / (TOWER_FALLOFF_RANGE - TOWER_OPTIMAL_RANGE);

        // Fall off does not start until after optimal range
        return 1 - (distance - TOWER_OPTIMAL_RANGE) * scaleDifferencePerTile;
    }

    /**
     * Get the amount of damage a tower will do at this distance
     * @param distance The number of tiles away the target is
     * @param healParts [Optional] The number of heal parts to calculate against
     * @param rangedHeal [Optional] Whether or not to use rangedHeal calculation instead of direct heal
     */
    public static getTowerDamageAtRange(distance: number, healParts = 0, rangedHeal = false) {
        // Base Calculation for tower damage
        const attackPower = Math.floor(TOWER_POWER_ATTACK * this.getTowerRangeScaleFactor(distance));

        if (healParts < 0) {
            throw new UserException(
                "Incorrect Arguments for getTowerDamageAtRange",
                "Attempted to pass a negative number of heal parts to function.",
                ERROR_WARN
            );
        }

        let healPower: number;

        if (rangedHeal) {
            healPower = healParts * RANGED_HEAL_POWER;
        } else {
            // direct/melee heal
            healPower = healParts * HEAL_POWER;
        }

        return attackPower - healPower;
    }

    /**
     * Get the amount of damage a tower will heal at this distance
     * @param distance The number of tiles away the target is
     */
    public static getTowerHealAtRange(distance: number) {
        return Math.floor(TOWER_POWER_HEAL * this.getTowerRangeScaleFactor(distance));
    }

    /**
     * Get the amount of damage a tower will repair at this distance
     * @param distance The number of tiles away the target is
     */
    public static getTowerRepairAtRange(distance: number) {
        return Math.floor(TOWER_POWER_REPAIR * this.getTowerRangeScaleFactor(distance));
    }

    /**
     * only returns true every ${parameter} number of ticks
     * @param ticks the number of ticks you want between executions
     */
    public static excecuteEveryTicks(ticks: number): boolean {
        return Game.time % ticks === 0;
    }

    /**
     *
     * @param room The room to find the target for
     */
    public static chooseTowerAttackTarget(room: Room): Creep | null {
        // All hostiles
        const hostileCreeps = MemoryApi_Creep.getHostileCreeps(room.name);

        // Quit early if no creeps
        if (hostileCreeps.length === 0) {
            return null;
        }

        // Take out creeps with heal parts
        const healCreeps = _.remove(hostileCreeps, (c: Creep) => CreepAllHelper.bodyPartExists(c, HEAL));

        // Take out creeps that can attack
        const attackCreeps = _.remove(hostileCreeps, (c: Creep) =>
            CreepAllHelper.bodyPartExists(c, ATTACK, RANGED_ATTACK)
        );

        // rename for clarity, all creeps leftover should be civilian
        // TODO Make a case for work part / claim part creeps?
        const civilianCreeps = hostileCreeps;

        // All towers in the room
        // const towers = MemoryApi_Room.getStructureOfType(room.name, STRUCTURE_TOWER, (tower: StructureTower) => tower.store[RESOURCE_ENERGY] > 0);
        const towers = MemoryApi_Room.getStructureOfType(
            room.name,
            STRUCTURE_TOWER,
            (tower: StructureTower) => tower.energy > 0
        ) as StructureTower[];

        if (healCreeps.length === 0) {
            return this.getBestTowerAttackTarget_NoHeal(towers, attackCreeps);
        }

        if (attackCreeps.length > 0) {
            // Target using heal creeps and attack creeps, ignore civilian creeps
            return this.getBestTowerAttackTarget_IncludeHeal(towers, healCreeps, attackCreeps);
        }

        // Target Heal creeps and civilian creeps if there are no attack creeps
        return this.getBestTowerAttackTarget_IncludeHeal(towers, healCreeps, civilianCreeps);
    }

    /**
     * Get the best target for towers, not considering heal parts
     * @param hostiles Array of hostile creeps
     * @param towers Array of friendly towers
     */
    public static getBestTowerAttackTarget_NoHeal(towers: StructureTower[], hostiles: Creep[]): Creep | null {
        let bestTarget: Creep | null = null;
        let bestDamage: number = 0;

        _.forEach(hostiles, (c: Creep) => {

            let damage = 0;

            _.forEach(towers, (tower: StructureTower) => {
                damage += this.getTowerDamageAtRange(tower.pos.getRangeTo(c));
            });

            if (damage > bestDamage) {
                bestTarget = c;
                bestDamage = damage;
            }
        });

        if (
            (bestDamage >= TOWER_MIN_DAMAGE_THRESHOLD && towers[0].room.memory.shotLastTick === true) ||
            bestDamage >= TOWER_MAX_DAMAGE_THRESHOLD
        ) {
            return bestTarget;
        } else {
            return null;
        }
    }

    /**
     * Get the best target for towers, taking their ability to heal into account
     * @param healHostiles Array of hostile creeps that can heal
     * @param otherHostiles Array of hostile creeps that can't heal
     * @param towers Array of friendly towers
     */
    public static getBestTowerAttackTarget_IncludeHeal(
        towers: StructureTower[],
        healHostiles: Creep[],
        otherHostiles?: Creep[]
    ): Creep | null {
        // Get the amount of healing each creep can receive
        const creepHealData: Array<{ creep: Creep; healAmount: number }> = this.getCreepsAvailableHealing(
            healHostiles,
            otherHostiles
        );

        // TODO Maybe make it consider the creep with
        // Get best creep (least ability to heal)
        // TODO add a situation to handle equal heal amounts, to break the tie
        let bestTarget = null;
        let bestDamage = 0;

        for (const data of creepHealData) {
            let damage = 0;

            _.forEach(towers, (tower: StructureTower) => {
                damage += this.getTowerDamageAtRange(tower.pos.getRangeTo(data.creep));
            });

            // Get damage after all possible healing has been applied
            const netDamage = damage - data.healAmount;

            // If this is better than our last target, choose it
            if (bestDamage < netDamage) {
                bestTarget = data.creep;
                bestDamage = netDamage;
            }
        }

        // If we shot last tick, netDamage >= min damage, else netDamage >= max damage
        if (
            (bestDamage >= TOWER_MIN_DAMAGE_THRESHOLD && towers[0].room.memory.shotLastTick === true) ||
            bestDamage >= TOWER_MAX_DAMAGE_THRESHOLD
        ) {
            return bestTarget;
        } else {
            return null;
        }
    }

    public static getCreepsAvailableHealing(
        healCreeps: Creep[],
        otherCreeps?: Creep[]
    ): Array<{ creep: Creep; healAmount: number }> {

        const hostiles: Creep[] = otherCreeps === undefined ? healCreeps : healCreeps.concat(otherCreeps);

        // Get all healers ability to heal adjusted for boosts
        const healersAdjustedPower: Array<{ creep: Creep, heal: number, rangedHeal: number }> = [];
        for (const healer of healCreeps) {
            const healerData = militaryDataHelper.getCreepAdjustedHeal(healer);
            healersAdjustedPower.push({ creep: healer, heal: healerData.heal, rangedHeal: healerData.rangedHeal });
        }

        // Get the maximum amount each creep could be healed for in a worst-case scenario
        const creepHealData: Array<{ creep: Creep; healAmount: number }> = [];
        for (const creep of hostiles) {

            let healAmount = 0;

            for (const data of healersAdjustedPower) {
                const distanceToCreep = creep.pos.getRangeTo(data.creep);
                const currentHealerAmount = distanceToCreep <= 1 ? data.heal : distanceToCreep <= 3 ? data.rangedHeal : 0;
                healAmount += currentHealerAmount;
            }

            creepHealData.push({ creep, healAmount });
        }

        return creepHealData;
    }

    /**
     * Search for the ideal repair target for the tower
     * @param room the room we are searching for repair targets in
     */
    public static chooseTowerTargetRepair(room: Room): Structure | undefined | null {
        // Check for non-priority repair jobs of an allowed type
        const repairJobs = MemoryApi_Jobs.getRepairJobs(
            room,
            (j: WorkPartJob) => j.targetType === STRUCTURE_CONTAINER || j.targetType === STRUCTURE_ROAD
        );

        if (repairJobs.length > 0) {
            return Game.getObjectById(repairJobs[0].targetID) as Structure;
        }

        return undefined;
    }

    /**
     * Decide if a structure type is allowed for the tower to repair
     * @param target the target we are checking for
     */
    public static isTowerAllowedToRepair(structureType: StructureConstant): boolean {
        for (const i in TOWER_ALLOWED_TO_REPAIR) {
            const currentStructureType = TOWER_ALLOWED_TO_REPAIR[i];
            if (currentStructureType === structureType) {
                return true;
            }
        }
        return false;
    }

    /**
     * Gets the average distance from the array of objects to a target
     * @param fromPoints An array of objects that have a pos property
     * @param target An object with a pos property
     */
    public static getAverageDistanceToTarget(fromPoints: _HasRoomPosition[], target: _HasRoomPosition) {
        const totalDistance = _.sum(fromPoints, (point: _HasRoomPosition) => point.pos.getRangeTo(target.pos));
        return totalDistance / fromPoints.length;
    }

    // Get the number of non-terrain-wall tiles around a RoomObject
    public static getNumAccessTilesForTarget(target: RoomObject): number {
        let accessibleTiles = 0;
        const roomTerrain: RoomTerrain = new Room.Terrain(target.pos.roomName);
        for (let y = target.pos.y - 1; y <= target.pos.y + 1; y++) {
            for (let x = target.pos.x - 1; x <= target.pos.x + 1; x++) {
                if (target.pos.x === x && target.pos.y === y) {
                    continue;
                }
                if (roomTerrain.get(x, y) !== TERRAIN_MASK_WALL) {
                    accessibleTiles++;
                }
            }
        }
        return accessibleTiles;
    }

    /**
     * Get the difference in Wall/Rampart HP between the current and previous RCL
     * @param controllerLevel the level of the controller in the room
     */
    public static getWallLevelDifference(controllerLevel: number): number {
        return WALL_LIMIT[controllerLevel] - WALL_LIMIT[controllerLevel - 1];
    }

    /**
     * Gets the total storage level for the room (terminal + storage)
     * @param room the room we are checking in
     * @returns number representing amount of energy in the room's store
     */
    public static getStorageLevel(room: Room): number {
        const storage: StructureStorage | undefined = room.storage;
        const terminal: StructureTerminal | undefined = room.terminal;
        let storageLevels: number = 0;

        if (storage) {
            storageLevels += storage.store[RESOURCE_ENERGY];
        }
        if (terminal) {
            storageLevels += terminal.store[RESOURCE_ENERGY];
        }
        return storageLevels;
    }
}
