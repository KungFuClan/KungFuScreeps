import { MemoryApi_Military, UtilHelper, Normalize, UserException, ERROR_ERROR, militaryDataHelper } from "Utils/Imports/internals";
import { MilitaryMovement_Helper } from "./Military.Movement.Helper";

export class MilitaryMovement_Api {

    /**
     * Verify that the path provided leads to the correct target
     * @param path The PathStep[] to check
     * @param target A room position, or any object with a room position
     */
    public static verifyPathTarget(path: PathStep[], target: _HasRoomPosition | RoomPosition): boolean {

        if (path.length === 0) {
            return false;
        }

        const pathEndStep = path[path.length - 1];

        const targetPosition = target instanceof RoomPosition ? target : target.pos;

        return (targetPosition.x === pathEndStep.x && targetPosition.y === pathEndStep.y);
    }

    /**
     * Finds the next step along a defined path for a creep to take
     * @param path The PathStep[] to check
     * @param creep The creep to check the path for
     * @returns the index of the next step, -1 if we're at the end
     */
    public static nextPathStep(creep: Creep, path: PathStep[]): number | -1 {

        if (path.length === 0) {
            return -1;
        }

        // Return the index of the next step (where the previous step is our current position) or -1 if not found
        return _.findIndex(path, (step: PathStep) => step.x - step.dx === creep.pos.x && step.y - step.dy === creep.pos.y);
    }

    /**
     * Check if every creep in the squad is at the rally point in their proper position
     * TODO
     * @param instance the squad instance we're using to check
     */
    public static isSquadRallied(instance: ISquadManager): boolean {
        const creeps: Array<Creep | undefined> = MemoryApi_Military.getCreepsInSquadByInstance(instance);
        const operation: MilitaryOperation | undefined = MemoryApi_Military.getOperationByUUID(instance.operationUUID);
        if (!instance.rallyPos) {
            return true;
        }
        const rallyPos: RoomPosition = Normalize.convertMockToRealPos(instance.rallyPos);
        for (const i in creeps) {
            const creep: Creep | undefined = creeps[i];
            if (!creep) {
                continue;
            }

            const creepOptions: CreepOptionsMili = creep.memory.options as CreepOptionsMili;
            if (creepOptions.caravanPos === undefined || creepOptions.caravanPos === null) {
                throw new UserException(
                    "Undefined caravanPos in squadRally Method",
                    "Creep [ " + creep.name + " ].",
                    ERROR_ERROR
                );
            }

            // If any creep is NOT in their caravanPos range of the rally position, we aren't rallied
            if (!creep.pos.inRangeTo(rallyPos, creepOptions.caravanPos)) {
                return false;
            }
        }

        // We make it here, everyones rallied
        return true;
    }

    /**
     *
     * @param instance the instance we're checking for
     * @returns boolean representing if quad squad is rallied
     */
    public static isQuadSquadInRallyPos(instance: ISquadManager): boolean {
        if (!instance.rallyPos) {
            return true;
        }

        const currPos: RoomPosition = Normalize.convertMockToRealPos(instance.rallyPos);
        const exit = Game.map.findExit(currPos.roomName, instance.targetRoom);
        if (exit === ERR_NO_PATH || exit === ERR_INVALID_ARGS) {
            throw new UserException("No path or invalid args for isQuadSquadInRallyPos", "rip", ERROR_ERROR);
        }

        const posArr: RoomPosition[] = MilitaryMovement_Helper.getQuadSquadRallyPosArray(currPos, exit);
        const squad: Creep[] = MemoryApi_Military.getLivingCreepsInSquadByInstance(instance);
        if (squad.length === 0) {
            return false;
        }

        for (const i in squad) {
            if (!squad[i].pos.isEqualTo(posArr[i])) {
                return false;
            }
        }
        return true;
    }

    /**
     * Find the rampart we want to stay put and defend on
     * @param creep the creep we are checking for
     * @param enemies the enemy creeps in the room
     * @param ramparts the ramparts we have to choose from
     */
    public static findDefenseRampart(creep: Creep, enemies: Creep[], ramparts: Structure[]): Structure | null {

        // Get an array of the rampart closest to each enemy for a list of viable options
        const viableRamparts: Structure[] = [];
        for (const i in enemies) {
            const enemy: Creep = enemies[i];
            const closeRampart: Structure | null = enemy.pos.findClosestByRange(ramparts);
            if (closeRampart) {
                viableRamparts.push(closeRampart);
            }
        }

        // Return the closest one to the creep that isn't occupied
        return creep.pos.findClosestByPath(viableRamparts, {
            filter:
                (rampart: Structure) => {
                    const creepOnRampart: Creep[] = rampart.pos.lookFor(LOOK_CREEPS);
                    // Creep can only occupy one space, so safe to use first value here
                    // Returns true only if rampart is empty OR you're the one on it
                    if (creepOnRampart.length > 0) {
                        return creepOnRampart[0].name === creep.name;
                    }
                    return true;
                }
        });
    }

    /**
     * Gets the domestic defender cost matrix for finding a path
     * Prefers ramparts and doesn't allow non-rampart movement if flag passed
     * @param roomName the room we are in
     * @param allowNonRamparts boolean asking if we want to allow creeps to walk off ramparts
     * @param roomData the data for the room
     */
    public static getDomesticDefenderCostMatrix(roomName: string, allowNonRamparts: boolean, roomData: MilitaryDataAll): FindPathOpts {
        if (!roomData[roomName]?.openRamparts) {
            allowNonRamparts = true;
        }
        const DEFAULT_OPTS: FindPathOpts = {
            heuristicWeight: 1.5,
            range: 0,
            ignoreCreeps: true,
            maxRooms: 1,
            costCallback(roomName: string, costMatrix: CostMatrix) {
                if (!allowNonRamparts) {
                    roomData[roomName].openRamparts!.forEach((rampart: StructureRampart) => {
                        costMatrix.set(rampart.pos.x, rampart.pos.y, 1);
                    });
                }
                return costMatrix;
            }
        };

        return DEFAULT_OPTS;
    }

    /**
     * Get the direction we need to move off the exit tile
     * @param creep the creep we're checking for
     * @returns direction we need to move to get off exit
     */
    public static getDirectionOffExitTile(creep: Creep): DirectionConstant | undefined {
        const x: number = creep.pos.x;
        const y: number = creep.pos.y;

        if (x === 0) {
            return RIGHT;
        }
        if (y === 0) {
            return BOTTOM;
        }
        if (x === 49) {
            return LEFT;
        }
        if (y === 49) {
            return TOP;
        }

        return undefined
    }

}
