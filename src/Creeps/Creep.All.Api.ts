import {
    JobTypes,
    UserException,
    ERROR_ERROR,
    ERROR_FATAL,
    ERROR_INFO,
    STUCK_COUNT_LIMIT,
    USE_STUCK_VISUAL,
    RoomVisualHelper,
    MemoryHelper_Room,
    PathfindingApi
} from "Utils/Imports/internals";
import { Voyager } from "Voyager/Voyager";

// Api for all types of creeps (more general stuff here)
export class CreepAllApi {
    /**
     * Call the proper doWork function based on job.jobType
     */
    public static doWork(creep: Creep, job: BaseJob) {
        for (const index in JobTypes) {
            if (JobTypes[index].jobType === job.jobType) {
                return JobTypes[index].doWork(creep, job);
            }
        }
        throw new UserException(
            "Bad jobType in CreepAllApi.doWork",
            "The jobtype of the job passed to CreepAllApi.doWork was invalid, or there is no implementation of that job type." +
            "\n Job Type: " +
            job.jobType,
            ERROR_FATAL
        );
    }

    /**
     * Call the proper travelTo function based on job.jobType
     */
    public static voyageToJob(creep: Creep, job: BaseJob) {
    

        for (const index in JobTypes) {
            if (JobTypes[index].jobType === job.jobType) {
                return JobTypes[index].travelTo(creep, job);
            }
        }

        throw new UserException(
            "Bad jobType in CreepAllApi.travelTo",
            "The jobtype of the job passed to CreepAllApi.travelTo was invalid, or there is no implementation of this job type" +
            "\n Job Type: " +
            job.jobType,
            ERROR_FATAL
        );
    }

    /**
     * Checks if the target is null and throws the appropriate error
     */
    public static nullCheck_target(creep: Creep, target: object | null) {
        if (target === null) {
            // If it was a construction job, update work part jobs to ensure ramparts are repaired swiftly
            if (creep.memory.job && creep.memory.job!.actionType === "build") {
                MemoryHelper_Room.updateWorkPart_repairJobs(creep.room);
            }

            // preserve for the error message
            const jobAsString: string = JSON.stringify(creep.memory.job);

            delete creep.memory.job;
            creep.memory.working = false;

            if (creep.memory.supplementary && creep.memory.supplementary.moveTarget) {
                delete creep.memory.supplementary.moveTarget;
            }

            throw new UserException(
                "Null Job Target",
                "Null Job Target for creep: " + creep.name + "\nJob: " + jobAsString,
                ERROR_INFO
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
            "]" +
            "\n Job: " +
            JSON.stringify(job),
            ERROR_ERROR
        );
    }

    /**
     * move the creep off of the exit tile
     * @param creep the creep we are moving
     * @returns if the creep had to be moved
     */
    public static moveCreepOffExit(creep: Creep): boolean {
        const x: number = creep.pos.x;
        const y: number = creep.pos.y;

        if (x === 0) {
            creep.move(RIGHT);
            return true;
        }
        if (y === 0) {
            creep.move(BOTTOM);
            return true;
        }
        if (x === 49) {
            creep.move(LEFT);
            return true;
        }
        if (y === 49) {
            creep.move(TOP);
            return true;
        }

        // Creep is not on exit tile
        return false;
    }

    public static creepShouldFlee(creep: Creep): boolean {
        const targetRoom = creep.memory.targetRoom;

        if (Memory.rooms[targetRoom] === undefined) {
            // If we don't know the state of the room, we have no way of knowing but to check
            return false;
        }

        return Memory.rooms[targetRoom].defcon > 1;
    }

    /**
     * Flee from remoteRoom - Called when defcon is > 1
     * @param creep The creep to flee
     * @param homeRoom The homeRoom of the creep
     */
    public static fleeRemoteRoom(creep: Creep, homeRoom: Room): void {

        // If we are not in homeRoom, but our job is to move to homeRoom, then do so
        if (creep.memory.job && creep.memory.job.targetID === homeRoom.name) {
            this.voyageToJob(creep, creep.memory.job);
            return;
        }

        // Clean out old job data
        delete creep.memory.job;
        creep.memory.working = false;
        if (creep.memory.supplementary) {
            delete creep.memory.supplementary.moveTargetID;
        }

        // If we are in home room, idle until we no longer need to flee
        if (creep.room.name === homeRoom.name) {
            creep.memory.working = true; // Mark as working for pathing purposes
            this.moveCreepOffExit(creep);
            return;
        }

        // Set new move job to homeRoom
        creep.memory.job = {
            jobType: "movePartJob",
            targetType: "roomName",
            targetID: creep.memory.homeRoom,
            actionType: "move",
            isTaken: false
        };
    }
}
