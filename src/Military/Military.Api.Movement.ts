import { MemoryApi_Military, UtilHelper, Normalize, UserException, ERROR_ERROR } from "Utils/Imports/internals";

export class MilitaryMovment_Api {

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
            if (!creepOptions.caravanPos) {
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
