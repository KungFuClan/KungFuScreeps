import {
    UserException,
    RUN_RESERVE_TTL_TIMER,
    RoomHelper_State,
    ROOM_STATE_INTRO,
    ROOM_STATE_NUKE_INBOUND,
    ROOM_STATE_STIMULATE,
    ROOM_STATE_UPGRADER,
    ROOM_STATE_ADVANCED,
    ROOM_STATE_INTER,
    ROOM_STATE_BEGINNER,
    RoomHelper_Structure,
    MemoryApi_Creep,
    MemoryApi_Room,
    MemoryApi_Empire,

} from "Utils/Imports/internals";

export class RoomApi_State {

    /**
     * check if there are hostile creeps in the room
     * @param room the room we are checking
     */
    public static isHostilesInRoom(room: Room): boolean {
        const hostilesInRoom = MemoryApi_Creep.getHostileCreeps(room.name);
        return hostilesInRoom.length > 0;
    }

    /**
     * set the room's state
     * Essentially backbone of the room, decides what flow
     * of action will be taken at the beginning of each tick
     * (note: assumes defcon already being found for simplicity sake)
     * @param room the room we are setting state for
     */
    public static setRoomState(room: Room): void {
        // If theres no controller, throw an error
        if (!room.controller) {
            throw new UserException(
                "Can't set room state for room with no controller!",
                "You attempted to call setRoomState on room [" + room.name + "]. Theres no controller here.",
                ERROR_WARN
            );
        }
        // ----------

        // check if we are in nuke inbound room state
        // nuke is coming in and we need to gtfo, but they take like 20k ticks, so only check every 1000 or so
        if (RoomHelper_Structure.excecuteEveryTicks(1000)) {
            const incomingNukes = room.find(FIND_NUKES);
            if (incomingNukes.length > 0) {
                MemoryApi_Room.updateRoomState(ROOM_STATE_NUKE_INBOUND, room);
                return;
            }
        }
        // ----------

        // check if we are in intro room state
        // 3 or less creeps so we need to (re)start the room
        const creeps: Array<Creep | null> = MemoryApi_Creep.getMyCreeps(room.name);
        if (creeps.length < 3) {
            MemoryApi_Room.updateRoomState(ROOM_STATE_INTRO, room);
            return;
        }
        // ----------

        const storage: StructureStorage | undefined = room.storage;
        const containers: Array<Structure | null> = MemoryApi_Room.getStructureOfType(room.name, STRUCTURE_CONTAINER);
        const sources: Array<Source | null> = MemoryApi_Room.getSources(room.name);
        if (room.controller!.level >= 6) {
            // check if we are in upgrader room state
            // container mining and storage set up, and we got links online
            if (
                RoomHelper_State.isContainerMining(room, sources, containers) &&
                RoomHelper_State.isUpgraderLink(room) &&
                storage !== undefined
            ) {
                if (RoomHelper_State.isStimulateRoom(room)) {
                    MemoryApi_Room.updateRoomState(ROOM_STATE_STIMULATE, room);
                    return;
                }
                // otherwise, just upgrader room state
                MemoryApi_Room.updateRoomState(ROOM_STATE_UPGRADER, room);
                return;
            }
        }
        // ----------

        if (room.controller!.level >= 4) {
            // check if we are in advanced room state
            // container mining and storage set up
            // then check if we are flagged for sitmulate state
            if (RoomHelper_State.isContainerMining(room, sources, containers) && storage !== undefined) {
                if (RoomHelper_State.isStimulateRoom(room)) {
                    MemoryApi_Room.updateRoomState(ROOM_STATE_STIMULATE, room);
                    return;
                }

                // otherwise, just advanced room state
                MemoryApi_Room.updateRoomState(ROOM_STATE_ADVANCED, room);
                return;
            }
        }
        // ----------

        if (room.controller!.level >= 3) {
            // check if we are in intermediate room state
            // container mining set up, but no storage
            if (RoomHelper_State.isContainerMining(room, sources, containers) && storage === undefined) {
                MemoryApi_Room.updateRoomState(ROOM_STATE_INTER, room);
                return;
            }
        }
        // ----------

        // check if we are in beginner room state
        // no containers set up at sources so we are just running a bare knuckle room
        if (creeps.length >= 3) {
            MemoryApi_Room.updateRoomState(ROOM_STATE_BEGINNER, room);
            return;
        }
        // ----------
    }

