// constants -----

// Error Constants
declare const ERROR_FATAL = 3;
declare const ERROR_ERROR = 2;
declare const ERROR_WARN = 1;
declare const ERROR_INFO = 0;

type ErrorConstant = ERROR_FATAL | ERROR_ERROR | ERROR_WARN | ERROR_INFO;
/**
 *  Very severe error - Game ruining
 */
type ERROR_FATAL = 3;
/**
 *  Regular error - Creep/Room ruining
 */
type ERROR_ERROR = 2;
/**
 *  Small error - Something went wrong, but doesn't ruin anything
 */
type ERROR_WARN = 1;
/**
 *  Non-error - Used to log when something happens (e.g. memory is updated)
 */
type ERROR_INFO = 0;

// room state constants
declare const ROOM_STATE_INTRO = 0;
declare const ROOM_STATE_BEGINNER = 1;
declare const ROOM_STATE_INTER = 2;
declare const ROOM_STATE_ADVANCED = 3;
declare const ROOM_STATE_UPGRADER = 4;
declare const ROOM_STATE_STIMULATE = 6;
declare const ROOM_STATE_NUKE_INBOUND = 7;

type RoomStateConstant =
    | ROOM_STATE_INTRO
    | ROOM_STATE_BEGINNER
    | ROOM_STATE_INTER
    | ROOM_STATE_ADVANCED
    | ROOM_STATE_UPGRADER
    | ROOM_STATE_STIMULATE
    | ROOM_STATE_NUKE_INBOUND;

interface ICreepSpawnLimits {
    roomState: RoomStateConstant;
    generateRemoteLimits: (room: Room) => RemoteCreepLimits;
    generateDomesticLimits: (room: Room) => DomesticCreepLimits;
}

/**
 * right when a room is starting and nothing is built/no creeps exist
 */
type ROOM_STATE_INTRO = 0;
/**
 * once some creeps have been established but no containers/storage exist
 */
type ROOM_STATE_BEGINNER = 1;
/**
 * once container mining is in place but we do not have a storage
 */
type ROOM_STATE_INTER = 2;
/**
 * once storage economy is in place but we aren't power upgrading
 */
type ROOM_STATE_ADVANCED = 3;
/**
 * once we have power upgrader based economy
 */
type ROOM_STATE_UPGRADER = 4;
/**
 * if the room has been flagged and is receiving heavy external assistance to upgrade quickly
 */
type ROOM_STATE_STIMULATE = 6;
/**
 * if a nuke is inbound to the room and we have to prepare for the strike x ticks before (low priority but good to keep in mind)
 */
type ROOM_STATE_NUKE_INBOUND = 7;
// --------------------------------------------------------------------

// role constants
declare const ROLE_MINER = "miner";
declare const ROLE_HARVESTER = "harvester";
declare const ROLE_WORKER = "worker";
declare const ROLE_POWER_UPGRADER = "powerUpgrader";
declare const ROLE_LORRY = "lorry";
declare const ROLE_MINERAL_MINER = "mineralMiner";
declare const ROLE_SCOUT = "scout";
declare const ROLE_REMOTE_MINER = "remoteMiner";
declare const ROLE_REMOTE_HARVESTER = "remoteHarvester";
declare const ROLE_REMOTE_RESERVER = "remoteReserver";
declare const ROLE_COLONIZER = "remoteColonizer";
declare const ROLE_CLAIMER = "claimer";
declare const ROLE_ZEALOT = "zealot";
declare const ROLE_STALKER = "stalker";
declare const ROLE_MEDIC = "medic";
declare const ROLE_TOWER_TANK = "towerTank";
declare const ROLE_MANAGER = "manager";

/**
 * role constants
 */
type RoleConstant =
    | ROLE_MINER
    | ROLE_HARVESTER
    | ROLE_WORKER
    | ROLE_POWER_UPGRADER
    | ROLE_LORRY
    | ROLE_MINERAL_MINER
    | ROLE_SCOUT
    | ROLE_REMOTE_MINER
    | ROLE_REMOTE_HARVESTER
    | ROLE_REMOTE_RESERVER
    | ROLE_COLONIZER
    | ROLE_CLAIMER
    | ROLE_ZEALOT
    | ROLE_STALKER
    | ROLE_MEDIC
    | ROLE_TOWER_TANK
    | ROLE_MANAGER;

/**
 * sits on the source and mines energy full-time
 */
type ROLE_MINER = "miner";
/**
 * brings energy from the miners to fill spawn/extensions
 */
type ROLE_HARVESTER = "harvester"; //
/**
 * repairs, builds, upgrades, etc... general labourer
 */
type ROLE_WORKER = "worker"; //
/**
 * sits at the controller and upgrades full-time
 */
type ROLE_POWER_UPGRADER = "powerUpgrader"; //
/**
 * moves energy or resources around the room to where it needs to be
 */
type ROLE_LORRY = "lorry";
/**
 * static miner for minerals
 */
type ROLE_MINERAL_MINER = "mineralMiner";
/**
 * scout used to populate empire movement data
 */
type ROLE_SCOUT = "scout";
/**
 * goes into remote room and sits on source to mine full-time
 */
type ROLE_REMOTE_MINER = "remoteMiner"; //
/**
 * goes into remote room and brings energy back to main room
 */
