import { off } from "process";
import { militaryDataHelper, RoomApi_State, UserException } from "Utils/Imports/internals";

/**
 * Two points that create a bounding rectangle on a grid
 */
interface BoundingRectangle {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

/**
 * Constants for tile types
 */
const UNWALKABLE = -1;
const NORMAL = 0;
const PROTECTED = 1;
const TO_EXIT = 2;
const EXIT = 3;

// The offsets to get the 8 tiles around a tile
const surroundingOffset: number[][] = [
    [0, -1],
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, 1],
    [1, 1],
    [1, 0],
    [1, -1]
];

type TerrainTile = typeof UNWALKABLE | typeof NORMAL | typeof PROTECTED | typeof TO_EXIT | typeof EXIT;

interface Edge {
    toVertex: number;
    resEdge: number;
    capacity: number;
    flow: number;
}

export class AutoConstructWalls {
    /**
     * Converts a room into a TerrainTyle array for use with mincut.
     * @param roomName The room to create an array from
     * @param bounds The bounding box to create into an array. By default this is the entire room.
     */
    public static getRoomAsArray(
        roomName: string,
        bounds: BoundingRectangle = { x1: 0, y1: 0, x2: 49, y2: 49 }
    ): TerrainTile[][] {
        // Initializes the array as all unwalkable tiles
        let tileArray: TerrainTile[][] = Array.from(Array(50), () => new Array(50).fill(UNWALKABLE));

        let xMin = bounds.x1 <= bounds.x2 ? bounds.x1 : bounds.x2;
        let xMax = bounds.x1 >= bounds.x2 ? bounds.x1 : bounds.x2;
        let yMin = bounds.y1 <= bounds.y2 ? bounds.y1 : bounds.y2;
        let yMax = bounds.y1 >= bounds.y2 ? bounds.y1 : bounds.y2;

        const terrain = Game.map.getRoomTerrain(roomName);

        for (let x = xMin; x <= xMax; x++) {
            for (let y = yMin; y <= yMax; y++) {
                // Skip walls, since they are UNWALKABLE
                if (terrain.get(x, y) !== TERRAIN_MASK_WALL) {
                    if (x === 0 || y === 0 || x === 49 || y === 49) {
                        tileArray[x][y] = EXIT;
                        continue;
                    }

                    if (x === bounds.x1 || y === bounds.y1 || x === bounds.x2 || y === bounds.y2) {
                        tileArray[x][y] = TO_EXIT;
                        continue;
                    }

                    tileArray[x][y] = NORMAL;
                }
            }
        }

        // If the bounds contains any edge, mark exits and to_exits
        if (xMin === 0 || yMin === 0 || xMax === 49 || yMax === 49) {
            tileArray = this.markExits(tileArray);
        }

        return tileArray;
    }

    /**
     * Marks all room borders as unwalkable, and all tiles near an EXIT to TO_EXIT
     */
    public static markExits(tileArray: TerrainTile[][]): TerrainTile[][] {
        // Mark all tile adjacent to an EXIT as TO_EXIT
        for (let i = 1; i < 49; i++) {
            // Left edge
            if (tileArray[0][i - 1] === EXIT) tileArray[1][i] = TO_EXIT;
            if (tileArray[0][i] === EXIT) tileArray[1][i] = TO_EXIT;
            if (tileArray[0][i + 1] === EXIT) tileArray[1][i] = TO_EXIT;

            // Right edge
            if (tileArray[49][i - 1] === EXIT) tileArray[48][i] = TO_EXIT;
            if (tileArray[49][i] === EXIT) tileArray[48][i] = TO_EXIT;
            if (tileArray[49][i + 1] === EXIT) tileArray[48][i] = TO_EXIT;

            // Top edge
            if (tileArray[i - 1][0] === EXIT) tileArray[i][1] = TO_EXIT;
            if (tileArray[i][0] === EXIT) tileArray[i][1] = TO_EXIT;
            if (tileArray[i + 1][0] === EXIT) tileArray[i][1] = TO_EXIT;

            // Bottom edge
            if (tileArray[i - 1][49] === EXIT) tileArray[i][48] = TO_EXIT;
            if (tileArray[i][49] === EXIT) tileArray[i][48] = TO_EXIT;
            if (tileArray[i + 1][49] === EXIT) tileArray[i][48] = TO_EXIT;
        }

        // Reset all room border tiles as UNWALKABLE
        for (let i = 0; i < 50; i++) {
            tileArray[0][i] = UNWALKABLE;
            tileArray[49][i] = UNWALKABLE;
            tileArray[i][0] = UNWALKABLE;
            tileArray[i][49] = UNWALKABLE;
        }

        return tileArray;
    }

