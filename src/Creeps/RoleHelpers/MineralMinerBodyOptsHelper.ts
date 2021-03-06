import {
    GROUPED,
    COLLATED,
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
    ROLE_MINERAL_MINER,
    SpawnHelper,
    SpawnApi,
    MemoryApi_Room
} from "Utils/Imports/internals";

export class MineralMinerBodyOptsHelper implements ICreepBodyOptsHelper {
    public name: RoleConstant = ROLE_MINERAL_MINER;

    constructor() {
        const self = this;
        self.generateCreepBody = self.generateCreepBody.bind(self);
        self.generateCreepOptions = self.generateCreepOptions.bind(this);
    }

    /**
     * Generate body for mienral miner creep
     * @param tier The tier of the room
     */
    public generateCreepBody = (tier: TierConstant, room: Room): BodyPartConstant[] => {
        let body: CreepBodyDescriptor = { work: 2, move: 2 };
        const opts: CreepBodyOptions = { mixType: GROUPED };

        switch (tier) {
            case TIER_6:
                body = { work: 8, move: 4 };
                break;

            case TIER_8:
            case TIER_7:
                body = { work: 10, move: 5 };
        }

        // Generate the creep body based on the body array and options
        return SpawnApi.createCreepBody(body, opts);
    };

    /**
     * Generate options for miner creep
     * @param roomState the room state of the room
     */
    public generateCreepOptions = (roomState: RoomStateConstant): CreepOptionsCiv | undefined => {
        let creepOptions: CreepOptionsCiv = SpawnHelper.getDefaultCreepOptionsCiv();

        switch (roomState) {
            case ROOM_STATE_INTRO:
            case ROOM_STATE_BEGINNER:
            case ROOM_STATE_INTER:
            case ROOM_STATE_ADVANCED:
            case ROOM_STATE_STIMULATE:
            case ROOM_STATE_UPGRADER:
            case ROOM_STATE_NUKE_INBOUND:
                creepOptions = {
                    harvestMinerals: true
                };
                break;
        }

        return creepOptions;
    };

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
        return room.name;
    }

    /**
     * Get the spawn direction for the creep
     * @param centerSpawn the center spawn for the room
     * @param room the room we are in
     */
    public getSpawnDirection(centerSpawn: StructureSpawn, room: Room): DirectionConstant[] {
        const roomCenter: RoomPosition = MemoryApi_Room.getBunkerCenter(room, false);
        const directions: DirectionConstant[] = [
            TOP,
            TOP_RIGHT,
            RIGHT,
            BOTTOM_RIGHT,
            BOTTOM,
            BOTTOM_LEFT,
            LEFT,
            TOP_LEFT
        ];
        const managerDirection: DirectionConstant = centerSpawn.pos.getDirectionTo(roomCenter!.x, roomCenter!.y);
        directions.splice(directions.indexOf(managerDirection), 1);
        return directions;
    }
}
