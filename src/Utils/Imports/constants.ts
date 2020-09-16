// Room State Constants
export const ROOM_STATE_INTRO = 0;
export const ROOM_STATE_BEGINNER = 1;
export const ROOM_STATE_INTER = 2;
export const ROOM_STATE_ADVANCED = 3;
export const ROOM_STATE_UPGRADER = 4;
export const ROOM_STATE_STIMULATE = 6;
export const ROOM_STATE_NUKE_INBOUND = 7;

// Role Constants
export const ROLE_MINER = "miner";
export const ROLE_HARVESTER = "harvester";
export const ROLE_WORKER = "worker";
export const ROLE_POWER_UPGRADER = "powerUpgrader";
export const ROLE_LORRY = "lorry";
export const ROLE_MINERAL_MINER = "mineralMiner";
export const ROLE_REMOTE_MINER = "remoteMiner";
export const ROLE_REMOTE_HARVESTER = "remoteHarvester";
export const ROLE_REMOTE_RESERVER = "remoteReserver";
export const ROLE_CLAIMER = "claimer";
export const ROLE_COLONIZER = "remoteColonizer";
export const ROLE_ZEALOT = "zealot";
export const ROLE_STALKER = "stalker";
export const ROLE_MEDIC = "medic";
export const ROLE_TOWER_TANK = "towerTank";
export const ROLE_SCOUT = "scout";
export const ROLE_MANAGER = "manager";

// Tier Constants
export const TIER_1 = 300;
export const TIER_2 = 550;
export const TIER_3 = 800;
export const TIER_4 = 1300;
export const TIER_5 = 1800;
export const TIER_6 = 2300;
export const TIER_7 = 5300;
export const TIER_8 = 12300;

// Squad Manager Name Constants
export const SOLO_ZEALOT_MAN = "soloZealotSquad";
export const SOLO_STALKER_MAN = "soloStalkerSquad";
export const STANDARD_MAN = "standardSquad";
export const TOWER_DRAINER_MAN = "towerDrainerSquad";
export const DOMESTIC_DEFENDER_MAN = "domesticDefenderSquad";
export const REMOTE_DEFENDER_MAN = "remoteDefenderSquad";

// Remote Room Type Constants
export const REMOTE_ENERGY = "remoteRoomEnergy";
export const REMOTE_SK_ENERGY = "remoteRoomSKEnergy";
export const REMOTE_SK_COMBINED = "remoteRoomSKCombined";

// Operation Strategy Constants
export const OP_STRATEGY_NONE = "none";
export const OP_STRATEGY_FFA = "ffa";
export const OP_STRATEGY_COMBINED = "combined";
export const OP_STRATEGY_INVADER = "invader";

// Attack Flag Constants
export const CLAIM_FLAG = 4;
export const REMOTE_FLAG = 5;
export const OVERRIDE_D_ROOM_FLAG = 6;
export const STIMULATE_FLAG = 7;

// Creep Body Layout Constants
export const GROUPED = "grouped";
export const COLLATED = "collated";

// Role Priority List
// * Keep this list ordered by spawn priority
export const domesticRolePriority: RoleConstant[] = [
    ROLE_MINER,
    ROLE_HARVESTER,
    ROLE_MANAGER,
    ROLE_WORKER,
    ROLE_POWER_UPGRADER,
    ROLE_LORRY,
    ROLE_MINERAL_MINER,
    ROLE_SCOUT
];

// * Keep this list ordered by spawn priority
export const remoteRolePriority: RoleConstant[] = [
    ROLE_REMOTE_RESERVER,
    ROLE_REMOTE_MINER,
    ROLE_REMOTE_HARVESTER,
    ROLE_CLAIMER,
    ROLE_COLONIZER
];

// List of every structure in the game
export const ALL_STRUCTURE_TYPES: StructureConstant[] = [
    STRUCTURE_EXTENSION,
    STRUCTURE_RAMPART,
    STRUCTURE_ROAD,
    STRUCTURE_SPAWN,
    STRUCTURE_LINK,
    STRUCTURE_WALL,
    STRUCTURE_STORAGE,
    STRUCTURE_TOWER,
    STRUCTURE_OBSERVER,
    STRUCTURE_POWER_SPAWN,
    STRUCTURE_EXTRACTOR,
    STRUCTURE_LAB,
    STRUCTURE_TERMINAL,
    STRUCTURE_CONTAINER,
    STRUCTURE_NUKER,
    STRUCTURE_KEEPER_LAIR,
    STRUCTURE_CONTROLLER,
    STRUCTURE_POWER_BANK,
    STRUCTURE_PORTAL,
    STRUCTURE_FACTORY,
    STRUCTURE_INVADER_CORE
];

// The Wall/Rampart HP Limit for each Controller level
export const WALL_LIMIT: number[] = [
    0, // RCL 0
    6250, // RCL 1
    12500, // RCL 2
    25000, // RCL 3
    50000, // RCL 4
    100000, // RCL 5
    200000, // RCL 6
    400000, // RCL 7
    1000000 // RCL 8
];

