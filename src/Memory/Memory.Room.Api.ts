import {
    MemoryHelper,
    UserException,
    MemoryApi_All,
    NO_CACHING_MEMORY,
    STRUCT_CACHE_TTL,
    ERROR_WARN,
    ROOM_STATE_INTRO,
    MemoryHelper_Room,
    CONSTR_CACHE_TTL,
    TOMBSTONE_CACHE_TTL,
    RUINS_CACHE_TTL,
    DROPS_CACHE_TTL,
    SOURCE_CACHE_TTL,
    MINERAL_CACHE_TTL,
    MemoryApi_Creep,
    MemoryApi_Jobs,
    MemoryApi_Empire,
    RoomHelper_State,
    Normalize
} from "Utils/Imports/internals";
import _ from "lodash";

export class MemoryApi_Room {
    /**
     * update the room state for the room
     * @param room the room we are updating the room state for
     * @param roomState the new room state we are saving
     */
    public static updateRoomState(roomState: RoomStateConstant, room: Room): void {
        room.memory.roomState = roomState;
    }

    /**
     * get the upgrader link for the room
     * @param room the room memory we are getting the upgrader link from
     */
    public static getUpgraderLink(room: Room): Structure<StructureConstant> | null {
        // Throw warning if we do not own this room
        if (!RoomHelper_State.isMyRoom(room)) {
            throw new UserException(
                "Stimulate flag check on non-owned room",
                "You attempted to check for a stimulate flag in a room we do not own. Room [" + room.name + "]",
                ERROR_WARN
            );
        }

        const links: Array<Structure<StructureConstant>> = MemoryApi_Room.getStructureOfType(room.name, STRUCTURE_LINK);
        const controller: StructureController | undefined = room.controller;

        // Break early if we don't have 3 links yet
        if (links.length < 2) {
            return null;
        }

        // Make sure theres a controller in the room
        if (!controller) {
            throw new UserException(
                "Tried to getUpgraderLink of a room with no controller",
                "Get Upgrader Link was called for room [" +
                    room.name +
                    "]" +
                    ", but theres no controller in this room.",
                ERROR_WARN
            );
        }

        // Find the closest link to the controller, this is our upgrader link
        const closestLink: Structure<StructureConstant> | null = controller!.pos.findClosestByRange(links) as Structure<
            StructureConstant
        >;
        return controller.pos.inRangeTo(closestLink.pos.x, closestLink.pos.y, 3) ? closestLink : null;
    }

    /**
     * update the upgrader link for the room
     * @param room the room we are updating it for
     * @param id the id of the link
     */
    public static updateUpgraderLink(room: Room, id: string): void {
        room.memory.upgradeLink = id;
    }

    /**
     * Go through the room's depedent room memory and remove null values
     * @param room the room we are cleaning the memory structure for
     */
    public static cleanDependentRoomMemory(room: Room): void {
        // Re-map Remote Room array to remove null values
        const allRemoteRooms: RemoteRoomMemory[] = Memory.rooms[room.name].remoteRooms!;
        const nonNullRemoteRooms: RemoteRoomMemory[] = [];

        _.forEach(allRemoteRooms, (rr: RemoteRoomMemory) => {
            if (rr !== null) {
                nonNullRemoteRooms.push(rr);
            }
        });
        Memory.rooms[room.name].remoteRooms = nonNullRemoteRooms;

        // Re-map Remote Room array to remove null values
        const allClaimRooms: ClaimRoomMemory[] = Memory.rooms[room.name].claimRooms!;
        const nonNullClaimRooms: ClaimRoomMemory[] = [];

        _.forEach(allClaimRooms, (rr: ClaimRoomMemory) => {
            if (rr !== null) {
                nonNullClaimRooms.push(rr);
            }
        });
        Memory.rooms[room.name].claimRooms = nonNullClaimRooms;
    }

