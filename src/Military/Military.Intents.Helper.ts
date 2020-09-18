import _ from "lodash";
import { ACTION_MOVE, ERROR_ERROR, MemoryApi_Military, UserException } from "Utils/Imports/internals";

export class MilitaryIntents_Helper {

    /**
 * Get the map of the creeps based on their caravan position
 * @param creeps the creeps in the squad
 * @param instance the instance we are controlling
 * @returns hash map of creeps with caravan position being the key
 */
    private static getCreepPositionMap(instance: ISquadManager): { [key: number]: Creep } {
        const creeps: Creep[] = MemoryApi_Military.getLivingCreepsInSquadByInstance(instance);
        const positionMap: { [key: number]: Creep } = {}
        _.forEach(creeps, (creep: Creep) => {
            const creepOptions: CreepOptionsMili = creep.memory.options as CreepOptionsMili;
            if (creepOptions.caravanPos === undefined || creepOptions.caravanPos === null) throw new UserException("Could not rotate creep, no caravan pos", "Squad - " + instance.squadUUID, ERROR_ERROR);
            positionMap[creepOptions.caravanPos] = creep;
        });
        return positionMap;
    }

    /**
     * Get the intent mapper for ease of use in pushing intents to creeps
     * @returns intent mapper
     */
    private static getIntentMap(): { [key: string]: Move_MiliIntent } {
        return {
            ["left"]: {
                action: ACTION_MOVE,
                target: LEFT,
                targetType: "direction"
            },
            ["up_left"]: {
                action: ACTION_MOVE,
                target: TOP_LEFT,
                targetType: "direction"
            },
            ["down_left"]: {
                action: ACTION_MOVE,
                target: BOTTOM_LEFT,
                targetType: "direction"
            },
            ["up_right"]: {
                action: ACTION_MOVE,
                target: TOP_RIGHT,
                targetType: "direction"
            },
            ["down_right"]: {
                action: ACTION_MOVE,
                target: BOTTOM_RIGHT,
                targetType: "direction"
            },
            ["right"]: {
                action: ACTION_MOVE,
                target: RIGHT,
                targetType: "direction"
            },
            ["up"]: {
                action: ACTION_MOVE,
                target: TOP,
                targetType: "direction"
            },
            ["down"]: {
                action: ACTION_MOVE,
                target: BOTTOM,
                targetType: "direction"
            }
        };
    }

    /**
     * Queue the intents to turn the squads orientation around
     * @param instance The current instance we are controlling
     * @param currentOrientation the current direction the squad is facing
     */
    public static queueIntentsQuadSquadTurnAround(instance: ISquadManager, currentOrientation: DirectionConstant): void {
        const positionMap: { [key: number]: Creep } = this.getCreepPositionMap(instance);
        const intentMapper: { [key: string]: Move_MiliIntent } = this.getIntentMap();

        switch (currentOrientation) {
            case TOP:
                if (positionMap[0] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[0].name, intentMapper["down_right"]);
                if (positionMap[1] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[1].name, intentMapper["down_left"]);
                if (positionMap[2] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[2].name, intentMapper["up_right"]);
                if (positionMap[3] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[3].name, intentMapper["up_left"]);
                break;

            case LEFT:
                if (positionMap[0] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[0].name, intentMapper["up_right"]);
                if (positionMap[1] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[1].name, intentMapper["down_right"]);
                if (positionMap[2] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[2].name, intentMapper["up_left"]);
                if (positionMap[3] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[3].name, intentMapper["down_left"]);
                break;

            case RIGHT:
                if (positionMap[0] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[0].name, intentMapper["down_left"]);
                if (positionMap[1] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[1].name, intentMapper["up_left"]);
                if (positionMap[2] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[2].name, intentMapper["down_right"]);
                if (positionMap[3] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[3].name, intentMapper["up_right"]);
                break;

            case BOTTOM:
                if (positionMap[0] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[0].name, intentMapper["up_left"]);
                if (positionMap[1] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[1].name, intentMapper["up_right"]);
                if (positionMap[2] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[2].name, intentMapper["down_left"]);
                if (positionMap[3] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[3].name, intentMapper["down_right"]);
                break;
        }
    }

