import {
    CREEP_CIV_MANAGERS,
    ALL_CIVILIAN_ROLES,
    ALL_REMOTE_ROLES,
    ERROR_ERROR,
    UtilHelper,
    UserException,
    CreepAllApi,
    ROLE_COLONIZER,
    ALL_MILITARY_ROLES
} from "Utils/Imports/internals";
import { profile } from "Profiler";

// Call the creep manager for each role
@profile
export class CreepManager {
    /**
     * loop over all creeps and call single creep manager for it
     */
    public static runCreepManager(): void {
        for (const creep in Game.creeps) {
            try {
                this.runSingleCreepManager(Game.creeps[creep]);
            } catch (e) {
                UtilHelper.printError(e);
            }
        }
    }

    /**
     * run single creep manager
     * @param creep the creep we are calling the manager for
     */
    private static runSingleCreepManager(creep: Creep): void {
        const role: RoleConstant = creep.memory.role;

        // If no role provided, throw warning
        if (!role) {
            throw new UserException(
                "Null role provided to run single creep manager",
                "Managers/CreepManager",
                ERROR_ERROR
            );
        }

        // Don't run the creep if they are still spawning
        if (creep.spawning) {
            return;
        }

        // Decide what interface to call to run the creep, and subsequently find the implementation
        // Of the helper functions within the creep manager files
        if (ALL_CIVILIAN_ROLES.includes(role)) {
            this.runSingleCivCreepManager(creep, role);
            return;
        }

        // Military Roles are handled by the SquadManagers, so if its one of these just bounce out
        if (ALL_MILITARY_ROLES.includes(role)) {
            return;
        }

        throw new UserException(
            "Creep we tried to run manager for is not defined in the constants array",
            "role: " + role + "\nrunSingleCreepManager",
            ERROR_ERROR
        );
    }

    /**
     * Run the civilian creep managerss
     * @param creep the creep we want to run
     */
    private static runSingleCivCreepManager(creep: Creep, role: RoleConstant): void {

        // Attempt to find a manager implementation of the support functions we need
        const homeRoom: Room = Game.rooms[creep.memory.homeRoom];
        const targetRoom: Room | undefined = Game.rooms[creep.memory.targetRoom];
        let managerImplementation: ICivCreepRoleManager | undefined;
        for (const i in CREEP_CIV_MANAGERS) {
            if (CREEP_CIV_MANAGERS[i].name === role) {
                managerImplementation = CREEP_CIV_MANAGERS[i];
            }
        }

        // Throw exception if we couldn't find one
        if (!managerImplementation) {
            throw new UserException(
                "Couldn't find ICreepManager implementation for the role",
                "role: " + role + "\nrunSingleCreepManager",
                ERROR_ERROR
            );
        }

        // Check if the remote creep should flee
        if (ALL_REMOTE_ROLES.includes(role)) {
            if (CreepAllApi.creepShouldFlee(creep)) {
                CreepAllApi.fleeRemoteRoom(creep, homeRoom);
            }
        }


        if (creep.memory.job === undefined) {
            creep.memory.job = managerImplementation!.getNewJob(creep, homeRoom, targetRoom);
            if (creep.memory.job === undefined) {
                return; // idle for a tick
            }

            // Set supplementary.moveTarget to container if one exists and isn't already taken
            managerImplementation!.handleNewJob(creep, homeRoom);
        }

        if (!creep.memory.working) {
            CreepAllApi.voyageToJob(creep, creep.memory.job);
        }

        if (creep.memory.working) {
            // Special case for remote colonizer, ideally this gets handled a different way and removed from here please
            // TODO, do ^ find a cleaner solution for this patch
            if (creep.memory.role === ROLE_COLONIZER && creep.store[RESOURCE_ENERGY] === creep.store.getCapacity() && creep.memory.job?.jobType === "getEnergyJob") {
                delete creep.memory.job;
                return;
            }

            CreepAllApi.doWork(creep, creep.memory.job);
            return;
        }
    }
}
