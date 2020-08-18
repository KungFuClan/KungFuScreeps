import { EmpireHelper, PROCESS_FLAG_HELPERS, MemoryApi_Empire, MemoryApi_Room } from "Utils/Imports/internals";
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
            for (const i in PROCESS_FLAG_HELPERS) {
                const currentHelper: IFlagProcesser = PROCESS_FLAG_HELPERS[i];
                if (currentHelper.primaryColor === flag.color) {
                    // We've found primary color, search for undefined or matching secondary color
                    if (!currentHelper.secondaryColor || currentHelper.secondaryColor === flag.secondaryColor) {
                        currentHelper.processFlag(flag);
                        break;
                    }
                }
                // If we make it here, we didn't find a match for the flag type, delete the flag and carry on
                MemoryApi_Empire.createEmpireAlertNode("Attempted to process flag of an unhandled type.", 10);
                flag.memory.processed = true;
                flag.memory.complete = true;
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
    public static cleanDeadFlags(): void {
        // Get all flag based action memory structures (Remote, Claim, and Attack Room Memory)
        const allRooms = MemoryApi_Empire.getOwnedRooms();
        const claimRooms: Array<ClaimRoomMemory | undefined> = _.flatten(
            _.map(allRooms, room => MemoryApi_Room.getClaimRooms(room))
        );
        const remoteRooms: Array<RemoteRoomMemory | undefined> = _.flatten(
            _.map(allRooms, room => MemoryApi_Room.getRemoteRooms(room))
        );

        // Remove claim room flags once the room is sufficiently built up
        EmpireHelper.markCompletedClaimRooms(claimRooms);

        // Clean dead flags from memory structures
        EmpireHelper.cleanDeadClaimRoomFlags(claimRooms);
        EmpireHelper.cleanDeadRemoteRoomsFlags(remoteRooms);

        // Clean the memory of each type of dependent room memory structure with no existing flags associated
        EmpireHelper.cleanDeadClaimRooms(claimRooms);
        EmpireHelper.cleanDeadRemoteRooms(remoteRooms);
    }
}
