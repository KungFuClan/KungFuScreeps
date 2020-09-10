import { ROLE_MANAGER, MemoryApi_Jobs, CreepAllApi, MemoryHelper, TERMINAL_MIN_ENERGY } from "Utils/Imports/internals";
import _ from "lodash";

// Manager for the miner creep role
export class ManagerCreepManager implements ICivCreepRoleManager {
    public name: RoleConstant = ROLE_MANAGER;

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
        if (creep.store.energy === 0) {
            return this.getEnergyJob(creep, room);
        } else {
            return this.getCarryJob(creep, room);
        }
    }

    /**
     * Check if theres a job besides just filling the storage
     * @param creep the creep we are checking the job for
     * @param room the room we are in
     * @returns boolean telling us if there is a non storage filling job or not
     */
    private isNonStorageJob(creep: Creep, room: Room): boolean {
        const job: CarryPartJob | undefined = this.getCarryJob(creep, room);
        return job !== undefined && job.targetType !== STRUCTURE_STORAGE;
    }

    /**
     * Find a job to get energy for the manager
     * @param creep the manager creep we are running
     * @param room the room the creep is in
     */
    private getEnergyJob(creep: Creep, room: Room): BaseJob | undefined {
        const creepOptions: CreepOptionsCiv = creep.memory.options as CreepOptionsCiv;
        // Check for energy in the terminal
        if (creepOptions.getFromTerminal) {
            // All backupStructures with enough energy to fill creep.carry, and not taken
            const backupStructures = MemoryApi_Jobs.getBackupStructuresJobs(
                room,
                (job: GetEnergyJob) =>
                    !job.isTaken && job.resources.energy >= TERMINAL_MIN_ENERGY && job.targetType === STRUCTURE_TERMINAL
            );

            if (backupStructures.length > 0) {
                const terminal: StructureTerminal = Game.getObjectById(
                    backupStructures[0].targetID
                ) as StructureTerminal;
                if (creep.pos.isNearTo(terminal)) {
                    return backupStructures[0];
                }
            }
        }

        // Check for energy in the storage
        // Second check it to make sure we don't get out energy just to put it back in
        if (creepOptions.getFromStorage && this.isNonStorageJob(creep, room)) {
            // All backupStructures with enough energy to fill creep.carry, and not taken
            const backupStructures = MemoryApi_Jobs.getBackupStructuresJobs(
                room,
                (job: GetEnergyJob) =>
                    !job.isTaken &&
                    job.resources.energy >= creep.store.getCapacity() &&
                    job.targetType === STRUCTURE_STORAGE
            );

            if (backupStructures.length > 0) {
                const storage: StructureStorage = Game.getObjectById(backupStructures[0].targetID) as StructureStorage;
                if (creep.pos.isNearTo(storage)) {
                    return backupStructures[0];
                }
            }
        }

        return undefined;
    }

    /**
     * Get a carry part job for the manager
     * @param creep the manager creep we are running
     * @param room the room the creep is in
     */
    private getCarryJob(creep: Creep, room: Room): CarryPartJob | undefined {
        const creepOptions: CreepOptionsCiv = creep.memory.options as CreepOptionsCiv;
        if (creepOptions.fillSpawn) {
            const spawnJobs = MemoryApi_Jobs.getFillJobs(
                room,
                (fJob: CarryPartJob) => !fJob.isTaken && fJob.targetType === STRUCTURE_SPAWN,
                true
            );

            if (spawnJobs.length > 0) {
                const jobObjects: Structure[] = MemoryHelper.getOnlyObjectsFromIDs(
                    _.map(spawnJobs, job => job.targetID)
                );

                const closestTarget = creep.pos.findClosestByRange(jobObjects);
                let closestJob;

                if (closestTarget !== null) {
                    closestJob = _.find(spawnJobs, (job: CarryPartJob) => job.targetID === closestTarget.id);
                } else {
                    // if findCLosest nulls out, just choose first
                    closestJob = spawnJobs[0];
                }

                const spawnObject: StructureSpawn = Game.getObjectById(closestJob!.targetID) as StructureSpawn;
                if (creep.pos.isNearTo(spawnObject)) {
                    return closestJob;
                }
            }
        }

        if (creepOptions.fillTower) {
            const towerJobs = MemoryApi_Jobs.getFillJobs(
                room,
                (fJob: CarryPartJob) => !fJob.isTaken && fJob.targetType === STRUCTURE_TOWER,
                true
            );

            if (towerJobs.length > 0) {
                const jobObjects: Structure[] = MemoryHelper.getOnlyObjectsFromIDs(
                    _.map(towerJobs, job => job.targetID)
                );

                const closestTarget = creep.pos.findClosestByRange(jobObjects);
                let closestJob;

                if (closestTarget !== null) {
                    closestJob = _.find(towerJobs, (job: CarryPartJob) => job.targetID === closestTarget.id);
                } else {
                    // if findCLosest nulls out, just choose first
                    closestJob = towerJobs[0];
                }

                const towerObject: StructureTower = Game.getObjectById(closestJob!.targetID) as StructureTower;
                if (creep.pos.isNearTo(towerObject)) {
                    return closestJob;
                }
            }
        }

        if (creepOptions.fillLink) {
            const linkJobs = MemoryApi_Jobs.getFillJobs(
                room,
                (fJob: CarryPartJob) => !fJob.isTaken && fJob.targetType === STRUCTURE_LINK,
                true
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
                    // if findCLosest nulls out, just choose first
                    closestJob = linkJobs[0];
                }

                const linkObject: StructureLink = Game.getObjectById(closestJob!.targetID) as StructureLink;
                if (creep.pos.isNearTo(linkObject)) {
                    return closestJob;
                }
            }
        }

        if (creepOptions.fillTerminal) {
            const terminalJobs = MemoryApi_Jobs.getStoreJobs(
                room,
                (sJob: CarryPartJob) => !sJob.isTaken && sJob.targetType === STRUCTURE_TERMINAL
            );

            if (terminalJobs.length > 0) {
                let closestJob = terminalJobs[0];

                const terminalObject: StructureTerminal = Game.getObjectById(closestJob!.targetID) as StructureTerminal;

                if (
                    creep.pos.isNearTo(terminalObject) &&
                    terminalObject.store.getUsedCapacity(RESOURCE_ENERGY) < TERMINAL_MIN_ENERGY
                ) {
                    return closestJob;
                }
            }
        }

        if (creepOptions.fillStorage) {
            const storeJobs = MemoryApi_Jobs.getStoreJobs(
                room,
                (bsJob: CarryPartJob) => !bsJob.isTaken && bsJob.targetType === STRUCTURE_STORAGE
            );

            if (storeJobs.length > 0) {
                let closestJob = storeJobs[0];

                const storageObject: StructureStorage = Game.getObjectById(closestJob!.targetID) as StructureStorage;
                if (creep.pos.isNearTo(storageObject)) {
                    return closestJob;
                }
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
        MemoryApi_Jobs.updateJobMemory(creep, room);
    }
}
