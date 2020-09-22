export class AutoConstruction {
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
     * Returns the number of available constructionSites out of the current cap
     * @returns number
     */
    public static remainingConstSites(): number {
        // Game Given Constant - Number of sites
        return MAX_CONSTRUCTION_SITES - Object.keys(Game.constructionSites).length;
    }
}
