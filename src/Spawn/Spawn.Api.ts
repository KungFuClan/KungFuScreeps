import {
    SpawnHelper,
    domesticRolePriority,
    remoteRolePriority,
    ROLE_HARVESTER,
    ROLE_MANAGER,
    GROUPED,
    COLLATED,
    ROOM_STATE_INTRO,
    TIER_1,
    TIER_2,
    TIER_3,
    TIER_4,
    TIER_5,
    TIER_6,
    TIER_7,
    TIER_8,
    ERROR_ERROR,
    CREEP_BODY_OPT_HELPERS,
    ROOM_STATE_CREEP_LIMITS,
    MemoryHelper_Room,
    MemoryApi_Room,
    UserException,
    LOW_PRIORITY,
    MED_PRIORITY,
    HIGH_PRIORITY,
    ALL_MILITARY_ROLES,
    MemoryApi_Military,
    ROLE_SCOUT
} from "Utils/Imports/internals";
import { profile } from "Profiler";
import _ from "lodash";

/**
 * The API used by the spawn manager
 */
export class SpawnApi {
    /**
     * set domestic creep limits
     * @param room the room we want limits for
     */
    private static generateDomesticCreepLimits(room: Room): DomesticCreepLimits {
        const roomState: RoomStateConstant = room.memory.roomState as RoomStateConstant;

        // This used to be the big switch statement for each room state
        // It is now seperated into a class per room state
        // This just searches the room states, follow the definition of room_state_creep_limits for the next portion
        // Generate the room state for the specified room state
        for (const index in ROOM_STATE_CREEP_LIMITS) {
            if (ROOM_STATE_CREEP_LIMITS[index].roomState === roomState) {
                return ROOM_STATE_CREEP_LIMITS[index].generateDomesticLimits(room);
            }
        }
        throw new UserException(
            "Failed to generate domestic limits",
            "The room state " + roomState + " doesn't have a implementation. [ " + room.name + " ].",
            ERROR_ERROR
        );
    }

    /**
     * set remote creep limits
     * (we got shooters on deck)
     * @param room the room we want limits for
     */
    private static generateRemoteCreepLimits(room: Room): RemoteCreepLimits {
        const roomState: RoomStateConstant = room.memory.roomState as RoomStateConstant;

        // Generate the room state for the specified room state
        for (const index in ROOM_STATE_CREEP_LIMITS) {
            if (ROOM_STATE_CREEP_LIMITS[index].roomState === roomState) {
                return ROOM_STATE_CREEP_LIMITS[index].generateRemoteLimits(room);
            }
        }
        throw new UserException(
            "Failed to generate domestic limits",
            "The room state " + roomState + " doesn't have a implementation. [ " + room.name + " ].",
            ERROR_ERROR
        );
    }

    /**
     * set creep limits for the room
     * @param room the room we are setting limits for
     */
    public static setCreepLimits(room: Room): void {
        // Ensure creep limits are set
        if (!room.memory.creepLimit) {
            MemoryApi_Room.initCreepLimits(room);
        }

        // Set Domestic Limits to Memory
        MemoryHelper_Room.updateDomesticLimits(room, this.generateDomesticCreepLimits(room));

        // Set Remote Limits to Memory
        MemoryHelper_Room.updateRemoteLimits(room, this.generateRemoteCreepLimits(room));
    }

    /**
     * get the first available open spawn for a room
     * @param room the room we are checking the spawn for
     */
    public static getOpenSpawn(room: Room): any {
        // Get all openSpawns, and return the first
        const openSpawns = MemoryApi_Room.getStructureOfType(
            room.name,
            STRUCTURE_SPAWN,
            (spawn: StructureSpawn) => !spawn.spawning
        );

        if (openSpawns.length === 0) {
            return null;
        }

        return _.first(openSpawns);
    }

