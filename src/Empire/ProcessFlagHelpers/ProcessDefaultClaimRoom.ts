import { EmpireHelper, UserException, MemoryApi_Room, MemoryApi_Empire, EmpireApi, CLAIM_DEFAULT } from "Utils/Imports/internals";
import _ from "lodash";

export class ProcessDefaultClaimRoom implements IFlagProcesser {
    public primaryColor: ColorConstant = COLOR_WHITE;

    constructor() {
        const self = this;
        self.processFlag = self.processFlag.bind(self);
        self.handleClaimFlagPlaced = self.handleClaimFlagPlaced.bind(self);
        self.handleRemoveClaimFlagPlaced = self.handleRemoveClaimFlagPlaced.bind(self);
    }

    /**
     * Process the default remote room flag
     * @param flag
     */
    public processFlag(flag: Flag): void {

        switch (flag.secondaryColor) {
            case COLOR_WHITE:
                const claimRoomName: string = flag.pos.roomName;
                const dependentRoom: Room = Game.rooms[EmpireHelper.findDependentRoom(claimRoomName)];
                this.handleClaimFlagPlaced(flag, dependentRoom, claimRoomName);
                EmpireApi.createClaimRoomInstance(claimRoomName, dependentRoom, CLAIM_DEFAULT);
                break;

            case COLOR_RED:
                this.handleRemoveClaimFlagPlaced(flag);
                EmpireApi.removeClaimRoomInstance(flag.pos.roomName);
                break;
        }
    }

    /**
     * Handle the administration for placing a claim flag
     * @param flag the flag that triggered the claim event
     * @param dependentRoom the room supporting the claim room
     * @param claimRoomName the name of the claim room we are trying to grab
     */
    private handleClaimFlagPlaced(flag: Flag, dependentRoom: Room, claimRoomName: string): void {
        // Get the host room and set the flags memory
        const flagTypeConst: FlagTypeConstant | undefined = EmpireHelper.getFlagType(flag);
        const roomName: string = flag.pos.roomName;
        Memory.flags[flag.name].complete = true;
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
    }

    /**
     * Handle the administration for placing a claim remove flag
     * @param flag the flag that triggered the claim remove event
     */
    private handleRemoveClaimFlagPlaced(flag: Flag): void {
        // Get the host room and set the flags memory
        const flagTypeConst: FlagTypeConstant | undefined = EmpireHelper.getFlagType(flag);
        Memory.flags[flag.name].complete = true;
        Memory.flags[flag.name].processed = true;
        Memory.flags[flag.name].timePlaced = Game.time;
        Memory.flags[flag.name].flagType = flagTypeConst;
        Memory.flags[flag.name].flagName = flag.name;
    }
}
