import { ROLE_MINERAL_MINER, CreepAllApi, CreepAllHelper, MemoryApi_Jobs } from "Utils/Imports/internals";
import { CreepCivApi } from "Creeps/Creep.Civ.Api";
import { CreepCivHelper } from "Creeps/Creep.Civ.Helper";

// Manager for the miner creep role
export class MineralMinerCreepManager implements ICivCreepRoleManager {
    public name: RoleConstant = ROLE_MINERAL_MINER;

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
        return CreepCivApi.getNewMineralJob(creep, room);
    }

    /**
     * Handle initalizing a new job
     */
    public handleNewJob(creep: Creep, room: Room): void {
        // Update room memory to reflect the new job
        MemoryApi_Jobs.updateJobMemory(creep, room);

        const isSource: boolean = true;
        const miningContainer = CreepCivHelper.getMiningContainer(
            creep.memory.job as GetEnergyJob,
            Game.rooms[creep.memory.homeRoom],
            isSource
        );

        console.log(creep.name + " " + JSON.stringify(miningContainer));

        if (miningContainer === undefined) {
            // Returning here to prevent supplementary id from being formed,
            // so in that case creep will just walk up to the source
            return;
        }

        if (creep.memory.supplementary === undefined) {
            creep.memory.supplementary = {};
        }

        creep.memory.supplementary.moveTargetID = miningContainer.id;
    }
}
