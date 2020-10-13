import { CostMatrixApi } from "Pathfinding/CostMatrix.Api";
import { MemoryApi_Room, RoomApi_Structure, RoomHelper_Structure } from "Utils/Imports/internals";
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
    public static checkGeneralRoads(room: Room, bunkerCenter: RoomPosition, rcl: number, currentConstructionCount: number): void {

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

    /**
     * Gets the distance transformed matrix for the room
     * @param room The room object for the cost matrix;
     */
    public static getDistanceTransform(room: Room, oob: number = 0, includeStructures: boolean = false): CostMatrix {

        let terrain: RoomTerrain = new Room.Terrain(room.name);
        const dist = new PathFinder.CostMatrix();

        // Set all walkable tiles, skipping terrain
        for (let x = 0; x < 50; x++) {
            for (let y = 0; y < 50; y++) {
                const terrainType = terrain.get(x, y);
                if(terrainType === TERRAIN_MASK_WALL) continue;
                dist.set(x, y, 1);
            }
        }

        // Set all structures to 0 (like walls)
        if(includeStructures){

            const structures = MemoryApi_Room.getStructures(room.name, (structure) => {
                return structure.structureType !== STRUCTURE_ROAD
            });

            for(let struct of structures) {
                dist.set(struct.pos.x, struct.pos.y, 0);
            }
        }

        let top_left = 0;
        let top = 0;
        let top_right = 0
        let left = 0;
        let center = 0;
        let right = 0
        let bottom_left = 0;
        let bottom = 0;
        let bottom_right = 0
 ​
        // Starting at the ( 0, 1 ), going to (49, 49)
        // set each tile to the minimum distance + 1, from its upper edges
        for (let n = 51; n < 2500; n++) {
            if (dist._bits[n] !== 0) {
            left = dist._bits[n - 1]
            top_left = dist._bits[n - 51]
            top = dist._bits[n - 50]
            top_right = dist._bits[n - 49]
        ​
            if (n % 50 === 0) { top_left = oob; left = oob }
            if (n % 50 === 49) { top_right = oob }
        ​
            dist._bits[n] = Math.min(Math.min(Math.min(top_left, top), Math.min(top_right, left)), 254) + 1
            }
        }

        // Starting at (48, 48)​, going to (0, 0)
        // set each tile to the minimum distance + 1, from it lower edges
        for (let n = 2448; n >= 0; n--) {
            center = dist._bits[n]
            right = dist._bits[n + 1]
            bottom_left = dist._bits[n + 49]
            bottom = dist._bits[n + 50]
            bottom_right = dist._bits[n + 51]
        ​
            if (n > 2400) { bottom_left = oob; bottom = oob; bottom_right = oob }
            if (n % 50 === 49) { right = oob; bottom_right = oob }
            if (n % 50 === 0) { bottom_left = oob }
        ​
            dist._bits[n] = Math.min(Math.min(Math.min(right, bottom_left) + 1, Math.min(bottom, bottom_right) + 1), center)
        }
        return dist;
    }

    public static displayMatrix(matrix: CostMatrix, showValues: boolean = true, showCircles: boolean = true) {
        const MATRIX_DISPLAY_SIZE_DIVIDER = 2;
        const color = "#ff0000";
        const rv = new RoomVisual();
        let max = 1;
        let x: number;
        let y: number;
        let value: number;
        for (y = 0; y < 50; y++) {
            for (x = 0; x < 50; x++) {
            max = Math.max(max, matrix.get(x, y));
            }
        }
        for (y = 0; y < 50; y++) {
            for (x = 0; x < 50; x++) {
            value = matrix.get(x, y);
            if (value > 0) {
                if (showCircles) {
                rv.circle(x, y, {
                    fill: color,
                    radius: value / max / MATRIX_DISPLAY_SIZE_DIVIDER,
                });
                }
                if (showValues) {
                rv.text(`${value}`, x, y);
                }
            }
            }
        }
    }

}
