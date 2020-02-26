import { SQUAD_STATUS_OK, SQUAD_STATUS_DEAD, SQUAD_STATUS_RALLY } from "Utils/Imports/constants";
import { UserException } from "Utils/Imports/internals";

export class MilitaryStatus_Helper {

    /**
     * Handle the unhandled status case
     * @param status the status of the squad
     * @throws exception based on status NOT okay
     */
    public static handleNotOKStatus(status: SquadStatusConstant): void {
        if (status !== SQUAD_STATUS_OK && status !== SQUAD_STATUS_RALLY) {
            throw new UserException(
                "Unhandled status for squad manager",
                "Status: " + status + "\nCheck that this status is being handled appropriately.",
                ERROR_ERROR
            );
        }
    }

    /**
     * Handle the squad dead status by cleaning up the squad from memory
     * @param status the status of the squad
     * @param instance the squad instance
     * @returns boolean representing if the squad was dead
     */
    public static handleSquadDeadStatus(status: SquadStatusConstant, instance: ISquadManager): boolean {
        // Anything else besides OK and we idle
        if (status === SQUAD_STATUS_DEAD) {
            delete Memory.empire.militaryOperations[instance.operationUUID].squads[instance.squadUUID];
            return true;
        }
        return false;
    }

}
