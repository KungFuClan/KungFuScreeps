export class MilitaryIntents_Helper {

    /**
     * Queue the intents to turn the squads orientation around
     * @param instance The current instance we are controlling
     * @param currentOrientation the current direction the squad is facing
     */
    public static queueIntentsQuadSquadTurnAround(instance: ISquadManager, currentOrientation: DirectionConstant): void {

    }

    /**
     * Queue the intents to rotate the squad clockwise
     * @param instance The current instance we are controlling
     * @param currentOrientation the current direction the squad is facing
     */
    public static queueIntentsQuadSquadRotateClockwise(instance: ISquadManager, currentOrientation: DirectionConstant): void {

    }

    /**
     * Queue the intents to rotate the squad counter clockwise
     * @param instance The current instance we are controlling
     * @param currentOrientation the current direction the squad is facing
     */
    public static queueIntentsQuadSquadRotateCounterClockwise(instance: ISquadManager, currentOrientation: DirectionConstant): void {

    }

    /**
     * Update the orientation of the squad
     * @param currentOrientation the current orientation of the squad
     * @param operationApplied the operation that was applied to decide the new orientation
     */
    public static updateSquadOrientation(currentOrientation: DirectionConstant, operationApplied: "clockwise" | "counterClockwise" | "turnAround"): void {

    }
}
