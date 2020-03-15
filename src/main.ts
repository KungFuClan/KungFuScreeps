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
import { Voyager } from "Voyager/Voyager";
global.Profiler = Profiler.init();
const voy = Voyager;

export const loop = ErrorMapper.wrapLoop(() => {
    Mem.loadCachedMemory();
    ManagerManager.runManagerManager();
});