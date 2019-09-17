import {
    GROUPED,
    ROOM_STATE_INTRO,
    ROOM_STATE_BEGINNER,
    ROOM_STATE_INTER,
    ROOM_STATE_ADVANCED,
    ROOM_STATE_NUKE_INBOUND,
    ROOM_STATE_STIMULATE,
    ROOM_STATE_UPGRADER,
    TIER_6,
    TIER_7,
    TIER_8,
    ROLE_MANAGER,
} from "utils/Constants";
import { SpawnHelper } from "Helpers/SpawnHelper";
import SpawnApi from "Api/Spawn.Api"

export class MedicBodyOptsHelper implements ICreepBodyOptsHelper {

    public name: RoleConstant = ROLE_MANAGER;

    constructor() {
        const self = this;
        self.generateCreepBody = self.generateCreepBody.bind(self);
        self.generateCreepOptions = self.generateCreepOptions.bind(this);
    }

    /**
     * Generate body for manager creep
     * @param tier the tier of the room
     */
    public generateCreepBody(tier: TierConstant): BodyPartConstant[] {
        // Default Values for manager
        let body: CreepBodyDescriptor = { heal: 1, move: 1 };
        const opts: CreepBodyOptions = { mixType: GROUPED };

        switch (tier) {
            // Manager doesn't exist until power upgrader exists, so can't be before t6
            case TIER_8:
            case TIER_7:
            case TIER_6: // 8 Carry - Total Cost: 400
                body = { carry: 8 };
                break;
        }

        // Generate creep body based on body array and options
        return SpawnApi.createCreepBody(body, opts);
    }

    /**
     * Generate options for manager creep
     * @param roomState the room state of the room
     */
    public generateCreepOptions = (roomState: RoomStateConstant): CreepOptionsCiv | undefined => {
        let creepOptions: CreepOptionsCiv = SpawnHelper.getDefaultCreepOptionsCiv();

        switch (roomState) {
            case ROOM_STATE_UPGRADER:
            case ROOM_STATE_NUKE_INBOUND:
                creepOptions = {
                    getFromStorage: true,
                    getFromLink: true,
                    getFromTerminal: true,
                    fillSpawn: true,
                    fillLink: true,
                    fillTerminal: true,
                    fillStorage: true,
                    fillTower: true
                };
                break;
        }

        return creepOptions;
    }
}
