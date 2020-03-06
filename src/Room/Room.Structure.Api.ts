import {
    UserException,
    RoomHelper_Structure,
    PRIORITY_REPAIR_THRESHOLD,
    REPAIR_THRESHOLD,
    TOWER_REPAIR_THRESHOLD,
    MemoryHelper,
    WALL_LIMIT,
    ROLE_MINER,
    MemoryApi_Room,
} from "Utils/Imports/internals";

export class RoomApi_Structure {
    /**
     * run the towers in the room for the purpose of defense
     * @param room the room we are defending
     */
    public static runTowersDefense(room: Room): void {
        const towers: StructureTower[] = MemoryApi_Room.getStructureOfType(
            room.name,
            STRUCTURE_TOWER
        ) as StructureTower[];
        // choose the most ideal target and have every tower attack it
        const idealTarget: Creep | undefined | null = RoomHelper_Structure.chooseTowerAttackTarget(room);
        if (!idealTarget) {
            room.memory.shotLastTick = false;
            return;
        }

        // Set fired to true if we have a target
        room.memory.shotLastTick = true;

        // have each tower attack this target
        towers.forEach((t: StructureTower) => {
            if (t) {
                t.attack(idealTarget);
            }
        });
    }

    /**
     * run the towers in the room for the purpose of repairing
     * @param room the room we are repairing structures in
     */
    public static runTowersRepair(room: Room): void {
        const towers: StructureTower[] = MemoryApi_Room.getStructureOfType(
            room.name,
            STRUCTURE_TOWER
        ) as StructureTower[];
        // choose the most ideal target and have every tower attack it
        const idealTarget: Structure | undefined | null = RoomHelper_Structure.chooseTowerTargetRepair(room);
        if (!idealTarget) {
            return;
        }

        // have each tower repair this target, making sure we have at least half energy remaining for an emergency
        towers.forEach((t: StructureTower) => {
            if (t && t.energy >= t.energyCapacity * 0.5) {
                t.repair(idealTarget);
            }
        });
    }

    /**
     * Check for emergecy ramparts for the tower to heal to help build mass ramparts
     * @param rampart the rampart we are targeting
     */
    public static runTowersEmergecyRampartRepair(rampart: StructureRampart): void {
        const towers: StructureTower[] = MemoryApi_Room.getStructureOfType(
            rampart.room.name,
            STRUCTURE_TOWER
        ) as StructureTower[];
        // have each tower repair this target
        towers.forEach((t: StructureTower) => {
            if (t) {
                t.repair(rampart);
            }
        });
    }

    /**
     * get repair targets for the room (any structure under config:REPAIR_THRESHOLD% hp)
     * @param room the room we are checking for repair targets
     */
    public static getRepairTargets(room: Room): Array<Structure<StructureConstant>> {
        return MemoryApi_Room.getStructures(room.name, (struct: Structure<StructureConstant>) => {
            if (struct.structureType !== STRUCTURE_RAMPART && struct.structureType !== STRUCTURE_WALL) {
                return struct.hits < struct.hitsMax * REPAIR_THRESHOLD;
            } else {
                return struct.hits < this.getWallHpLimit(room) * REPAIR_THRESHOLD;
            }
        });
    }

    /**
     * Get priority repair targets for the room (any structure under config:PRIORITY_REPAIR_THRESHOLD% hp)
     * @param room The room we are checking for repair targets
     */
    public static getPriorityRepairTargets(room: Room): Array<Structure<StructureConstant>> {
        return MemoryApi_Room.getStructures(room.name, (struct: Structure<StructureConstant>) => {
            if (struct.structureType !== STRUCTURE_RAMPART && struct.structureType !== STRUCTURE_WALL) {
                return struct.hits < struct.hitsMax * PRIORITY_REPAIR_THRESHOLD;
            } else {
                return struct.hits < this.getWallHpLimit(room) * PRIORITY_REPAIR_THRESHOLD;
            }
        });
    }