    /**
     * get next creep to spawn
     * TODO spawn squad members together
     * @param room the room we want to spawn them in
     */
    public static getNextCreep(room: Room, openSpawn: StructureSpawn): RoleConstant | MilitaryQueue | null {
        // Get Limits for each creep department
        const creepLimits: CreepLimits = MemoryApi_Room.getCreepLimits(room);
        const creepCount: AllCreepCount = MemoryApi_Room.getAllCreepCount(room);
        let militaryRole: MilitaryQueue | null;

        const spawns: StructureSpawn[] = _.filter(
            Game.spawns,
            (spawn: StructureSpawn) => spawn.room.name === room.name
        );
        const centerSpawn: StructureSpawn | null = MemoryHelper_Room.getCenterSpawn(room, spawns);
        const isCenterSpawn = centerSpawn !== null && centerSpawn.id === openSpawn.id;

        // Check for a priority harvester
        if (SpawnHelper.needPriorityHarvester(room)) {
            return ROLE_HARVESTER;
        }

        // Check for high priority military spawn
        militaryRole = this.getNextMilitaryRoleToSpawn(room, HIGH_PRIORITY);
        if (militaryRole) {
            return militaryRole;
        }

        // Check if we need a domestic creep -- Return role if one is found
        for (const role of domesticRolePriority) {
            // Skip the manager if we aren't on the center spawn
            if (!isCenterSpawn && role === ROLE_MANAGER) {
                continue;
            }
            if (creepCount[role] < creepLimits.domesticLimits[role]) {
                return role;
            }
        }

        // Check for medium priority military spawn
        militaryRole = this.getNextMilitaryRoleToSpawn(room, MED_PRIORITY);
        if (militaryRole) {
            return militaryRole;
        }

        // Check if we need a remote creep -- Return role if one is found
        for (const role of remoteRolePriority) {
            if (creepCount[role] < creepLimits.remoteLimits[role]) {
                return role;
            }
        }

        // check for low priority military spawn
        militaryRole = this.getNextMilitaryRoleToSpawn(room, LOW_PRIORITY);
        if (militaryRole) {
            return militaryRole;
        }

        return null;
    }

    /**
     * Check if we need to spawn a military queue of the specified priority
     * @param room the room we are checking in
     * @param priority the priority constant we are checking for
     */
    private static getNextMilitaryRoleToSpawn(room: Room, priority: number): MilitaryQueue | null {
        const miliQueue: MilitaryQueue[] | undefined = room.memory.creepLimit?.militaryQueue;
        if (!miliQueue) {
            return null;
        }

        for (const i in miliQueue) {
            const item: MilitaryQueue = miliQueue[i];

            // If we're past the tick to spawn, and the item is of the specified priority
            if (item.tickToSpawn < Game.time && item.priority === priority) {
                return item;
            }
        }

        return null;
    }

    /**
     * Handle a newly spawned military creep
     * @param roleName the role we spawned
     * @param operationUUID the operation that triggered it
     * @param squadUUID the squad that requested it
     * @param room the room we are spawning it from
     * @param creepName the name of the creep we are saving the refrence for
     */
    public static handleMilitaryCreepSpawnSuccess(roleName: RoleConstant, operationUUID: string, squadUUID: string, room: Room, creepName: string): void {
        // Handle _only_ military roles in this function
        if (roleName === ROLE_SCOUT) {
            MemoryApi_Room.updateLastTickScoutSpawned(room);
        }
        if (!ALL_MILITARY_ROLES.includes(roleName)) {
            return;
        }
        if (!(room.memory.creepLimit?.militaryQueue)) {
            return;
        }

        // Loop over the military queue, finding and removing the creep re just spawned
        // Also add its reference to the creep object in the operation->squad->creeps
        for (let i = 0; i < room.memory.creepLimit.militaryQueue.length; ++i) {
            if (
                room.memory.creepLimit.militaryQueue[i].operationUUID === operationUUID &&
                room.memory.creepLimit.militaryQueue[i].squadUUID === squadUUID &&
                room.memory.creepLimit.militaryQueue[i].role === roleName
            ) {
                // Remove from queue
                room.memory.creepLimit.militaryQueue.splice(i, 1);
                // Add reference to operation
                const instance: ISquadManager | undefined = MemoryApi_Military.getSquadByUUIDs(operationUUID, squadUUID);
                if (!instance) {
                    throw new UserException(
                        "Couldn't find the squad to add the creep to it",
                        "In handleMilitaryCreepSpawnSuccess <- spawnApi",
                        ERROR_ERROR
                    );
                }
                const singleton: ISquadManager | undefined = MemoryApi_Military.getSingletonSquadManager(instance.name);
                singleton.addCreep(instance, creepName);
                return;
            }
        }

        // If we didn't remove one, and it was a military spawn, something went wrong
        throw new UserException(
            "Couldn't remove military creep from spawn queue",
            "Room: [ " + room.name + " ], \n" +
            "OperationUUID: [ " + operationUUID + "], \n" +
            "SquadUUID: [ " + squadUUID + " ]. \n",
            ERROR_ERROR
        );
    }