type ROLE_REMOTE_HARVESTER = "remoteHarvester"; //
/**
 * goes into remote room and reserves the controller full-time
 */
type ROLE_REMOTE_RESERVER = "remoteReserver"; //
/**
 * goes into claim room and helps get the spawn up and running
 */
type ROLE_COLONIZER = "remoteColonizer"; //
/**
 * goes into claim room and claims it
 */
type ROLE_CLAIMER = "claimer"; //
/**
 * Military Creep - offensive melee
 */
type ROLE_ZEALOT = "zealot"; //
/**
 * Military Creep - offensive ranged
 */
type ROLE_STALKER = "stalker"; //
/**
 * Military Creep - offensive healer
 */
type ROLE_MEDIC = "medic"; //
/**
 * Military Creep - tower drainer tank
 */
type ROLE_TOWER_TANK = "towerTank"; //
/*
 * Domestic Creep, manages energy flow in the room
 */
type ROLE_MANAGER = "manager"; //

// Operation Strategy Constants
type OP_STRATEGY_NONE = "none"; // Default implementation for each squad
type OP_STRATEGY_FFA = "ffa"; // Each squad should act independently of each other
type OP_STRATEGY_COMBINED = "combined"; // Each squad should move together
type OP_STRATEGY_INVADER = "invader"; // We are fighting invaders, so less complex / more specific strategies are required

type OpStrategyConstant = OP_STRATEGY_NONE | OP_STRATEGY_FFA | OP_STRATEGY_COMBINED | OP_STRATEGY_INVADER;

type OpStrategyTypes = { [key in OpStrategyConstant]?: string };

// Squad Manager Name Constants
type SOLO_ZEALOT_MAN = "soloZealotSquad";
type SOLO_STALKER_MAN = "soloStalkerSquad";
type STANDARD_MAN = "standardSquad";
type TOWER_DRAINER_MAN = "towerDrainerSquad";
type DOMESTIC_DEFENDER_MAN = "domesticDefenderSquad";
type REMOTE_DEFENDER_MAN = "remoteDefenderSquad";

type SquadManagerConstant =
    | SOLO_STALKER_MAN
    | SOLO_ZEALOT_MAN
    | STANDARD_MAN
    | TOWER_DRAINER_MAN
    | DOMESTIC_DEFENDER_MAN
    | REMOTE_DEFENDER_MAN;

// Military Squad Status Types
type SQUAD_STATUS_OK = 0;
type SQUAD_STATUS_RALLY = 1;
type SQUAD_STATUS_DONE = 2;
type SQUAD_STATUS_DEAD = 3;

type SquadStatusConstant = SQUAD_STATUS_OK | SQUAD_STATUS_RALLY | SQUAD_STATUS_DONE | SQUAD_STATUS_DEAD;

type RallyOpts = {
    avoidedRoomTypes?: RoomStatusType[];
    preferredRoomTypes?: RoomStatusType[];
    rallyInTargetRoom?: boolean;
};

// Military Actions
type ACTION_ATTACK = 0;
type ACTION_MOVE = 1;
type ACTION_RANGED_ATTACK = 2;
type ACTION_MASS_RANGED = 3;
type ACTION_HEAL = 4;
type ACTION_RANGED_HEAL = 5;

type MilitaryActionConstants =
    | ACTION_ATTACK
    | ACTION_MASS_RANGED
    | ACTION_MOVE
    | ACTION_RANGED_ATTACK
    | ACTION_HEAL
    | ACTION_RANGED_HEAL;

type MilitaryTargetConstants_Move = DirectionConstant;

type MilitaryTargetConstants_Heal = Id<Creep | PowerCreep> | string; // Creep name

type MilitaryTargetConstants_RangedHeal = Id<Creep | PowerCreep> | string; // Creep name

type MilitaryTargetConstants_Attack = Id<Creep | PowerCreep | Structure> | string; // Creep name

type MilitaryTargetConstants_RangedAttack = Id<Creep | PowerCreep | Structure> | string; // Creep name

type MilitaryTargetConstants_MassRanged = null;

type MilitaryTargetConstants =
    | MilitaryTargetConstants_Move
    | MilitaryTargetConstants_Heal
    | MilitaryTargetConstants_RangedHeal
    | MilitaryTargetConstants_Attack
    | MilitaryTargetConstants_RangedAttack
    | MilitaryTargetConstants_MassRanged;

type MilitaryTargetTypeConstants_Move = "direction";

type MilitaryTargetTypeConstants_Heal = "creepID" | "creepName" | "powerCreep";

type MilitaryTargetTypeConstants_RangedHeal = "creepID" | "creepName" | "powerCreep";

type MilitaryTargetTypeConstants_Attack = "creepID" | "creepName" | "powerCreep" | "structure";

type MilitaryTargetTypeConstants_RangedAttack = "creepID" | "creepName" | "powerCreep" | "structure";

type MilitaryTargetTypeConstants_MassRanged = "creepID" | "creepName" | "powerCreep" | "structure";

type MilitaryTargetTypeConstants =
    | MilitaryTargetTypeConstants_Move
    | MilitaryTargetTypeConstants_Heal
    | MilitaryTargetTypeConstants_RangedHeal
    | MilitaryTargetTypeConstants_Attack
    | MilitaryTargetTypeConstants_RangedAttack
    | MilitaryTargetTypeConstants_MassRanged;

