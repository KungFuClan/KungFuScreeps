import {
    UserException,
    STANDARD_MAN,
    SpawnApi,
    ROLE_MEDIC,
    ROLE_ZEALOT,
    LOW_PRIORITY,
    MemoryApi_Military,
    SQUAD_STATUS_OK,
    OP_STRATEGY_COMBINED,
    OP_STRATEGY_FFA
} from "Utils/Imports/internals";

export class StandardSquadManager implements ISquadManager {
    public name: SquadManagerConstant = STANDARD_MAN;
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
            default: return this[OP_STRATEGY_FFA];
        }
    }

    /**
     * Create an instance and place into the empire memory
     * @param targetRoom the room we are attacking
     */
    public createInstance(targetRoom: string, operationUUID: string): StandardSquadManager {
        const uuid: string = SpawnApi.generateSquadUUID(operationUUID);
        const instance = new StandardSquadManager();
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
        const medic1: SquadDefinition = {
            role: ROLE_MEDIC,
            caravanPos: 1
        };
        return [zealot1, medic1];
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
     * Implementation of OP_STRATEGY_COMBINED
     */
    public combined = {

        runSquad(instance: ISquadManager): void {
            return;
        }

    }
}
