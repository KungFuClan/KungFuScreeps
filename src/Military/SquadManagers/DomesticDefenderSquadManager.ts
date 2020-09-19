import {
    DOMESTIC_DEFENDER_MAN,
    SpawnApi,
    ROLE_STALKER,
    MemoryApi_Military,
    SQUAD_STATUS_OK,
    OP_STRATEGY_COMBINED,
    OP_STRATEGY_FFA,
    HIGH_PRIORITY,
    SQUAD_STATUS_RALLY,
    SQUAD_STATUS_DONE,
    MilitaryMovement_Api,
    MilitaryCombat_Api,
    SQUAD_STATUS_DEAD,
    militaryDataHelper,
    ACTION_MOVE,
    ACTION_RANGED_ATTACK,
    ACTION_HEAL
} from "Utils/Imports/internals";
import { MilitaryIntents_Api } from "Military/Military.Api.Intents";
import { MilitaryStatus_Helper } from "Military/Military.Status.Helper";
import _ from "lodash";

export class DomesticDefenderSquadManager implements ISquadManager {
    public name: SquadManagerConstant = DOMESTIC_DEFENDER_MAN;
    public creeps: SquadStack[] = [];
    public targetRoom: string = "";
    public squadUUID: string = "";
    public operationUUID: string = "";
    public initialRallyComplete: boolean = false;
    public rallyPos: MockRoomPos | undefined;
    public orientation: DirectionConstant | undefined;
    public attackTarget: Id<Creep | Structure> | undefined;

    constructor() {
        const self = this;
        self.runSquad = self.runSquad.bind(this);
        self.createInstance = self.createInstance.bind(this);
        self.getSquadArray = self.getSquadArray.bind(this);
        self.checkStatus = self.checkStatus.bind(this);
        self.addCreep = self.addCreep.bind(this);
        self.creeps = [];
    }

    /**
     * Run the squad manager
     * @param instance the speecific instance of the squad we're running
     */
    public runSquad(instance: ISquadManager): void {
        const operation = MemoryApi_Military.getOperationByUUID(instance.operationUUID);
        const squadImplementation = this.getSquadStrategyImplementation(operation!);
        // Run the specific strategy for the current operation
        squadImplementation.runSquad(instance);
    }

    /**
     * Returns the implementation object for the squad
     * @param operation The parent operation of the squad
     */
    public getSquadStrategyImplementation(operation: MilitaryOperation): SquadStrategyImplementation {
        switch (operation.operationStrategy) {
            case OP_STRATEGY_COMBINED:
                return this[OP_STRATEGY_COMBINED];
            case OP_STRATEGY_FFA:
                return this[OP_STRATEGY_FFA];
            default:
                return this[OP_STRATEGY_FFA];
        }
    }

    /**
     * Create an instance and place into the empire memory
     * @param targetRoom the room we are attacking
     */
    public createInstance(targetRoom: string, operationUUID: string): DomesticDefenderSquadManager {
        const uuid: string = SpawnApi.generateSquadUUID(operationUUID);
        const instance = new DomesticDefenderSquadManager();
        instance.squadUUID = uuid;
        instance.targetRoom = targetRoom;
        instance.operationUUID = operationUUID;
        instance.initialRallyComplete = false;
        instance.rallyPos = undefined;
        instance.orientation = undefined;
        instance.attackTarget = undefined;
        return instance;
    }

    /**
     * Add a creep to the class
     * @param creep the creep we are adding to the squad
     * @param instance the speecific instance of the squad we're running
     */
    public addCreep(instance: ISquadManager, creepName: string): void {
        MemoryApi_Military.addCreepToSquad(instance.operationUUID, instance.squadUUID, creepName);
    }