    /**
     * Create the Graph for minCut
     */
    public static createGraph(
        roomName: string,
        protectedTiles: BoundingRectangle[] = [],
        bounds: BoundingRectangle = { x1: 0, y1: 0, x2: 49, y2: 49 }
    ) {
        // Get the room as an array of TerrainTiles
        let roomTerrainArray = AutoConstructWalls.getRoomAsArray(roomName, bounds);

        // Protect any tiles passed in for protection
        roomTerrainArray = this.protectGraphArea(roomTerrainArray, protectedTiles);

        const visualizeArray = true;
        if (visualizeArray) this.visualizeArray(roomName, roomTerrainArray);

        // Initialize Graph
        // - Possible for 2 * 50 * 50 + 2 vertices (UNWALKABLE set to unused later)
        // Top vertices = y * 50 + x;
        // bottom vertices = top + 2500;
        let graph = new Graph(2 * 50 * 50 + 2);
        let sourceVertex = 2 * 50 * 50; // where the flow is generated
        let sinkVertex = 2 * 50 * 50 + 1; // where the flow is absorbed

        // Subfunction that create the edge for surrounding tiles if they are
        // normal or to exit
        const createSurroundingEdge = (vertex: number, x: number, y: number) => {
            for (let offset of surroundingOffset) {
                let dx = x + offset[0];
                let dy = y + offset[1];
                if (roomTerrainArray[dx][dy] === NORMAL || roomTerrainArray[dx][dy] === TO_EXIT)
                    graph.newEdge(vertex, dy * 50 + dx, Number.MAX_VALUE);
            }
        };

        for (let x = 1; x < 49; x++) {
            for (let y = 1; y < 49; y++) {
                let topVertex = y * 50 + x;
                let botVertex = topVertex + 2500;

                switch (roomTerrainArray[x][y]) {
                    case NORMAL:
                        graph.newEdge(topVertex, botVertex, 1);
                        createSurroundingEdge(botVertex, x, y);
                        break;

                    case PROTECTED:
                        graph.newEdge(sourceVertex, topVertex, Number.MAX_VALUE);
                        graph.newEdge(topVertex, botVertex, 1);
                        createSurroundingEdge(botVertex, x, y);
                        break;

                    case TO_EXIT:
                        graph.newEdge(topVertex, sinkVertex, Number.MAX_VALUE);
                        break;
                }
            }
        }

        // Graph is complete
        return graph;
    }

    /**
     * Calculate minCut tiles from room and bounds
     */
    public static GetCutTiles(
        roomName: string,
        protectedTiles: BoundingRectangle[] = [],
        bounds: BoundingRectangle = { x1: 0, y1: 0, x2: 49, y2: 49 },
        verbose: boolean = false
    ) {
        let graph = this.createGraph(roomName, protectedTiles, bounds);
        let sourceVertex = 2 * 50 * 50; // Position Source / Sink in Room-Graph
        let sinkVertex = 2 * 50 * 50 + 1;

        // Get the min cut
        let count = graph.calculateMinCut(sourceVertex, sinkVertex);

        if (verbose) console.log("Number of Tiles in Cut: ", count);

        let positions: { x: number; y: number }[] = [];

        if (count > 0) {
            let cutEdges = graph.bfsCut(sourceVertex);

            // Get Positions from edges
            for (let i = 0; i < cutEdges.length; i++) {
                let vertex = cutEdges[i] - 2500;
                let x = vertex % 50;
                let y = (vertex - x) / 50;

                positions.push({ x, y });
            }
        }

        // If bounds are given, try to detect islands of walkable tiles
        // which are not connected to the exits, and delete them from the cut tiles
        let xMin = bounds.x1 <= bounds.x2 ? bounds.x1 : bounds.x2;
        let xMax = bounds.x1 >= bounds.x2 ? bounds.x1 : bounds.x2;
        let yMin = bounds.y1 <= bounds.y2 ? bounds.y1 : bounds.y2;
        let yMax = bounds.y1 >= bounds.y2 ? bounds.y1 : bounds.y2;
        let entireRoomInBounds = xMin === 0 && xMax === 49 && yMin === 0 && yMax === 49;

        if (!entireRoomInBounds && positions.length > 0) {
            // this.deleteDeadEndTiles(roomName, positions);
        }

        if (verbose && positions.length > 0) {
            let visual = new RoomVisual(roomName);
            for (let { x, y } of positions) {
                visual.circle(x, y, { radius: 0.5, fill: "#ff7722", opacity: 0.9 });
            }
        }

        return positions;
    }

