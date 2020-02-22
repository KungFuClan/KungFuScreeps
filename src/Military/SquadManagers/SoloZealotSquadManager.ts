import {
    UserException,
    SOLO_ZEALOT_MAN,
    SpawnApi,
    ROLE_ZEALOT,
    LOW_PRIORITY,
    MemoryApi_Military,
    SQUAD_STATUS_OK,
    OP_STRATEGY_COMBINED,
    OP_STRATEGY_FFA,
    militaryDataHelper,
    MilitaryCombat_Api,
    ACTION_MOVE,
    ACTION_ATTACK,
    OP_STRATEGY_INVADER
} from "Utils/Imports/internals";
import { MilitaryStatus_Helper } from "Military/Military.Status.Helper";
import { MilitaryIntents_Api } from "Military/Military.Api.Intents";

export class SoloZealotSquadManager implements ISquadManager {
    public name: SquadManagerConstant = SOLO_ZEALOT_MAN;
    public creeps: SquadStack[] = [];
    public targetRoom: string = "";
    public squadUUID: string = "";
    public operationUUID: string = "";
    public initialRallyComplete: boolean = false;
    public rallyPos: MockRoomPos | undefined;

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
            case OP_STRATEGY_COMBINED: return this[OP_STRATEGY_COMBINED];
            case OP_STRATEGY_FFA: return this[OP_STRATEGY_FFA];
            case OP_STRATEGY_INVADER: return this[OP_STRATEGY_INVADER];
            default: return this[OP_STRATEGY_FFA];
        }
    }

    /**
     * Create an instance and place into the empire memory
     * @param targetRoom the room we are attacking
     */
    public createInstance(targetRoom: string, operationUUID: string): SoloZealotSquadManager {
        const uuid: string = SpawnApi.generateSquadUUID(operationUUID);
        const instance = new SoloZealotSquadManager();
        instance.squadUUID = uuid;
        instance.targetRoom = targetRoom;
        instance.operationUUID = operationUUID;
        instance.initialRallyComplete = false;
        instance.rallyPos = undefined;
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
        return SQUAD_STATUS_OK;
    }

    /**
     * Gets the members of the squad in array form
     * @returns array containing all squad member's role constants
     */
    public getSquadArray(): SquadDefinition[] {
        const zealot1: SquadDefinition = {
            role: ROLE_ZEALOT,
            caravanPos: 0
        };
        return [zealot1];
    }

    /**
     * Get the spawn priority of the military squad
     */
    public getSpawnPriority(): number {
        return LOW_PRIORITY;
    }


    /**
     * Implementation of OP_STRATEGY_FFA
     */
    public ffa = {

        runSquad(instance: ISquadManager): void {
            return;
        }

    }

    /**
     * Implementation of OP_STRATEGY_INVADER
     */
    public invader = {

        runSquad(instance: ISquadManager): void {

            const singleton: ISquadManager = MemoryApi_Military.getSingletonSquadManager(instance.name);
            const status: SquadStatusConstant = singleton.checkStatus(instance);

            if (MilitaryStatus_Helper.handleSquadDeadStatus(status, instance)) {
                return;
            }

            MilitaryStatus_Helper.handleNotOKStatus(status);

            const dataNeeded: MilitaryDataParams = {
                hostiles: true,
                hostileStructures: true
            };
            const creeps: Creep[] = MemoryApi_Military.getLivingCreepsInSquadByInstance(instance);
            const roomData: MilitaryDataAll = militaryDataHelper.getRoomData(creeps, {}, dataNeeded, instance);

            MilitaryIntents_Api.resetSquadIntents(instance);
            this.decideMoveIntents(instance, status, roomData);
            this.decideAttackIntents(instance, status, roomData);

            for (const i in creeps) {
                const creep: Creep = creeps[i];
                MilitaryCombat_Api.runIntents(instance, creep, roomData);
            }

        },

        decideMoveIntents(instance: ISquadManager, status: SquadStatusConstant, roomData: MilitaryDataAll): void {
            const creeps = MemoryApi_Military.getLivingCreepsInSquadByInstance(instance);

            _.forEach(creeps, (creep: Creep) => {
                if(creep.room.name === instance.targetRoom) {
                    this.decideMoveIntents_TARGET_ROOM(instance, status, roomData, creep);
                } else {
                    this.decideMoveIntents_NON_TARGET_ROOM(instance, status, roomData, creep);
                }
            });


        },

        decideMoveIntents_TARGET_ROOM(instance: ISquadManager, status: SquadStatusConstant, roomData: MilitaryDataAll, creep: Creep): void {

            const invaderCore = _.find(roomData[creep.room.name]!.hostileStructures!, (struct: AnyOwnedStructure) => struct.structureType === STRUCTURE_INVADER_CORE);

            if(invaderCore === undefined) { 
                return;
            }

            let directionToTarget: DirectionConstant | undefined;

            if (!MilitaryCombat_Api.isInAttackRange(creep, invaderCore.pos, true)) {
                const path = creep.pos.findPathTo(invaderCore.pos, { range: 1 });
                directionToTarget = path[0].direction;
            }

            if(directionToTarget === undefined) {
                return;
            }

            const intent: Move_MiliIntent = {
                action: ACTION_MOVE,
                target: directionToTarget,
                targetType: "direction"
            };

            MemoryApi_Military.pushIntentToCreepStack(instance, creep.name, intent);
        },

        decideMoveIntents_NON_TARGET_ROOM(instance: ISquadManager, status: SquadStatusConstant, roomData: MilitaryDataAll, creep: Creep): void {
            // Get away from a creep in range while in transit
            if (
                MilitaryIntents_Api.queueIntentMoveNearHostileKiting(
                    creep,
                    instance,
                    roomData[creep.room.name].hostiles?.allHostiles!
                )
            ) {
                return;
            }

            // Move towards the target room
            if (MilitaryIntents_Api.queueIntentMoveToTargetRoom(creep, instance)) {
                return;
            }
        },

        decideAttackIntents(instance: ISquadManager, status: SquadStatusConstant, roomData: MilitaryDataAll) {

            const creeps = MemoryApi_Military.getLivingCreepsInSquadByInstance(instance);
            
            // Return early if we do not have a creep in the target room yet
            if(roomData[instance.targetRoom] === undefined) { 
                return;
            }
            
            const invaderCore = _.find(roomData[instance.targetRoom]!.hostileStructures!, (struct: AnyOwnedStructure) => struct.structureType === STRUCTURE_INVADER_CORE);

            if(invaderCore === undefined) { 
                return;
            }


            _.forEach(creeps, (creep: Creep) => {

                if(MilitaryCombat_Api.isInAttackRange(creep, invaderCore.pos, true)) {

                    const intent: Attack_MiliIntent = {
                        action: ACTION_ATTACK,
                        target: invaderCore.id,
                        targetType: "structure"
                    }

                    MemoryApi_Military.pushIntentToCreepStack(instance, creep.name, intent);
                    return;
                }
            });
        }
    }
    /**
     * Implementation of OP_STRATEGY_COMBINED
     */
    public combined = {

        runSquad(instance: ISquadManager): void {
            return;
        }

    }
}
