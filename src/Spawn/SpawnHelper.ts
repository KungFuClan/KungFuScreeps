import {
    ROLE_COLONIZER,
    ROLE_HARVESTER,
    ROLE_REMOTE_MINER,
    ROLE_REMOTE_HARVESTER,
    ROLE_REMOTE_RESERVER,
    ROLE_CLAIMER,
    ERROR_WARN,
    UserException,
    ALL_MILITARY_ROLES,
    RESERVER_MIN_TTL,
    ROOM_STATE_INTRO,
    NUM_LIFESPANS_FOR_EXTRA_CREEP,
    MAX_WORKERS_UPGRADER_STATE,
    WALL_LIMIT,
    SCOUT_SPAWN_TICKS,
    MemoryApi_Room,
    MemoryApi_Creep,
    RoomHelper_Structure,
    RoomHelper_State,
} from "Utils/Imports/internals";
import _ from "lodash";

/**
 * Functions to help keep Spawn.Api clean go here
 */
export class SpawnHelper {
    /**
     * Returns a boolean indicating if the object is a valid creepBody descriptor
     * @param bodyObject The description of the creep body to verify
     */
    public static verifyDescriptor(bodyObject: CreepBodyDescriptor): boolean {
        const partNames = Object.keys(bodyObject);
        let valid: boolean = true;
        // Check that no body parts have a definition of 0 or negative
        for (const part in partNames) {
            if (bodyObject[part] <= 0) {
                valid = false;
            }
            if (!(part in BODYPARTS_ALL)) {
                valid = false;
            }
        }
        return valid;
    }

    /**
     * Helper function - Returns an array containing @numParts of @part
     * @part The part to create
     * @numParts The number of parts to create
     */
    public static generateParts(part: BodyPartConstant, numParts: number): BodyPartConstant[] {
        const returnArray: BodyPartConstant[] = [];
        for (let i = 0; i < numParts; i++) {
            returnArray.push(part);
        }
        return returnArray;
    }

    /**
     * Groups the body parts -- e.g. WORK, WORK, CARRY, CARRY, MOVE, MOVE
     * @param descriptor A StringMap of creepbody limits -- { MOVE: 3, CARRY: 2, ... }
     */
    public static getBody_Grouped(descriptor: CreepBodyDescriptor): BodyPartConstant[] {
        const creepBody: BodyPartConstant[] = [];
        _.forEach(Object.keys(descriptor), (part: BodyPartConstant) => {
            // Having ! after property removes 'null' and 'undefined'
            for (let i = 0; i < descriptor[part]!; i++) {
                creepBody.push(part);
            }
        });
        return creepBody;
    }

    /**
     * Collates the body parts -- e.g. WORK, CARRY, MOVE, WORK, CARRY, ...
     * @param descriptor A StringMap of creepbody limits -- { MOVE: 3, CARRY: 2, ... }
     */
    public static getBody_Collated(descriptor: CreepBodyDescriptor): BodyPartConstant[] {
        const returnParts: BodyPartConstant[] = [];
        const numParts: number = _.sum(_.values(descriptor));
        const partNames = <BodyPartConstant[]>Object.keys(descriptor);

        let i = 0;
        while (i < numParts) {
            for (let j = 0; j < partNames.length; j++) {
                const currPart: BodyPartConstant = partNames[j];
                if (descriptor[currPart]! >= 1) {
                    returnParts.push(currPart);
                    descriptor[currPart]!--;
                    i++;
                }
            }
        }
        return returnParts;
    }

    /**
     * Generates a creep name in the format role_tier_uniqueID
     * @param role The role of the creep being generated
     * @param tier The tier of the creep being generated
     */
    public static generateCreepName(role: RoleConstant, tier: TierConstant, room: Room): string {
        const modifier: string = Game.time.toString().slice(-4);
        const name = role + "_" + tier + "_" + room.name + "_" + modifier + "_" + Math.trunc(Math.random() * 99);
        return name;
    }

    /**
     * returns a set of creep options with all default values
     */
    public static getDefaultCreepOptionsCiv(): CreepOptionsCiv {
        return {};
    }