    /**
     * Queue the intents to rotate the squad clockwise
     * @param instance The current instance we are controlling
     * @param currentOrientation the current direction the squad is facing
     */
    public static queueIntentsQuadSquadRotateClockwise(instance: ISquadManager, currentOrientation: DirectionConstant): void {
        const positionMap: { [key: number]: Creep } = this.getCreepPositionMap(instance);
        const intentMapper: { [key: string]: Move_MiliIntent } = this.getIntentMap();

        switch (currentOrientation) {
            case TOP:
                if (positionMap[0] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[0].name, intentMapper["right"]);
                if (positionMap[1] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[1].name, intentMapper["down"]);
                if (positionMap[2] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[2].name, intentMapper["up"]);
                if (positionMap[3] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[3].name, intentMapper["left"]);
                break;

            case LEFT:
                if (positionMap[0] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[0].name, intentMapper["up"]);
                if (positionMap[1] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[1].name, intentMapper["right"]);
                if (positionMap[2] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[2].name, intentMapper["left"]);
                if (positionMap[3] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[3].name, intentMapper["down"]);
                break;

            case RIGHT:
                if (positionMap[0] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[0].name, intentMapper["down"]);
                if (positionMap[1] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[1].name, intentMapper["left"]);
                if (positionMap[2] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[2].name, intentMapper["right"]);
                if (positionMap[3] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[3].name, intentMapper["up"]);
                break;

            case BOTTOM:
                if (positionMap[0] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[0].name, intentMapper["left"]);
                if (positionMap[1] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[1].name, intentMapper["up"]);
                if (positionMap[2] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[2].name, intentMapper["down"]);
                if (positionMap[3] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[3].name, intentMapper["right"]);
                break;
        }
    }

    /**
     * Queue the intents to rotate the squad counter clockwise
     * @param instance The current instance we are controlling
     * @param currentOrientation the current direction the squad is facing
     */
    public static queueIntentsQuadSquadRotateCounterClockwise(instance: ISquadManager, currentOrientation: DirectionConstant): void {
        const positionMap: { [key: number]: Creep } = this.getCreepPositionMap(instance);
        const intentMapper: { [key: string]: Move_MiliIntent } = this.getIntentMap();

        switch (currentOrientation) {
            case TOP:
                if (positionMap[0] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[0].name, intentMapper["down"]);
                if (positionMap[1] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[1].name, intentMapper["left"]);
                if (positionMap[2] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[2].name, intentMapper["right"]);
                if (positionMap[3] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[3].name, intentMapper["up"]);
                break;

            case LEFT:
                if (positionMap[0] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[0].name, intentMapper["right"]);
                if (positionMap[1] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[1].name, intentMapper["down"]);
                if (positionMap[2] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[2].name, intentMapper["up"]);
                if (positionMap[3] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[3].name, intentMapper["left"]);
                break;

            case RIGHT:
                if (positionMap[0] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[0].name, intentMapper["left"]);
                if (positionMap[1] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[1].name, intentMapper["up"]);
                if (positionMap[2] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[2].name, intentMapper["down"]);
                if (positionMap[3] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[3].name, intentMapper["right"]);
                break;

            case BOTTOM:
                if (positionMap[0] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[0].name, intentMapper["up"]);
                if (positionMap[1] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[1].name, intentMapper["right"]);
                if (positionMap[2] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[2].name, intentMapper["left"]);
                if (positionMap[3] !== undefined) MemoryApi_Military.pushIntentToCreepStack(instance, positionMap[3].name, intentMapper["down"]);
                break;
        }
    }

    /**
     * Update the orientation of the squad
     * @param currentOrientation the current orientation of the squad
     * @param operationApplied the operation that was applied to decide the new orientation
     */
    public static updateSquadOrientation(currentOrientation: DirectionConstant, operationApplied: "clockwise" | "counterClockwise" | "turnAround"): DirectionConstant {
        interface SquadOrientationMapper {
            [key: string]: { [key: string]: DirectionConstant };
        }

        const orientationMapper: SquadOrientationMapper = {
            [TOP]: {
                ["clockwise"]: RIGHT,
                ['counterClockwise']: LEFT,
                ['turnAround']: BOTTOM
            },
            [LEFT]: {
                ["clockwise"]: TOP,
                ['counterClockwise']: BOTTOM,
                ['turnAround']: RIGHT
            },
            [RIGHT]: {
                ["clockwise"]: BOTTOM,
                ['counterClockwise']: TOP,
                ['turnAround']: LEFT
            },
            [BOTTOM]: {
                ["clockwise"]: LEFT,
                ['counterClockwise']: RIGHT,
                ['turnAround']: TOP
            }
        }

        return orientationMapper[currentOrientation][operationApplied];
    }
}
