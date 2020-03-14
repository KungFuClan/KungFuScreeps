interface VoyageToOptions {
    // Creeps will not prefer roads over plains (but will still prefer them over swamps)
    // Default: false
    ignoreRoads?: boolean;
    // Creeps will not path around other creeps
    // Default: true
    // ignoreCreeps?: boolean;
    // Creeps will not path around structures
    // Default: false
    // ignoreStructures?: boolean;
    // Creeps will prefer to travel in highways
    // Default: false
    preferHighway?: boolean;
    // How heavily a creep will prefer highways 
    // Default: preferHighway === true ? 2.5 : 1
    highwayBias?: number;
    // Room Types the creep is allowed to pass through
    // Default: [ALLY, ALLY_REMOTE, INVADER_REMOTE, NEUTRAL, HIGHWAY, UNKNOWN]
    allowedRoomStatuses?: RoomStatusType[];
    // Range to destination before it is considered reached
    // Default: 1
    range?: number;
    // Array of objects with a pos property to avoid
    // Default: []
    obstacles?: {pos: RoomPosition}[];
    // List of MatrixTypes to be used in the pathfinding operation
    // Default: [ StructureMatrix, TerrainMatrix, OwnedCreepMatrix, NonOwnedCreepMatrix ]
    costMatrices?: MatrixTypes[];
    // Any additional parameters required to use the costMatrices passed in above - check CostMatrixApi.getCostMatrix for details
    // Default: undefined
    costMatrixAdditionalparam?: {};
    // Callback function that accepts two arguments, roomName and costmatrix, returning a CostMatrix or a boolean.
    // If it returns false, the room will be excluded. If it returns a costMatrix, it will be used instead of the default.
    // Default: PathFinder's default CostMatrix
    roomCallback?: (roomName: string, matrix: CostMatrix) => CostMatrix | boolean;
    // Callback function that accepts one argument, roomName and returns a number representing the weight of that room in 
    // the route finding process. If it returns undefined, the default value will be used.
    // Default: Game.map.findRoute's default value
    routeCallback?: (roomName: string) => number;
    // If an empty object is passed into this argument, the method will populate it with data
    // Default: undefined
    returnData?: VoyageToReturnData;
    // Limits the range that findRoute will search
    // Default: 32
    restrictDistance?: number;
    // Force / Disable multi-room pathing. 
    // Default: Multi-room path if linear distance > 2
    useFindRoute?: boolean;
    // Limit the ops (CPU) that PathFinder will use
    // Default: 2000 (~2 CPU)
    maxOps?: number;
    // Avoid repathing if the target has moved only 1 position away - be cautious 
    // while using this, as it can cause a winding path depending on intial distance to target.
    // Default: false
    movingTarget?: boolean;
    // Creeps won't prefer plains or roads over swamps - all costs will be 1
    // Default: false
    offRoad?: boolean;
    // The number of ticks a creep has to be stuck before it has a chance of repathing.
    // When a creep gets stuck, it has a 50% chance to repath, to potentially alleviate a stalemate
    // Default: 2
    stuckValue?: number;
    // Limit how many rooms can be searched by PathFinder
    // Default: undefined / unlimited
    maxRooms?: number;
    // Float between 0 and 1 representing the percent chance a creep will randomly 
    // invalidate its current path. 1 would repath every tick, 0 would never repath.
    // Default: undefined / 0
    repath?: number;
    // Supply the route that should be used by PathFinder - will skip using findRoute, regardless of useFindRoute option value
    // Default: undefined
    route?: {[roomName: string]: boolean};
    // Attempt a secondary method of pathfinding if the first fails, to ensure you get a path
    // Default: false
    ensurePath?: boolean;
    // Show visuals as appropriate
    // Default: true
    enableVisuals?: boolean;
    // Returns an intent instead of calling creep.move - pass in an empty object and it will be populated
    // Default: undefined
    returnIntent?: Move_MiliIntent;
}

interface PathfinderReturn {
    path: RoomPosition[];
    ops: number;
    cost: number;
    incomplete: boolean;
}

interface VoyageToReturnData {
    nextPos?: RoomPosition;
    pathfinderReturn?: PathfinderReturn;
    state?: VoyageState;
    path?: string;
}

interface VoyagerData {
    state: VoyageState;
    path: string;
}

interface VoyageState {
    stuckCount?: number;
    lastCoord?: Coord;
    destination: RoomPosition;
    cpu: number;
}

interface Creep {
    voyageTo(destination: _HasRoomPosition|RoomPosition|null, ops?: VoyageToOptions): number;
}

interface CreepMemory {
    /**
     * Voyager movement data
     */
    _voyage?: VoyagerData;
}

type Coord = {x: number, y: number};

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


interface EmpireMemory {
    /**
     * Voyager empire-wide memory
     */
    movementData?: MovementData;
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