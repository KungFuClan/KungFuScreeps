import { NO_CACHING_MEMORY, FCREEP_CACHE_TTL, MemoryHelper_Room, MemoryHelper, HCREEP_CACHE_TTL } from "Utils/Imports/internals";
import _ from "lodash";

export class MemoryApi_Creep {
    /**
     * Initializes the memory of a newly spawned creep
     * @param creep the creep we want to initialize memory for
     */
    public static initCreepMemory(
        creep: Creep,
        creepRole: RoleConstant,
        creepHomeRoom: string,
        creepOptions: CreepOptionsCiv | CreepOptionsMili,
        creepTargetRoom?: string
    ): void {
        // abort if memory already exists
        if (Memory.creeps[creep.name]) {
            return;
        }

        // Initialize Memory
        Memory.creeps[creep.name] = {
            homeRoom: creepHomeRoom,
            options: creepOptions,
            role: creepRole,
            targetRoom: creepTargetRoom || "",
            job: undefined,
            working: false
        };
    }

    /**
     * Gets the owned creeps in a room, updating memory if necessary.
     *
     * [Cached] Memory.rooms[room.name].creeps
     * @param room The room to retrieve from
     * @param filterFunction [Optional] The function to filter all creep objects
     * @param forceUpdate [Optional] Invalidate Cache by force
     * @returns Creep[ ] -- An array of owned creeps, empty if there are none
     */
    public static getMyCreeps(
        roomName: string,
        filterFunction?: (object: Creep) => boolean,
        forceUpdate?: boolean
    ): Creep[] {
        // If we have no vision of the room, return an empty array
        if (!Memory.rooms[roomName]) {
            return [];
        }

        if (
            NO_CACHING_MEMORY ||
            forceUpdate ||
            !Memory.rooms[roomName].creeps ||
            Memory.rooms[roomName].creeps!.cache < Game.time - FCREEP_CACHE_TTL
        ) {
            MemoryHelper_Room.updateMyCreeps(roomName);
        }

        const creepIDs: string[] = Memory.rooms[roomName].creeps!.data;

        let creeps: Creep[] = MemoryHelper.getOnlyObjectsFromIDs<Creep>(creepIDs);

        if (filterFunction !== undefined) {
            creeps = _.filter(creeps, filterFunction);
        }

        return creeps;
    }

    /**
     * Get all hostile creeps in a room, updating if necessary
     *
     * [Cached] Memory.rooms[room.name].hostiles
     * @param room The room to retrieve from
     * @param filterFunction [Optional] The function to filter all creep objects
     * @param forceUpdate [Optional] Invalidate Cache by force
     * @returns Creep[ ]  -- An array of hostile creeps, empty if none
     */
    public static getHostileCreeps(
        roomName: string,
        filterFunction?: (object: Creep) => boolean,
        forceUpdate?: boolean
    ): Creep[] {
        // If we have no vision of the room, return an empty array
        if (!Game.rooms[roomName]) {
            return [];
        }

        if (
            NO_CACHING_MEMORY ||
            forceUpdate ||
            !Memory.rooms[roomName].hostiles ||
            Memory.rooms[roomName].hostiles!.cache < Game.time - HCREEP_CACHE_TTL
        ) {
            MemoryHelper_Room.updateHostileCreeps(roomName);
        }

        const creepIDs: string[] = [];
        // Basically flattening the object in memory here
        _.forEach(Object.keys(Memory.rooms[roomName].hostiles.data), (hostileType: string) => {
            _.forEach(Memory.rooms[roomName].hostiles.data[hostileType], (enemyID: string) => {
                creepIDs.push(enemyID);
            });
        });

        let creeps: Creep[] = MemoryHelper.getOnlyObjectsFromIDs<Creep>(creepIDs);

        if (filterFunction !== undefined) {
            creeps = _.filter(creeps, filterFunction);
        }

        return creeps;
    }
}
