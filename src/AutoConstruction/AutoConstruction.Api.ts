import { AutoConstruction_Helper } from "./AutoConstructionHelper";

export class AutoConstruction_Api {
    /**
     * Create an array that contains true or false if a tile is buildable
     * @param roomName The name of the room to get buildable tiles
     * @returns Array[] A 2-d array of booleans, true if tile is buildable
     */
    public static getBuildableTiles(roomName: string): boolean[][] {
        // TODO Create a stringify/unstringify version of this array to be stored in memory
        const roomTerrain = new Room.Terrain(roomName);
        // Create an empty 50 x 50 array
        // For clarity, creates an Array from [ a new array of 50 elements ] and maps each element to [ a new array of 50 elements ]
        // This array will be filled with booleans of buildable or not
        const buildableArray = Array.from(Array(50), () => new Array(50));

        // Fill buildableArray
        for (let x = 0; x < 50; x++) {
            for (let y = 0; y < 50; y++) {
                // Skip outside tiles/exit tiles
                if (x === 49 || x === 0 || y === 49 || y === 0) {
                    buildableArray[x][y] = false;
                    continue;
                }
                // Position is true if it is not a wall
                buildableArray[x][y] = roomTerrain.get(x, y) !== TERRAIN_MASK_WALL;
            }
        }
        return buildableArray;
    }

    /**
     * Check and place construction sites for the main center of the bunker
     * @param room the room we are checking for
     * @param bunkerCenter the center of the bunker for our main room
     * @param rcl the current rcl of the room
     * @param currentConstructionCount the current number of active construction sites
     */
    public static checkBunkerCenterBuildings(room: Room, bunkerCenter: RoomPosition, rcl: number, currentConstructionCount: number): void {
        AutoConstruction_Helper.checkTowers(room, bunkerCenter, rcl, currentConstructionCount);
        AutoConstruction_Helper.checkSpawns(room, bunkerCenter, rcl, currentConstructionCount);
        AutoConstruction_Helper.checkBunkerCenterLink(room, bunkerCenter, rcl, currentConstructionCount);
        AutoConstruction_Helper.checkStorage(room, bunkerCenter, rcl, currentConstructionCount);
        AutoConstruction_Helper.checkTerminal(room, bunkerCenter, rcl, currentConstructionCount);
        AutoConstruction_Helper.checkBunkerCenterRamparts(room, bunkerCenter, rcl, currentConstructionCount);
        AutoConstruction_Helper.checkBunkerCenterRoads(room, bunkerCenter, rcl, currentConstructionCount);
    }

    /**
     * Check and place construction sites for the buildings around the controller
     * @param room the room we are checking for
     * @param controller the controller for the main room
     * @param rcl the current rcl of the room
     * @param currentConstructionCount the current number of active construction sites
     */
    public static checkControllerBuildings(room: Room, controller: StructureController, rcl: number, currentConstructionCount: number): void {

    }

    /**
     * Check and place construction sites for the extensions in the room
     * @param room the room we are checking for
     * @param bunkerCenter the center of the bunker for our main room
     * @param rcl the current rcl of the room
     * @param currentConstructionCount the current number of active construction sites
     */
    public static checkExtensions(room: Room, bunkerCenter: RoomPosition, rcl: number, currentConstructionCount: number): void {

    }

    /**
     * Check and place construction sites for the roads in the room
     * @param room the room we are checking for
     * @param bunkerCenter the center of the bunker for our main room
     * @param rcl the current rcl of the room
     * @param currentConstructionCount the current number of active construction sites
     */
    public static checkRoads(room: Room, bunkerCenter: RoomPosition, rcl: number, currentConstructionCount: number): void {

    }

    /**
     * Check and place construction sites for the buildings around the sources
     * @param room the room we are checking for
     * @param sources the sources for the room we are checking for
     * @param rcl the current rcl of the room
     * @param currentConstructionCount the current number of active construction sites
     */
    public static checkSourceBuildings(room: Room, sources: Source[], rcl: number, currentConstructionCount: number): void {

    }

    /**
     * Check and place construction sites for the buildings around the remote room sources
     * @param room the room we are checking for
     * @param currentConstructionCount the current number of active construction sites
     */
    public static checkRemoteRoomSourceBuildings(room: Room, currentConstructionCount: number): void {

    }

    /**
     * Check and place construction sites for the roads leading towards the remote rooms (if applicable)
     * @param room the room we are checking for
     * @param currentConstructionCount the current number of active construction sites
     */
    public static checkRemoteRoomRoads(room: Room, currentConstructionCount: number): void {

    }
}
