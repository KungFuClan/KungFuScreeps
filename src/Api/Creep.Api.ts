import UtilHelper from "Helpers/UtilHelper";
import UserException from "utils/UserException";
import CreepHelper from "Helpers/CreepHelper";
import Normalize from "Helpers/Normalize";
import { DEFAULT_MOVE_OPTS } from "utils/constants";

// Api for all types of creeps (more general stuff here)
export default class CreepApi {
    /**
     * Call the proper doWork function based on job.jobType
     */
    public static doWork(creep: Creep, job: BaseJob) {
        switch (job.jobType) {
            case "getEnergyJob":
                this.doWork_GetEnergyJob(creep, job as GetEnergyJob);
                break;
            case "carryPartJob":
                this.doWork_CarryPartJob(creep, job as CarryPartJob);
                break;
            case "claimPartJob":
                this.doWork_ClaimPartJob(creep, job as ClaimPartJob);
                break;
            case "workPartJob":
                this.doWork_WorkPartJob(creep, job as WorkPartJob);
                break;
            default:
                throw new UserException(
                    "Bad job.jobType in CreepApi.doWork",
                    "The jobtype of the job passed to CreepApi.doWork was invalid.",
                    ERROR_FATAL
                );
        }
    }

    /**
     * Call the proper travelTo function based on job.jobType
     */
    public static travelTo(creep: Creep, job: BaseJob) {
        switch (job.jobType) {
            case "getEnergyJob":
                this.travelTo_GetEnergyJob(creep, job as GetEnergyJob);
                break;
            case "carryPartJob":
                this.travelTo_CarryPartJob(creep, job as CarryPartJob);
                break;
            case "claimPartJob":
                this.travelTo_ClaimPartJob(creep, job as ClaimPartJob);
                break;
            case "workPartJob":
                this.travelTo_WorkPartJob(creep, job as WorkPartJob);
                break;
            default:
                throw new UserException(
                    "Bad job.jobType in CreepApi.travelTo",
                    "The jobtype of the job passed to CreepApi.travelTo was invalid",
                    ERROR_FATAL
                );
        }
    }

    /**
     * Do work on the target provided by claimPartJob
     */
    public static doWork_ClaimPartJob(creep: Creep, job: ClaimPartJob) {
        const target = Game.getObjectById(job.targetID);

        this.nullCheck_target(creep, target);

        let returnCode: number;

        if (job.actionType === "claim" && target instanceof StructureController) {
            returnCode = creep.claimController(target);
        } else if (job.actionType === "reserve" && target instanceof StructureController) {
            returnCode = creep.reserveController(target);
        } else if (job.actionType === "sign" && target instanceof StructureController) {
            returnCode = creep.signController(target, CreepHelper.getSigningText());
        } else if (job.actionType === "attack" && target instanceof StructureController) {
            returnCode = creep.attackController(target);
        } else {
            throw this.badTarget_Error(creep, job);
        }

        // Can handle the return code here - e.g. display an error if we expect creep to be in range but it's not
        switch (returnCode) {
            case OK:
                break;
            case ERR_NOT_IN_RANGE:
                creep.memory.working = false;
                break;
            case ERR_NOT_FOUND:
                break;
            default:
                break;
        }
    }

    /**
     * Do work on the target provided by carryPartJob
     */
    public static doWork_CarryPartJob(creep: Creep, job: CarryPartJob) {
        let target;

        if (job.targetType === "roomPosition") {
            // TODO Change this to parse a string to create a RoomPosition object
            // * Should be something like "25,25,W12S49" that corresponds to x, y, roomName
            // ! Temporary, not used for anything atm, but target needs to be of type RoomPosition.
            target = new RoomPosition(25, 25, creep.memory.homeRoom);
        } else {
            target = Game.getObjectById(job.targetID);
            this.nullCheck_target(creep, target);
        }

        let returnCode: number;

        if (job.actionType === "transfer" && (target instanceof Structure || target instanceof Creep)) {
            returnCode = creep.transfer(target, RESOURCE_ENERGY);
        } else if (job.actionType === "drop" && target instanceof RoomPosition) {
            returnCode = creep.drop(RESOURCE_ENERGY);
        } else {
            throw this.badTarget_Error(creep, job);
        }

        // Can handle the return code here - e.g. display an error if we expect creep to be in range but it's not
        switch (returnCode) {
            case OK:
                break;
            case ERR_NOT_IN_RANGE:
                creep.memory.working = false;
                break;
            case ERR_NOT_FOUND:
                break;
            default:
                break;
        }
    }