    /**
     * Initialize the Memory object for a new room, and perform all one-time updates
     * @param room The room to initialize the memory of.
     */
    public static initRoomMemory(roomName: string, isOwnedRoom: boolean): void {
        // You might think of a better way/place to do this, but if we delete a memory structure as a "reset",
        // We want it to be reformed
        // Make sure jobs exist
        if (Memory.rooms[roomName] && !Memory.rooms[roomName].jobs) {
            Memory.rooms[roomName].jobs = {};
        }

        // Abort if Memory already exists
        if (Memory.rooms[roomName]) {
            return;
        }

        // Initialize Memory - Typescript requires it be done this way
        //                    unless we define a constructor for RoomMemory.
        if (isOwnedRoom) {
            Memory.rooms[roomName] = {
                claimRooms: [],
                constructionSites: { data: null, cache: null },
                creepLimit: {
                    domesticLimits: {
                        miner: 0,
                        harvester: 0,
                        worker: 0,
                        powerUpgrader: 0,
                        lorry: 0,
                        scout: 0,
                        manager: 0,
                        mineralMiner: 0
                    },
                    remoteLimits: {
                        remoteMiner: 0,
                        remoteHarvester: 0,
                        remoteReserver: 0,
                        remoteDefender: 0,
                        remoteColonizer: 0,
                        claimer: 0
                    },
                    militaryQueue: []
                },
                creeps: { data: null, cache: null },
                defcon: -1,
                shotLastTick: false,
                hostiles: { data: null, cache: null },
                remoteRooms: [],
                roomState: ROOM_STATE_INTRO,
                sources: { data: null, cache: null },
                minerals: { data: null, cache: null },
                tombstones: { data: null, cache: null },
                ruins: { data: null, cache: null },
                droppedResources: { data: null, cache: null },
                jobs: {},
                structures: { data: null, cache: null },
                hostileStructures: { data: null, cache: null },
                upgradeLink: ""
            };
        } else {
            Memory.rooms[roomName] = {
                structures: { data: null, cache: null },
                hostileStructures: { data: null, cache: null },
                sources: { data: null, cache: null },
                minerals: { data: null, cache: null },
                tombstones: { data: null, cache: null },
                ruins: { data: null, cache: null },
                droppedResources: { data: null, cache: null },
                constructionSites: { data: null, cache: null },
                defcon: -1,
                hostiles: { data: null, cache: null }
            };
        }

        // Only populate out the memory structure if we have vision of the room
        // Extra saftey provided at each helper function, but make sure only visible rooms are being sent anyway
        if (Game.rooms[roomName]) {
            this.getRoomMemory(Game.rooms[roomName], true);
        }
    }

    /**
     * Validates Room Memory and calls update function as needed
     * for the entire room memory.
     *
     * [Cached] Memory.rooms[room.name]
     * @param room The name of the room to get memory for
     * @param forceUpdate [Optional] Force all room memory to update
     * @param isHostileRoom [Default] if the room we are getting memory for is hostile
     */
    public static getRoomMemory(room: Room, forceUpdate?: boolean, isHostileRoom: boolean = false): void {
        MemoryApi_Room.getConstructionSites(room.name, undefined, forceUpdate);
        MemoryApi_Creep.getMyCreeps(room.name, undefined, forceUpdate);
        MemoryApi_Creep.getHostileCreeps(room.name, undefined, forceUpdate);
        MemoryApi_Room.getHostileStuctures(room.name, undefined, forceUpdate);

        if (!isHostileRoom) {
            MemoryApi_Room.getUpgraderLink(room);
            MemoryApi_Room.getSources(room.name, undefined, forceUpdate);
            MemoryApi_Room.getStructures(room.name, undefined, forceUpdate);
            MemoryApi_Jobs.getAllGetEnergyJobs(room, undefined, forceUpdate);
            MemoryApi_Jobs.getAllNonEnergyJobs(room, undefined, forceUpdate);
            MemoryApi_Jobs.getAllClaimPartJobs(room, undefined, forceUpdate);
            MemoryApi_Jobs.getAllWorkPartJobs(room, undefined, forceUpdate);
            MemoryApi_Room.getBunkerCenter(room, forceUpdate);
        }
    }

