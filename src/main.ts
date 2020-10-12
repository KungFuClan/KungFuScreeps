/*
  Kung Fu Klan's Screeps Code
  Written and maintained by -
    Jakesboy2
    UhmBrock

  Starting Jan 2019
*/

// Define prototypes
import { ErrorMapper, ManagerManager, RoomVisualApi } from "Utils/Imports/internals";
import { Mem } from "Utils/MemHack";

// import * as Profiler from "./Profiler";
// global.Profiler = Profiler.init();

export const loop = ErrorMapper.wrapLoop(() => {
    Mem.loadCachedMemory();
    ManagerManager.runManagerManager();
    RoomVisualApi.debug_towerDamageOverlay_perCreep(Game.rooms["W8S8"])
});
