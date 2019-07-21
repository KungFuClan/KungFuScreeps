import EmpireManager from "Managers/EmpireManager";
import MemoryManager from "Managers/MemoryManagement";
import RoomManager from "Managers/RoomManager";
import SpawnManager from "Managers/SpawnManager";
import UtilHelper from "Helpers/UtilHelper";
import RoomVisualManager from "Managers/RoomVisuals/RoomVisualManager";
import {
    ROOM_OVERLAY_ON,
    CREEP_MANAGER_BUCKET_LIMIT,
    SPAWN_MANAGER_BUCKET_LIMIT,
    EMPIRE_MANAGER_BUCKET_LIMIT,
    ROOM_MANAGER_BUCKET_LIMIT,
    MEMORY_MANAGER_BUCKET_LIMIT,
    EVENT_MANAGER_BUCKET_LIMIT,
    ROOM_OVERLAY_BUCKET_LIMIT
} from "utils/config";
import CreepManager from "Managers/CreepManager";
import { ConsoleCommands } from "Helpers/ConsoleCommands";
import RoomHelper from "Helpers/RoomHelper";
import EventManager from "Managers/EventManager";


export default class ManagerManager {
    public static runManagerManager(): void {

        if (RoomHelper.excecuteEveryTicks(1000)) {
            ConsoleCommands.init();
        }

        // clean up memory
        if (!Game.cpu["bucket"] || Game.cpu["bucket"] > MEMORY_MANAGER_BUCKET_LIMIT) {
            try {
                MemoryManager.runMemoryManager();
            } catch (e) {
                UtilHelper.printError(e);
            }
        }

        // run the empire
        if (!Game.cpu["bucket"] || Game.cpu["bucket"] > EMPIRE_MANAGER_BUCKET_LIMIT) {
            try {
                EmpireManager.runEmpireManager();
            } catch (e) {
                UtilHelper.printError(e);
            }
        }

        // run rooms
        if (!Game.cpu["bucket"] || Game.cpu["bucket"] > ROOM_MANAGER_BUCKET_LIMIT) {
            try {
                RoomManager.runRoomManager();
            } catch (e) {
                UtilHelper.printError(e);
            }
        }

        // run spawning
        if (!Game.cpu["bucket"] || Game.cpu["bucket"] > SPAWN_MANAGER_BUCKET_LIMIT) {
            try {
                SpawnManager.runSpawnManager();
            } catch (e) {
                UtilHelper.printError(e);
            }
        }

        // run creeps
        if (!Game.cpu["bucket"] || Game.cpu["bucket"] > CREEP_MANAGER_BUCKET_LIMIT) {
            try {
                CreepManager.runCreepManager();
            } catch (e) {
                UtilHelper.printError(e);
            }
        }


        // Display room visuals if we have a fat enough bucket and config option allows it
        if (!Game.cpu["bucket"] || (Game.cpu["bucket"] > ROOM_OVERLAY_BUCKET_LIMIT && ROOM_OVERLAY_ON)) {
            try {
                RoomVisualManager.runRoomVisualManager();
            } catch (e) {
                UtilHelper.printError(e);
            }
        }

        // Display room visuals if we have a fat enough bucket and config option allows it
        if (!Game.cpu["bucket"] || (Game.cpu["bucket"] > EVENT_MANAGER_BUCKET_LIMIT)) {
            try {
                EventManager.runEventManager();
            } catch (e) {
                UtilHelper.printError(e);
            }
        }
        // -------- end managers --------
    }
}
