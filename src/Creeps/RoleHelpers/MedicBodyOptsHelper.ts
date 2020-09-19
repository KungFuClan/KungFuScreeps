import {
    GROUPED,
    ROOM_STATE_INTRO,
    ROOM_STATE_BEGINNER,
    ROOM_STATE_INTER,
    ROOM_STATE_ADVANCED,
    ROOM_STATE_NUKE_INBOUND,
    ROOM_STATE_STIMULATE,
    ROOM_STATE_UPGRADER,
    TIER_1,
    TIER_2,
    TIER_3,
    TIER_4,
    TIER_5,
    TIER_6,
    TIER_7,
    TIER_8,
    ROLE_MEDIC,
    ERROR_ERROR,
    SpawnHelper,
    SpawnApi,
    UserException,

    MemoryApi_Room
} from "Utils/Imports/internals";

export class MedicBodyOptsHelper implements ICreepBodyOptsHelper {
    public name: RoleConstant = ROLE_MEDIC;

    constructor() {
        const self = this;
        self.generateCreepBody = self.generateCreepBody.bind(self);
        self.generateCreepOptions = self.generateCreepOptions.bind(this);
    }

    /**
     * Generate body for medic creep
     * @param tier the tier of the room
     */
    public generateCreepBody(tier: TierConstant, room: Room): BodyPartConstant[] {
        // Default Values for Medic
        let body: CreepBodyDescriptor = { heal: 1, move: 1 };
        const opts: CreepBodyOptions = { mixType: GROUPED };

        switch (tier) {
            case TIER_1: // 1 Heal, 1 Move - Total Cost: 300
                body = { heal: 1, move: 1 };
                break;

            case TIER_2: // 2 Heal, 1 Move - Total Cost: 550
                body = { heal: 2, move: 1 };
                break;

            case TIER_3: // 2 Heal, 2 Move - Total Cost: 600
                body = { heal: 2, move: 2 };
                break;

            case TIER_4: // 4 Heal, 4 Move - Total Cost: 1200
                body = { heal: 4, move: 4 };
                break;

            case TIER_5: // 6 Heal, 6 Move - Total Cost: 1800
                body = { heal: 6, move: 6 };
                break;

            case TIER_6: // 8 Heal, 6 Move - Total Cost: 2300
                body = { heal: 8, move: 6 };
                break;

            case TIER_7:    // 8 Heal, 8 Move - Total Cost: 2400
                body = { heal: 15, move: 15 };
                break;

            case TIER_8:    // 15 Heal, 15 Move - Total Cost: 4500
                body = { heal: 15, move: 15 };
                break;

        }

        // ! Important DONT FORGET TO CHANGE
        // Temp override
        body = { heal: 1, move: 1 };
        // Generate creep body based on body array and options
        return SpawnApi.createCreepBody(body, opts);
    }

    /**
     * Generate options for medic creep
     * @param tier the tier of the room
     */
    public generateCreepOptions(
        roomState: RoomStateConstant,
        squadUUIDParam: string | null,
        operationUUIDParam: string | null,
        caravanPosParam: number | null
    ): CreepOptionsMili | undefined {
        let creepOptions: CreepOptionsMili = SpawnHelper.getDefaultCreepOptionsMili();
        creepOptions = {
            squadUUID: squadUUIDParam,
            operationUUID: operationUUIDParam,
            caravanPos: caravanPosParam
        };

        return creepOptions;
    }

    /**
     * Get the home room for the creep
     * @param room the room we are spawning the creep from
     */
    public getHomeRoom(room: Room): string {
        return room.name;
    }

    /**
     * Get the target room for the creep
     * @param room the room we are spawning the creep in
     * @param roleConst the role we are getting room for
     * @param creepBody the body of the creep we are checking, so we know who to exclude from creep counts
     * @param creepName the name of the creep we are checking for
     */
    public getTargetRoom(
        room: Room,
        roleConst: RoleConstant,
        creepBody: BodyPartConstant[],
        creepName: string
    ): string {
        // Military creeps don't need a target room at the moment
        return room.name;
    }

    /**
     * Get the spawn direction for the creep
     * @param centerSpawn the center spawn for the room
     * @param room the room we are in
     */
    public getSpawnDirection(centerSpawn: StructureSpawn, room: Room): DirectionConstant[] {
        const roomCenter: RoomPosition = MemoryApi_Room.getBunkerCenter(room, false);
        const directions: DirectionConstant[] = [TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT];
        const managerDirection: DirectionConstant = centerSpawn.pos.getDirectionTo(roomCenter!.x, roomCenter!.y);
        directions.splice(directions.indexOf(managerDirection), 1);
        return directions;
    }
}
