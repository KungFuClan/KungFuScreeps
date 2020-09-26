import { MemoryApi_Empire, MemoryApi_Room } from "Utils/Imports/internals";

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
        const bunkerCenter: RoomPosition = MemoryApi_Room.getBunkerCenter(room);
        const rcl: number = room.controller.level;

        // check if we're missing any buildings for the current rcl
        // return these buildings as an array that we're missing
        // object denoting it (ie source container, upgrader link, etc)
        // opt param saying what object its near like for upgrader link and source containers
        // loop over this array, attempting to place each building
        // get a list of valid locations for the building
        // place building on the first valid location
    }
}