interface Base_MiliIntent {
    action: MilitaryActionConstants;
    target: MilitaryTargetConstants;
    targetType: MilitaryTargetTypeConstants;
}

interface Move_MiliIntent extends Base_MiliIntent {
    action: ACTION_MOVE;
    target: MilitaryTargetConstants_Move;
    targetType: MilitaryTargetTypeConstants_Move;
}

interface Heal_MiliIntent extends Base_MiliIntent {
    action: ACTION_HEAL;
    target: MilitaryTargetConstants_Heal;
    targetType: MilitaryTargetTypeConstants_Heal;
}

interface RangedHeal_MiliIntent extends Base_MiliIntent {
    action: ACTION_RANGED_HEAL;
    target: MilitaryTargetConstants_RangedHeal;
    targetType: MilitaryTargetTypeConstants_RangedHeal;
}

interface Attack_MiliIntent extends Base_MiliIntent {
    action: ACTION_ATTACK;
    target: MilitaryTargetConstants_Attack;
    targetType: MilitaryTargetTypeConstants_Attack;
}

interface RangedAttack_MiliIntent extends Base_MiliIntent {
    action: ACTION_RANGED_ATTACK;
    target: MilitaryTargetConstants_RangedAttack;
    targetType: MilitaryTargetTypeConstants_RangedAttack;
}

interface MassRanged_MiliIntent extends Base_MiliIntent {
    action: ACTION_MASS_RANGED;
    target: MilitaryTargetConstants_MassRanged;
    targetType: MilitaryTargetTypeConstants_MassRanged;
}

interface MilitaryDataAll {
    [key: string]: MilitaryDataRoom;
}

// Update these together, as the params decide which data to get
interface MilitaryDataRoom {
    openRamparts?: StructureRampart[];
    hostiles?: { allHostiles: Creep[]; attack: Creep[]; rangedAttack: Creep[]; heal: Creep[] };
    hostileStructures?: AnyOwnedStructure[];
}
interface MilitaryDataParams {
    openRamparts?: boolean;
    hostiles?: boolean;
    hostileStructures?: boolean;
}

// Cost matrix storage interface - used by CostMatrix.Api
interface CostMatrixIndex {
    /**
     * Room Name to access cost matrices of
     */
    [index: string]: RoomCostMatrices;
}
interface RoomCostMatrices {
    creepMatrix?: StoredCostMatrix;
    towerDamageMatrix?: StoredCostMatrix;
    structureMatrix?: StoredCostMatrix;
    terrainMatrix?: StoredCostMatrix;
    quadSquadMatrix?: StoredCostMatrix;
}
interface StoredCostMatrix {
    serializedCostMatrix: string;
    expires: boolean;
    expirationTick?: number;
    roomName: string;
}

// Role Interfaces to be implemented  -------------
interface ICivCreepRoleManager {
    name: RoleConstant;
    getNewJob: (creep: Creep, room: Room, targetRoom?: Room) => BaseJob | undefined;
    handleNewJob: (creep: Creep, room: Room, job?: BaseJob) => void;
}

interface ISquadManager {
    name: SquadManagerConstant;
    creeps: SquadStack[];
    targetRoom: string;
    squadUUID: string;
    operationUUID: string;
    // Booleans flags used in check status
    initialRallyComplete?: boolean;
    rallyPos: MockRoomPos | undefined;
    orientation: DirectionConstant | undefined;

    runSquad: (instance: ISquadManager) => void;
    addCreep(instance: ISquadManager, creepName: string): void;
    createInstance: (targetroom: string, operationUUID: string) => ISquadManager;
    checkStatus: (instance: ISquadManager) => SquadStatusConstant;
    getSquadArray: () => SquadDefinition[];
    getSpawnPriority: () => number;

    strategyImplementation?: SquadStrategyImplementation;
}

interface SquadStack {
    name: string;
    intents: Base_MiliIntent[];
}

type SquadStrategyImplementation = {
    runSquad: (instance: ISquadManager) => void;
    [functionName: string]: Function;
};

/**
 * Interface for Creep Role Helpers (for body and options)
 */
interface ICreepBodyOptsHelper {
    name: RoleConstant;
    generateCreepOptions: (
        roomState: RoomStateConstant,
        squadUUIDParam: string | null,
        operationUUIDParam: string | null,
        caravanPosParam: number | null
    ) => (CreepOptionsCiv | undefined) | (CreepOptionsMili | undefined);
    generateCreepBody: (tier: TierConstant, room: Room) => BodyPartConstant[];
    getTargetRoom: (room: Room, roleConst: RoleConstant, creepBody: BodyPartConstant[], creepName: string) => string;
    getHomeRoom: (room: Room) => string;
    getSpawnDirection: (centerSpawn: StructureSpawn, room: Room) => DirectionConstant[];
}

/**
 * Interface for Job Type
 */
interface IJobTypeHelper {
    travelTo: (creep: Creep, job: BaseJob) => void;
    doWork: (creep: Creep, job: BaseJob) => void;
    jobType: Valid_JobTypes;
}

/**
 * Interface for Flag Types
 */
