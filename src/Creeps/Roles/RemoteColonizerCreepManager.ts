import { ROLE_COLONIZER, MemoryApi_Jobs, MemoryApi_Room } from "Utils/Imports/internals";
import { CreepCivApi } from "Creeps/Creep.Civ.Api";
import _ from "lodash";

// Manager for the miner creep role
export class RemoteColonizerCreepManager implements ICivCreepRoleManager {
    public name: RoleConstant = ROLE_COLONIZER;

    constructor() {
        const self = this;
        self.getNewJob = self.getNewJob.bind(this);
        self.handleNewJob = self.handleNewJob.bind(this);
    }

    /**
     * get a job for the miner creep
     * @param creep
     * @param room
     */
    public getNewJob(creep: Creep, room: Room): BaseJob | undefined {
        if (creep.room.name === creep.memory.targetRoom) {

            const targetRoom = Game.rooms[creep.memory.targetRoom];
            if (creep.store.energy === 0) {
                return this.newGetEnergyJob(creep, targetRoom);
            } else {
                creep.memory.working = false;
                return CreepCivApi.newWorkPartJob(creep, targetRoom);
            }
        }
        else if (creep.room.name !== creep.memory.targetRoom) {
            return CreepCivApi.newMovePartJob(creep, creep.memory.targetRoom);
        }

        return undefined;
    }

    /**
     * Get a GetEnergyJob for the harvester
     */
    public newGetEnergyJob(creep: Creep, room: Room): GetEnergyJob | undefined {
        const creepOptions: CreepOptionsCiv = creep.memory.options as CreepOptionsCiv;

        if (creepOptions.getDroppedEnergy) {
            // All dropped resources with enough energy to fill creep.carry, and not taken
            const dropJobs = MemoryApi_Jobs.getPickupJobs(
                room,
                (dJob: GetEnergyJob) => !dJob.isTaken && dJob.resources.energy >= creep.store.getCapacity()
            );

            if (dropJobs.length > 0) {
                return dropJobs[0];
            }
        }

        if (creepOptions.harvestSources) {
            const closestSource: Source | null = creep.pos.findClosestByRange(MemoryApi_Room.getSources(room.name));
            const sourceJobs = MemoryApi_Jobs.getSourceJobs(room, (sJob: GetEnergyJob) => !sJob.isTaken, true);
            if (sourceJobs.length > 0) {
                return _.find(sourceJobs, (job: GetEnergyJob) => job.targetID === closestSource?.id);
            }
        }

        return undefined;
    }

    /**
     * Handle initalizing a new job
     * @param creep the creep we are using
     * @param room the room we are in
     */
    public handleNewJob(creep: Creep, room: Room): void {
        const targetRoom = Game.rooms[creep.memory.targetRoom];
        MemoryApi_Jobs.updateJobMemory(creep, targetRoom);
    }
}
