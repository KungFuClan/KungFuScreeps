import { AutoConstruction_Api, MemoryApi_Empire, MemoryApi_Room } from "Utils/Imports/internals";

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
        const bunkerCenter: RoomPosition = MemoryApi_Room.getBunkerCenter(room);
        const controller: StructureController = room.controller;
        const rcl: number = room.controller.level;
        const sources: Source[] = MemoryApi_Room.getSources(room.name);


        // Run the checks for all buildings we will need to consider
        AutoConstruction_Api.checkBunkerCenterBuildings(room, bunkerCenter, rcl, currentConstructionCount);
        AutoConstruction_Api.checkControllerBuildings(room, controller, rcl, currentConstructionCount);
        AutoConstruction_Api.checkExtensions(room, bunkerCenter, rcl, currentConstructionCount);
        AutoConstruction_Api.checkRoads(room, bunkerCenter, rcl, currentConstructionCount);
        AutoConstruction_Api.checkSourceBuildings(room, sources, rcl, currentConstructionCount);
        AutoConstruction_Api.checkRemoteRoomSourceBuildings(room, currentConstructionCount);
        AutoConstruction_Api.checkRemoteRoomRoads(room, currentConstructionCount);
    }
}
