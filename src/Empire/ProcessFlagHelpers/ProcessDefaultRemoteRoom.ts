import { UserException, EmpireHelper, MemoryApi_Room, MemoryApi_Empire, EmpireApi, REMOTE_ENERGY } from "Utils/Imports/internals";
import _ from "lodash";

export class ProcessDefaultRemoteRoom implements IFlagProcesser {
    public primaryColor: ColorConstant = COLOR_YELLOW;

    constructor() {
        const self = this;
        self.processFlag = self.processFlag.bind(self);
    }

    /**
     * Process the default remote room flag
     * @param flag
     */
    public processFlag(flag: Flag): void {
        switch (flag.secondaryColor) {
            // Create an energy focused remote room
            case COLOR_YELLOW:
                EmpireApi.createRemoteRoomInstance(flag, REMOTE_ENERGY);
                break;

            // Clear an existing remote room
            case COLOR_RED:
                EmpireApi.removeRemoteRoomInstance(flag);
                break;
        }
    }
}