interface IFlagProcesser {
    primaryColor: ColorConstant;
    processFlag: (flag: Flag) => void;
}
// --------------------------------------------------------------------
/**
 * global console functions
 */
declare namespace NodeJS {
    interface Global {
        Memory: Memory;
        age?: number;
        Profiler: Profiler;
        removeConstructionSites(roomName: string, structureType?: string): void;
        removeFlags(substr: string): void;
        displayRoomStatus(roomName: string): void;
        killAllCreeps(room?: Room): void;
        sendResource(sendingRoom: Room, receivingRoom: Room, resourceType: ResourceConstant, amount: number): void;
    }
}

interface RawMemory {
    _parsed: Memory;
}

/**
 * Creep Body Options Object
 */
interface CreepBodyOptions {
    mixType?: string;
    toughFirst?: boolean;
    healLast?: boolean;
}

/**
 * UserException Object - A custom error that will color itself in console when thrown.
 */
interface UserException {
    title: string;
    body: string;
    severity: number;
    titleColor: any;
    bodyColor: string;
}

/**
 * Creep Body Descriptor Object
 */
interface CreepBodyDescriptor {
    [index: string]: any;
    move?: number;
    work?: number;
    carry?: number;
    tough?: number;
    attack?: number;
    ranged_attack?: number;
    heal?: number;
    claim?: number;
}
/**
 * Ally Names
 */
type AllyConstant = JAKESBOY2 | UHMBROCK | ATANNER;
type JAKESBOY2 = "jakesboy2";
type UHMBROCK = "uhmbrock";
type ATANNER = "atanner";

/**
 * Generic
 */
interface StringMap {
    [key: string]: any;
}
// ----------------------------------------

// main memory modules --------------
interface CreepMemory {
    /**
     * the creep's role
     */
    role: RoleConstant;
    /**
     * the home room for the creep
     */
    homeRoom: string;
    /**
     * the room where operations are performed
     */
    targetRoom: string;
    /**
     * the job the creep is working
     */
    job: BaseJob | undefined;
    /**
     * the creep's options given to it at birth (can be adjusted thorugh lifetime)
     */
    options: CreepOptionsCiv | CreepOptionsMili;
    /**
     * tracks if the creep is currently working
     */
    working: boolean;
    /**
     * Additional memory options that vary from role to role
     */
    supplementary?: StringMap;
    /**
     * The memory used by screeps to store movePaths
     */
    _move?: {
        dest: { x: number; y: number; roomName: string };
        time: number;
        path: number;
        room: string;
        // Custom stuck-detection object - xyroomName string
        lastPosition: string;
        stuckCount: number;
    };
}

/**
 * Contains all of the sublists of job objects
 *
 * This is the object to store in `Memory.rooms[room.name].Jobs`
 */
interface JobListing {
    getEnergyJobs?: GetEnergyJobListing;
    claimPartJobs?: ClaimPartJobListing;
    workPartJobs?: WorkPartJobListing;
    carryPartJobs?: CarryPartJobListing;
    getNonEnergyJobs?: GetNonEnergyJobListing;
}

/**
 * Structures that have a energy, minerals, or store property
 */
type ResourceContainingStructureConstant =
    | STRUCTURE_CONTAINER
    | STRUCTURE_EXTENSION
    | STRUCTURE_LAB
    | STRUCTURE_LINK
    | STRUCTURE_NUKER
    | STRUCTURE_POWER_SPAWN
    | STRUCTURE_SPAWN
    | STRUCTURE_STORAGE
    | STRUCTURE_TERMINAL
    | STRUCTURE_TOWER;

/**
 * Valid types for the GetEnergyJob targetType
 */
type GetEnergy_ValidTargets =
    | "source"
    | "tombstone"
    | "ruin"
    | "droppedResource"
    | "mineral"
    | ResourceContainingStructureConstant;

/**
 * Valid actions for GetEnergyJob actionType
 */
type GetEnergy_ValidActions = "withdraw" | "harvest" | "pickup";

/**
 * Valid types for the GetNonEnergyJob target type
 */
type GetNonEnergy_ValidTargets =
    | "mineral"
    | "droppedResource"
    | "ruin"
    | "tombstone"
    | ResourceContainingStructureConstant;
/**
 * Valid actions for GetNonEnergy action type
 */
type GetNonEnergy_ValidActions = "pickup" | "withdraw" | "harvest";

/**
 * Valid types for the WorkPartJob targetType
 */
type WorkPart_ValidTargets = BuildableStructureConstant | STRUCTURE_CONTROLLER | "constructionSite";
/**
 * Valid actions for WorkPartJob actionType
 */
type WorkPart_ValidActions = "build" | "repair" | "upgrade";

/**
 * Valid types for the ClaimPartJob targetType
 * ? Probably unnecessary, but provided for flexibility
 */
type ClaimPart_ValidTargets = STRUCTURE_CONTROLLER | "roomName";
/**
 * Valid actions for ClaimPartJob actionType
 */
type ClaimPart_ValidActions = "claim" | "reserve" | "attack" | "sign";

/**
 * Valid types for the CarryPartJob targetType
 */
type CarryPart_ValidTargets = ResourceContainingStructureConstant | "roomPosition";
/**
 * Valid actions for CarryPartJob actionType
 */
