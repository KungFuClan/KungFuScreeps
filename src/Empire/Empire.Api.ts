import { EmpireHelper, PROCESS_FLAG_HELPERS, MemoryApi_Empire, MemoryApi_Room, UserException, ERROR_WARN, RoomManager } from "Utils/Imports/internals";
import _ from "lodash";

export class EmpireApi {
    /**
     * get new flags that need to be processed
     * @returns Flag[] an array of flags that need to be processed (empty if none)
     */
    public static getUnprocessedFlags(): Flag[] {
        // Create an array of all flags
        const allFlags: Flag[] = MemoryApi_Empire.getAllFlags();
        const newFlags: Flag[] = [];

        // Create an array of all unprocessed flags
        for (const flag of allFlags) {
            if (!flag) {
                continue;
            }
            if (!flag.memory.processed || flag.memory.processed === undefined) {
                newFlags.push(flag);
            }
        }

        // Returns all unprocessed flags, empty array if there are none
        return newFlags;
    }
    /**
     * search for new flags and properly commit them
     * @param newFlags StringMap of new flags we need to process
     */
    public static processNewFlags(newFlags: Flag[]): void {
        // Don't run the function if theres no new flags
        if (newFlags.length === 0) {
            return;
        }

        for (const flag of newFlags) {
            // Find the proper implementation of the flag processer we need
            let processedFlag = false;
            for (const i in PROCESS_FLAG_HELPERS) {
                const currentHelper: IFlagProcesser = PROCESS_FLAG_HELPERS[i];
                if (currentHelper.primaryColor === flag.color) {
                    // We've found primary color, search for undefined or matching secondary color
                    currentHelper.processFlag(flag);
                    processedFlag = true;
                    break;
                }
            }

            if (!processedFlag) {
                // If we make it here, we didn't find a match for the flag type, delete the flag and carry on
                MemoryApi_Empire.createEmpireAlertNode("Attempted to process flag of an unhandled type.", 10);
                flag.memory.processed = true;
                flag.memory.complete = true;
                return;
            }

            // Create room memory for the dependent room to prevent errors in accessing the rooms memory for spawning and traveling
            const roomName = flag.pos.roomName;
            if (!Memory.rooms[roomName]) {
                const isOwnedRoom: boolean = false;
                MemoryApi_Empire.createEmpireAlertNode("Initializing Room Memory for Dependent Room [" + roomName + "].", 10);
                MemoryApi_Room.initRoomMemory(roomName, isOwnedRoom);
            }
        }
    }

    /**
     * deletes all flags marked as complete
     */
    public static deleteCompleteFlags(): void {
        const completeFlags = MemoryApi_Empire.getAllFlags((flag: Flag) => flag.memory.complete);

        // Loop over all flags, removing them and their direct memory from the game
        for (const flag of completeFlags) {
            MemoryApi_Empire.createEmpireAlertNode("Removing flag [" + flag.name + "]", 10);
            flag.remove();
        }
    }

    /**
     * look for dead flags (memory with no associated flag existing) and remove them
     */
    public static cleanClaimRooms(): void {
        // Get all flag based action memory structures (Remote, Claim, and Attack Room Memory)
        const allRooms = MemoryApi_Empire.getOwnedRooms();

        for (const room of allRooms) {
            const claimRooms: Array<ClaimRoomMemory | undefined> = MemoryApi_Room.getClaimRooms(room)
            EmpireHelper.markCompletedClaimRooms(claimRooms);
            this.cleanCompletedClaimRooms(claimRooms, room.name);
        }

    }

    /**
     * Remove all claim rooms that have build complete on them
     * @param claimRooms all the claim rooms we have for the current room
     */
    public static cleanCompletedClaimRooms(claimRooms: Array<ClaimRoomMemory | undefined>, dependentRoomName: string): void {
        for (const claimRoom of claimRooms) {
            if (!claimRoom) continue;
            if (claimRoom.buildComplete) {
                delete Memory.rooms[dependentRoomName].claimRooms![claimRoom.roomName];
            }
        }
    }

    /**
     * Create the specified remote room instance in the room specified
     * TODO - Remove flag from this to generalize it
     * @param flag the flag we used to create the remote room
     * @param remoteRoomType the type of remote room we are creating
     */
    public static createRemoteRoomInstance(remoteRoomName: string, dependentRoom: Room, remoteRoomType: RemoteRoomTypeConstant): void {
        const remoteRoomMemory: RemoteRoomMemory = {
            sources: { cache: Game.time, data: 1 },
            hostiles: { cache: Game.time, data: null },
            structures: { cache: Game.time, data: null },
            roomName: remoteRoomName,
            reserveTTL: 0,
            reserveUsername: undefined,
            remoteRoomType
        };

        MemoryApi_Empire.createEmpireAlertNode(
            "Host Room: [" + dependentRoom.name + "] - Remote Room type [" + remoteRoomType + "]",
            10
        );
        if (!dependentRoom.memory.remoteRooms) dependentRoom.memory.remoteRooms = {};
        dependentRoom.memory.remoteRooms![remoteRoomName] = remoteRoomMemory;
    }

