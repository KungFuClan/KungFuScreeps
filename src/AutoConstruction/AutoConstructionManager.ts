import { MemoryApi_Empire } from "Utils/Imports/internals";

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

    }
}