    /**
     * Check the status of the squad
     * @param instance the speecific instance of the squad we're running
     * @returns boolean representing the squads current status
     */
    public checkStatus(instance: ISquadManager): SquadStatusConstant {
        // Handle initial rally status
        if (!instance.initialRallyComplete) {
            if (MilitaryMovement_Api.isSquadRallied(instance)) {
                instance.initialRallyComplete = true;
                return SQUAD_STATUS_OK;
            }
            return SQUAD_STATUS_RALLY;
        }

        // Check if the squad is done with the attack (ie, attack success)
        if (MilitaryCombat_Api.isOperationDone(instance)) {
            return SQUAD_STATUS_DONE;
        }

        // Check if the squad was killed
        if (MilitaryCombat_Api.isSquadDead(instance)) {
            return SQUAD_STATUS_DEAD;
        }

        // If nothing else, we are OK
        return SQUAD_STATUS_OK;
    }

    /**
     * Gets the members of the squad in array form
     * @returns array containing all squad member's role constants
     */
    public getSquadArray(): SquadDefinition[] {
        const stalker1: SquadDefinition = {
            role: ROLE_STALKER,
            caravanPos: 0
        };
        return [stalker1];
    }

    /**
     * Get the spawn priority of the military squad
     */
    public getSpawnPriority(): number {
        return HIGH_PRIORITY;
    }