type CarryPart_ValidActions = "transfer" | "drop";

/**
 * Valid types for the MovePartJob targetType
 */
type MovePart_ValidTargets = "roomPosition" | "roomName";
/**
 * Valid actions for MovePartJob actionType
 */
type MovePart_ValidActions = "move";

/**
 * Acceptable ValidTargets Lists for BaseJob
 */
type Any_ValidTargets =
    | GetEnergy_ValidTargets
    | CarryPart_ValidTargets
    | ClaimPart_ValidTargets
    | WorkPart_ValidTargets
    | MovePart_ValidTargets;
/**
 * Acceptable ValidAction Lists for BaseJob
 */
type Any_ValidActions =
    | GetEnergy_ValidActions
    | CarryPart_ValidActions
    | ClaimPart_ValidActions
    | WorkPart_ValidActions
    | MovePart_ValidActions;

/**
 * Valid jobType for BaseJob
 */
type Valid_JobTypes =
    | "getEnergyJob"
    | "claimPartJob"
    | "carryPartJob"
    | "workPartJob"
    | "movePartJob"
    | "getNonEnergyJob"
    | "nonEnergyCarryPartJob";
/**
 * Basic Job Interface
 */
interface BaseJob {
    /**
     * Type of the job object
     */
    jobType: Valid_JobTypes;
    /**
     * Valid actions to perform on the job object
     */
    actionType: Any_ValidActions;
    /**
     * ID of the target object
     */
    targetID: string;
    /**
     * Type of the target object
     */
    targetType: Any_ValidTargets;
    /**
     * Whether or not the job has been taken
     */
    isTaken: boolean;
}
/**
 * JobObject for the GetEnergyJobListing
 * Overrides targetType to only GetEnergy_ValidTargets
 */
interface GetEnergyJob extends BaseJob {
    /**
     * The type of the target object
     */
    targetType: GetEnergy_ValidTargets;
    /**
     * The action to perform on the target object
     */
    actionType: GetEnergy_ValidActions;
    /**
     * The resources in the object in the format of Structure.Store
     *
     * Each object key is one of the RESOURCE_* constants, values are resources amounts.
     * RESOURCE_ENERGY is always defined and equals to 0 when empty, other resources are undefined when empty.
     */
    resources: StoreDefinition | Store<ResourceConstant, true>;
}

/**
 * JobObject for the GetNonEnergyJobListing
 * Overrides targetType to only GetNonEnergy_ValidTargets
 */
interface GetNonEnergyJob extends BaseJob {
    /**
     * The type of the target object
     */
    targetType: GetNonEnergy_ValidTargets;
    /**
     * The action to perform on the target object
     */
    actionType: GetNonEnergy_ValidActions;
    /**
     * The type of resource in the target object
     * A container with multiple resource types will have multiple jobs assigned  to it
     */
    resourceType: Exclude<ResourceConstant, RESOURCE_ENERGY>;
    /**
     * Amount of the resource remaining
     */
    resourceAmount: number;
}

/**
 * JobObject for the WorkPartJobListing
 */
interface WorkPartJob extends BaseJob {
    /**
     * The type of the target object
     */
    targetType: WorkPart_ValidTargets;
    /**
     * The action to perform on the target object
     */
    actionType: WorkPart_ValidActions;
    /**
     * The progress (% to next level, % hp, % to construction) of the target
     */
    remaining: number;
}

/**
 * JobObject for the ClaimPartJobListing
 */
interface ClaimPartJob extends BaseJob {
    /**
     * The type of the target object
     */
    targetType: ClaimPart_ValidTargets;
    /**
     * The action to perform on the target object
     */
    actionType: ClaimPart_ValidActions;
}

/**
 * JobObject for the CarryPartJobListing
 */
interface CarryPartJob extends BaseJob {
    /**
     * The type of the target object
     */
    targetType: CarryPart_ValidTargets;
    /**
     * The action to perform on the target object
     */
    actionType: CarryPart_ValidActions;
    /**
     * The amount of energy to be filled
     */
    remaining: number;
    /**
     * The resource type of the thing we're carrying
     */
    resourceType: ResourceConstant | undefined;
}

/**
 * JobObject used to move a creep's location
 */
interface MovePartJob extends BaseJob {
    /**
     * The type of the target object
     */
    targetType: MovePart_ValidTargets;
    /**
     * The action to perform on the target object
     */
    actionType: MovePart_ValidActions;
}

/**
 * Object that stores the seperate lists of GetEnergyJob Objects
 */
interface GetEnergyJobListing {
    /**
     * Jobs that target sources that are not being mined optimally (RoomAPI.getOpenSources)
     */
    sourceJobs?: Cache;
    /**
     * Jobs that target mienrals that are not being mined
     */
    mineralJobs?: Cache;
    /**'
     * Jobs that target containers with resources
     */
    containerJobs?: Cache;
    /**
     * Jobs that target links that contain energy (and are not deposit only)
     */
    linkJobs?: Cache;
    /**
     * Jobs that target structures that store excess resources (Storage, Terminal)
     */
    backupStructures?: Cache;
    /**
     * Jobs that target resources on the ground
     */
    pickupJobs?: Cache;
    /**
     * Jobs that target tombstones
     */
    lootJobs?: Cache;
}

