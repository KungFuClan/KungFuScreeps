import {
    ROOM_VISUALS_ON,
    CREEP_MANAGER_BUCKET_LIMIT,
    SPAWN_MANAGER_BUCKET_LIMIT,
    EMPIRE_MANAGER_BUCKET_LIMIT,
    ROOM_MANAGER_BUCKET_LIMIT,
    MEMORY_MANAGER_BUCKET_LIMIT,
    EVENT_MANAGER_BUCKET_LIMIT,
    ROOM_OVERLAY_BUCKET_LIMIT,
    ConsoleCommands,
    CreepManager,
    RoomVisualManager,
    UtilHelper,
    SpawnManager,
    RoomManager,
    MemoryManager,
    EmpireManager,
    RoomHelper_Structure,
    MILITARY_MANAGER_BUCKET_LIMIT,
    MilitaryManager,
    MAP_OVERLAY_BUCKET_LIMIT,
    MARKET_MANAGER_BUCKET_LIMIT,
    AUTOCONST_MANAGER_BUCKET_LIMIT
} from "Utils/Imports/internals";
import { MapVisualManager } from "MapVisuals/MapVisualManager";
import { MarketManager } from "Market/MarketManager";
import { AutoConstructionManager } from "AutoConstruction/AutoConstructionManager";

export class ManagerManager {
    public static runManagerManager(): void {

        // * Debug Variables
        const debug_disableVisuals = true;
        const debug_disableMarket = true;

        if (RoomHelper_Structure.executeEveryTicks(1000)) {
            ConsoleCommands.init();
        }

        if (Game.cpu.generatePixel !== undefined && Game.cpu.bucket >= 10000) {
            Game.cpu.generatePixel();
        }

        if (Game.cpu.bucket > MEMORY_MANAGER_BUCKET_LIMIT) {
            try {
                MemoryManager.runMemoryManager();
            } catch (e) {
                UtilHelper.printError(e);
            }
        }

        if (Game.cpu.bucket > ROOM_MANAGER_BUCKET_LIMIT) {
            try {
                RoomManager.runRoomManager();
            } catch (e) {
                UtilHelper.printError(e);
            }
        }

        if (Game.cpu.bucket > SPAWN_MANAGER_BUCKET_LIMIT && RoomHelper_Structure.executeEveryTicks(3)) {
            try {
                SpawnManager.runSpawnManager();
            } catch (e) {
                UtilHelper.printError(e);
            }
        }

        if (Game.cpu.bucket > CREEP_MANAGER_BUCKET_LIMIT) {
            try {
                CreepManager.runCreepManager();
            } catch (e) {
                UtilHelper.printError(e);
            }
        }

        if (!debug_disableVisuals && Game.cpu.bucket > MAP_OVERLAY_BUCKET_LIMIT && ROOM_VISUALS_ON) {
            try {
                MapVisualManager.runMapVisualManager();
            } catch (e) {
                UtilHelper.printError(e);
            }
        }

        if (Game.cpu.bucket > EMPIRE_MANAGER_BUCKET_LIMIT) {
            try {
                EmpireManager.runEmpireManager();
            } catch (e) {
                UtilHelper.printError(e);
            }
        }

        if (!debug_disableMarket && Game.cpu.bucket > MARKET_MANAGER_BUCKET_LIMIT) {
            try {
                MarketManager.runMarketManager();
            } catch (e) {
                UtilHelper.printError(e);
            }
        }

        if (Game.cpu.bucket > MILITARY_MANAGER_BUCKET_LIMIT) {
            try {
                MilitaryManager.runOperations();
            } catch (e) {
                UtilHelper.printError(e);
            }
        }

        if (Game.cpu.bucket > AUTOCONST_MANAGER_BUCKET_LIMIT && RoomHelper_Structure.executeEveryTicks(1)) {
            try {
                AutoConstructionManager.runAutoConstructionManager();
            } catch (e) {
                UtilHelper.printError(e);
            }
        }

        // Display room visuals if we have a fat enough bucket and config option allows it
        if (!debug_disableVisuals && Game.cpu.bucket > ROOM_OVERLAY_BUCKET_LIMIT && ROOM_VISUALS_ON) {
            try {
                RoomVisualManager.runRoomVisualManager();
            } catch (e) {
                UtilHelper.printError(e);
            }
        } else {
            try {
                RoomVisualManager.runRoomVisualManagerSlim();
            } catch (e) {
                UtilHelper.printError(e);
            }
        }
    }
}