    /**
     * Get hostile structures in a room, updating if necessary
     *
     * [Cached] Memory.rooms[room.name].structures
     * @param room The room to retrieve from
     * @param filterFunction [Optional] The function to filter all structure objects
     * @param forceUpdate [Optional] Invalidate Cache by force
     * @returns Array<Structure> -- An array of structures
     */
    public static getHostileStuctures(
        roomName: string,
        filterFunction?: (object: Structure) => boolean,
        forceUpdate?: boolean
    ): Structure[] {
        // If we have no vision of the room, return an empty array
        if (!Memory.rooms[roomName]) {
            return [];
        }

        if (
            NO_CACHING_MEMORY ||
            forceUpdate ||
            Memory.rooms[roomName].hostileStructures === undefined ||
            Memory.rooms[roomName].hostileStructures.cache < Game.time - STRUCT_CACHE_TTL
        ) {
            MemoryHelper_Room.updateHostileStructures(roomName);
        }

        const structureIDs: string[] = [];
        // Flatten the object into an array of IDs
        for (const type in Memory.rooms[roomName].hostileStructures.data) {
            const IDs = Memory.rooms[roomName].hostileStructures.data[type];
            for (const singleID of IDs) {
                if (singleID) {
                    structureIDs.push(singleID);
                }
            }
        }

        let structures: Structure[] = MemoryHelper.getOnlyObjectsFromIDs<Structure<StructureConstant>>(structureIDs);

        if (filterFunction !== undefined) {
            structures = _.filter(structures, filterFunction);
        }

        return structures;
    }

    /**
     * Get structures in a room, updating if necessary
     *
     * [Cached] Memory.rooms[room.name].structures
     * @param room The room to retrieve from
     * @param filterFunction [Optional] The function to filter all structure objects
     * @param forceUpdate [Optional] Invalidate Cache by force
     * @returns Array<Structure> -- An array of structures
     */
    public static getStructures(
        roomName: string,
        filterFunction?: (object: Structure) => boolean,
        forceUpdate?: boolean
    ): Structure[] {
        // If we have no vision of the room, return an empty array
        if (!Memory.rooms[roomName]) {
            return [];
        }

        if (
            NO_CACHING_MEMORY ||
            forceUpdate ||
            Memory.rooms[roomName].structures === undefined ||
            Memory.rooms[roomName].structures.cache < Game.time - STRUCT_CACHE_TTL
        ) {
            MemoryHelper_Room.updateStructures(roomName);
        }

        const structureIDs: string[] = [];
        // Flatten the object into an array of IDs
        for (const type in Memory.rooms[roomName].structures.data) {
            const IDs = Memory.rooms[roomName].structures.data[type];
            for (const singleID of IDs) {
                if (singleID) {
                    structureIDs.push(singleID);
                }
            }
        }

        let structures: Structure[] = MemoryHelper.getOnlyObjectsFromIDs<Structure<StructureConstant>>(structureIDs);

        if (filterFunction !== undefined) {
            structures = _.filter(structures, filterFunction);
        }

        return structures;
    }

    /**
     * Get structures of a single type in a room, updating if necessary
     *
     * [Cached] Memory.rooms[room.name].structures
     * @param roomName The room to check in
     * @param filterFunction [Optional] A function to filter by
     * @param forceUpdate [Optional] Force structures memory to be updated
     * @returns Structure[] An array of structures of a single type
     */
    public static getStructure<T extends Structure>(
        roomName: string,
        type: StructureConstant,
        filterFunction?: (object: T) => boolean,
        forceUpdate?: boolean
    ): T[] {
        // If we have no vision of the room, return an empty array
        if (!Memory.rooms[roomName]) {
            return [];
        }

        if (
            NO_CACHING_MEMORY ||
            forceUpdate ||
            Memory.rooms[roomName].structures === undefined ||
            Memory.rooms[roomName].structures.data === null ||
            Memory.rooms[roomName].structures.data[type] === undefined ||
            Memory.rooms[roomName].structures.cache < Game.time - STRUCT_CACHE_TTL
        ) {
            MemoryHelper_Room.updateStructures(roomName);
        }

        const structureIDs: string[] = Memory.rooms[roomName].structures.data[type];

        let structures: T[] = MemoryHelper.getOnlyObjectsFromIDs<T>(structureIDs);

        if (filterFunction !== undefined) {
            structures = _.filter(structures, filterFunction);
        }

        return structures;
    }