    /**
     * Do work on the target provided by workPartJob
     */
    public static doWork_WorkPartJob(creep: Creep, job: WorkPartJob) {
        const target = Game.getObjectById(job.targetID);

        this.nullCheck_target(creep, target);

        let returnCode: number;

        if (job.actionType === "build" && target instanceof ConstructionSite) {
            returnCode = creep.build(target);
        } else if (job.actionType === "repair" && target instanceof Structure) {
            returnCode = creep.repair(target);
        } else if (job.actionType === "upgrade" && target instanceof StructureController) {
            returnCode = creep.upgradeController(target);
        } else {
            throw this.badTarget_Error(creep, job);
        }

        // Can handle the return code here - e.g. display an error if we expect creep to be in range but it's not
        switch (returnCode) {
            case OK:
                break;
            case ERR_NOT_IN_RANGE:
                creep.memory.working = false;
                break;
            case ERR_NOT_FOUND:
                break;
            default:
                break;
        }
    }

    /**
     * Do work on the target provided by a getEnergyJob
     */
    public static doWork_GetEnergyJob(creep: Creep, job: GetEnergyJob) {
        const target = Game.getObjectById(job.targetID);

        this.nullCheck_target(creep, target);

        let returnCode: number;

        if (job.actionType === "harvest" && (target instanceof Source || target instanceof Mineral)) {
            returnCode = creep.harvest(target);
        } else if (job.actionType === "pickup" && target instanceof Resource) {
            returnCode = creep.pickup(target);
        } else if (job.actionType === "withdraw" && target instanceof Structure) {
            returnCode = creep.withdraw(target, RESOURCE_ENERGY);
        } else {
            throw this.badTarget_Error(creep, job);
        }

        // Can handle the return code here - e.g. display an error if we expect creep to be in range but it's not
        switch (returnCode) {
            case OK:
                break;
            case ERR_NOT_IN_RANGE:
                creep.memory.working = false;
                break;
            case ERR_NOT_FOUND:
                break;
            default:
                break;
        }
    }

    /**
     * Travel to the target provided by GetEnergyJob in creep.memory.job
     */
    public static travelTo_GetEnergyJob(creep: Creep, job: GetEnergyJob) {
        let moveTarget: RoomObject | null;

        // Get target to move to, using supplementary.moveTargetID if available, job.targetID if not.
        if (creep.memory.supplementary && creep.memory.supplementary.moveTargetID) {
            moveTarget = Game.getObjectById(creep.memory.supplementary.moveTargetID);
        } else {
            moveTarget = Game.getObjectById(job.targetID);
        }

        this.nullCheck_target(creep, moveTarget);

        // Move options target
        const moveOpts: MoveToOpts = DEFAULT_MOVE_OPTS;

        // In this case all actions are complete with a range of 1, but keeping for structure
        if (job.actionType === "harvest" && (moveTarget instanceof Source || moveTarget instanceof Mineral)) {
            moveOpts.range = 1;
        } else if (job.actionType === "withdraw" && (moveTarget instanceof Structure || moveTarget instanceof Creep)) {
            moveOpts.range = 1;
        } else if (job.actionType === "pickup" && moveTarget instanceof Resource) {
            moveOpts.range = 1;
        } else {
            // Assumes that if we specify a different target, we want to be on top of it.
            moveOpts.range = 0;
        }

        if (creep.pos.getRangeTo(moveTarget!) <= moveOpts.range) {
            creep.memory.working = true;
            return; // If we are in range to the target, then we do not need to move again, and next tick we will begin work
        }

        creep.moveTo(moveTarget!, moveOpts);
    }

    /**
     * Travel to the target provided by CarryPartJob in creep.memory.job
     */
    public static travelTo_CarryPartJob(creep: Creep, job: CarryPartJob) {
        return;
    }

    /**
     * Travel to the target provided by ClaimPartJob in creep.memory.job
     */
    public static travelTo_ClaimPartJob(creep: Creep, job: ClaimPartJob) {
        return;
    }

    /**
     * Travel to the target provided by WorkPartJob in creep.memory.job
     */
    public static travelTo_WorkPartJob(creep: Creep, job: WorkPartJob) {
        return;
    }

    /**
     * Checks if the target is null and throws the appropriate error
     */
    public static nullCheck_target(creep: Creep, target: object | null) {
        if (target === null) {
            throw new UserException(
                "Null Job Target",
                "Null Job Target for creep: " + creep.name + "\n The error occurred in: " + this.caller,
                ERROR_ERROR
            );
        }
    }

    /**
     * Throws an error that the job actionType or targetType is invalid for the job type
     */
    public static badTarget_Error(creep: Creep, job: BaseJob) {
        return new UserException(
            "Invalid Job actionType or targetType",
            "An invalid actionType or structureType has been provided by creep [" +
                creep.name +
                "] for function [" +
                this.caller +
                "]" +
                "\n Job: " +
                JSON.stringify(job),
            ERROR_ERROR
        );
    }
}