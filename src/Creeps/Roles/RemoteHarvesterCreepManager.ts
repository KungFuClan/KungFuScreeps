import {
    ROLE_REMOTE_HARVESTER,
    CreepAllApi,
    MemoryHelper,
    PathfindingApi,
    UserException,
    ERROR_ERROR,
    MemoryApi_Jobs
} from "Utils/Imports/internals";
import { CreepCivApi } from "Creeps/Creep.Civ.Api";
import _ from "lodash";

// Manager for the miner creep role
export class RemoteHarvesterCreepManager implements ICivCreepRoleManager {
    public name: RoleConstant = ROLE_REMOTE_HARVESTER;

    constructor() {
        const self = this;
        self.getNewJob = self.getNewJob.bind(this);
        self.handleNewJob = self.handleNewJob.bind(this);
    }

    /**
     * Decides which kind of job to get and calls the appropriate function
     */
    public getNewJob(creep: Creep, homeRoom: Room, targetRoom: Room | undefined): BaseJob | undefined {
        // When a creep is fleeing, the target room might be undefined, this is okay so check that the error ACTUALLY occured specifically
        if (!targetRoom && creep.memory.targetRoom === "") {
            throw new UserException(
                "Remote harvester target room was not set",
                "creep: " + creep.name + ", room: " + homeRoom.name,
                ERROR_ERROR
            );
        }

        if (creep.store.energy === 0 && creep.room.name === creep.memory.targetRoom) {
            // If creep is empty and in targetRoom - get energy
            return CreepCivApi.newGetEnergyJob(creep, targetRoom!);
        } else if (creep.store.energy === 0 && creep.room.name !== creep.memory.targetRoom) {
            // If creep is empty and not in targetRoom - Go to targetRoom
            return CreepCivApi.newMovePartJob(creep, creep.memory.targetRoom);
        } else if (creep.store.energy > 0 && creep.room.name === creep.memory.targetRoom) {
            // If creep has energy and is in targetRoom - Get workpartJob
            let job = CreepCivApi.newWorkPartJob(creep, targetRoom!) as BaseJob;

            // if no work part job - Go to homeRoom
            if (job === undefined) {
                job = CreepCivApi.newMovePartJob(creep, creep.memory.homeRoom) as BaseJob;
            }

            return job;
        } else if (creep.store.energy > 0 && creep.room.name === creep.memory.homeRoom) {
            // If creep has energy and is in homeRoom - Get a carry job to use energy
            let job: BaseJob | undefined = this.newCarryPartJob(creep, homeRoom);

            // If no carryJob, get a workPartJob in homeroom
            if (job === undefined) {
                job = CreepCivApi.newWorkPartJob(creep, homeRoom);
            }

            return job;
        }

        return undefined;
    }

    /**
     * Get a CarryPartJob for the harvester
     */
    public newCarryPartJob(creep: Creep, room: Room): CarryPartJob | undefined {
        const creepOptions: CreepOptionsCiv = creep.memory.options as CreepOptionsCiv;

        if (creepOptions.fillLink) {
            const linkJobs = MemoryApi_Jobs.getFillJobs(
                room,
                (job: CarryPartJob) =>
                    !job.isTaken && job.targetType === STRUCTURE_LINK && job.remaining >= creep.store.getCapacity()
            );

            if (linkJobs.length > 0) {
                const jobObjects: Structure[] = MemoryHelper.getOnlyObjectsFromIDs(
                    _.map(linkJobs, job => job.targetID)
                );

                const closestTarget = creep.pos.findClosestByRange(jobObjects);

                let closestJob;

                if (closestTarget !== null) {
                    closestJob = _.find(linkJobs, (job: CarryPartJob) => job.targetID === closestTarget.id);
                } else {
                    closestJob = linkJobs[0];
                }

                return closestJob;
            }
        }

        if (creepOptions.fillStorage || creepOptions.fillTerminal) {
            const storeJobs = MemoryApi_Jobs.getStoreJobs(
                room,
                (bsJob: CarryPartJob) => !bsJob.isTaken && bsJob.remaining >= creep.store.getCapacity()
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
     * Handles setup for a new job
     */
    public handleNewJob(creep: Creep, room: Room): void {
        if (creep.memory.job!.jobType === "movePartJob") {
            // Avoid error due to movePartJobs not residing in memory
            return;
        }

        const currentRoom = creep.room;
        MemoryApi_Jobs.updateJobMemory(creep, currentRoom);
    }
}