    /**
     * Get structures of a single type in a room, updating if necessary
     *
     * [Cached] Memory.rooms[room.name].structures
     * @param roomName The room to check in
     * @param type The type of structure to retrieve
     * @param filterFunction [Optional] A function to filter by
     * @param forceUpdate [Optional] Force structures memory to be updated
     * @returns Structure[] An array of structures of a single type
     */
    public static getStructureOfType(
        roomName: string,
        type: StructureConstant,
        filterFunction?: (object: any) => boolean,
        forceUpdate?: boolean
    ): Structure[] {
        // If we have no vision of the room, return an empty array
        if (!Memory.rooms[roomName]) {
            return [];
        }

        if (
            NO_CACHING_MEMORY ||
            forceUpdate ||
            Memory.rooms[roomName].structures === undefined ||
            Memory.rooms[roomName].structures.data === null ||
            Memory.rooms[roomName].structures.data[type] === undefined ||
            Memory.rooms[roomName].structures.cache < Game.time - STRUCT_CACHE_TTL
        ) {
            MemoryHelper_Room.updateStructures(roomName);
        }

        const structureIDs: string[] = Memory.rooms[roomName].structures.data[type];

        let structures: Structure[] = MemoryHelper.getOnlyObjectsFromIDs<Structure>(structureIDs);

        if (filterFunction !== undefined) {
            structures = _.filter(structures, filterFunction);
        }

        return structures;
    }

    /**
     * Get structures of a single type in a room, updating if necessary
     *
     * [Cached] Memory.rooms[room.name].structures
     * @param roomName The room to check in
     * @param type The type of structure to retrieve
     * @param filterFunction [Optional] A function to filter by
     * @param forceUpdate [Optional] Force structures memory to be updated
     * @returns Structure[] An array of structures of a single type
     */
    public static getHostileStructureOfType(
        roomName: string,
        type: StructureConstant,
        filterFunction?: (object: any) => boolean,
        forceUpdate?: boolean
    ): Structure[] {
        // If we have no vision of the room, return an empty array
        if (!Memory.rooms[roomName]) {
            return [];
        }

        if (
            NO_CACHING_MEMORY ||
            forceUpdate ||
            Memory.rooms[roomName].hostileStructures === undefined ||
            Memory.rooms[roomName].hostileStructures.data === null ||
            Memory.rooms[roomName].hostileStructures.data[type] === undefined ||
            Memory.rooms[roomName].hostileStructures.cache < Game.time - STRUCT_CACHE_TTL
        ) {
            MemoryHelper_Room.updateHostileStructures(roomName);
        }

        const structureIDs: string[] = Memory.rooms[roomName].hostileStructures.data[type];

        let structures: Structure[] = MemoryHelper.getOnlyObjectsFromIDs<Structure>(structureIDs);

        if (filterFunction !== undefined) {
            structures = _.filter(structures, filterFunction);
        }

        return structures;
    }

    /**
     * Get all construction sites in a room, updating if necessary
     *
     * [Cached] Memory.rooms[room.name].constructionSites
     * @param room The room to retrieve from
     * @param filterFunction [Optional] The function to filter all structure objects
     * @param forceUpdate [Optional] Invalidate Cache by force
     * @returns Array<ConstructionSite> -- An array of ConstructionSites
     */
    public static getConstructionSites(
        roomName: string,
        filterFunction?: (object: ConstructionSite) => boolean,
        forceUpdate?: boolean
    ): ConstructionSite[] {
        // If we have no vision of the room, return an empty array
        if (!Memory.rooms[roomName]) {
            return [];
        }

        if (
            NO_CACHING_MEMORY ||
            forceUpdate ||
            !Memory.rooms[roomName].constructionSites ||
            Memory.rooms[roomName].constructionSites.cache < Game.time - CONSTR_CACHE_TTL
        ) {
            MemoryHelper_Room.updateConstructionSites(roomName);
        }

        const constructionSiteIDs: string[] = Memory.rooms[roomName].constructionSites.data;

        let constructionSites: ConstructionSite[] = MemoryHelper.getOnlyObjectsFromIDs<ConstructionSite>(
            constructionSiteIDs
        );

        if (filterFunction !== undefined) {
            constructionSites = _.filter(constructionSites, filterFunction);
        }

        return constructionSites;
    }