    /**
     * returns set of mili creep options with all default values
     */
    public static getDefaultCreepOptionsMili(): CreepOptionsMili {
        return {
            squadUUID: null,
            operationUUID: null,
            caravanPos: null
        };
    }

    /**
     * generates a creep memory to give to a creep being spawned
     */
    public static generateDefaultCreepMemory(
        roleConst: RoleConstant,
        homeRoomNameParam: string,
        targetRoomParam: string,
        creepOptions: CreepOptionsCiv | CreepOptionsMili
    ): CreepMemory {
        return {
            role: roleConst,
            homeRoom: homeRoomNameParam,
            targetRoom: targetRoomParam,
            job: undefined,
            options: creepOptions,
            working: false
        };
    }

    /**
     * get if the creep is a military type creep or not
     * @param roleConst the role of the creep
     */
    public static isMilitaryRole(roleConst: RoleConstant): boolean {
        for (const role in ALL_MILITARY_ROLES) {
            if (roleConst === ALL_MILITARY_ROLES[role]) {
                return true;
            }
        }
        return false;
    }

    /**
     * gets the ClaimRoomMemory with lowest number creeps of the specified role with it as their target room
     * Must also be less than the max amount of that role allowed for the room
     * @param room the room spawning the creep
     * @param roleConst the specified role we are checking for
     * @param creepBody the body of the creep we are checking, so we know who to exclude from creep count
     */
    public static getLowestNumRoleAssignedClaimRoom(
        room: Room,
        roleConst: RoleConstant,
        creepBody: BodyPartConstant[]
    ): ClaimRoomMemory | undefined {
        const allClaimRooms: Array<ClaimRoomMemory | undefined> = MemoryApi_Room.getClaimRooms(room);
        const tickLimit: number = creepBody.length * 3;
        // Get all claim rooms in which the specified role does not yet have
        const unfulfilledClaimRooms: Array<ClaimRoomMemory | undefined> = _.filter(
            allClaimRooms,
            claimRoom =>
                this.getNumCreepAssignedAsTargetRoom(room, roleConst, claimRoom, tickLimit) <
                this.getLimitPerClaimRoomForRole(roleConst)
        );

        let nextClaimRoom: ClaimRoomMemory | undefined;

        // Find the unfulfilled with the lowest amount of creeps assigned to it
        for (const claimRoom of unfulfilledClaimRooms) {
            if (!nextClaimRoom) {
                nextClaimRoom = claimRoom;
                continue;
            }

            const lowestCreepsAssigned = this.getNumCreepAssignedAsTargetRoom(
                room,
                roleConst,
                nextClaimRoom,
                tickLimit
            );
            const currentCreepsAssigned = this.getNumCreepAssignedAsTargetRoom(room, roleConst, claimRoom, tickLimit);

            if (currentCreepsAssigned < lowestCreepsAssigned) {
                nextClaimRoom = claimRoom;
            }
        }

        return nextClaimRoom;
    }

    /**
     * gets the RemoteRoomMemory with lowest number creeps of the specified role with it as their target room
     * @param room the room spawning the creep
     * @param roleConst the specified role we are checking for
     * @param creepBody the creep body so we know what creeps to exclude from rolecall
     */
    public static getLowestNumRoleAssignedRemoteRoom(
        room: Room,
        roleConst: RoleConstant,
        creepBody: BodyPartConstant[]
    ): RemoteRoomMemory | undefined {
        const allRemoteRooms: Array<RemoteRoomMemory | undefined> = MemoryApi_Room.getRemoteRooms(room);
        const tickLimit = creepBody.length * 3;
        // Get all claim rooms in which the specified role does not yet have
        const unfulfilledRemoteRooms: Array<RemoteRoomMemory | undefined> = _.filter(allRemoteRooms, remoteRoom => {
            const numSources: number =
                !Memory.rooms[remoteRoom!.roomName] || !Memory.rooms[remoteRoom!.roomName].sources.data
                    ? 1
                    : Memory.rooms[remoteRoom!.roomName].sources.data.length;
            return (
                this.getNumCreepAssignedAsTargetRoom(room, roleConst, remoteRoom, tickLimit) <
                this.getLimitPerRemoteRoomForRolePerSource(roleConst, numSources)
            );
        });

        let nextRemoteRoom: RemoteRoomMemory | undefined;
        let lowestCreepsAssigned = Number.MAX_VALUE;
        // Find the unfulfilled with the lowest amount of creeps assigned to it
        for (const remoteRoom of unfulfilledRemoteRooms) {
            if (remoteRoom && !nextRemoteRoom) {
                nextRemoteRoom = remoteRoom;
                continue;
            }

            const currentCreepsAssigned = this.getNumCreepAssignedAsTargetRoom(room, roleConst, remoteRoom, tickLimit);

            if (currentCreepsAssigned < lowestCreepsAssigned) {
                nextRemoteRoom = remoteRoom;
                lowestCreepsAssigned = currentCreepsAssigned;
            }
        }

        return nextRemoteRoom;
    }