// Cache Tick Limits
export const STRUCT_CACHE_TTL = 50; // Structures
export const SOURCE_CACHE_TTL = -1; // Sources
export const MINERAL_CACHE_TTL = -1; // Minerals
export const CONSTR_CACHE_TTL = 50; // Construction Sites
export const TOMBSTONE_CACHE_TTL = 50; // Tombstones
export const RUINS_CACHE_TTL = 50; // Ruins
export const DROPS_CACHE_TTL = 50; // Dropped Resources
export const FCREEP_CACHE_TTL = 3; // Friendly Creep
export const HCREEP_CACHE_TTL = 1; // Hostile Creep
export const MOVEMENT_CACHE_TTL = 2500; // Empire cross-room movement data
// GetEnergyJob Constants
export const SOURCE_JOB_CACHE_TTL = 50; // Source jobs
export const CONTAINER_JOB_CACHE_TTL = 5; // Container jobs
export const LINK_JOB_CACHE_TTL = 50; // Link Jobs
export const BACKUP_JOB_CACHE_TTL = 5; // Backup Jobs
export const PICKUP_JOB_CACHE_TTL = 50; // Pickup Jobs
export const LOOT_JOB_CACHE_TTL = 50; // Tombstone/Ruin Jobs
// ClaimPartJob Constants
export const CLAIM_JOB_CACHE_TTL = 1; // Claim Jobs
export const RESERVE_JOB_CACHE_TTL = 1; // Reserve Jobs
export const SIGN_JOB_CACHE_TTL = 50; // Sign Jobs
export const ATTACK_JOB_CACHE_TTL = 1; // Attack Jobs
// WorkPartJob Constants
export const REPAIR_JOB_CACHE_TTL = 10; // Repair jobs
export const BUILD_JOB_CACHE_TTL = 10; // Build Jobs
export const UPGRADE_JOB_CACHE_TTL = -1; // Upgrade Jobs
// CarryPartJob Constants
export const FILL_JOB_CACHE_TTL = 10; // Fill Jobs
export const STORE_JOB_CACHE_TTL = 50; // Store Jobs

// ? Should we change DEPNDT to be 3 seperate consts? Attack, Remote, Claim?
export const DEPNDT_CACHE_TTL = 50; // Dependent Rooms - Attack, Remote, Claim

// Error Severity Constants
export const ERROR_FATAL = 3; // Very severe error - Game ruining
export const ERROR_ERROR = 2; // Regular error - Creep/Room ruining
export const ERROR_WARN = 1; // Small error - Something went wrong, but doesn't ruin anything
export const ERROR_INFO = 0; // Non-error - Used to log when something happens (e.g. memory is updated)

// Color Constants
export const COLORS: any = {};
COLORS[ERROR_FATAL] = "#FF0000";
COLORS[ERROR_ERROR] = "#E300FF";
COLORS[ERROR_WARN] = "#F0FF00";
COLORS[ERROR_INFO] = "#0045FF";

// Movement API Data Types
export const ROOM_STATUS_ALLY = "ally";
export const ROOM_STATUS_ALLY_REMOTE = "allyRemote";
export const ROOM_STATUS_NEUTRAL = "neutral";
export const ROOM_STATUS_HIGHWAY = "highway";
export const ROOM_STATUS_SOURCE_KEEPER = "sourceKeeper";
export const ROOM_STATUS_HOSTILE = "hostile";
export const ROOM_STATUS_HOSTILE_REMOTE = "hostileRemote";
export const ROOM_STATUS_INVADER_REMOTE = "invaderRemote";
export const ROOM_STATUS_UNKNOWN = "unknown";

// Military Squad Status Types
export const SQUAD_STATUS_OK: SquadStatusConstant = 0;
export const SQUAD_STATUS_RALLY: SquadStatusConstant = 1;
export const SQUAD_STATUS_DONE: SquadStatusConstant = 2;
export const SQUAD_STATUS_DEAD: SquadStatusConstant = 3;

// Military Actions
export const ACTION_ATTACK = 0;
export const ACTION_MOVE = 1;
export const ACTION_RANGED_ATTACK = 2;
export const ACTION_MASS_RANGED = 3;
export const ACTION_HEAL = 4;
export const ACTION_RANGED_HEAL = 5;

// Spawn Priority constants for military squads
export const HIGH_PRIORITY: number = 1;
export const MED_PRIORITY: number = 2;
export const LOW_PRIORITY: number = 3;

// All civilian roles we have
export const ALL_CIVILIAN_ROLES: RoleConstant[] = [
    ROLE_CLAIMER,
    ROLE_COLONIZER,
    ROLE_HARVESTER,
    ROLE_LORRY,
    ROLE_MANAGER,
    ROLE_MINER,
    ROLE_MINERAL_MINER,
    ROLE_POWER_UPGRADER,
    ROLE_REMOTE_HARVESTER,
    ROLE_REMOTE_MINER,
    ROLE_REMOTE_RESERVER,
    ROLE_SCOUT,
    ROLE_WORKER
];

// All Remote roles we have
export const ALL_REMOTE_ROLES: RoleConstant[] = [
    ROLE_REMOTE_HARVESTER,
    ROLE_REMOTE_MINER,
    ROLE_REMOTE_RESERVER
];
