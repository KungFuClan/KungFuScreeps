import { ROLE_HARVESTER, MemoryApi_Jobs, CreepAllApi, MemoryHelper, CreepAllHelper } from "Utils/Imports/internals";
import { CreepCivApi } from "Creeps/Creep.Civ.Api";
import _ from "lodash";

// Manager for the miner creep role
export class HarvesterCreepManager implements ICivCreepRoleManager {
    public name: RoleConstant = ROLE_HARVESTER;

    constructor() {
        const self = this;
        self.getNewJob = self.getNewJob.bind(this);
        self.handleNewJob = self.handleNewJob.bind(this);
    }

    /**
     * Decides which kind of job to get and calls the appropriate function
     * @param creep the creep we are getting the job for
     * @param room the room we are in
     * @returns BaseJob of the new job we recieved (undefined if none)
     */
    public getNewJob(creep: Creep, room: Room): BaseJob | undefined {
        // if creep is empty, get a GetEnergyJob
        if (creep.store.energy === 0) {
            return CreepCivApi.newGetEnergyJob(creep, room);
        } else {
            let job: BaseJob | undefined = this.newCarryPartJob(creep, room);
            if (job === undefined && CreepAllHelper.bodyPartExists(creep, WORK)) {
                job = this.newWorkPartJob(creep, room);
            }
            return job;
        }
    }

    /**
     * Get a CarryPartJob for the harvester
     */
    public newCarryPartJob(creep: Creep, room: Room): CarryPartJob | undefined {
        const creepOptions: CreepOptionsCiv = creep.memory.options as CreepOptionsCiv;

        if (creepOptions.fillTower || creepOptions.fillSpawn || creepOptions.fillExtension) {
            const fillJobs = MemoryApi_Jobs.getFillJobs(
                room,
                (fJob: CarryPartJob) => !fJob.isTaken && fJob.targetType !== "link",
                true
            );

            if (fillJobs.length > 0) {
                const jobObjects: Structure[] = MemoryHelper.getOnlyObjectsFromIDs(
                    _.map(fillJobs, job => job.targetID)
                );

                const closestTarget = creep.pos.findClosestByRange(jobObjects);

                let closestJob;

                if (closestTarget !== null) {
                    closestJob = _.find(fillJobs, (job: CarryPartJob) => job.targetID === closestTarget.id);
                } else {
                    // if findCLosest nulls out, just choose first
                    closestJob = fillJobs[0];
                }
                return closestJob;
            }
        }

        if (creepOptions.fillStorage) {
            const storeJobs = MemoryApi_Jobs.getStoreJobs(
                room,
                (bsJob: CarryPartJob) => !bsJob.isTaken && bsJob.targetType === STRUCTURE_STORAGE
            );

            if (storeJobs.length > 0) {
                const jobObjects: Structure[] = MemoryHelper.getOnlyObjectsFromIDs(
                    _.map(storeJobs, job => job.targetID)
                );

                const closestTarget = creep.pos.findClosestByRange(jobObjects);
                let closestJob;

                if (closestTarget !== null) {
                    closestJob = _.find(storeJobs, (job: CarryPartJob) => job.targetID === closestTarget.id);
                } else {
                    // if findCLosest nulls out, just choose first
                    closestJob = storeJobs[0];
                }
                return closestJob;
            }
        }

        if (creepOptions.fillTerminal) {
            const storeJobs = MemoryApi_Jobs.getStoreJobs(
                room,
                (bsJob: CarryPartJob) => !bsJob.isTaken && bsJob.targetType === STRUCTURE_TERMINAL
            );

            if (storeJobs.length > 0) {
                const jobObjects: Structure[] = MemoryHelper.getOnlyObjectsFromIDs(
                    _.map(storeJobs, job => job.targetID)
                );

                const closestTarget = creep.pos.findClosestByRange(jobObjects);
                let closestJob;

                if (closestTarget !== null) {
                    closestJob = _.find(storeJobs, (job: CarryPartJob) => job.targetID === closestTarget.id);
                } else {
                    // if findCLosest nulls out, just choose first
                    closestJob = storeJobs[0];
                }
                return closestJob;
            }
        }

        return undefined;
    }

    /**
     * Gets a new WorkPartJob for harvester
     */
    public newWorkPartJob(creep: Creep, room: Room): WorkPartJob | undefined {
        const creepOptions: CreepOptionsCiv = creep.memory.options as CreepOptionsCiv;

        if (creepOptions.build) {
            const buildJobs = MemoryApi_Jobs.getBuildJobs(room, (job: WorkPartJob) => !job.isTaken);
            if (buildJobs.length > 0) {
                return buildJobs[0];
            }
        }

        if (creepOptions.repair) {
            const priorityRepairJobs = MemoryApi_Jobs.getPriorityRepairJobs(room);
            if (priorityRepairJobs.length > 0) {
                return priorityRepairJobs[0];
            }
        }

        if (creepOptions.upgrade) {
            const upgradeJobs = MemoryApi_Jobs.getUpgradeJobs(room, (job: WorkPartJob) => !job.isTaken);
            if (upgradeJobs.length > 0) {
                return upgradeJobs[0];
            }
        }

        return undefined;
    }

    /**
     * Handles setup for a new job
     */
    public handleNewJob(creep: Creep, room: Room): void {
        MemoryApi_Jobs.updateJobMemory(creep, room);
    }
}
