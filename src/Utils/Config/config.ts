/**
 * Disallow the caching of all memory
 *
 * Turning this setting on will massively reduce performance
 * but will ensure that all memory is as accurate as possible
 */
export const NO_CACHING_MEMORY = false;

/**
 * Allow UtilHelper.throwError to throw an error rather than just print to console
 */
export const ALLOW_CUSTOM_ERRORS = true;

/**
 * The number of ticks a creep can be stuck before repathing
 */
export const STUCK_COUNT_LIMIT = 3;

/**
 * Whether or not to apply visual on stuck
 */
export const USE_STUCK_VISUAL = true;

/**
 * Colors to use for: 100%, 75+%, 50+%, 25+% (percent to stuck reset)
 */
export const STUCK_VISUAL_COLORS = [
    "#FF0000", // 100% +
    "#800080", //  75% +
    "#0000FF", //  50% +
    "#FFFFFF" //  25% +
];
/**
 * Minimum amount of energy a container must have to be used in a GetEnergyJob
 */
export const CONTAINER_MINIMUM_ENERGY = 100;
/**
 * Minimum amount of energy a link must have to be used in a GetEnergyJob
 */
export const LINK_MINIMUM_ENERGY = 200;
/**
 * Minimum amount of energy a ruin must have to be used in a GetEnergyJob
 */
export const RUIN_MINIMUM_ENERGY = 100;
/**
 * Minimum amount of energy a tombstone must have to be used in a GetEnergyJob
 */
export const TOMBSTONE_MINIMUM_ENERGY = 100;

/**
 * Percentage HP to begin repairing structures (Percentage of current limit for Ramparts and Walls)
 */
export const REPAIR_THRESHOLD = 0.9;

/**
 * Percentage HP to make repairing structures a priority (Percentage of current limit for Ramparts and Walls)
 */
export const PRIORITY_REPAIR_THRESHOLD = 0.3;

/**
 * Number of HP to repair Ramparts/Walls to before considering them as a normal structure
 */
export const RAMPART_HITS_THRESHOLD = 10000;

/**
 * Control whether we run VisualManager to make any visuals at all
 */
export const ROOM_VISUALS_ON = true;

/**
 * toggle for the room stats/info visual overlay
 */
export const ROOM_OVERLAY_ON = true;

/**
 * toggle for the graph in room overlay (high cpu cost)
 */
export const ROOM_OVERLAY_GRAPH_ON = true;

/**
 * toggle debug overlay (very high CPU cost)
 */
export const ROOM_DEBUG_OVERLAY_ON = true;

/**
 * display % or raw value on your rcl progress
 */
export const ROOM_OVERLAY_RCL_RAW_VAL = true;

/**
 * The text to sign controllers with
 */
export const CONTROLLER_SIGNING_TEXT = [
    "home of the dallas cowboys and the oklahoma city thunder",
    "7j2Music on spotify",
    "like taking candy from a baby",
    "terminating process goldenstatewarriors.exe",
    "durant is my aunt",
    "typescript master race",
    "static type gang",
    "resource hogs",
    "PRESCOTT/ELLIOT 2020",
    "WESTBROOK/PAUL GEORGE 2024",
    "KANYE 2024",
    "you just activated my fap card",
    ">be me\n>sign controller",
    "braces go on the same line",
    "camelCaseMasterRace",
    "++i > i++",
    "baker mayfield: american hero",
    "don't be a creep, free-think",
    "down to die for my rooms",
    "blueface baby",
    "H2O, lean: same thing",
    "extraem damage morg no spares",
    "can't cuck the tuck",
    "can't stump the trump",
    "liberal hunters",
    "spunk junkies",
    "trespassers will be violated",
    "world biggest blunts smoked here",
    ""
];

/**
 * Allow miners to find the closest source instead of just the first one
 */
export const MINERS_GET_CLOSEST_SOURCE: boolean = true;

/**
 * Constants for Tick Timers - Number of ticks between running the specified constant this is deciding
 */
export const RUN_TOWER_TIMER = 1;
export const RUN_LAB_TIMER = 5;
export const RUN_LINKS_TIMER = 2;
export const RUN_TERMINAL_TIMER = 5;
export const RUN_ROOM_STATE_TIMER = 5;
export const RUN_DEFCON_TIMER = 2;
export const RUN_RESERVE_TTL_TIMER = 1;
export const RUN_RAMPART_STATUS_UPDATE = 1;
export const RESERVER_MIN_TTL = 1500;

/**
 * bucket limits for manager
 * decides the min the bucket must be to run this manager
 */
export const CREEP_MANAGER_BUCKET_LIMIT = 1000;
export const SPAWN_MANAGER_BUCKET_LIMIT = 50;
export const EMPIRE_MANAGER_BUCKET_LIMIT = 5000;
export const ROOM_MANAGER_BUCKET_LIMIT = 500;
export const MEMORY_MANAGER_BUCKET_LIMIT = 1;
export const EVENT_MANAGER_BUCKET_LIMIT = 5000;
export const ROOM_OVERLAY_BUCKET_LIMIT = 7000;
export const MILITARY_MANAGER_BUCKET_LIMIT = 2000;

/**
 * List of allies
 */
export const ALLY_LIST: string[] = ["jakesboy2", "UhmBrock", "Atanner", "Faff", "Yoner"];

/**
 * List of structures a tower in a bunker is allowed to repair
 */
export const TOWER_ALLOWED_TO_REPAIR: StructureConstant[] = [STRUCTURE_CONTAINER, STRUCTURE_ROAD];

/**
 * The % energy a tower must have before we fill it up
 */
export const TOWER_REPAIR_THRESHOLD: number = 0.85;

/**
 * The minimum amount of damage a tower should be able to deal before it stops firing, once it has already started firing
 */
export const TOWER_MIN_DAMAGE_THRESHOLD: number = 50;

/**
 * The amount of damage a tower should be able to deal before it will fire on a target, unless it has already started firing
 */
export const TOWER_MAX_DAMAGE_THRESHOLD: number = 150;

/**
 * The storage threshold we want to hit before spawning another worker
 */
export const STORAGE_ADDITIONAL_WORKER_THRESHOLD: number = 100000;

/**
 * The storage threshold we want to hit before spawning another power upgrader
 */
export const STORAGE_ADDITIONAL_UPGRADER_THRESHOLD: number = 300000;

/**
 * The number of lifetimes it would take a worker to repair all the ramparts
 * (for extra worker in upgrader state)
 */
export const NUM_LIFESPANS_FOR_EXTRA_CREEP: number = 2;

/**
 * Max number of workers in upgrader state
 */
export const MAX_WORKERS_UPGRADER_STATE: number = 4;

/**
 * Storage minimum for hamstringing power upgraders to rebuild storage
 *
 * Number of work parts for a mini power upgrader that this number decides
 */
export const STORAGE_LEVEL_MINI_UPGRADERS: number = 50000;
export const MINI_UPGRADER_WORK_PARTS: number = 5;

/**
 * The number of ticks we want to pass between scout spawns
 * currently set to one creep life, so if a scout dies it won't spawn another one to replace it until it would have naturally died
 */
export const SCOUT_SPAWN_TICKS: number = 1500;
