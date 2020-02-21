/*
  Kung Fu Klan's Screeps Code
  Written and maintained by -
    Jakesboy2
    UhmBrock

  Starting Jan 2019
*/

// Define prototypes
import { ErrorMapper, ManagerManager } from "Utils/Imports/internals";
import { MilitaryMovement_Helper } from "Military/Military.Movement.Helper";
import { CostMatrixApi } from "Pathfinding/CostMatrix.Api";
export const loop = ErrorMapper.wrapLoop(() => {
  ManagerManager.runManagerManager();
  // const terrain = CostMatrixApi.getTerrainMatrix("W9N7");
  // const twrDmg = CostMatrixApi.getTowerDamageMatrix("W9N7");
  // const summed = CostMatrixApi.sumCostMatrices([terrain, twrDmg]);
  // CostMatrixApi.visualizeCostMatrix(summed, "W9N7");
});
