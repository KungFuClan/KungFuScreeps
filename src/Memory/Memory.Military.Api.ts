import { ERROR_WARN, ERROR_ERROR, SQUAD_MANAGERS, UserException } from "Utils/Imports/internals";
import _ from "lodash";

export class MemoryApi_Military {
    /**
     * Get an active operation of with the provided UUID
     * @param operationUUID
     * @returns militaryOperations object with that UUID
     */
    public static getOperationByUUID(operationUUID: string): MilitaryOperation | undefined {
        return Memory.empire.militaryOperations[operationUUID];
    }

    /**
     * Get an active squad with the provided UUIDs
     * @param operationUUID the operation id
     * @param squadUUID the squad id
     * @returns the squad we are referencing
     */
    public static getSquadByUUIDs(operationUUID: string, squadUUID: string): ISquadManager | undefined {
        return this.getOperationByUUID(operationUUID)?.squads[squadUUID];
    }

    /**
     * Get creeps in squad by uuids
     * @param operationUUID
     * @param squadUUID
     * @returns array of creeps in the squad
     */
    public static getCreepsInSquadByUUIDs(operationUUID: string, squadUUID: string): Creep[] | undefined {
        const creepNames: SquadStack[] | undefined = this.getSquadByUUIDs(operationUUID, squadUUID)?.creeps;
        if (!creepNames) {
            return undefined;
        }

        const creeps: Creep[] = [];
        for (const i in creepNames) {
            if (!creepNames[i]) {
                continue;
            }
            if (!Game.creeps[creepNames[i].name]) {
                continue;
            }

            creeps.push(Game.creeps[creepNames[i].name]);
        }

        return creeps;
    }

    /**
     * Gets the creeps in the squad by instance reference
     * @param instance the implmeentation instance of the squad
     * @returns array of creeps in the squad
     */
    public static getCreepsInSquadByInstance(instance: ISquadManager): Array<Creep | undefined> {
        const creeps: Creep[] = [];
        if (!instance.creeps) {
            return creeps;
        }
        for (const i in instance.creeps) {
            creeps.push(Game.creeps[instance.creeps[i].name]);
        }
        return creeps;
    }

    /**
     * Gets the LIVING creeps in the squad by instance reference
     * @param instance the implmeentation instance of the squad
     * @returns array of creeps in the squad that are alive
     */
    public static getLivingCreepsInSquadByInstance(instance: ISquadManager): Creep[] {
        const creeps: Creep[] = [];
        if (!instance.creeps) {
            return creeps;
        }
        for (const i in instance.creeps) {
            const creep: Creep | undefined = Game.creeps[instance.creeps[i].name];
            if (!creep) {
                continue;
            }
            creeps.push(creep);
        }
        return creeps;
    }

    /**
     * Add Creep to squad
     * @param operationUUID
     * @param squadUUID
     */
    public static addCreepToSquad(operationUUID: string, squadUUID: string, creepName: string): void {
        this.getSquadByUUIDs(operationUUID, squadUUID)?.creeps.push({
            name: creepName,
            intents: []
        });
    }

    /**
     * Clean the squad of dead creeps
     * [GarbageCollector]
     * @param operationUUID
     * @param squadUUID
     */
    public static removeDeadCreepsFromSquad(operationUUID: string, squadUUID: string): void {
        const squad: ISquadManager | undefined = this.getSquadByUUIDs(operationUUID, squadUUID);
        if (!squad?.creeps) {
            return;
        }

        const livingCreeps: SquadStack[] = [];
        // Remove the creeps name from the squad
        for (const i in squad.creeps) {
            const creepName: string = squad.creeps[i].name;
            const intentStack: Base_MiliIntent[] = squad.creeps[i].intents;
            if (Game.creeps[creepName]) {
                livingCreeps.push({
                    name: creepName,
                    intents: intentStack
                });
            }
        }

        squad.creeps = livingCreeps;
    }

    public static pushIntentToCreepStack(instance: ISquadManager, creepName: string, intent: Base_MiliIntent) {
        const creepStack = this.findCreepInSquadByInstance(instance, creepName);

        if (creepStack === undefined) {
            throw new UserException(
                "Could not find creepStack to push intent onto.",
                "Op UUID: " + instance.operationUUID + "\nSquad UUID: " + instance.squadUUID + "\nCreep: " + creepName,
                ERROR_ERROR
            );
        }

        creepStack.intents.push(intent);
    }

    /**
     * Retrieves the SquadStack for a specific creep in a squad
     * @param instance The squad instance
     * @param creepName the name of the creep to find
     */
    public static findCreepInSquadByInstance(instance: ISquadManager, creepName: string): SquadStack | undefined {
        return _.find(instance.creeps, (searchCreep: SquadStack) => searchCreep.name === creepName);
    }

    /**
     * Return the master implementation in the code for the specfici instance
     * this is so we can call implementation functions on it
     * @param managerType the specific implementation we are loooking for
     */
    public static getSingletonSquadManager(managerType: SquadManagerConstant): ISquadManager {
        for (const i in SQUAD_MANAGERS) {
            if (SQUAD_MANAGERS[i].name === managerType) {
                return SQUAD_MANAGERS[i];
            }
        }

        throw new UserException(
            "Unhandled squad manager, MemoryMilitaryApi/getSingletonSquadManager",
            "tried to handle [" + managerType + "] but no implementation was found.",
            ERROR_ERROR
        );
    }

    /**
     * Get all operations in the empire
     */
    public static getAllOperations(): OperationData {
        return Memory.empire.militaryOperations;
    }

    /**
     *
     * @param instance the instance we are checking for the lead creep on
     */
    public static getLeadSquadCreep(instance: ISquadManager): Creep {
        const creeps: Creep[] = this.getLivingCreepsInSquadByInstance(instance);
        for (const creep of creeps) {
            const militaryOptions: CreepOptionsMili = creep.memory.options as CreepOptionsMili;
            if (militaryOptions.caravanPos === 0) {
                return creep;
            }
        }
        throw new UserException("No lead creep found", "Sqaud - " + instance.squadUUID, ERROR_WARN);
    }
}