    /**
     * get number of creeps of role with target room assigned to a specified room
     * @param room the room spawning the creep
     * @param roleConst the role of the creep
     * @param roomMemory the room memory we are checking
     * @param ticksToLiveLimit the limit in ticks that the new creep will be spawned in the old creeps place
     */
    public static getNumCreepAssignedAsTargetRoom(
        room: Room,
        roleConst: RoleConstant,
        roomMemory: ClaimRoomMemory | RemoteRoomMemory | undefined,
        ticksToLiveLimit: number
    ): number {
        // Get all creeps above the ticks to live limit with the specified role
        const allCreepsOfRole: Array<Creep | null> = MemoryApi_Creep.getMyCreeps(
            room.name,
            creep =>
                creep.memory.role === roleConst && (creep.ticksToLive ? creep.ticksToLive : 1600) > ticksToLiveLimit
            // Find the creep w/ ticks to live higher than the limit (1600 if no ticks to live ie a spawning creep to ensure they're counted)
        );
        let sum = 0;

        for (const creep of allCreepsOfRole) {
            if (creep!.memory.targetRoom === roomMemory!.roomName) {
                ++sum;
            }
        }

        return sum;
    }

    /**
     * gets the number of each claim room creep that is meant to be assigned to a room
     * @param roleConst the role we are checking the limit for
     */
    public static getLimitPerClaimRoomForRole(roleConst: RoleConstant): number {
        let creepNum: number = 0;

        switch (roleConst) {
            case ROLE_CLAIMER:
                creepNum = 1;
                break;
            case ROLE_COLONIZER:
                creepNum = 2;
                break;
        }

        return creepNum;
    }

    /**
     * gets the number of each remote room creep that is meant to be assigned to a room
     * @param roleConst the role we are checking the limit for
     * @param numSources the number of sources in the remote room
     */
    public static getLimitPerRemoteRoomForRolePerSource(roleConst: RoleConstant, numSources: number): number {
        let creepNum: number = 0;

        switch (roleConst) {
            case ROLE_REMOTE_HARVESTER:
                creepNum = Math.ceil(1.5 * numSources);
                break;
            case ROLE_REMOTE_MINER:
                creepNum = 1 * numSources;
                break;
        }

        return creepNum;
    }

    /**
     * gets the number of lorries for the room based on room state
     * @param room the room we are doing limits for
     * @param roomState the room state of the room we are checking limit for
     */
    public static getLorryLimitForRoom(room: Room, roomState: RoomStateConstant) {
        return 0;
    }

    /**
     * get the number of accesssible tiles for the sources in a room
     * @param room the room we are checking for
     */
    public static getNumAccessTilesToSources(room: Room): number {
        const sources: Source[] = MemoryApi_Room.getSources(room.name);
        let accessibleTiles: number = 0;
        const roomTerrain: RoomTerrain = new Room.Terrain(room.name);
        _.forEach(sources, (source: Source) => {
            accessibleTiles += RoomHelper_Structure.getNumAccessTilesForTarget(source);
        });
        return accessibleTiles;
    }

