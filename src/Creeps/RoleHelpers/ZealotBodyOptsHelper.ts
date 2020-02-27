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
    ROLE_ZEALOT,
    ERROR_ERROR,
    SpawnHelper,
    SpawnApi,
    UserException,
    MemoryApi_Room,
} from "Utils/Imports/internals";

export class ZealotBodyOptsHelper implements ICreepBodyOptsHelper {
    public name: RoleConstant = ROLE_ZEALOT;

    constructor() {
        const self = this;
        self.generateCreepBody = self.generateCreepBody.bind(self);
        self.generateCreepOptions = self.generateCreepOptions.bind(this);
    }

    /**
     * Generate body for zealot creep
     * @param tier the tier of the room
     */
    public generateCreepBody(tier: TierConstant, room: Room): BodyPartConstant[] {
        // Default Values for Zealot
        let body: CreepBodyDescriptor = { work: 0, move: 0 };
        const opts: CreepBodyOptions = { mixType: GROUPED };

        switch (tier) {
            // case TIER_6: // this is just for quick and dirty purposes, i don't reccomend using it, but replace tier with your current tier and make a custom attack zealot
            //     body = { attack: 1, move: 10, tough: 39 };
            //     break;
            case TIER_1: // 2 Attack, 2 Move - Total Cost: 260
                body = { attack: 2, move: 2 };
                break;

            case TIER_2: // 3 Attack, 3 Move  - Total Cost: 390
                body = { attack: 3, move: 3 };
                break;

            case TIER_3: // 5 Attack, 5 Move - Total Cost: 650
                body = { attack: 5, move: 5 };
                break;

            case TIER_4: // 10 Attack, 10 Move - Total Cost: 1300
                body = { attack: 10, move: 10 };
                break;

            case TIER_5: // 15 Attack, 12 Move - Total Cost: 1800
                body = { attack: 15, move: 12 };
                break;

            case TIER_8:
            case TIER_7:
            case TIER_6: // 20 Attack, 14 Move - Total Cost: 2300
                body = { attack: 20, move: 14 };
                break;
        }

        // ! Important DONT FORGET TO CHANGE
        // Temp override
        body = { attack: 1, move: 1 };
        // Generate creep body based on body array and options
        return SpawnApi.createCreepBody(body, opts);
    }

    /**
     * Generate options for zealot creep
     * @param roomState the room state of the room
     * @param squadSizeParam the size of the squad associated with the zealot
     * @param squadUUIDParam the squad id that the zealot is a member of
     * @param rallyLocationParam the meeting place for the squad
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