interface GetNonEnergyJobListing {
    /**
     * Jobs that target the mineral source
     */
    mineralJobs?: Cache;
    /**
     * Jobs that target resources on the ground
     */
    pickupJobs?: Cache;
    /**'
     * Jobs that target containers with resources
     */
    containerJobs?: Cache;
    /**
     * Jobs that target storage with resources
     */
    storageJobs?: Cache;
    /**
     * Jobs that target the terminal with resources
     */
    terminalJobs?: Cache;
    /**
     * Jobs that target labs with resources
     */
    labJobs?: Cache;
}

/**
 * Object that stores the seperate lists of claimPartJob Objects
 */
interface ClaimPartJobListing {
    /**
     * Jobs to claim controllers
     */
    claimJobs?: Cache;
    /**
     * Jobs to reserve controllers
     */
    reserveJobs?: Cache;
    /**
     * Jobs to sign controllers
     */
    signJobs?: Cache;
    /**
     * Jobs to attack enemy controllers
     */
    attackJobs?: Cache;
}

/**
 * Object that stores the seperate lists of workPartJob Objects
 */
interface WorkPartJobListing {
    /**
     * Jobs to repair structures
     */
    repairJobs?: Cache;
    /**
     * Jobs to build constructionSites
     */
    buildJobs?: Cache;
    /**
     * Jobs to upgrade controllers
     */
    upgradeJobs?: Cache;
    /**
     * Jobs to repair walls
     */
    wallRepairJobs?: Cache;
}

/**
 * Object that stores the seperate lists of carryPartJob Objects
 */
interface CarryPartJobListing {
    /**
     * Jobs to fill objects that need resources to function (Extensions, Spawns, Links, Towers)
     */
    fillJobs?: Cache;
    /**
     * Jobs to store away or sell excess resources (Storage, Terminal, Containers)
     */
    storeJobs?: Cache;
    /**
     * Jobs to fill objects that need non-energy resources to function (Labs, nukers, factories)0
     */
    nonEnergyFillJobs?: Cache;
    /**
     * Jobs to store away or sell excess non-energy resources (STorage, terminal, containers)
     */
    nonEnergyStoreJobs?: Cache;
}

interface RoomMemory {
    roomState?: RoomStateConstant;
    /**
     * IDs of all structures in the room
     * Stringmap : [structure.type] = String[]
     */
    structures: Cache;
    /**
     * Hostile structures in the room
     */
    hostileStructures: Cache;
    /**
     * IDs of all construction sites in the room
     */
    constructionSites: Cache;
    /**
     * IDs of all sources in the room
     */
    sources: Cache;
    /**
     * IDs of all minerals in the room
     */
    minerals: Cache;
    /**
     * IDs of all dropped resources in a room
     */
    droppedResources: Cache;
    /**
     * IDs of all tombstones in the room
     */
    tombstones: Cache;
    /**
     * IDs of all ruins in the room
     */
    ruins: Cache;
    /**
     * IDs of the link the power upgrader pulls from
     */
    upgradeLink?: string;
    /**
     * the center of the bunker for auto construction and spawn referencing
     */
    bunkerCenter?: MockRoomPos;
    /**
     * Cache of all creeps
     */
    creeps?: Cache;
    /**
     * the limit of each role for the room
     */
    creepLimit?: CreepLimits;
    /**
     * IDs of all hostile creeps in this room
     */
    hostiles: Cache;
    /**
     * the defcon level for the room
     */
    defcon: number;
    /**
     * Whether or not this room fired its towers last tick
     */
    shotLastTick?: boolean;
    /**
     * Names of all rooms flagged to remote harvest
     */
    remoteRooms?: RemoteRoomObject;
    /**
     * Names of all rooms flagged to colonize
     */
    claimRooms?: ClaimRoomObject;
    /**
     * List of all of the room's GetEnergyJobs
     */
    jobs?: JobListing;
    /**
     * extra memory for visual function
     */
    visual?: VisualMemory;
    /**
     * The last tick we had a scout spawn
     */
    lastScoutSpawn?: number;
}

interface RemoteRoomObject {
    [key: string]: RemoteRoomMemory;
}

interface ClaimRoomObject {
    [key: string]: ClaimRoomMemory;
}

interface Memory {
    empire: EmpireMemory;
    mapVisualData: string;
    debug: StringMap;
}

interface EmpireMemory {
    /**
     * messages to display in each room's alert box
     */
    alertMessages?: AlertMessageNode[];
    /**
     * PathfindingApi empire-wide memory
     */
    movementData?: MovementData;
    /**
     * Military operations
     */
    militaryOperations: OperationData;
}

interface OperationData {
    [key: string]: MilitaryOperation;
}

interface SquadData {
    [key: string]: ISquadManager;
}

interface MilitaryOperation {
    squads: SquadData;
    operationUUID: string;
    operationStrategy: OpStrategyConstant;
}

interface MovementData {
    [key: string]: RoomMovementData;
}
/**
 * Contains pathfinding information about a room
 */
