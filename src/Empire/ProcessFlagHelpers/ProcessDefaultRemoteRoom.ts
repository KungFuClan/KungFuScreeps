import { UserException, EmpireHelper, MemoryApi_Room, MemoryApi_Empire, EmpireApi, REMOTE_ENERGY } from "Utils/Imports/internals";
import _ from "lodash";

export class ProcessDefaultRemoteRoom implements IFlagProcesser {
    public primaryColor: ColorConstant = COLOR_YELLOW;

    constructor() {
        const self = this;
        self.processFlag = self.processFlag.bind(self);
        self.handleRemoteFlagPlaced = self.handleRemoteFlagPlaced.bind(self);
        self.handleRemoveRemoteFlagPlaced = self.handleRemoveRemoteFlagPlaced.bind(self);
    }

    /**
     * Process the default remote room flag
     * @param flag
     */
    public processFlag(flag: Flag): void {
        switch (flag.secondaryColor) {
            // Create an energy focused remote room
            case COLOR_YELLOW:
                const roomName: string = flag.pos.roomName;
                const dependentRoom: Room = Game.rooms[EmpireHelper.findDependentRoom(roomName)];
                this.handleRemoteFlagPlaced(flag, dependentRoom, roomName)
                EmpireApi.createRemoteRoomInstance(roomName, dependentRoom, REMOTE_ENERGY);
                break;

            // Clear an existing remote room
            case COLOR_RED:
                this.handleRemoveRemoteFlagPlaced(flag);
                EmpireApi.removeRemoteRoomInstance(flag.pos.roomName);
                break;
        }
    }

    /**
     * Handle the flag administration for the remote room
     * @param flag the flag that we placed to create the instance
     * @param dependentRoom the room handling the supply chain for the remote room
     * @param remoteRoomName the name of the remote room we are taking
     */
    private handleRemoteFlagPlaced(flag: Flag, dependentRoom: Room, remoteRoomName: string): void {
        const flagTypeConst: FlagTypeConstant | undefined = EmpireHelper.getFlagType(flag);
        Memory.flags[flag.name].complete = true;
        Memory.flags[flag.name].processed = true;
        Memory.flags[flag.name].timePlaced = Game.time;
        Memory.flags[flag.name].flagType = flagTypeConst;
        Memory.flags[flag.name].flagName = flag.name;

        // If the dependent room already has this room covered, set the flag to be deleted and throw a warning
        const existingDepedentRemoteRoomMem: RemoteRoomMemory | undefined = _.find(
            MemoryApi_Room.getRemoteRooms(dependentRoom),
            (rr: RemoteRoomMemory) => {
                if (rr) {
                    return rr.roomName === remoteRoomName;
                }
                return false;
            }
        );

        if (existingDepedentRemoteRoomMem) {
            Memory.flags[flag.name].complete = true;
            throw new UserException(
                "Already working this dependent room!",
                "The room you placed the remote flag in is already being worked by " +
                existingDepedentRemoteRoomMem.roomName,
                ERROR_WARN
            );
        }
    }

    /**
     * Handle the flag administration for the remote room removal
     * @param flag the flag that triggered the removal of the remote room
     */
    private handleRemoveRemoteFlagPlaced(flag: Flag): void {
        const flagTypeConst: FlagTypeConstant | undefined = EmpireHelper.getFlagType(flag);
        Memory.flags[flag.name].complete = true;
        Memory.flags[flag.name].processed = true;
        Memory.flags[flag.name].timePlaced = Game.time;
        Memory.flags[flag.name].flagType = flagTypeConst;
        Memory.flags[flag.name].flagName = flag.name;
    }
}
