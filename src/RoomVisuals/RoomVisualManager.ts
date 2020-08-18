import {
    ROOM_OVERLAY_GRAPH_ON,
    RoomVisualApi,
    ROOM_OVERLAY_ON,
    ROOM_DEBUG_OVERLAY_ON,
    MemoryApi_Empire
} from "Utils/Imports/internals";
import { profile } from "Profiler";
import _ from "lodash";

// Manager for room visuals
@profile
export class RoomVisualManager {
    /**
     * run the manager for each room
     */
    public static runRoomVisualManager(): void {
        const ownedRooms = MemoryApi_Empire.getOwnedRooms();

        _.forEach(ownedRooms, (room: Room) => this.runSingleRoomVisualManager(room));
    }

    /**
     * Run the slim room visual manager for each room
     */
    public static runRoomVisualManagerSlim(): void {
        const ownedRooms = MemoryApi_Empire.getOwnedRooms();

        _.forEach(ownedRooms, (room: Room) => this.runSingleRoomVisualManagerSlim(room));
    }

    /**
     * run the manager for a single room
     * @param room the room we want to run the room visual for
     */
    private static runSingleRoomVisualManager(room: Room): void {
        let endLeftLine: number = 1;
        let endRightLine: number = 1;
        const LEFT_START_X = 1;
        const RIGHT_START_X = 48;

        if (ROOM_OVERLAY_ON) {
            // Left Side -----
            // Display the Empire box in the top left
            endLeftLine = RoomVisualApi.createEmpireInfoVisual(room, LEFT_START_X, endLeftLine);
            // Display the Creep Info box in middle left
            endLeftLine = RoomVisualApi.createCreepCountVisual(room, LEFT_START_X, endLeftLine);
            // Display the Room Info box in the bottom left
            endLeftLine = RoomVisualApi.createRoomInfoVisual(room, LEFT_START_X, endLeftLine);
        }

        if (ROOM_OVERLAY_GRAPH_ON) {
            RoomVisualApi.createUpgradeGraphVisual(room, LEFT_START_X + 1, 45);
        }
        // ------

        if (ROOM_OVERLAY_ON) {
            // Right Side -----
            // Display Remote Flag box on the top right
            endRightLine = RoomVisualApi.createRemoteFlagVisual(room, RIGHT_START_X, endRightLine);
            // Display Claim Flag Box on the upper middle right
            endRightLine = RoomVisualApi.createClaimFlagVisual(room, RIGHT_START_X, endRightLine);
            // Display Attack Flag Box on the lower middle right
            endRightLine = RoomVisualApi.createAttackFlagVisual(room, RIGHT_START_X, endRightLine);
            // Display Option Flag box on the bottom right
            endRightLine = RoomVisualApi.createOptionFlagVisual(room, RIGHT_START_X, endRightLine);
            // Display message box on the bottom right
            endRightLine = RoomVisualApi.createMessageBoxVisual(room, RIGHT_START_X, endRightLine);
        }

        // ------DEBUG-------------------------
        if (ROOM_DEBUG_OVERLAY_ON) {
            // RoomVisualApi.debug_towerDamageOverlay_perTile(room);
            // RoomVisualApi.debug_towerDamageOverlay_perCreep(room);
        }
    }

    /**
     * Run a much slimmer version of room visuals that just shows mostly CPU/Empire info
     * This runs in the case that full room visuals get turned off to assist with debugging cpu issues
     * @param room the room we are displaying the visuals for
     */
    private static runSingleRoomVisualManagerSlim(room: Room): void {
        let endLeftLine: number = 1;
        const LEFT_START_X = 1;

        if (ROOM_OVERLAY_ON) {
            // Left Side -----
            // Display the Empire box in the top left
            endLeftLine = RoomVisualApi.createEmpireInfoVisual(room, LEFT_START_X, endLeftLine);
        }
    }
}
