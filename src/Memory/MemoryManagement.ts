// @ts-ignore
import { MemoryApi_All, MemoryApi_Empire, MemoryApi_Room } from "Utils/Imports/internals";
import { profile } from "Profiler";
import _ from "lodash";

// manager for the memory of the empire
@profile
export class MemoryManager {
    /**
     * run the memory for the AI
     */
    public static runMemoryManager(): void {
        this.initMainMemory();

        MemoryApi_All.garbageCollection();

        const ownedRooms: Room[] = MemoryApi_Empire.getOwnedRooms();
        // Init memory for all owned rooms
        _.forEach(ownedRooms, (room: Room) => {
            const isOwnedRoom: boolean = true;
            MemoryApi_Room.initRoomMemory(room.name, isOwnedRoom);
        });

        const dependentRooms: Room[] = MemoryApi_Room.getVisibleDependentRooms();
        // Init memory for all visible dependent rooms
        _.forEach(dependentRooms, (room: Room) => {
            const isOwnedRoom: boolean = false;
            MemoryApi_Room.initRoomMemory(room.name, isOwnedRoom);
        });
    }

    /**
     * Ensures the initial Memory object is defined properly
     */
    private static initMainMemory() {
        if (!Memory.rooms) {
            Memory.rooms = {};
        }

        if (!Memory.flags) {
            Memory.flags = {};
        }

        if (!Memory.creeps) {
            Memory.creeps = {};
        }

        if (!Memory.empire) {
            Memory.empire = {
                market: {
                    priceData: {},
                    requests: []
                },

                militaryOperations: {}
            };
        }
    }
}