    /**
     * Implementation of OP_STRATEGY_FFA
     */
    public ffa = {
        runSquad(instance: ISquadManager): void {
            // find squad implementation
            const singleton: ISquadManager = MemoryApi_Military.getSingletonSquadManager(instance.name);
            const status: SquadStatusConstant = singleton.checkStatus(instance);
            if (MilitaryStatus_Helper.handleSquadDeadStatus(status, instance)) {
                return;
            }
            MilitaryStatus_Helper.handleNotOKStatus(status);

            const dataNeeded: MilitaryDataParams = {
                hostiles: true,
                openRamparts: true
            };
            const creeps: Creep[] = MemoryApi_Military.getLivingCreepsInSquadByInstance(instance);
            const roomData: MilitaryDataAll = {};

            MilitaryIntents_Api.resetSquadIntents(instance);
            this.decideMoveIntents(instance, status, roomData);
            this.decideRangedAttackIntents(instance, status, roomData);
            this.decideHealIntents(instance, status, roomData);

            for (const i in creeps) {
                const creep: Creep = creeps[i];
                MilitaryCombat_Api.runIntents(instance, creep, roomData);
            }
        },

        decideMoveIntents(instance: ISquadManager, status: SquadStatusConstant, roomData: MilitaryDataAll): void {
            const creeps = MemoryApi_Military.getLivingCreepsInSquadByInstance(instance);

            roomData = militaryDataHelper.getRoomData(
                creeps,
                roomData,
                { hostiles: true, openRamparts: true },
                instance
            );

            // These should never be null, even if the hostiles and openRamparts don't exist. Will be empty arrays
            if (!roomData[instance.targetRoom]?.hostiles || !roomData[instance.targetRoom]?.openRamparts) {
                return;
            }

            // Get objective
            // if rcl < 4, objective is to seek and destroy
            // get every creep onto the nearest rampart to the enemy closest to the center of bunker?

            const hostileTarget = militaryDataHelper.getHostileClosestToBunkerCenter(
                roomData[instance.targetRoom].hostiles!.allHostiles,
                instance.targetRoom
            );

            if (hostileTarget === null) {
                return;
            }

            _.forEach(creeps, (creep: Creep) => {
                // Find the rampart that the creep needs to move to
                const targetRampart = hostileTarget.pos.findClosestByPath<StructureRampart>(
                    roomData[instance.targetRoom].openRamparts!,
                    {
                        // Filter out ramparts with non-me creeps on them
                        filter: (rampart: StructureRampart) => {
                            const creepsInRampart: Creep[] = rampart.pos.lookFor(LOOK_CREEPS);
                            return !_.some(creepsInRampart, (rampartCreep: Creep) => rampartCreep.name === creep.name);
                        }
                    }
                );
                if (targetRampart === null) {
                    return;
                }

                if (creep.pos.isEqualTo(targetRampart.pos)) {
                    return;
                }

                // TODO Create a place we can store data like this for use from tick to tick
                const pathOpts: FindPathOpts = MilitaryMovement_Api.getDomesticDefenderCostMatrix(
                    instance.targetRoom,
                    false,
                    roomData
                );
                const directionToTarget = creep.pos.findPathTo(targetRampart.pos, pathOpts)[0].direction;

                const intent: Move_MiliIntent = {
                    action: ACTION_MOVE,
                    target: directionToTarget,
                    targetType: "direction"
                };

                const creepStack: SquadStack | undefined = MemoryApi_Military.findCreepInSquadByInstance(
                    instance,
                    creep.name
                );

                if (creepStack === undefined) {
                    return;
                }

                creepStack.intents.push(intent);
            });
        },

        decideRangedAttackIntents(
            instance: ISquadManager,
            status: SquadStatusConstant,
            roomData: MilitaryDataAll
        ): void {
            const creeps = MemoryApi_Military.getLivingCreepsInSquadByInstance(instance);

            roomData = militaryDataHelper.getRoomData(
                creeps,
                roomData,
                { hostiles: true, openRamparts: true },
                instance
            );

            if (!roomData[instance.targetRoom]?.hostiles || !roomData[instance.targetRoom]?.openRamparts) {
                return;
            }

            const bestTargetHostile = militaryDataHelper.getHostileClosestToBunkerCenter(
                roomData[instance.targetRoom].hostiles!.allHostiles,
                instance.targetRoom
            );

            if (bestTargetHostile === null) {
                return;
            }

            _.forEach(creeps, (creep: Creep) => {
                if (creep.pos.inRangeTo(bestTargetHostile.pos, 3)) {
                    const intent: RangedAttack_MiliIntent = {
                        action: ACTION_RANGED_ATTACK,
                        target: bestTargetHostile.id,
                        targetType: "creepID"
                    };

                    MemoryApi_Military.pushIntentToCreepStack(instance, creep.name, intent);
                    return;
                }

                // Find any other attackable creep if we can't hit the best target
                const closestHostileCreep: Creep | undefined = _.find(
                    roomData[instance.targetRoom].hostiles!.allHostiles,
                    (hostile: Creep) => hostile.pos.getRangeTo(creep.pos) <= 3
                );

                if (closestHostileCreep !== undefined) {
                    const intent: RangedAttack_MiliIntent = {
                        action: ACTION_RANGED_ATTACK,
                        target: closestHostileCreep.id,
                        targetType: "creepID"
                    };

                    MemoryApi_Military.pushIntentToCreepStack(instance, creep.name, intent);
                    return;
                }
            });
        },

        decideHealIntents(instance: ISquadManager, status: SquadStatusConstant, roomData: MilitaryDataAll): void {
            const creeps = MemoryApi_Military.getLivingCreepsInSquadByInstance(instance);

            roomData = militaryDataHelper.getRoomData(creeps, roomData, { hostiles: true }, instance);

            if (!roomData[instance.targetRoom]?.hostiles) {
                return;
            }

            // Heal yourself every tick, as long as there are hostiles in the room

            _.forEach(creeps, (creep: Creep) => {
                // Heal if we are below full, preheal if theres hostiles and we aren't under a rampart
                const creepIsOnRampart: boolean =
                    _.filter(
                        creep.pos.lookFor(LOOK_STRUCTURES),
                        (struct: Structure) => struct.structureType === STRUCTURE_RAMPART
                    ).length > 0;
                if (
                    (roomData[instance.targetRoom].hostiles!.allHostiles.length > 0 && !creepIsOnRampart) ||
                    creep.hits < creep.hitsMax
                ) {
                    const intent: Heal_MiliIntent = {
                        action: ACTION_HEAL,
                        target: creep.name,
                        targetType: "creepName"
                    };

                    MemoryApi_Military.pushIntentToCreepStack(instance, creep.name, intent);
                    return;
                }
            });

            return;
        }
    };

    /**
     * Implementation of OP_STRATEGY_COMBINED
     */
    public combined = {
        runSquad(instance: ISquadManager): void {
            return;
        }
    };
}