    /**
     * spawn the next creep
     * @param room the room we want to spawn them in
     * @param body BodyPartConstant[] the body array of the creep
     * @param creepOptions creep options we want to give to it
     * @param role RoleConstant the role of the creep
     * @param spawn spawn we are going to use to spawn the creep
     * @param name the name of the creep
     */
    public static spawnNextCreep(
        room: Room,
        body: BodyPartConstant[],
        creepOptions: CreepOptionsCiv | CreepOptionsMili,
        role: RoleConstant,
        spawn: StructureSpawn,
        homeRoom: string,
        targetRoom: string,
        name: string,
        spawnDirection: DirectionConstant[]
    ): number {
        // Throw error if we don't have enough energy to spawn this creep
        if (this.getEnergyCostOfBody(body) > room.energyAvailable) {
            throw new UserException(
                "Creep failed to spawn.",
                'The role "' + role + '" was unable to spawn in room "' + room.name + '": Not enough energy .',
                ERROR_WARN
            );
        }

        const creepMemory = SpawnHelper.generateDefaultCreepMemory(role, homeRoom, targetRoom, creepOptions);
        return spawn.spawnCreep(body, name, { memory: creepMemory, directions: spawnDirection });
    }

    /**
     * get energy cost of creep body
     * @param room the room we are spawning them in
     * @param RoleConstant the role of the creep
     * @param tier the tier of this creep we are spawning
     */
    public static getEnergyCostOfBody(body: BodyPartConstant[]): number {
        // Create the object with the costs of each body part
        let totalCost = 0;

        // Loop over the creep body array summing the total cost of the body parts
        for (let i = 0; i < body.length; ++i) {
            const currBodyPart = body[i];
            totalCost += BODYPART_COST[currBodyPart];
        }
        return totalCost;
    }

    /**
     * check what tier of this creep we are spawning
     * @param room the room we are spawning them in
     * @param RoleConstant the role of the creep
     */
    public static getTier(room: Room, roleConst: RoleConstant | null): TierConstant {
        let energyAvailable: number = room.energyCapacityAvailable;

        if (roleConst === ROLE_HARVESTER && SpawnHelper.needPriorityHarvester(room)) {
            energyAvailable = room.energyAvailable;
        }

        // Check what tier we are in based on the amount of energy the room has
        if (room.memory.roomState === ROOM_STATE_INTRO) {
            return TIER_1;
        }
        if (energyAvailable >= TIER_7 && room.controller?.level === 8) {
            return TIER_8;
        }

        if (energyAvailable >= TIER_7) {
            return TIER_7;
        }

        if (energyAvailable >= TIER_6) {
            return TIER_6;
        }

        if (energyAvailable >= TIER_5) {
            return TIER_5;
        }

        if (energyAvailable >= TIER_4) {
            return TIER_4;
        }

        if (energyAvailable >= TIER_3) {
            return TIER_3;
        }

        if (energyAvailable >= TIER_2) {
            return TIER_2;
        }

        // If we make it here, we are simply tier 1
        return TIER_1;
    }

