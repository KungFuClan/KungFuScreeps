import { AutoConstruction_Api, MemoryApi_Empire, MemoryApi_Room } from "Utils/Imports/internals";
import { AutoConstructWalls } from "./AutoConstructWalls";

export class AutoConstructionManager {
    /**
     * Run the auto construction manager for all rooms
     */
    public static runAutoConstructionManager(): void {
        const ownedRooms: Room[] = MemoryApi_Empire.getOwnedRooms();
        for (const room of ownedRooms) {
            if (!room) continue;
            this.runSingleAutoConstructionManager(room);
        }
    }

    /**
     * Run auto construction manager for a single room
     * @param room The room we are running it for
     */
    private static runSingleAutoConstructionManager(room: Room): void {
        if (!room.controller) return;
        const currentConstructionCount = Object.keys(Game.constructionSites).length;
        if (currentConstructionCount >= MAX_CONSTRUCTION_SITES) return;
        const spawns = room.find(FIND_MY_SPAWNS);
        if (spawns.length < 1) return;
        const bunkerCenter: RoomPosition = MemoryApi_Room.getBunkerCenter(room);
        const controller: StructureController = room.controller;
        const rcl: number = room.controller.level;
        const sources: Source[] = MemoryApi_Room.getSources(room.name);

        // Run the checks for all buildings we will need to consider
        AutoConstruction_Api.checkBunkerCenterBuildings(room, bunkerCenter, rcl, currentConstructionCount);
        AutoConstruction_Api.checkControllerBuildings(room, controller, rcl, currentConstructionCount);
        AutoConstruction_Api.checkSourceBuildings(room, sources, rcl, currentConstructionCount);

        AutoConstruction_Api.displayMatrix(AutoConstruction_Api.getDistanceTransform(room, 0, true), false, true);

        // TODO Remove - Temp line
        // let cpu = Game.cpu.getUsed();
        // let protectedTiles = [
        //     { x1: 34, y1: 26, x2: 44, y2: 36 }, // bunker area
        //     { x1: 10, y1: 20, x2: 15, y2: 24 }, // controller area
        //     // { x1: 1, y1: 6, x2: 5, y2: 8 }, // Top left alcove
        //     { x1: 30, y1: 25, x2: 32, y2: 27 }, // source 1
        //     { x1: 30, y1: 35, x2: 32, y2: 37 } // source 2
        // ];
        // let wallPositions = AutoConstructWalls.GetCutTiles("W8S8", protectedTiles, undefined, true);
        // console.log("W8N7 Positions returned: " + wallPositions.length);
        // cpu = Game.cpu.getUsed() - cpu;
        // console.log("CPU USED: " + cpu);

        // This is for your room on SPLUS Seasonal
        // let prot2 = [
        //     { x1: 35, y1: 12, x2: 44, y2: 24 },
        //     { x1: 30, y1: 2, x2: 33, y2: 5 },
        //     { x1: 45, y1: 14, x2: 47, y2: 16 },
        //     { x1: 19, y1: 17, x2: 21, y2: 19 }
        // ];

        // let wallPositions2 = AutoConstructWalls.GetCutTiles("W8S9", prot2, undefined, true);

        // Not yet implemented for MVP
        // AutoConstruction_Api.checkExtensions(room, bunkerCenter, rcl, currentConstructionCount);
        // AutoConstruction_Api.checkGeneralRoads(room, bunkerCenter, rcl, currentConstructionCount);
        // AutoConstruction_Api.checkRemoteRoomSourceBuildings(room, currentConstructionCount);
        // AutoConstruction_Api.checkRemoteRoomRoads(room, currentConstructionCount);
    }

    /**
     * Displays a graph to the room for debugging purposes.
     * @param arr The array to visualize
     * @param roomName The roomname, if left undefined it will dispaly to all rooms
     */
    public static visualizeArray(arr: number[][], roomName?: string): void {
        if (Game.time % 3 !== 0) return;

        const roomVisual: RoomVisual = new RoomVisual(roomName);

        for (let x = 0; x < arr.length; x++) {
            for (let y = 0; y < arr[x].length; y++) {
                roomVisual.text(arr[x][y].toString(), x, y);
            }
        }
    }
}
