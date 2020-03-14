import { CreepAllHelper, CreepAllApi, PathfindingApi } from "Utils/Imports/internals";

export class MovePartJobs implements IJobTypeHelper {
    public jobType: Valid_JobTypes = "movePartJob";

    constructor() {
        const self = this;
        self.doWork = self.doWork.bind(self);
        self.travelTo = self.travelTo.bind(this);
    }
    /**
     * Travel to the target provided by MovePartJob in creep.memory.job
     */
    public travelTo(creep: Creep, job: BaseJob) {
        const moveTarget = CreepAllHelper.getMoveTarget(creep, job);

        CreepAllApi.nullCheck_target(creep, moveTarget);

        let range = 0;

        if (job.targetType === "roomName") {
            // 23 should get us inside the room and off the exit
            range = 23;
        } else if (job.targetType === "roomPosition") {
            range = 0;
        }

        if (creep.pos.getRangeTo(moveTarget!) <= range) {
            creep.memory.working = true;
            return;
        }

        creep.voyageTo(moveTarget!, { range });
        return;
    }

    /**
     * Do work on the target provided by workPartJob
     * * We may need to flesh this method out to accomodate future usage
     * @param creep The creep to do the work
     * @param job The job to perform work on
     */
    public doWork(creep: Creep, job: BaseJob) {
        // If we are in here then that means that we have either reached the roomPosition
        // or are in the specified roomName
        delete creep.memory.job;
        creep.memory.working = false;
    }
}
