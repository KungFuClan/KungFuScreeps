import {
    Military_Spawn_Api,
    STANDARD_MAN,
    SpawnApi,
    SOLO_STALKER_MAN,
    SOLO_ZEALOT_MAN,
    TOWER_DRAINER_MAN,
    UserException,
    ERROR_ERROR,
    DOMESTIC_DEFENDER_MAN,
    REMOTE_DEFENDER_MAN
} from "Utils/Imports/internals";

export class ProcessDefaultAttackFlag implements IFlagProcesser {
    public primaryColor: ColorConstant = COLOR_RED;
    public secondaryColor: undefined = undefined;

    constructor() {
        const self = this;
        self.processFlag = self.processFlag.bind(self);
    }

    /**
     * Process the default remote room flag
     * @param flag
     */
    public processFlag(flag: Flag): void {
        // Get the host room and set the flags memory
        const roomName: string = flag.pos.roomName;
        const operationUUID: string = SpawnApi.generateSquadUUID(roomName);
        Memory.flags[flag.name].complete = true;
        Memory.flags[flag.name].processed = true;
        Memory.flags[flag.name].timePlaced = Game.time;
        Memory.flags[flag.name].flagName = flag.name;

        // Choose the squad instance to create based on our flag colors
        switch (flag.secondaryColor) {
            case COLOR_RED:     // Standard Squad
                Military_Spawn_Api.createSquadInstance(STANDARD_MAN, roomName, operationUUID);
                break;

            case COLOR_BLUE:    // Solo Zealot
                // Military_Spawn_Api.createSquadInstance(SOLO_ZEALOT_MAN, roomName, operationUUID);
                Military_Spawn_Api.createSquadInstance(REMOTE_DEFENDER_MAN, roomName, operationUUID); // TEMP DOMESTIC DEFENDER TESTING
                break;

            case COLOR_BROWN:   // Solo Stalker
                Military_Spawn_Api.createSquadInstance(SOLO_STALKER_MAN, roomName, operationUUID);
                break;

            case COLOR_WHITE:   // Tower Drainer Squad
                Military_Spawn_Api.createSquadInstance(TOWER_DRAINER_MAN, roomName, operationUUID);
                break;

            default:
                throw new UserException(
                    "Invalid attack flag",
                    "ProcessDefaultAttackFlag -> secondary color is not handled",
                    ERROR_ERROR
                );
        }
    }
}
