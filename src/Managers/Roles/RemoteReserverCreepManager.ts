import MemoryApi from "../../Api/Memory.Api";
import CreepApi from "Api/Creep.Api";

// Manager for the miner creep role
export default class RemoteReserverCreepManager {
    /**
     * run the remote reserver creep
     * @param creep the creep we are running
     */
    public static runCreepRole(creep: Creep): void {
        if (creep.spawning) {
            return; // Don't do anything until you've spawned
        }

        const homeRoom = Game.rooms[creep.memory.homeRoom];
        const targetRoom = Game.rooms[creep.memory.targetRoom];

        if (targetRoom && targetRoom.memory.defcon > 0) {
            // Flee Here
        }

        if (creep.memory.job === undefined) {
            creep.memory.job = this.getNewReserveJob(creep, homeRoom);

            if (creep.memory.job === undefined) {
                return;
            }

            this.handleNewJob(creep, homeRoom);
        }

        if (creep.memory.working === true) {
            CreepApi.doWork(creep, creep.memory.job);
            return;
        }

        CreepApi.travelTo(creep, creep.memory.job);
        return;
    }

    /**
     * Find a job for the creep
     */
    public static getNewReserveJob(creep: Creep, room: Room): ClaimPartJob | undefined {
        const creepOptions: CreepOptionsCiv = creep.memory.options as CreepOptionsCiv;

        if (creepOptions.claim) {
            const reserveJob = MemoryApi.getReserveJobs(room, (sjob: ClaimPartJob) => !sjob.isTaken);
            if (reserveJob.length > 0) {
                return reserveJob[0];
            }
        }
        return undefined;
    }

    /**
     * Handle initalizing a new job
     */
    public static handleNewJob(creep: Creep, room: Room): void {
        MemoryApi.updateJobMemory(creep, room);
    }
}