    /**
     * get the number of remote rooms that need a reserver
     * @param room the room we are checking the remote rooms for
     */
    public static getRemoteReserverLimitForRoom(room: Room): number {
        const remoteRooms: Array<RemoteRoomMemory | undefined> = MemoryApi_Room.getRemoteRooms(room);
        let numReserversNeeded: number = 0;
        for (const remoteRoom of remoteRooms) {
            // Handle undefined rooms
            if (!remoteRoom) {
                continue;
            }

            // Don't consider these sources valid if the controller is reserved by an enemy, or theres defcon 2 >=
            if (Memory.rooms[remoteRoom.roomName] && Memory.rooms[remoteRoom.roomName].defcon >= 2) {
                continue;
            }

            // We have to make sure the limit remains for an existing reserver as well
            if (this.reserverExistsForRoomCurrently(room, remoteRoom)) {
                numReserversNeeded++;
            }
            else if (remoteRoom.reserveTTL <= RESERVER_MIN_TTL || this.isRemoteRoomEnemyReserved(remoteRoom)) {
                numReserversNeeded++;
            }
        }

        return numReserversNeeded;
    }

    /**
     * Check if there is a reserver for this remote room already
     * @param room the room doing the spawning
     * @param remoteRoom the remote room we are checking for
     * @returns the bool result on if there is a remote reserver set to this room arleady
     */
    public static reserverExistsForRoomCurrently(room: Room, remoteRoom: RemoteRoomMemory): boolean {
        const creepsInRemoteRoom: Creep[] = MemoryApi_Creep.getMyCreeps(room.name,
            (c: Creep) => c.memory.role === ROLE_REMOTE_RESERVER
                && c.memory.targetRoom === remoteRoom.roomName);
        return creepsInRemoteRoom.length > 0;
    }

    /**
     * normalize the number of work parts a power upgrader can have to make sure we don't go past the energy available
     * @param usedEnergy the energy we are already using
     * @param numWorkParts the number of work parts we want
     * @param energyAvailable the amount of energy we are limited to
     * @returns the number of work parts it can have
     */
    public static limitNumWorkParts(numWorkParts: number, usedEnergy: number, energyAvailable: number): number {
        const workPartsAllowed: number = Math.floor((energyAvailable - usedEnergy) / BODYPART_COST[WORK]);
        return numWorkParts > workPartsAllowed ? workPartsAllowed : numWorkParts;
    }

    /**
     * Gets the status of a remote room's controller in respect to it being reserved by an invader
     * @param remoteRoom the remote room memory of the room we are checking
     */
    public static isRemoteRoomEnemyReserved(remoteRoom: RemoteRoomMemory): boolean {
        // If we don't have vision of the room, just assume we need a reserver for the lulz
        const room: Room = Game.rooms[remoteRoom.roomName];
        if (!room) {
            return true;
        }
        if (RoomHelper_State.isNoReservation(room)) {
            return false;
        }
        return !RoomHelper_State.isAllyReserved(room);
    }

    /**
     * get a remote room that needs a remote reserver
     */
    public static getRemoteRoomNeedingRemoteReserver(room: Room): RemoteRoomMemory | undefined {
        const reserversInRoom: Creep[] = MemoryApi_Creep.getMyCreeps(room.name, (c: Creep) => c.memory.role === ROLE_REMOTE_RESERVER);
        const remoteRooms: RemoteRoomMemory[] = MemoryApi_Room.getRemoteRooms(room, (rr: RemoteRoomMemory) => rr.reserveTTL < RESERVER_MIN_TTL || this.isRemoteRoomEnemyReserved(rr));
        return _.min(remoteRooms, (rr: RemoteRoomMemory) => _.sum(reserversInRoom, (c: Creep) => {
            if (c.memory.targetRoom === rr.roomName) {
                return 1;
            } else {
                return 0;
            }
        }));
    }