    /**
     * Returns a list of tombstones in the room, updating if necessary
     *
     * @param room The room we want to look in
     * @param filterFunction [Optional] The function to filter the tombstones objects
     * @param forceUpdate [Optional] Invalidate Cache by force
     * @returns Tombstone[]  An array of tombstones, if there are any
     */
    public static getTombstones(
        room: Room,
        filterFunction?: (object: Tombstone) => boolean,
        forceUpdate?: boolean
    ): Tombstone[] {
        if (
            NO_CACHING_MEMORY ||
            forceUpdate ||
            !Memory.rooms[room.name].tombstones ||
            Memory.rooms[room.name].tombstones.cache < Game.time - TOMBSTONE_CACHE_TTL
        ) {
            MemoryHelper_Room.updateTombstones(room);
        }

        const tombstoneIDs: string[] = Memory.rooms[room.name].tombstones.data;

        let tombstones = MemoryHelper.getOnlyObjectsFromIDs<Tombstone>(tombstoneIDs);

        if (filterFunction !== undefined) {
            tombstones = _.filter(tombstones, filterFunction);
        }

        return tombstones;
    }

    /**
     * Returns a list of ruins in the room, updating if necessary
     *
     * @param room The room we want to look in
     * @param filterFunction [Optional] The function to filter the ruin objects
     * @param forceUpdate [Optional] Invalidate Cache by force
     * @returns Ruin[]  An array of Ruins, if there are any
     */
    public static getRuins(room: Room, filterFunction?: (object: Ruin) => boolean, forceUpdate?: boolean): Ruin[] {
        if (
            NO_CACHING_MEMORY ||
            forceUpdate ||
            !Memory.rooms[room.name].ruins ||
            Memory.rooms[room.name].ruins.cache < Game.time - RUINS_CACHE_TTL
        ) {
            MemoryHelper_Room.updateRuins(room);
        }

        const ruinIDs: string[] = Memory.rooms[room.name].ruins.data;

        let ruins = MemoryHelper.getOnlyObjectsFromIDs<Ruin>(ruinIDs);

        if (filterFunction !== undefined) {
            ruins = _.filter(ruins, filterFunction);
        }

        return ruins;
    }

    /**
     * Returns a list of the dropped resources in a room, updating if necessary
     *
     * @param room The room we want to look in
     * @param filterFunction [Optional] The function to filter the resource objects
     * @param forceUpdate [Optional] Invalidate Cache by force
     * @returns Resource[]  An array of dropped resources, if there are any
     */
    public static getDroppedResources(
        room: Room,
        filterFunction?: (object: RESOURCE_ENERGY) => boolean,
        forceUpdate?: boolean
    ): Resource[] {
        if (
            NO_CACHING_MEMORY ||
            forceUpdate ||
            !Memory.rooms[room.name].droppedResources ||
            Memory.rooms[room.name].droppedResources.cache < Game.time - DROPS_CACHE_TTL
        ) {
            MemoryHelper_Room.updateDroppedResources(room);
        }

        const resourceIDs: string[] = Memory.rooms[room.name].droppedResources.data;

        let droppedResources: Resource[] = MemoryHelper.getOnlyObjectsFromIDs<Resource>(resourceIDs);

        if (filterFunction !== undefined) {
            droppedResources = _.filter(droppedResources, filterFunction);
        }

        return droppedResources;
    }

    public static getSourceIds(roomName: string): string[] {
        return _.map(Memory.rooms[roomName].sources.data, (sourceMemory: StringMap) => sourceMemory.id);
    }

    /**
     * get sources in the room
     * @param room the room we want sources from
     * @param filterFunction [Optional] The function to filter all source objects
     * @param forceUpdate [Optional] Invalidate cache by force
     * @returns Source[]  An array of sources, if there are any
     */
    public static getSources(
        roomName: string,
        filterFunction?: (object: Source) => boolean,
        forceUpdate?: boolean
    ): Source[] {
        // If we have no vision of the room, return an empty array
        if (!Memory.rooms[roomName]) {
            return [];
        }

        if (
            NO_CACHING_MEMORY ||
            forceUpdate ||
            Memory.rooms[roomName].sources === undefined ||
            Memory.rooms[roomName].sources.cache < Game.time - SOURCE_CACHE_TTL
        ) {
            MemoryHelper_Room.updateSources(roomName);
        }

        const sourceIDs = this.getSourceIds(roomName);

        let sources: Source[] = MemoryHelper.getOnlyObjectsFromIDs<Source>(sourceIDs);

        if (filterFunction !== undefined) {
            sources = _.filter(sources, filterFunction);
        }

        return sources;
    }

