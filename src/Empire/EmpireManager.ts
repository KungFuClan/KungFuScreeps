import { EmpireApi } from "Utils/Imports/internals";
import { profile } from "Profiler";

// empire-wide manager
@profile
export class EmpireManager {
    /**
     * run the empire for the AI
     */
    public static runEmpireManager(): void {
        // Get unprocessed flags and process them
        const unprocessedFlags: Flag[] = EmpireApi.getUnprocessedFlags();

        if (unprocessedFlags.length > 0) {
            EmpireApi.processNewFlags(unprocessedFlags);
        }

        // Delete unused flags and flag memory
        EmpireApi.deleteCompleteFlags();
        EmpireApi.cleanDeadFlags();
    }
}