    /**
     * Removes unnecessary cut-tiles if bounds are set to include dead ends
     */
    public static deleteDeadEndTiles(roomName: string, cutTiles: { x: number; y: number }[]) {
        // Get Terrain and set all cut-tiles as UNWALKABLE
        let roomTerrainArray = this.getRoomAsArray(roomName);

        for (let { x, y } of cutTiles) {
            roomTerrainArray[x][y] = UNWALKABLE;
        }

        this.visualizeArray(roomName, roomTerrainArray);

        // Flood fill from exits: save exit tiles in array and do a bfs search

        let unvisitedVertices: number[] = [];

        for (let i = 0; i < 49; i++) {
            if (roomTerrainArray[1][i] === TO_EXIT) unvisitedVertices.push(50 * i + 1);
            if (roomTerrainArray[48][i] === TO_EXIT) unvisitedVertices.push(50 * i + 48);
            if (roomTerrainArray[i][1] === TO_EXIT) unvisitedVertices.push(50 * i);
            if (roomTerrainArray[i][48] === TO_EXIT) unvisitedVertices.push(50 * 48 + i);
        }

        // Iterate over all unvisited TO_EXIT tiles and mark neighbors as TO_EXIT tiles if NORMAL,
        // and add to unvisited
        while (unvisitedVertices.length > 0) {
            let index = unvisitedVertices.pop();
            if (index === undefined) continue;

            index -= 2500; // adjust for mapping to position
            let x = index % 50;
            let y = (index - x) / 50;
            for (let offset of surroundingOffset) {
                let dx = x + offset[0];
                let dy = y + offset[1];
                if (roomTerrainArray[dx][dy] === NORMAL) {
                    unvisitedVertices.push(50 * dy + dx + 2500);
                    roomTerrainArray[dx][dy] = TO_EXIT;
                }
            }
        }

        // Remove min cut tile if there is no TO_EXIT surrounding it
        for (let i = cutTiles.length - 1; i >= 0; i--) {
            let leadsToExit = false;
            let x = cutTiles[i].x;
            let y = cutTiles[i].y;
            for (let offset of surroundingOffset) {
                let dx = x + offset[0];
                let dy = y + offset[1];
                if (roomTerrainArray[dx][dy] === TO_EXIT) {
                    leadsToExit = true;
                }
            }

            if (!leadsToExit) {
                cutTiles.splice(i, 1);
            }
        }
    }

    /**
     * Mark the protected areas on the graph
     */
    public static protectGraphArea(
        roomTerrainArray: TerrainTile[][],
        protectedTiles: BoundingRectangle[]
    ): TerrainTile[][] {
        for (let i = 0; i < protectedTiles.length; i++) {
            let protRect: BoundingRectangle = protectedTiles[i];

            let xMin = protRect.x1 <= protRect.x2 ? protRect.x1 : protRect.x2;
            let xMax = protRect.x1 >= protRect.x2 ? protRect.x1 : protRect.x2;
            let yMin = protRect.y1 <= protRect.y2 ? protRect.y1 : protRect.y2;
            let yMax = protRect.y1 >= protRect.y2 ? protRect.y1 : protRect.y2;

            for (let x = xMin; x <= xMax; x++) {
                for (let y = yMin; y <= yMax; y++) {
                    // Mark the borders of a rectangle as protected, the center as unwalkable
                    if (x === protRect.x1 || x === protRect.x2 || y === protRect.y1 || y === protRect.y2) {
                        if (roomTerrainArray[x][y] === NORMAL) roomTerrainArray[x][y] = PROTECTED;
                    } else {
                        roomTerrainArray[x][y] = UNWALKABLE;
                    }
                }
            }
        }

        return roomTerrainArray;
    }

    /**
     * visualizes the terrain array using colored circles.
     */
    public static visualizeArray(roomName: string, roomTerrainArray: TerrainTile[][]): void {
        let visual = new RoomVisual(roomName);

        for (let x = 0; x < 50; x++) {
            for (let y = 0; y < 50; y++) {
                if (roomTerrainArray[x][y] === UNWALKABLE) continue;
                // visual.circle(x, y, { radius: 0.5, fill: "#111166", opacity: 0.3 });
                else if (roomTerrainArray[x][y] === NORMAL)
                    visual.circle(x, y, { radius: 0.5, fill: "#e8e863", opacity: 0.3 });
                else if (roomTerrainArray[x][y] === PROTECTED)
                    visual.circle(x, y, { radius: 0.5, fill: "#75e863", opacity: 0.3 });
                else if (roomTerrainArray[x][y] === TO_EXIT)
                    visual.circle(x, y, { radius: 0.5, fill: "#b063e8", opacity: 0.3 });
            }
        }
    }
}

class Graph {
    public vertexCount: number;
    public level: number[];
    public edges: Edge[][];

    constructor(vertexCount: number) {
        this.vertexCount = vertexCount;
        this.level = new Array(vertexCount);
        this.edges = Array.from(Array(vertexCount), () => []);
    }

