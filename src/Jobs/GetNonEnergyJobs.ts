import {
    CreepAllHelper,
    CreepAllApi,
    PathfindingApi,
    CONTAINER_MINIMUM_ENERGY,
    ROLE_MINER,
    ROLE_REMOTE_MINER,
    TOMBSTONE_MINIMUM_ENERGY,
    RUIN_MINIMUM_ENERGY,
    LINK_MINIMUM_ENERGY,
    RoomApi_Structure,
    MemoryApi_Room,
    MemoryApi_Creep
} from "Utils/Imports/internals";
import _ from "lodash";

export class GetNonEnergyJobs implements IJobTypeHelper {
    public jobType: Valid_JobTypes = "getNonEnergyJob";

    constructor() {
        const self = this;
        self.doWork = self.doWork.bind(self);
        self.travelTo = self.travelTo.bind(this);
    }
    /**
     * Do work on the target provided by a getEnergyJob
     */
    public doWork(creep: Creep, job: BaseJob) {
        const target: any = Game.getObjectById(job.targetID);

        CreepAllApi.nullCheck_target(creep, target);

        let returnCode: number;

        if (job.actionType === "pickup" && target instanceof Resource) {
            returnCode = creep.pickup(target);
        } else if (
            job.actionType === "withdraw" &&
            (target instanceof Structure || target instanceof Ruin || target instanceof Tombstone)
        ) {
            returnCode = creep.withdraw(target, RESOURCE_ENERGY);
        } else {
            throw CreepAllApi.badTarget_Error(creep, job);
        }

        // Can handle the return code here - e.g. display an error if we expect creep to be in range but it's not
        switch (returnCode) {
            case OK:
                delete creep.memory.job;
                creep.memory.working = false;
                break;
            case ERR_NOT_IN_RANGE:
                creep.memory.working = false;
                break;
            case ERR_NOT_FOUND:
                break;
            case ERR_FULL:
                delete creep.memory.job;
                creep.memory.working = false;
                break;
            default:
                break;
        }
    }

    /**
     * Travel to the target provided by GetEnergyJob in creep.memory.job
     */
    public travelTo(creep: Creep, job: BaseJob) {
        const moveTarget = CreepAllHelper.getMoveTarget(creep, job);

        CreepAllApi.nullCheck_target(creep, moveTarget);

        // Move options target
        const moveOpts: MoveToOpts = PathfindingApi.GetDefaultMoveOpts(creep);
        moveOpts.range = 1;

        if (creep.pos.getRangeTo(moveTarget!) <= moveOpts.range!) {
            creep.memory.working = true;
            return; // If we are in range to the target, then we do not need to move again, and next tick we will begin work
        }

        creep.moveTo(moveTarget!, moveOpts);
    }


    // Structure complete, need methods filled in and setting up of the cache system for sending the jobs to memory

    /**
     * Gets a list of GetNonEnergyJobs for the dropped non-energy resources of a room
     * @param room The room to create the job for
     * [Accurate-Restore] Adjusts for creeps targeting it
     */
    public static createNonEnergyPickUpJobs(room: Room): GetNonEnergyJob[] {
        if (!room.storage) return [];
        const sourceJob: GetNonEnergyJob = {
            jobType: "getNonEnergyJob",
            targetID: "",
            targetType: "droppedResource",
            actionType: "pickup",
            resources: room.storage.store,
            isTaken: false // Taken if no resources remaining
        };
        return [sourceJob];
    }

    /**
     * Gets a list of GetNonEnergyJobs for the container held non-energy resources of a room
     * @param room The room to create the job for
     * [Accurate-Restore] Adjusts for creeps targeting it
     */
    public static createNonEnergyContainerJobs(room: Room): GetNonEnergyJob[] {
        if (!room.storage) return [];
        const sourceJob: GetNonEnergyJob = {
            jobType: "getNonEnergyJob",
            targetID: "",
            targetType: "droppedResource",
            actionType: "pickup",
            resources: room.storage.store,
            isTaken: false // Taken if no resources remaining
        };
        return [sourceJob];
    }

    /**
     * Gets a list of GetNonEnergyJobs for the storage held non-energy resources of a room
     * @param room The room to create the job for
     * [Accurate-Restore] Adjusts for creeps targeting it
     */
    public static createNonEnergyStorageJobs(room: Room): GetNonEnergyJob[] {
        if (!room.storage) return [];
        const sourceJob: GetNonEnergyJob = {
            jobType: "getNonEnergyJob",
            targetID: "",
            targetType: "droppedResource",
            actionType: "pickup",
            resources: room.storage.store,
            isTaken: false // Taken if no resources remaining
        };
        return [sourceJob];
    }

    /**
     * Gets a list of GetNonEnergyJobs for the terminal held non-energy resources of a room
     * @param room The room to create the job for
     * [Accurate-Restore] Adjusts for creeps targeting it
     */
    public static createNonEnergyTerminalJobs(room: Room): GetNonEnergyJob[] {
        if (!room.terminal) return [];
        const sourceJob: GetNonEnergyJob = {
            jobType: "getNonEnergyJob",
            targetID: "",
            targetType: "droppedResource",
            actionType: "pickup",
            resources: room.terminal.store,
            isTaken: false // Taken if no resources remaining
        };
        return [sourceJob];
    }

    /**
     * Gets a list of GetNonEnergyJobs for the lab held non-energy resources of a room
     * @param room The room to create the job for
     * [Accurate-Restore] Adjusts for creeps targeting it
     */
    public static createNonEnergyLabJobs(room: Room): GetNonEnergyJob[] {
        if (!room.terminal) return [];
        const sourceJob: GetNonEnergyJob = {
            jobType: "getNonEnergyJob",
            targetID: "",
            targetType: "droppedResource",
            actionType: "pickup",
            resources: room.terminal.store,
            isTaken: false // Taken if no resources remaining
        };
        return [sourceJob];
    }
}