    /**
     * Remove all remote room instances from the room in question
     * TODO - Remove flag from this to generalize it
     * @param roomName the name of the room we are removing the remote room instance from
     */
    public static removeRemoteRoomInstance(remoteRoomName: string): void {
        // Delete all creep associated with remote room
        const ownedRooms: Room[] = MemoryApi_Empire.getOwnedRooms();
        delete Memory.rooms[remoteRoomName];
        for (const room of ownedRooms) {
            if (!room.memory.remoteRooms) room.memory.remoteRooms = {};
            delete Memory.rooms[room.name].remoteRooms![remoteRoomName];
        }

        // Suicide all creeps associated with the remote room
        for (let i in Game.creeps) {
            const creep: Creep = Game.creeps[i];
            if (creep.memory.targetRoom === remoteRoomName) {
                creep.suicide();
            }
        }
    }

    /**
     * TODO - Remove flag from this to generalize it
     * @param flag The flag we used to generate the request
     * @param claimRoomType the type of claim room we are creating
     */
    public static createClaimRoomInstance(flag: Flag, claimRoomType: ClaimRoomTypeConstant): void {
        // Get the host room and set the flags memory
        const dependentRoom: Room = Game.rooms[EmpireHelper.findDependentRoom(flag.pos.roomName)];
        const flagTypeConst: FlagTypeConstant | undefined = EmpireHelper.getFlagType(flag);
        const roomName: string = flag.pos.roomName;
        Memory.flags[flag.name].complete = false;
        Memory.flags[flag.name].processed = true;
        Memory.flags[flag.name].timePlaced = Game.time;
        Memory.flags[flag.name].flagType = flagTypeConst;
        Memory.flags[flag.name].flagName = flag.name;

        // If the dependent room already has this room covered, set the flag to be deleted and throw a warning
        const existingDepedentClaimRoomMem: ClaimRoomMemory | undefined = _.find(
            MemoryApi_Room.getClaimRooms(dependentRoom),
            (rr: ClaimRoomMemory) => {
                if (rr) {
                    return rr.roomName === roomName;
                }
                return false;
            }
        );

        if (existingDepedentClaimRoomMem) {
            Memory.flags[flag.name].complete = true;
            throw new UserException(
                "Already working this dependent room!",
                "The room you placed the claim flag in is already being worked by " +
                existingDepedentClaimRoomMem.roomName,
                ERROR_WARN
            );
        }

        // Otherwise, add a brand new memory structure onto it
        const claimRoomMemory: ClaimRoomMemory = {
            roomName: flag.pos.roomName,
            claimRoomType,
            buildComplete: false
        };

        MemoryApi_Empire.createEmpireAlertNode(
            "Claim Flag [" + flag.name + "] processed - Host Room: [" + dependentRoom.name + "] - Claim Room Type [" + claimRoomType + "].",
            10
        );
        dependentRoom.memory.claimRooms![roomName] = claimRoomMemory;
    }

    /**
     * Remove the claim room instance from the room specified
     * TODO - Remove flag from this to generizise it
     * @param flag The flag we used to generate the request
     */
    public static removeClaimRoomInstance(flag: Flag): void {
        const flagTypeConst: FlagTypeConstant | undefined = EmpireHelper.getFlagType(flag);
        const claimRoomName = flag.pos.roomName;
        Memory.flags[flag.name].complete = true;
        Memory.flags[flag.name].processed = true;
        Memory.flags[flag.name].timePlaced = Game.time;
        Memory.flags[flag.name].flagType = flagTypeConst;
        Memory.flags[flag.name].flagName = flag.name;

        // Delete all creep associated with claim room
        const ownedRooms: Room[] = MemoryApi_Empire.getOwnedRooms();
        delete Memory.rooms[claimRoomName];
        for (const room of ownedRooms) {
            if (!room.memory.claimRooms) room.memory.claimRooms = {};
            delete Memory.rooms[room.name].claimRooms![claimRoomName];
        }

        // Suicide all creeps associated with the claim room
        for (let i in Game.creeps) {
            const creep: Creep = Game.creeps[i];
            if (creep.memory.targetRoom === claimRoomName) {
                creep.suicide();
            }
        }
    }
}
