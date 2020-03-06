import {
    GROUPED,
    ROOM_STATE_NUKE_INBOUND,
    ROOM_STATE_STIMULATE,
    ROOM_STATE_UPGRADER,
    TIER_6,
    TIER_7,
    TIER_8,
    TIER_5,
    ROLE_POWER_UPGRADER,
    SpawnHelper,
    SpawnApi,
    MemoryApi_Room,
    STORAGE_LEVEL_MINI_UPGRADERS,
    MINI_UPGRADER_WORK_PARTS,
    RoomHelper_State,
    RoomHelper_Structure
} from "Utils/Imports/internals";

export class PowerUpgraderBodyOptsHelper implements ICreepBodyOptsHelper {
    public name: RoleConstant = ROLE_POWER_UPGRADER;

    constructor() {
        const self = this;
        self.generateCreepBody = self.generateCreepBody.bind(self);
        self.generateCreepOptions = self.generateCreepOptions.bind(this);
    }

    /**
     * Generate body for power upgrader creep
     * @param tier the tier of the room
     */
    public generateCreepBody(tier: TierConstant, room: Room): BodyPartConstant[] {
        // Default Values for Power Upgrader
        let body: CreepBodyDescriptor = { work: 18, carry: 8, move: 4 };
        const opts: CreepBodyOptions = { mixType: GROUPED };
        const numRemoteSources = RoomHelper_State.numRemoteSources(room);
        let numWorkParts: number = (numRemoteSources * 2);
        const storageLevel: number = RoomHelper_Structure.getStorageLevel(room);
        const NUM_CARRY: number = 8;
        const NUM_MOVE: number = 4;
        const USED_ENERGY: number = (NUM_CARRY + NUM_MOVE) * 50;

        switch (tier) {
            case TIER_5:
            case TIER_6:
            case TIER_7:
                numWorkParts += 12;
                // This is to limit work parts in the case of an empty storage to help a room get back off the ground
                numWorkParts = storageLevel < STORAGE_LEVEL_MINI_UPGRADERS ? MINI_UPGRADER_WORK_PARTS : numWorkParts;
                numWorkParts = SpawnHelper.limitNumWorkParts(numWorkParts, USED_ENERGY, tier);
                body = { work: numWorkParts, carry: NUM_CARRY, move: NUM_MOVE };
                break;

            case TIER_8: // 15 Work, 8 Carry, 4 Move - Total Cost: 2100
                numWorkParts = storageLevel < STORAGE_LEVEL_MINI_UPGRADERS ? MINI_UPGRADER_WORK_PARTS : 15;
                body = { work: numWorkParts, carry: NUM_CARRY, move: NUM_MOVE }; // RCL 8 you can only do 15 per tick
                break;
        }

        // Generate creep body based on body array and options
        return SpawnApi.createCreepBody(body, opts);
    }

    /**
     * Generate options for power upgrader creep
     * @param roomState the room state of the room
     */
    public generateCreepOptions(roomState: RoomStateConstant): CreepOptionsCiv | undefined {
        let creepOptions: CreepOptionsCiv = SpawnHelper.getDefaultCreepOptionsCiv();

        switch (roomState) {
            case ROOM_STATE_UPGRADER:
            case ROOM_STATE_STIMULATE:
            case ROOM_STATE_NUKE_INBOUND:
                creepOptions = {
                    upgrade: true, //
                    getFromLink: true //
                };

                break;
        }

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