    /**
     * set the rooms defcon level
     * @param room the room we are setting defcon for
     */
    public static setDefconLevel(room: Room): void {
        const hostileCreeps = MemoryApi_Creep.getHostileCreeps(room.name);
        const hostileStructures = MemoryApi_Room.getHostileStuctures(room.name, s => s.structureType === STRUCTURE_INVADER_CORE)
        
        // check level 0 first to reduce cpu drain as it will be the most common scenario
        // level 0 -- no danger
        if (hostileCreeps.length === 0 && hostileStructures.length === 0) {
            room.memory.defcon = 0;
            return;
        }

        // now define the variables we will need to check the other cases in the event
        // we are not dealing with a level 0 defcon scenario
        const hostileBodyParts: number = _.sum(hostileCreeps, (c: Creep) => c.body.length);
        const hostileDamageParts: number = _.sum(hostileCreeps, (c: Creep) => {
            return _.filter(c.body, (part: BodyPartDefinition) => {
                if (part.type === ATTACK || part.type === RANGED_ATTACK) {
                    return true;
                }
                return false;
            }).length;
        });
        const boostedHostileBodyParts: number = _.filter(_.flatten(_.map(hostileCreeps, "body")), (p: any) => !!p.boost)
            .length;

        // level 6 -- nuke inbound
        if (room.find(FIND_NUKES).length > 0) {
            room.memory.defcon = 6;
            return;
        }

        // level 5 full seige, 50+ boosted parts
        if (boostedHostileBodyParts >= 50) {
            room.memory.defcon = 5;
            return;
        }

        // level 4 -- 150+ body parts OR over 10 boosted body parts (to prevent spawning on the easy invader)
        if (boostedHostileBodyParts > 10 || hostileBodyParts >= 150) {
            room.memory.defcon = 4;
            return;
        }

        // level 3 -- 50 - 150 body parts
        if (hostileBodyParts < 150 && hostileBodyParts > 50) {
            room.memory.defcon = 3;
            return;
        }

        // level 2 -- Any damaging parts
        if (hostileDamageParts > 0 || hostileStructures.length > 0) {
            room.memory.defcon = 2;
            return;
        }

        // level 1 -- less than 50 body parts, no attack parts
        room.memory.defcon = 1;
        return;
    }

    /**
     * simulate or update the reserve TTL for all remote rooms in that room
     * @param room the room we are updating the remote rooms for
     */
    public static simulateReserveTTL(room: Room): void {
        const remoteRooms = MemoryApi_Room.getRemoteRooms(room);
        for (const remoteRoom of remoteRooms) {
            // Handle unreserved and undefined rooms
            if (!remoteRoom) {
                continue;
            }

            const currentRoom: Room = Game.rooms[remoteRoom.roomName];
            if (currentRoom === undefined) {
                continue;
            }

            if (currentRoom === undefined) {
                // Simulate the dropping of reserve timer by the number of ticks between checks
                remoteRoom.reserveTTL -= RUN_RESERVE_TTL_TIMER;
                if (remoteRoom.reserveTTL < 0) {
                    remoteRoom.reserveTTL = 0;
                }
            } else if (currentRoom.controller) {
                // Get the actual value of the reserve timer
                if (currentRoom.controller!.reservation) {
                    remoteRoom.reserveTTL = Game.rooms[remoteRoom.roomName].controller!.reservation!.ticksToEnd;
                } else {
                    remoteRoom.reserveTTL = 0;
                }
            }
        }
    }

    /**
     * Activate safemode if we need to
     * @param room the room we are checking safemode for
     * @param defcon the defcon level of the room
     */
    public static runSafeMode(room: Room, defcon: number): void {
        // If we are under attack before we have a tower, trigger a safe mode
        if (defcon >= 2 && !RoomHelper_Structure.isExistInRoom(room, STRUCTURE_TOWER)) {
            if (room.controller!.safeModeAvailable) {
                room.controller!.activateSafeMode();
            }
        }

        // If we are under attack and our towers have no energy, trigger a safe mode
        const towerEnergy = _.sum(MemoryApi_Room.getStructureOfType(room.name, STRUCTURE_TOWER), "energy");
        if (defcon >= 3 && towerEnergy === 0) {
            if (room.controller!.safeModeAvailable) {
                room.controller!.activateSafeMode();
            }
        }
    }
}