    /**
     * get spawn/extensions that need to be filled for the room
     * @param room the room we are getting spawns/extensions to be filled from
     */
    public static getLowSpawnAndExtensions(room: Room): Array<StructureSpawn | StructureExtension> {
        const extensionsNeedFilled: StructureExtension[] = MemoryApi_Room.getStructureOfType(
            room.name,
            STRUCTURE_EXTENSION,
            (e: StructureExtension) => {
                return e.energy < e.energyCapacity;
            }
        ) as StructureExtension[];

        const spawnsNeedFilled: StructureSpawn[] = (MemoryApi_Room.getStructureOfType(
            room.name,
            STRUCTURE_SPAWN,
            (e: StructureSpawn) => {
                return e.energy < e.energyCapacity;
            }
        ) as any) as StructureSpawn[];

        const extensionsAndSpawns: Array<StructureExtension | StructureSpawn> = [];
        _.forEach(extensionsNeedFilled, (ext: StructureExtension) => extensionsAndSpawns.push(ext));
        _.forEach(spawnsNeedFilled, (ext: StructureSpawn) => extensionsAndSpawns.push(ext));
        return extensionsAndSpawns;
    }

    /**
     * get towers that need to be filled for the room
     * @param room the room we are getting towers that need to be filled from
     */
    public static getTowersNeedFilled(room: Room): StructureTower[] {
        const unsortedTowerList: StructureTower[] = <StructureTower[]>MemoryApi_Room.getStructureOfType(
            room.name,
            STRUCTURE_TOWER,
            (t: StructureTower) => {
                return t.energy < t.energyCapacity * TOWER_REPAIR_THRESHOLD;
            }
        );
        // Sort by lowest to highest towers, so the most needed gets filled first
        return _.sortBy(unsortedTowerList, (tower: StructureTower) => tower.energy);
    }

    /**
     * get ramparts, or ramparts and walls that need to be repaired
     * @param room the room we are getting ramparts/walls that need to be repaired from
     */
    public static getWallRepairTargets(room: Room): Array<Structure<StructureConstant>> {
        // returns all walls and ramparts under the current wall/rampart limit
        const hpLimit: number = this.getWallHpLimit(room);
        const walls = MemoryApi_Room.getStructureOfType(
            room.name,
            STRUCTURE_WALL,
            (s: StructureWall) => s.hits < hpLimit
        );
        const ramparts = MemoryApi_Room.getStructureOfType(
            room.name,
            STRUCTURE_RAMPART,
            (s: StructureRampart) => s.hits < hpLimit
        );

        return walls.concat(ramparts);
    }

    /**
     * get a list of open sources in the room (not saturated)
     * @param room the room we are checking
     */
    public static getOpenSources(room: Room): Array<Source | null> {
        const sources = MemoryApi_Room.getSources(room.name);
        // ? this assumes that we are only using this for domestic rooms
        // ? if we use it on domestic rooms then I'll need to distinguish between ROLE_REMOTE_MINER
        const miners = MemoryHelper.getCreepOfRole(room, ROLE_MINER);
        const lowSources = _.filter(sources, (source: Source) => {
            let totalWorkParts = 0;
            // Count the number of work parts targeting the source
            _.remove(miners, (miner: Creep) => {
                if (!miner.memory.job) {
                    return false;
                }
                if (miner.memory.job!.targetID === source.id) {
                    const workPartCount = miner.getActiveBodyparts(WORK);
                    totalWorkParts += workPartCount;
                    return true;
                }
                return false;
            });

            // filter out sources where the totalWorkParts < workPartsNeeded ( energyCap / ticksToReset / energyPerPart )
            return totalWorkParts < source.energyCapacity / 300 / 2;
        });

        return lowSources;
    }

    /**
     * gets the drop container next to the source
     * @param room the room we are checking in
     * @param source the source we are considering
     */
    public static getMiningContainer(room: Room, source: Source): Structure<StructureConstant> | undefined {
        const containers: Array<Structure<StructureConstant>> = MemoryApi_Room.getStructureOfType(
            room.name,
            STRUCTURE_CONTAINER
        );

        return _.find(
            containers,
            (c: any) => Math.abs(c.pos.x - source.pos.x) <= 1 && Math.abs(c.pos.y - source.pos.y) <= 1
        );
    }