    /**
     * get minerals in the room
     * @param room the room we want minerals from
     * @param filterFunction [Optional] The function to filter all mineral objects
     * @param forceUpdate [Optional] Invalidate cache by force
     * @returns Mineral[]  An array of minerals, if there are any
     */
    public static getMinerals(
        roomName: string,
        filterFunction?: (object: Source) => boolean,
        forceUpdate?: boolean
    ): Mineral[] {
        // If we have no vision of the room, return an empty array
        if (!Memory.rooms[roomName]) {
            return [];
        }

        if (
            NO_CACHING_MEMORY ||
            forceUpdate ||
            Memory.rooms[roomName].minerals === undefined ||
            Memory.rooms[roomName].minerals.cache < Game.time - MINERAL_CACHE_TTL
        ) {
            MemoryHelper_Room.updateMinerals(roomName);
        }

        const sourceIDs = Memory.rooms[roomName].minerals.data;

        let minerals: Mineral[] = MemoryHelper.getOnlyObjectsFromIDs<Mineral>(sourceIDs);

        if (filterFunction !== undefined) {
            minerals = _.filter(minerals, filterFunction);
        }

        return minerals;
    }

    /**
     * Get the remoteRoom objects
     *
     * Updates all dependencies if the cache is invalid, for efficiency
     * @param room The room to check dependencies of
     * @param filterFunction [Optional] The function to filter the room objects
     * @param targetRoom [Optional] the name of the room we want to grab if we already know it
     */
    public static getRemoteRooms(
        room: Room,
        filterFunction?: (object: RemoteRoomMemory) => boolean,
        targetRoom?: string
    ): RemoteRoomMemory[] {
        if (Memory.rooms[room.name] === undefined || Memory.rooms[room.name]!.remoteRooms === undefined) {
            return [];
        }

        let remoteRooms: RemoteRoomMemory[] = Memory.rooms[room.name].remoteRooms!;

        // TargetRoom parameter provided
        if (targetRoom !== undefined) {
            remoteRooms = _.filter(remoteRooms, (roomMemory: RemoteRoomMemory) => roomMemory.roomName === targetRoom);
        }

        if (filterFunction !== undefined) {
            // No target room provided, just return them all
            remoteRooms = _.filter(remoteRooms, filterFunction);
        }

        return remoteRooms;
    }

    /**
     * Get the claimRoom objects
     *
     * Updates all dependencies if the cache is invalid
     * @param room The room to check the dependencies of
     * @param filterFunction [Optional] THe function to filter the room objects
     * @param targetRoom the name of the room we want to grab if we already know it
     */
    public static getClaimRooms(
        room: Room,
        filterFunction?: (object: ClaimRoomMemory) => boolean,
        targetRoom?: string
    ): ClaimRoomMemory[] {
        if (Memory.rooms[room.name] === undefined || Memory.rooms[room.name].claimRooms === undefined) {
            return [];
        }

        let claimRooms: ClaimRoomMemory[] = Memory.rooms[room.name].claimRooms!;

        if (targetRoom !== undefined) {
            claimRooms = _.filter(claimRooms, (roomMemory: ClaimRoomMemory) => roomMemory.roomName === targetRoom);
        }

        if (filterFunction !== undefined) {
            // No target room provided, just return them all
            claimRooms = _.filter(claimRooms, filterFunction);
        }

        return claimRooms;
    }

    /**
     * get the defcon level for the room
     * @param room the room we are checking defcon for
     */
    public static getDefconLevel(room: Room): number {
        return Memory.rooms[room.name].defcon;
    }

    /**
     * Get count of all creeps, or of one if creepConst is specified
     * @param room the room we are getting the count for
     * @param creepConst [Optional] Count only one role
     */
    public static getCreepCount(room: Room, creepConst?: RoleConstant): number {
        const filterFunction = creepConst === undefined ? undefined : (c: Creep) => c.memory.role === creepConst;

        // Return all creeps in that role, excluding those on deaths door
        return _.filter(MemoryApi_Creep.getMyCreeps(room.name, filterFunction), (creep: Creep) => {
            if (creep.ticksToLive) {
                return creep.ticksToLive > creep.body.length * 3;
            }
            return false;
        }).length;
    }

