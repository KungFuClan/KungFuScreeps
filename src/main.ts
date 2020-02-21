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
export const loop = ErrorMapper.wrapLoop(() => {
    Mem.loadCachedMemory();
    ManagerManager.runManagerManager();
    // const terrain = CostMatrixApi.getTerrainMatrix("W9N7");
    // const twrDmg = CostMatrixApi.getTowerDamageMatrix("W9N7");
    // const summed = CostMatrixApi.sumCostMatrices([terrain, twrDmg]);
    // CostMatrixApi.visualizeCostMatrix(summed, "W9N7");
});