interface RoomMovementData {
    /**
     * Name of the room
     */
    roomName: string;
    /**
     * Status of the room
     */
    roomStatus: RoomStatusType;
    /**
     * Last tick this room was scouted
     */
    lastSeen: number;
    /**
     * Optional SERIALIZED costMatrix data to be used with PathFinder.CostMatrix.deserialize()
     * -- Useful for storing data to be shared between multiple creeps
     */
    costMatrix?: number[];
}

type ROOM_STATUS_ALLY = "ally";
type ROOM_STATUS_ALLY_REMOTE = "allyRemote";
type ROOM_STATUS_NEUTRAL = "neutral";
type ROOM_STATUS_HIGHWAY = "highway";
type ROOM_STATUS_SOURCE_KEEPER = "sourceKeeper";
type ROOM_STATUS_HOSTILE = "hostile";
type ROOM_STATUS_HOSTILE_REMOTE = "hostileRemote";
type ROOM_STATUS_INVADER_REMOTE = "invaderRemote";
type ROOM_STATUS_UNKNOWN = "unknown";
type RoomStatusType =
    | ROOM_STATUS_ALLY
    | ROOM_STATUS_ALLY_REMOTE
    | ROOM_STATUS_NEUTRAL
    | ROOM_STATUS_HIGHWAY
    | ROOM_STATUS_SOURCE_KEEPER
    | ROOM_STATUS_HOSTILE
    | ROOM_STATUS_HOSTILE_REMOTE
    | ROOM_STATUS_INVADER_REMOTE
    | ROOM_STATUS_UNKNOWN;

/**
 * override structure type
 */

/**
 * a node for an alert message
 */
interface AlertMessageNode {
    /**
     * the message
     */
    message: string;
    /**
     * tick that it was created on
     */
    tickCreated: number;
    /**
     * the number of ticks you want the message to be shown
     */
    expirationLimit: number;
}
// ----------------------------------

/**
 * options for civilian creeps
 */
interface CreepOptionsCiv {
    /**
     * if the creep can build construction sites
     */
    build?: boolean;
    /**
     * if the creep can upgrade the controller
     */
    upgrade?: boolean;
    /**
     * if the creep can repair containers/roads, etc
     */
    repair?: boolean;
    /**
     * claim or reserve
     */
    claim?: boolean;
    /**
     * if the creep can harvest sources
     */
    harvestSources?: boolean;
    /**
     * if the creep can harvest minerals
     */
    harvestMinerals?: boolean;
    /**
     * if the creep can repair walls and ramparts
     */
    wallRepair?: boolean;
    /**
     * If the creep can fill extensions
     */
    fillExtension?: boolean;
    /**
     * if the creep can fill towers
     */
    fillTower?: boolean;
    /**
     * if the creep can fill storage
     */
    fillStorage?: boolean;
    /**
     * if the creep can fill containers
     */
    fillContainer?: boolean;
    /**
     * if the creep can fill links
     */
    fillLink?: boolean;
    /**
     * fill spawn/extensions
     */
    fillSpawn?: boolean;
    /**
     * if the creep can fill the terminal
     */
    fillTerminal?: boolean;
    /**
     * if the creep can fill a lab
     */
    fillLab?: boolean;
    /**
     * if the creep can pull from storage
     */
    getFromStorage?: boolean;
    /**
     * if the creep can pull from a container
     */
    getFromContainer?: boolean;
    /**
     * if the creep can seek out dropped energy
     */
    getDroppedEnergy?: boolean;
    /**
     * if the creep can seek out tombstones/ruins
     */
    getLootJobs?: boolean;
    /**
     * if the creep can pull from a link
     */
    getFromLink?: boolean;
    /**
     * if the creep can pull from the terminal
     */
    getFromTerminal?: boolean;
}

/**
 * options for military creeps
 */
interface CreepOptionsMili {
    /**
     * the generated token that ties members of this squad together
     */
    squadUUID?: string | null;
    /**
     * The generated token that ties members of this OPERATION together
     */
    operationUUID?: string | null;
    /**
     * Caravan position
     */
    caravanPos?: number | null;
}

/**
 * creep limits for room
 */
interface CreepLimits {
    /**
     * creep limits for remote creeps
     */
    remoteLimits: RemoteCreepLimits;
    /**
     * creep limits for domestic creeps
     */
    domesticLimits: DomesticCreepLimits;
    /**
     * The military queue
     */
    militaryQueue: MilitaryQueue[];
}

interface MilitaryQueue {
    priority: number;
    tickToSpawn: number;
    operationUUID: string;
    squadUUID: string;
    role: RoleConstant;
    caravanPos: number;
}

interface SquadDefinition {
    role: RoleConstant;
    caravanPos: number;
}

interface MockRoomPos {
    x: number;
    y: number;
    roomName: string;
}

/**
 * creep limits for remote creeps
 */
interface RemoteCreepLimits {
    [index: string]: number;
    /**
     * limit for remote miners
     */
    remoteMiner: number;
    /**
     * limit for remote harvesters
     */
    remoteHarvester: number;
    /**
     * limit for remote reservers
     */
    remoteReserver: number;
    /**
     * limit for remote colonizers
     */
    remoteColonizer: number;
    /**
     * limit for claimers
     */
    claimer: number;
}

/**
 * creep limits for domestic creeps
 */