    /**
     * get creep limits
     * @param room the room we want the limits for
     */
    public static getCreepLimits(room: Room): CreepLimits {
        // Make sure everything is defined at the memory level
        if (
            !Memory.rooms[room.name].creepLimit?.domesticLimits ||
            !Memory.rooms[room.name].creepLimit?.remoteLimits ||
            !Memory.rooms[room.name].creepLimit?.militaryQueue
        ) {
            MemoryApi_Room.initCreepLimits(room);
        }
        const creepLimits: CreepLimits = {
            domesticLimits: Memory.rooms[room.name].creepLimit!.domesticLimits,
            remoteLimits: Memory.rooms[room.name].creepLimit!.remoteLimits,
            militaryQueue: Memory.rooms[room.name].creepLimit!.militaryQueue
        };

        return creepLimits;
    }

    /**
     * initilize creep limits in room memory in the case it is not defined
     * @param room the room we are initing the creep memory for
     */
    public static initCreepLimits(room: Room): void {
        Memory.rooms[room.name].creepLimit = {
            domesticLimits: {
                miner: 0,
                harvester: 0,
                worker: 0,
                powerUpgrader: 0,
                lorry: 0,
                scout: 0,
                manager: 0,
                mineralMiner: 0
            },
            remoteLimits: {
                remoteMiner: 0,
                remoteHarvester: 0,
                remoteReserver: 0,
                remoteDefender: 0,
                remoteColonizer: 0,
                claimer: 0
            },
            militaryQueue: []
        };
    }

    /**
     * get all visible dependent rooms
     */
    public static getVisibleDependentRooms(): Room[] {
        const ownedRooms: Room[] = MemoryApi_Empire.getOwnedRooms();
        const roomNames: string[] = [];
        _.forEach(ownedRooms, (room: Room) => {
            // Collect the room names for dependent rooms
            _.forEach(MemoryApi_Room.getRemoteRooms(room), (rr: RemoteRoomMemory) => roomNames.push(rr.roomName));

            _.forEach(MemoryApi_Room.getClaimRooms(room), (rr: ClaimRoomMemory) => roomNames.push(rr.roomName));
        });

        // Return all visible rooms which appear in roomNames array
        return _.filter(Game.rooms, (room: Room) => roomNames.includes(room.name));
    }

    /**
     * Get the center of the bunker
     * @param room the room we are in
     * @param forceUpdate boolean representing if we need to update this
     * @returns the room position of the center of the room
     */
    public static getBunkerCenter(room: Room, forceUpdate?: boolean): RoomPosition {
        if (forceUpdate || !room.memory.bunkerCenter) {
            MemoryHelper_Room.updateBunkerCenter(room);
        }

        return Normalize.convertMockToRealPos(room.memory.bunkerCenter!);
    }

    /**
     * Get the creep count split up by role : count pairs
     * @param room the room we are in
     */
    public static getAllCreepCount(room: Room): AllCreepCount {
        const creepsInRoom: Creep[] = MemoryApi_Creep.getMyCreeps(room.name);
        const allCreepCount: AllCreepCount = MemoryHelper.generateDefaultAllCreepCountObject();

        // sum up the number of each role we come across
        for (const creep of creepsInRoom) {
            if (creep.ticksToLive && creep.ticksToLive < creep.body.length * 3) {
                continue;
            }
            allCreepCount[creep.memory.role] = allCreepCount[creep.memory.role] + 1;
        }
        return allCreepCount;
    }

    /**
     * Get the last tick a scout was spawned from memory
     * @param room the room we are in
     * @returns the last tick a scout was spawned in the room, -1 if one has not been spawned ever (ie memory was not set)
     */
    public static getLastTickScoutSpawned(room: Room): number {
        if (!room.memory.lastScoutSpawn) {
            return -1;
        }
        return room.memory.lastScoutSpawn;
    }

    /**
     * Update the last tick a scout was spawned in memory to the current tick
     * @param room the room we are in
     */
    public static updateLastTickScoutSpawned(room: Room): void {
        room.memory.lastScoutSpawn = Game.time;
    }
}