    /**
     * Creates a new edge for (x, y) where x is fromVertex, y is toVertex
     * @param fromVertex
     * @param toVertex
     * @param capacity
     */
    public newEdge(fromVertex: number, toVertex: number, capacity: number): void {
        let forwardEdge: Edge = {
            toVertex: toVertex,
            resEdge: this.edges[toVertex].length,
            capacity: capacity,
            flow: 0
        };

        let reverseEdge: Edge = {
            toVertex: fromVertex,
            resEdge: this.edges[fromVertex].length - 1,
            capacity: 0,
            flow: 0
        };

        this.edges[fromVertex].push(forwardEdge); // Normal forward edge
        this.edges[toVertex].push(reverseEdge); // Reverse edge for residual graph
    }

    /**
     * Calculates the level graph and if there is a path from s to t
     * @param s
     * @param t
     */
    public breadthFirstSearch(s: number, t: number): boolean {
        if (t >= this.vertexCount) return false;

        // Reset old levels
        this.level.fill(-1);
        this.level[s] = 0;

        // Start queue with s as a starting point
        let queue = [s];

        while (queue.length) {
            // Remove first element and return it
            let u: number = queue.splice(0, 1)[0];

            // Set the level of each connected node, starting at 0
            for (let i = 0; i < this.edges[u].length; i++) {
                let edge = this.edges[u][i];
                if (this.level[edge.toVertex] < 0 && edge.flow < edge.capacity) {
                    this.level[edge.toVertex] = this.level[u] + 1;
                    queue.push(edge.toVertex);
                }
            }
        }

        // If the level has been changed from the initial value of -1,
        // then there is a path at some level.
        return this.level[t] >= 0;
    }

    /**
     * DFS Like flow, sends flow along path from s -> t recursively, while increasing the level
     * of each visited vertex by one.
     * @param vertex
     * @param flow
     * @param t the sink index
     * @param c Array of numbers
     */
    public sendFlow(vertex: number, flow: number, sink: number, array: number[]): number {
        // Sink reached, start flowing back up the recursive stack.
        if (vertex === sink) return flow;

        let flowToCurrentVertex = 0;
        let flowToSink = 0;

        // Visit all edges of the vertex, one after the other
        while (array[vertex] < this.edges[vertex].length) {
            let edge = this.edges[vertex][array[vertex]];

            // Edge leads to vertex with a level one higher, and has flow under capacity
            if (this.level[edge.toVertex] === this.level[vertex] + 1 && edge.flow < edge.capacity) {
                // Get the smaller of the flow passed in, or the remaining flow in the edge
                flowToCurrentVertex = Math.min(flow, edge.capacity - edge.flow);

                // Recursively call this function for the next vertex
                flowToSink = this.sendFlow(edge.toVertex, flowToCurrentVertex, sink, array);

                if (flowToSink > 0) {
                    // Add flow to the current edge
                    edge.flow += flowToSink;

                    // Subtract flow from the reverse edge
                    this.edges[edge.toVertex][edge.resEdge].flow -= flowToSink;

                    return flowToSink;
                }
            }

            array[vertex]++;
        }

        // No vertices to visit, or no flow in the system.
        return 0;
    }

    /**
     * Searches the level array to mark the vertices reachable from s
     * @param s The vertex to search
     */
    public bfsCut(s: number): number[] {
        let edgeInCut: Edge[] = [];

        // Reset level array
        this.level.fill(-1);
        this.level[s] = 1;

        let queue: number[] = [s];

        while (queue.length) {
            // Remove first element and return it
            let u: number = queue.splice(0, 1)[0];

            // Set the level of each connected node, starting at 0
            for (let i = 0; i < this.edges[u].length; i++) {
                let edge = this.edges[u][i];
                if (this.level[edge.toVertex] < 1 && edge.flow < edge.capacity) {
                    this.level[edge.toVertex] = 1;
                    queue.push(edge.toVertex);
                }
                if (edge.flow === edge.capacity && edge.capacity > 0) {
                    edge.resEdge = u;
                    edgeInCut.push(edge);
                }
            }
        }

        let minCut: number[] = [];

        for (let i = 0; i < edgeInCut.length; i++) {
            // Only edges which are blocking and lead to from-s unreachable vertices are in the min cut
            if (this.level[edgeInCut[i].toVertex] === -1) {
                minCut.push(edgeInCut[i].toVertex);
            }
        }

        return minCut;
    }

    /**
     * Caculate the mincut given a source and sink (Dinic Algorithm)
     * @param s The source vertex
     * @param t The sink vertex
     */
    public calculateMinCut(s: number, t: number): number {
        if (s === t) return -1;

        let returnValue = 0;

        // While there is a path
        while (this.breadthFirstSearch(s, t) === true) {
            let count: number[] = Array(this.vertexCount + 1).fill(0);
            let flow = 0;

            do {
                flow = this.sendFlow(s, Number.MAX_VALUE, t, count);
                if (flow > 0) returnValue += flow;
            } while (flow);
        }

        return returnValue;
    }
}