interface DomesticCreepLimits {
    [index: string]: number;
    /**
     * limit for domestic miners
     */
    miner: number;
    /**
     * limit for domestic harvesters
     */
    harvester: number;
    /**
     * limit for domestic workers
     */
    worker: number;
    /**
     * limit for manager
     */
    manager: number;
    /**
     * limit for domestic power upgraders
     */
    powerUpgrader: number;
    /**
     * limit for domestic lorries
     */
    lorry: number;
    /**
     * limit for scout
     */
    scout: number;
    /**
     * lmit for mineral miner
     */
    mineralMiner: number;
}

/**
 * A container object for Cache memory - Stores a StructureCache or CreepCache
 */
interface Cache {
    /**
     * The data that the Cache object validates
     */
    data: any;
    /**
     * Cache Object - used for validation
     */
    cache: any;
}

/**
 * Memory for flags. Allows us to tell if a flag should be
 * deleted from memory or if it still needs to be processed
 */
interface FlagMemory {
    /**
     * if the flag has been set into the proper memory channels
     */
    processed: boolean;
    /**
     * if the flag has completed its requirements
     */
    complete: boolean;
    /**
     * time the flag was placed
     */
    timePlaced: number;
    /**
     * the type of flag this is
     */
    flagType?: FlagTypeConstant | undefined;
    /**
     * the name of the flag
     */
    flagName: string;
}

// Memory for remote/attack/claim rooms
/**
 * parent memory for depedent rooms
 */
interface DependentRoomParentMemory {
    /**
     * the name of the room for lookup purposes
     */
    roomName: string;
}

/**
 * Remote room memory structure
 */
interface RemoteRoomMemory extends DependentRoomParentMemory {
    /**
     * sources in the room
     */
    sources: Cache;
    /**
     * hostiles in the room
     */
    hostiles: Cache;
    /**
     * structures in room
     */
    structures: Cache;
    /**
     * time remaining for reserving the controller
     */
    reserveTTL: number;
    /**
     * username reserving the controller - used to detect invader reserve
     */
    reserveUsername: string | undefined;
    /**
     * The type of remote room this is
     */
    remoteRoomType: RemoteRoomTypeConstant;
}

/**
 * Claim room memory structure
 */
// tslint:disable-next-line:no-empty-interface
interface ClaimRoomMemory extends DependentRoomParentMemory {
    // Parent memory covers everything currently needed in here
    claimRoomType: ClaimRoomTypeConstant;
    buildComplete: boolean;
}

/**
 * flag type constant definitions
 */
declare const CLAIM_FLAG = 4;
declare const REMOTE_FLAG = 5;
declare const OVERRIDE_D_ROOM_FLAG = 6;
declare const STIMULATE_FLAG = 7;

/**
 * flag types type definitions
 */
type CLAIM_FLAG = 4;
type REMOTE_FLAG = 5;
type OVERRIDE_D_ROOM_FLAG = 6;
type STIMULATE_FLAG = 7;

/**
 * type that holds all flag type constants
 */
type FlagTypeConstant = CLAIM_FLAG | REMOTE_FLAG | OVERRIDE_D_ROOM_FLAG | STIMULATE_FLAG;

/**
 * Tier Definitions
 */
declare const TIER_1 = 300;
declare const TIER_2 = 550;
declare const TIER_3 = 800;
declare const TIER_4 = 1300;
declare const TIER_5 = 1800;
declare const TIER_6 = 2300;
declare const TIER_7 = 5300;
declare const TIER_8 = 12300;

type TierConstant = TIER_1 | TIER_2 | TIER_3 | TIER_4 | TIER_5 | TIER_6 | TIER_7 | TIER_8;

type TIER_1 = 300;
type TIER_2 = 550;
type TIER_3 = 800;
type TIER_4 = 1300;
type TIER_5 = 1800;
type TIER_6 = 2300;
type TIER_7 = 5300;
type TIER_8 = 12300;

/**
 * room visual memory related memory
 */
interface VisualMemory {
    time: number;
    secondsPerTick: number;
    controllerProgressArray: number[];
    avgControlPointsPerHourArray: number[];
    room: StringMap;
    etaMemory: ETAMemory;
}

/**
 * structure for nodes on the visual graph
 */
interface GraphTickMarkMemory {
    start: number;
    end: number;
}

/**
 * Memory used by rolling average to next eta level
 */
interface ETAMemory {
    rcl: number;
    avgPointsPerTick: number;
    ticksMeasured: number;
}

/**
 * object containing the count of each creep by role
 * key = role
 * value = number representing value
 */
type AllCreepCount = {
    [key in RoleConstant]: number;
};

/**
 * Constants for types of remote rooms
 */
type REMOTE_ENERGY = "remoteRoomEnergy";
type REMOTE_SK_ENERGY = "remoteRoomSKEnergy";
type REMOTE_SK_COMBINED = "remoteRoomSKCombined";

type RemoteRoomTypeConstant =
    REMOTE_ENERGY
    | REMOTE_SK_COMBINED
    | REMOTE_SK_ENERGY;

/**
 * Constants for types of claim rooms
 */
type CLAIM_DEFAULT = "claimDefault";
type CLAIM_ESCORT = "claimEscort";

type ClaimRoomTypeConstant =
    CLAIM_DEFAULT
    | CLAIM_ESCORT;
