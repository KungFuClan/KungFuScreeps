import { MemoryApi_Military, SQUAD_MANAGERS } from "Utils/Imports/internals";
import { profile } from "Profiler";

@profile
export class MilitaryManager {

    /**
     * Run all operations
     */
    public static runOperations(): void {
        const operations: OperationData = MemoryApi_Military.getAllOperations();
        for (const op in operations) {
            this.runSingleOperation(operations[op]);
        }
    }

    /**
     * Run a single operation
     * @param operation the operation we're running
     */
    private static runSingleOperation(operation: MilitaryOperation): void {
        const squads: SquadData = operation.squads;
        for (const squad in squads) {
            this.runSingleSquad(squads[squad]);
        }
    }

    /**
     * Run single squad
     */
    private static runSingleSquad(squad: ISquadManager): void {
        MemoryApi_Military.getSingletonSquadManager(squad.name).runSquad(squad);
    }
}
