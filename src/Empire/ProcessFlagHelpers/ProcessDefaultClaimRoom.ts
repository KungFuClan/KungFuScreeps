import { EmpireHelper, UserException, MemoryApi_Room, MemoryApi_Empire, EmpireApi, CLAIM_DEFAULT } from "Utils/Imports/internals";
import _ from "lodash";

export class ProcessDefaultClaimRoom implements IFlagProcesser {
    public primaryColor: ColorConstant = COLOR_WHITE;

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
            case COLOR_WHITE:
                EmpireApi.createClaimRoomInstance(flag, CLAIM_DEFAULT);
                break;

            case COLOR_RED:
                EmpireApi.removeClaimRoomInstance(flag);
                break;
        }
    }
}