    /**
     * checks if a structure or creep store is full
     * @param target the structure or creep we are checking
     */
    public static isFull(target: StoreStructure | Creep, resource?: ResourceConstant): boolean {
        if (!resource) {
            return target.store.getFreeCapacity() === 0;
        }
        return target.store.getFreeCapacity(resource) === 0;
    }

    /**
     * get the current hp limit for walls/ramparts
     * @param room the current room
     */
    public static getWallHpLimit(room: Room): number {
        // only do so if the room has a controller otherwise we have an exception
        if (room.controller !== undefined) {
            // % of way to next level
            // If we're at rcl 8, simulate 99% controller progress for maxiumum repairage!
            const controllerProgress: number = room.controller.level < 8 ? room.controller.progress / room.controller.progressTotal : 1;
            // difference between this levels max and last levels max
            const wallLevelHpDiff: number = RoomHelper_Structure.getWallLevelDifference(room.controller.level);
            // Minimum hp chunk to increase limit
            const chunkSize: number = 10000;
            // The adjusted hp difference for controller progress and chunking
            const numOfChunks: number = Math.floor((wallLevelHpDiff * controllerProgress) / chunkSize);

            return WALL_LIMIT[room.controller.level] + chunkSize * numOfChunks;
        } else {
            throw new UserException(
                "Undefined Controller",
                "Error getting wall limit for room with undefined controller.",
                ERROR_ERROR
            );
        }
    }

    /**
     * run links for the room
     * @param room the room we want to run links for
     */
    public static runLinks(room: Room): void {
        // If we don't have an upgrader link, cancel early
        const upgraderLink: StructureLink | null = MemoryApi_Room.getUpgraderLink(room) as StructureLink | null;
        if (!upgraderLink) {
            return;
        }
        if (upgraderLink.energy > 400) {
            return;
        }

        // Get non-upgrader links above 100 energy to fill the upgrader link
        const nonUpgraderLinks: StructureLink[] = MemoryApi_Room.getStructureOfType(
            room.name,
            STRUCTURE_LINK,
            (link: StructureLink) => link.id !== upgraderLink.id && link.energy >= 100
        ) as StructureLink[];
        for (const link of nonUpgraderLinks) {
            if (link.cooldown > 0) {
                continue;
            }

            // Get the amount of energy we are sending over
            const missingEnergy: number = upgraderLink.energyCapacity - upgraderLink.energy;
            let amountToTransfer: number = 0;
            if (missingEnergy > link.energy) {
                amountToTransfer = link.energy;
            } else {
                amountToTransfer = missingEnergy;
            }

            link.transferEnergy(upgraderLink, amountToTransfer);
        }
    }

    /**
     * run terminal for the room
     * @param room the room we want to run terminal for
     */
    public static runTerminal(room: Room): void {
        // here we can do market stuff, send resources from room to room
        // to each other, and make sure we have the ideal ratio of minerals
        // we decide that we want
    }

    /**
     * run labs for the room
     * @param room the room we want to run labs for
     */
    public static runLabs(room: Room): void {
        // i have no idea yet lol
    }

    /**
     * get the rampart the defender should stand on when defending the room
     * @param room the room we are looking for the rampart in
     * @param target the target creep we are defending against
     */
    public static getDefenseRampart(room: Room, target: Creep | null): StructureRampart | null {
        if (!target) {
            return null;
        }
        const rampartsInRoom: StructureRampart[] = MemoryApi_Room.getStructureOfType(
            room.name,
            STRUCTURE_RAMPART
        ) as StructureRampart[];
        const openRamparts: StructureRampart[] = _.filter(rampartsInRoom, (rampart: StructureRampart) => {
            const foundCreeps: Creep[] = rampart.pos.lookFor(LOOK_CREEPS);
            const foundStructures: Array<Structure<StructureConstant>> = rampart.pos.lookFor(LOOK_STRUCTURES);
            return !foundCreeps && !foundStructures;
        });
        return target!.pos.findClosestByRange(openRamparts);
    }
}