    /**
     * get the memory options for this creep
     * @param room the room we are spawning it in
     * @param RoleConstant the role of the creep
     * @param tier the tier of this creep we are spawning
     */
    public static generateCreepOptions(
        role: RoleConstant | null,
        roomState: RoomStateConstant,
        squadMemory: StringMap
    ): CreepOptionsCiv | CreepOptionsMili | undefined {
        // Set default values if military options aren't provided
        // If one of these aren't provided, then the entire purpose of them is nix,
        // So we just check if any of them aren't provided and set defaults for all in that case
        let operationUUID: string | null = squadMemory['operationUUID'];
        let squadUUID: string | null = squadMemory["squadUUID"];
        let caravanPos: number | null = squadMemory["caravanPos"];
        if (!squadUUID || !operationUUID) {
            operationUUID = null;
            squadUUID = null;
            caravanPos = null;
        }

        // If no role provided, throw warning
        if (!role) {
            throw new UserException("Null role provided to generate creep options", "Api/SpawnApi", ERROR_ERROR);
        }

        // Call the appropriate class to generate the creep options for the specified role
        for (const index in CREEP_BODY_OPT_HELPERS) {
            if (CREEP_BODY_OPT_HELPERS[index].name === role) {
                return CREEP_BODY_OPT_HELPERS[index].generateCreepOptions(
                    roomState,
                    squadUUID,
                    operationUUID,
                    caravanPos
                );
            }
        }
        throw new UserException(
            "Couldn't find ICreepBodyOptsHelper implementation for the role",
            "role: " + role + "\nCreep Options",
            ERROR_ERROR
        );
    }

    /**
     * Generate the body for the creep based on the tier and role
     * @param tier the tier our room is at
     * @param role the role of the creep we want
     */
    public static generateCreepBody(tier: TierConstant, role: RoleConstant | null, room: Room): BodyPartConstant[] {
        if (!role) {
            throw new UserException("Null role provided to generate creep options", "Api/SpawnApi", ERROR_ERROR);
        }
        for (const index in CREEP_BODY_OPT_HELPERS) {
            if (CREEP_BODY_OPT_HELPERS[index].name === role) {
                return CREEP_BODY_OPT_HELPERS[index].generateCreepBody(tier, room);
            }
        }
        throw new UserException(
            "Couldn't find ICreepBodyOptsHelper implementation for the role",
            "role: " + role + "\nCreep Options",
            ERROR_ERROR
        );
    }

    /**
     * Returns a creep body part array, or null if invalid parameters were passed in
     * @param bodyObject The object that describes the creep's body parts
     * @param opts The options for generating the creep body from the descriptor
     */
    public static createCreepBody(bodyObject: CreepBodyDescriptor, opts?: CreepBodyOptions): BodyPartConstant[] {
        let creepBody: BodyPartConstant[] = [];
        let numHealParts = 0;

        /**
         * If opts is undefined, use default options
         */
        if (opts === undefined) {
            opts = { mixType: GROUPED, toughFirst: false, healLast: false };
        }

        /**
         * Verify bodyObject - Return null if invalid
         */
        if (SpawnHelper.verifyDescriptor(bodyObject) === false) {
            throw new UserException(
                "Invalid Creep Body Descriptor",
                "Ensure that the object being passed to getCreepBody is in the format { BodyPartConstant: NumberParts } and that NumberParts is > 0.",
                ERROR_ERROR
            );
        }

        /**
         * Append tough parts on creepBody first - Delete tough property from bodyObject
         */
        if (opts.toughFirst && bodyObject.tough) {
            creepBody = SpawnHelper.generateParts("tough", bodyObject.tough);
            delete bodyObject.tough;
        }

        /**
         * Retain Heal Information to append on the end of creepBody - Delete heal property from bodyObject
         */
        if (opts.healLast && bodyObject.heal) {
            numHealParts = bodyObject.heal;
            delete bodyObject.heal;
        }

        /**
         * If mixType is grouped, add onto creepBody
         */
        if (opts.mixType === GROUPED) {
            const bodyParts = SpawnHelper.getBody_Grouped(bodyObject);
            for (let i = 0; i < bodyParts.length; i++) {
                creepBody.push(bodyParts[i]);
            }
        }

        /**
         * If mixType is collated, add onto creepBody
         */
        if (opts.mixType === COLLATED) {
            const bodyParts = SpawnHelper.getBody_Collated(bodyObject);
            for (let i = 0; i < bodyParts.length; i++) {
                creepBody.push(bodyParts[i]);
            }
        }

        /**
         * Append Heal Information that was retained at the beginning of the function
         */
        if (opts.healLast) {
            for (let i = 0; i < numHealParts; i++) {
                creepBody.push("heal");
            }
        }

        // If creepBody is empty, return undefined
        if (creepBody.length === 0) {
            return [];
        } else {
            return creepBody;
        }
    }