    /**
     * check if we need a harvester as the highest priority
     * @param room the room we are in
     * @returns boolean that represents if we need a harvester as priority
     */
    public static needPriorityHarvester(room: Room): boolean {
        if (
            room.memory.creepLimit !== undefined &&
            room.memory.creepLimit.domesticLimits !== undefined &&
            room.memory.creepLimit.domesticLimits.harvester === 1 &&
            room.memory.roomState !== undefined &&
            room.memory.roomState > ROOM_STATE_INTRO // Never a priority in intro state
        ) {
            const harvester: Creep | undefined = _.find(
                MemoryApi_Creep.getMyCreeps(room.name, (c: Creep) => c.memory.role === ROLE_HARVESTER)
            );

            // If theres no harvester, and we are outside of ROOM_STATE_INTRO, we need one
            if (!harvester) {
                return true;
            }
            return false;
        }
        return false;
    }

    /**
     * Decides if we need an extra worker based on the state of ramparts in the room
     * @param room the room we are checking for
     * @returns bool representing if we need the extra worker or not
     */
    public static needExtraWorkerUpgrader(room: Room, numWorkParts: number): boolean {
        if (!room.controller) {
            return false;
        }

        // Each work part repairs 100, assumes they'll be repairing for 90% of their lifespan. Precision isn't important
        const creepRepairPerLife: number = (numWorkParts * 100 * 1500) * .90;
        const ramparts: StructureRampart[] = MemoryApi_Room.getStructureOfType(room.name, STRUCTURE_RAMPART) as StructureRampart[];
        const totalRampartHits: number = _.sum(ramparts, (r: StructureRampart) => r.hits);
        const maxRampartHits: number = WALL_LIMIT[room.controller.level] * ramparts.length;
        const neededLifetimes: number = Math.ceil((maxRampartHits - totalRampartHits) / creepRepairPerLife);

        // Break early if we're over the max hits already
        if ((maxRampartHits - totalRampartHits) <= 0) {
            return false;
        }

        // Only need an extra worker if the number of lifetimes for a single worker to get the ramparts to the limit
        // is greater than the set config value
        return neededLifetimes >= NUM_LIFESPANS_FOR_EXTRA_CREEP;
    }

    /**
     * Get the limit of workers in the room
     * This accounts specifically for construction sites in the room
     * @param currentWorkers the number of workers currently in the room
     * @param room the room we are checking for
     */
    public static getWorkerLimitForConstructionHelper(currentWorkers: number, room: Room): number {
        const constructionSitesInRoom: ConstructionSite[] = _.filter(Game.constructionSites, (s: ConstructionSite) => s.room && s.room.name === room.name);
        const hitsNeededToBuild: number = _.sum(constructionSitesInRoom, (s: ConstructionSite) => s.progressTotal - s.progress);
        // Spawn 1 extra worker
        const numNewWorkers: number = Math.floor(hitsNeededToBuild / 15000);
        return (currentWorkers + numNewWorkers) <= MAX_WORKERS_UPGRADER_STATE ? currentWorkers + numNewWorkers : MAX_WORKERS_UPGRADER_STATE;
    }

    /**
     * Get the spawn limit for scouts
     * @param room the room we are in
     */
    public static getScoutSpawnLimit(room: Room): number {
        // Returns -1 if one has never been spawned, so check for that case as well in the if
        const lastTickScoutSpawned: number = MemoryApi_Room.getLastTickScoutSpawned(room);
        const differenceCheck: number = Game.time - lastTickScoutSpawned
        return (differenceCheck > SCOUT_SPAWN_TICKS || lastTickScoutSpawned === -1) ? 1 : 0;
    }

    /**
     * Get the number of mineral miners we want in the room
     * @param room the room we are in
     */
    public static getMineralMinerSpawnLimit(room: Room): number {
        const extractors: StructureExtractor[] = MemoryApi_Room.getStructureOfType(room.name, STRUCTURE_EXTRACTOR) as StructureExtractor[];
        return extractors.length;
    }

    /**
     * Get the number of additional harvesters we need for the room
     * These handle things like mineral mining or extra spawn pressure
     * @param room the room we are operating from
     */
    public static getNumExtraHarvesters(room: Room): number {
        // check for mining container, early return if not
        // return amount in mining container < 1500
    }
}
