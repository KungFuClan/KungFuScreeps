import { MemoryApi_Creep, MemoryApi_Empire } from "Utils/Imports/internals";
import _ from "lodash";

// Accessing Memory Helpers
export class MemoryHelper {
    /**
     * Returns an array of creeps of a role
     * @param role The role to check for
     */
    public static getCreepOfRole(room: Room, role: RoleConstant, forceUpdate?: boolean): Creep[] {
        const filterByRole = (creep: Creep) => {
            return creep.memory.role === role;
        };
        const creepsOfRole = MemoryApi_Creep.getMyCreeps(room.name, filterByRole);

        return creepsOfRole;
    }

    /**
     * check if the room name exists as a dependent room
     * @param roomName the name of the room we are cheking for
     */
    public static dependentRoomExists(roomName: string): boolean {
        const ownedRooms: Room[] = MemoryApi_Empire.getOwnedRooms();

        // Loop over d-rooms within each room looking for the parameter room name
        for (const room of ownedRooms) {
            for (const rr in room.memory.remoteRooms!) {
                if (room.memory.remoteRooms![rr] && roomName === room.memory.remoteRooms![rr].roomName) {
                    return true;
                }
            }

            for (const cr in room.memory.claimRooms!) {
                if (room.memory.claimRooms![cr] && roomName === room.memory.claimRooms![cr].roomName) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Performs the length checks and null checks for all getXXX functions that use IDs to get the objects
     * @param idArray An array of ids to check
     */
    public static getOnlyObjectsFromIDs<T>(idArray: string[]): T[] {
        if (idArray.length === 0) {
            return [];
        }

        const objects: T[] = [];
        _.forEach(idArray, (id: string) => {
            const object: T | null = Game.getObjectById(id);
            if (object !== null) {
                objects.push(object);
            }
        });

        return objects;
    }

    /**
     * clear the memory structure for the creep
     * @param creep the creep we want to clear the memory of
     */
    public static clearCreepMemory(creep: Creep) {
        // check if the memory object exists and delete it
        if (Memory.creeps[creep.name]) {
            delete creep.memory;
        }
    }

    /**
     * clear the memory for a room
     * @param room the room we want to clear the memory for
     */
    public static clearRoomMemory(room: Room) {
        // check if the memory structures exists and delete it
        if (Memory.rooms[room.name]) {
            delete room.memory;
        }
    }

    /**
     * Generate default memory for the "AllCreepCount" type
     */
    public static generateDefaultAllCreepCountObject(): AllCreepCount {
        // Update here upon creating new role, can't generate dynamically due to typescript requiring explicit definition
        return {
            claimer: 0,
            harvester: 0,
            lorry: 0,
            manager: 0,
            medic: 0,
            miner: 0,
            mineralMiner: 0,
            powerUpgrader: 0,
            remoteColonizer: 0,
            remoteHarvester: 0,
            remoteMiner: 0,
            remoteReserver: 0,
            scout: 0,
            stalker: 0,
            worker: 0,
            zealot: 0,
            towerTank: 0
        };
    }
}