    /**
     * generates a UUID for a squad
     */
    public static generateSquadUUID(initialValue: string): string {
        const randomNumber: string = (Math.floor(Math.random() * 1000)).toString();
        const tick: string = Game.time.toString();
        return initialValue + "_" + randomNumber + "_" + tick;
    }

    /**
     * generates options for spawning a squad based on the attack room's specifications
     * @param room the room we are spawning the squad in
     * @param roleConst the role we are checking for
     * @param creepName the name of the creep we are checking for
     */
    public static generateSquadOptions(room: Room, roleConst: RoleConstant | null | MilitaryQueue): StringMap {
        // Set to this for clarity that we aren't expecting any squad options in some cases
        const squadOptions: StringMap = {
            operationUUID: null,
            squadUUID: null,
            caravanPos: null
        };

        if (!SpawnApi.isMilitaryQueue(roleConst)) {
            return squadOptions;
        }

        squadOptions['operationUUID'] = roleConst.operationUUID;
        squadOptions['squadUUID'] = roleConst.squadUUID;
        squadOptions['caravanPos'] = roleConst.caravanPos;
        return squadOptions;
    }

    /**
     * get the target room for the creep
     * @param room the room we are spawning the creep in
     * @param roleConst the role we are getting room for
     * @param creepBody the body of the creep we are checking, so we know who to exclude from creep counts
     * @param creepName the name of the creep we are checking for
     */
    public static getCreepTargetRoom(
        room: Room,
        roleConst: RoleConstant,
        creepBody: BodyPartConstant[],
        creepName: string
    ): string {
        for (const index in CREEP_BODY_OPT_HELPERS) {
            if (CREEP_BODY_OPT_HELPERS[index].name === roleConst) {
                return CREEP_BODY_OPT_HELPERS[index].getTargetRoom(room, roleConst, creepBody, creepName);
            }
        }
        throw new UserException(
            "Couldn't find ICreepBodyOptsHelper implementation for the role",
            "role: " + roleConst + "\nCreep Target Room",
            ERROR_ERROR
        );
    }

    /**
     * get the home room for the creep
     * @param room the room the creep is spawning in
     * @param roleConst the role we are getting room for
     */
    public static getCreepHomeRoom(room: Room, roleConst: RoleConstant): string {
        for (const index in CREEP_BODY_OPT_HELPERS) {
            if (CREEP_BODY_OPT_HELPERS[index].name === roleConst) {
                return CREEP_BODY_OPT_HELPERS[index].getHomeRoom(room);
            }
        }
        throw new UserException(
            "Couldn't find ICreepBodyOptsHelper implementation for the role",
            "role: " + roleConst + "\nCreep HomeRoom",
            ERROR_ERROR
        );
    }

    /**
     * Get the direction the creep needs to be spawned in
     */
    public static getSpawnDirection(nextCreepRole: RoleConstant, room: Room, openSpawn: StructureSpawn): DirectionConstant[] {

        if (!openSpawn) {
            throw new UserException(
                "Couldn't find correct spawn for the room",
                "role: " + nextCreepRole + "\nCreep Home Room",
                ERROR_ERROR
            );
        }

        for (const index in CREEP_BODY_OPT_HELPERS) {
            if (CREEP_BODY_OPT_HELPERS[index].name === nextCreepRole) {
                return CREEP_BODY_OPT_HELPERS[index].getSpawnDirection(openSpawn!, room);
            }
        }
        throw new UserException(
            "Couldn't find ICreepBodyOptsHelper implementation for the role",
            "role: " + nextCreepRole + "\nCreep Home Room",
            ERROR_ERROR
        );
    }

    /**
     * Check if the object is a military queue type
     * @param obj the object we're checking
     */
    public static isMilitaryQueue(obj: any): obj is MilitaryQueue {
        return obj.role !== undefined;
    }
}
