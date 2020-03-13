/*
  Kung Fu Klan's Screeps Code
  Written and maintained by -
    Jakesboy2
    UhmBrock

  Starting Jan 2019
*/

// Define prototypes
import { ErrorMapper, ManagerManager } from "Utils/Imports/internals";
import { Mem } from "Utils/MemHack";

import * as Profiler from "./Profiler"
import { CostMatrixApi } from "Voyager/CostMatrix.Api";
import { Voyager } from "Voyager/Voyager";
global.Profiler = Profiler.init();
const voy = Voyager;

export const loop = ErrorMapper.wrapLoop(() => {
    Mem.loadCachedMemory();
    ManagerManager.runManagerManager();
    const creep = Game.creeps["harvester_12300_W9N7_7494_11"];
    const x = Math.random() * 10;
    const dest = new RoomPosition(x, 21, "W9N7");
    // creep.voyageTo(dest);
});