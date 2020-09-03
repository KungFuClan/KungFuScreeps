/*
  Kung Fu Klan's Screeps Code
  Written and maintained by -
    Jakesboy2
    UhmBrock

  Starting Jan 2019
*/

// Define prototypes
import { ErrorMapper, ManagerManager, MemoryHelper_Room } from "Utils/Imports/internals";
import { Mem } from "Utils/MemHack";

import * as Profiler from "./Profiler";
import { CostMatrixApi } from "Pathfinding/CostMatrix.Api";
global.Profiler = Profiler.init();

export const loop = ErrorMapper.wrapLoop(() => {
    Mem.loadCachedMemory();
    ManagerManager.runManagerManager();

    MemoryHelper_Room.updateGetNonEnergy_allJobs(Game.rooms["W9N7"]);
});
