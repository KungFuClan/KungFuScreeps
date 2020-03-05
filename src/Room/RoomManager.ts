import {
    RUN_TOWER_TIMER,
    RUN_LAB_TIMER,
    RUN_LINKS_TIMER,
    RUN_TERMINAL_TIMER,
    RUN_ROOM_STATE_TIMER,
    RUN_DEFCON_TIMER,
    RUN_RESERVE_TTL_TIMER,
    RUN_RAMPART_STATUS_UPDATE,
    ROOM_STATE_UPGRADER,
    ROOM_STATE_NUKE_INBOUND,
    RoomHelper_Structure,
    RoomApi_State,
    RoomApi_Structure,
    MemoryApi_Empire,
    MemoryApi_Room,
} from "Utils/Imports/internals";
import { profile } from "Profiler";

// room-wide manager
@profile
export class RoomManager {
    /**
     * run the room for every room
     */
    public static runRoomManager(): void {
        // Run all owned rooms
        const ownedRooms: Room[] = MemoryApi_Empire.getOwnedRooms();
        _.forEach(ownedRooms, (room: Room) => {
            this.runSingleRoom(room);
        });

        // Run all dependent rooms we have visiblity in
        const dependentRooms: Room[] = MemoryApi_Room.getVisibleDependentRooms();
        _.forEach(dependentRooms, (room: Room) => {
            this.runSingleDependentRoom(room);
        });
    }

    /**
     * run the room for a single owned room
     * @param room the room we are running this manager function on
     */
    private static runSingleRoom(room: Room): void {
        // Set Defcon and Room State (roomState relies on defcon being set first)
        if (RoomHelper_Structure.excecuteEveryTicks(RUN_DEFCON_TIMER)) {
            RoomApi_State.setDefconLevel(room);
        }

        if (RoomHelper_Structure.excecuteEveryTicks(RUN_ROOM_STATE_TIMER)) {
            RoomApi_State.setRoomState(room);
        }

        const defcon: number = MemoryApi_Room.getDefconLevel(room);
        if (room.controller!.safeModeAvailable) {
            RoomApi_State.runSafeMode(room, defcon);
        }

        // Run all structures in the room if they exist
        // Run Towers
        const roomState = room.memory.roomState;
        if (RoomHelper_Structure.excecuteEveryTicks(RUN_TOWER_TIMER) && RoomHelper_Structure.isExistInRoom(room, STRUCTURE_TOWER)) {
            // Check first if we have EMERGECY ramparts to heal up
            // I just got this to work while it was bug testable, so feel free to refactor into something thats NOT this (maybe pull into a function either way idc)
            const rampart: Structure<StructureConstant> = <Structure<StructureConstant>>_.first(
                room.find(FIND_MY_STRUCTURES, {
                    filter: (s: any) => s.structureType === STRUCTURE_RAMPART && s.hits < 1000
                })
            );
            if (rampart) {
                RoomApi_Structure.runTowersEmergecyRampartRepair(rampart as StructureRampart);
            } else if (defcon >= 1) {
                RoomApi_Structure.runTowersDefense(room);
            } else if (roomState === ROOM_STATE_UPGRADER || roomState === ROOM_STATE_NUKE_INBOUND) {
                room.memory.shotLastTick = false;
                RoomApi_Structure.runTowersRepair(room);
            } else {
                room.memory.shotLastTick = false;
            }
        }

        // Run Labs
        if (RoomHelper_Structure.isExistInRoom(room, STRUCTURE_LAB) && RoomHelper_Structure.excecuteEveryTicks(RUN_LAB_TIMER)) {
            RoomApi_Structure.runLabs(room);
        }

        // Run Links
        if (RoomHelper_Structure.isExistInRoom(room, STRUCTURE_LINK) && RoomHelper_Structure.excecuteEveryTicks(RUN_LINKS_TIMER)) {
            RoomApi_Structure.runLinks(room);
        }

        // Run Terminals
        if (RoomHelper_Structure.isExistInRoom(room, STRUCTURE_TERMINAL) && RoomHelper_Structure.excecuteEveryTicks(RUN_TERMINAL_TIMER)) {
            RoomApi_Structure.runTerminal(room);
        }

        // Run accessory functions for dependent rooms ----
        // Update reserve timer for remote rooms
        if (RoomHelper_Structure.excecuteEveryTicks(RUN_RESERVE_TTL_TIMER)) {
            RoomApi_State.simulateReserveTTL(room);
        }
    }

    /**
     * run the room for an unowned room
     * @param room the room we are running
     */
    private static runSingleDependentRoom(room: Room): void {
        // Set Defcon for the dependent room
        if (RoomHelper_Structure.excecuteEveryTicks(RUN_ROOM_STATE_TIMER)) {
            RoomApi_State.setDefconLevel(room);
        }
    }
}
