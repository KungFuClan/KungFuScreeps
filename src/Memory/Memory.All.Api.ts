import {
    MemoryHelper,
    MemoryHelper_Room,
    NO_CACHING_MEMORY,
    PRIORITY_REPAIR_THRESHOLD,
    BACKUP_JOB_CACHE_TTL,
    CONSTR_CACHE_TTL,
    CONTAINER_JOB_CACHE_TTL,
    DROPS_CACHE_TTL,
    FCREEP_CACHE_TTL,
    HCREEP_CACHE_TTL,
    LINK_JOB_CACHE_TTL,
    ROOM_STATE_INTRO,
    SOURCE_CACHE_TTL,
    SOURCE_JOB_CACHE_TTL,
    STRUCT_CACHE_TTL,
    TOMBSTONE_CACHE_TTL,
    CLAIM_JOB_CACHE_TTL,
    RESERVE_JOB_CACHE_TTL,
    SIGN_JOB_CACHE_TTL,
    ATTACK_JOB_CACHE_TTL,
    REPAIR_JOB_CACHE_TTL,
    BUILD_JOB_CACHE_TTL,
    UPGRADE_JOB_CACHE_TTL,
    STORE_JOB_CACHE_TTL,
    FILL_JOB_CACHE_TTL,
    PICKUP_JOB_CACHE_TTL,
    ALL_STRUCTURE_TYPES,
    ERROR_ERROR,
    MINERAL_CACHE_TTL,
    UserException,
    RUINS_CACHE_TTL,
    LOOT_JOB_CACHE_TTL
} from "Utils/Imports/internals";
import _ from "lodash";

// the api for the memory class
export class MemoryApi_All {
    /**
     * Remove all memory objects that are dead
     */
    public static garbageCollection(): void {
        // Remove all dead creeps from memory
        for (const name in Memory.creeps) {
            if (!(name in Game.creeps)) {
                delete Memory.creeps[name];
            }
        }

        // Remove all dead rooms from memory
        for (const roomName in Memory.rooms) {
            if (
                !(roomName in Game.rooms) &&
                !MemoryHelper.dependentRoomExists(roomName) &&
                !_.some(Game.creeps, (creep: Creep) => creep.memory.targetRoom === roomName)
            ) {
                delete Memory.rooms[roomName];
            }
        }

        // Remove all dead flags from memory
        for (const flag in Memory.flags) {
            if (!_.some(Game.flags, (flagLoop: Flag) => flagLoop.name === Memory.flags[flag].flagName)) {
                delete Memory.flags[flag];
            }
        }

        // Remove dead operations from memory
        for (const op in Memory.empire.militaryOperations) {
            if (Object.keys(Memory.empire.militaryOperations[op].squads).length === 0) {
                delete Memory.empire.militaryOperations[op];
            }
        }
    }
}
