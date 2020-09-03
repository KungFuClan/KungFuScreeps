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
    RoomApi_State,
    RoomApi_Structure,
    MemoryApi_Room,
    MemoryApi_Creep
} from "Utils/Imports/internals";
import _ from "lodash";

export class GetEnergyJobs implements IJobTypeHelper {
    public jobType: Valid_JobTypes = "getEnergyJob";

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

        if (job.actionType === "harvest" && target instanceof Source) {
            returnCode = creep.harvest(target);
        } else if (job.actionType === "harvest" && target instanceof Mineral) {
            const extractor: StructureExtractor = _.find(
                target.pos.lookFor(LOOK_STRUCTURES),
                (s: Structure) => s.structureType === STRUCTURE_EXTRACTOR
            ) as StructureExtractor;
            returnCode = extractor.cooldown > 0 ? ERR_TIRED : creep.harvest(target);
        } else if (job.actionType === "pickup" && target instanceof Resource) {
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
                if (job.actionType !== "harvest") {
                    delete creep.memory.job;
                    creep.memory.working = false;
                }
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

        // In this case all actions are complete with a range of 1, but keeping for structure
        if (job.actionType === "harvest" && (moveTarget instanceof Source || moveTarget instanceof Mineral)) {
            moveOpts.range = 1;
        } else if (job.actionType === "harvest" && moveTarget instanceof StructureContainer) {
            moveOpts.range = 0;
        } else if (
            job.actionType === "withdraw" &&
            (moveTarget instanceof Structure ||
                moveTarget instanceof Creep ||
                moveTarget instanceof Ruin ||
                moveTarget instanceof Tombstone)
        ) {
            moveOpts.range = 1;
        } else if (job.actionType === "pickup" && moveTarget instanceof Resource) {
            moveOpts.range = 1;
        }

        if (creep.pos.getRangeTo(moveTarget!) <= moveOpts.range!) {
            creep.memory.working = true;
            return; // If we are in range to the target, then we do not need to move again, and next tick we will begin work
        }

        creep.moveTo(moveTarget!, moveOpts);
    }

    /**
     * Gets a list of GetEnergyJobs for the sources of a room
     * @param room The room to create the job list for
     * [Accurate-Restore] Adjusts for creeps targeting it
     */
    public static createSourceJobs(room: Room): GetEnergyJob[] {
        // List of all sources that are under optimal work capacity
        const openSources = RoomApi_Structure.getOpenSources(room);

        if (openSources.length === 0) {
            return [];
        }

        const sourceJobList: GetEnergyJob[] = [];

        _.forEach(openSources, (source: Source) => {
            // Get all miners that are targeting this source
            const miners = _.filter(Game.creeps, (creep: Creep) => {
                if (
                    creep.my &&
                    (creep.memory.role === ROLE_MINER || creep.memory.role === ROLE_REMOTE_MINER) &&
                    creep.memory.job &&
                    creep.memory.job.targetID === source.id
                ) {
                    return true;
                }

                return false;
            });

            // The Number of work parts those miners have
            const numWorkParts = _.sum(miners, (creep: Creep) => creep.getActiveBodyparts(WORK));

            // 2 energy per part per tick * 300 ticks to regen a source = effective mining capacity
            const sourceEnergyRemaining = source.energyCapacity - 2 * numWorkParts * 300;

            // Create the StoreDefinition for the source
            const sourceResources: StoreDefinition = { energy: sourceEnergyRemaining } as StoreDefinition;

            // Create the GetEnergyJob object for the source
            const sourceJob: GetEnergyJob = {
                jobType: "getEnergyJob",
                targetID: source.id as string,
                targetType: "source",
                actionType: "harvest",
                resources: sourceResources,
                isTaken: sourceEnergyRemaining <= 0 // Taken if no energy remaining
            };

            // Append the GetEnergyJob to the main array
            sourceJobList.push(sourceJob);
        });

        return sourceJobList;
    }

    /**
     * Gets a list of GetEnergyJobs for the containers of a room
     * @param room The room to create the job list for
     * [Accurate-Restore] Adjusts for creeps currently targeting it
     */
    public static createContainerJobs(room: Room): GetEnergyJob[] {
        // List of all containers with >= CONTAINER_MINIMUM_ENERGY (from config.ts)
        const containers = MemoryApi_Room.getStructureOfType(
            room.name,
            STRUCTURE_CONTAINER,
            (container: StructureContainer) => container.store.energy > CONTAINER_MINIMUM_ENERGY
        );

        if (containers.length === 0) {
            return [];
        }

        const containerJobList: GetEnergyJob[] = [];

        _.forEach(containers, (container: StructureContainer) => {
            // Get all creeps that are targeting this container to withdraw from it
            const creepsUsingContainer = MemoryApi_Creep.getMyCreeps(room.name, (creep: Creep) => {
                if (
                    creep.memory.job &&
                    creep.memory.job.targetID === container.id &&
                    creep.memory.job.actionType === "withdraw"
                ) {
                    return true;
                }
                return false;
            });

            // The container.store we will use instead of the true value
            const adjustedContainerStore: StoreDefinition = container.store;

            // Subtract the empty carry of creeps targeting this container to withdraw
            _.forEach(creepsUsingContainer, (creep: Creep) => {
                adjustedContainerStore.energy -= creep.store.getFreeCapacity();
            });

            // Create the containerJob
            const containerJob: GetEnergyJob = {
                jobType: "getEnergyJob",
                targetID: container.id as string,
                targetType: STRUCTURE_CONTAINER,
                actionType: "withdraw",
                resources: adjustedContainerStore,
                isTaken: adjustedContainerStore.getUsedCapacity() <= 0 // Taken if empty
            };
            // Append to the main array
            containerJobList.push(containerJob);
        });

        return containerJobList;
    }

    /**
     * Gets a list of GetEnergyJobs for the links of a room
     * @param room The room to create the job list for
     */
    public static createLinkJobs(room: Room): GetEnergyJob[] {
        const linkJobList: GetEnergyJob[] = [];

        const upgraderLink: StructureLink | null = MemoryApi_Room.getUpgraderLink(room) as StructureLink | null;
        if (upgraderLink !== undefined && upgraderLink !== null && upgraderLink.energy > LINK_MINIMUM_ENERGY) {
            const linkStore: StoreDefinition = { energy: upgraderLink.energy } as StoreDefinition;
            const linkJob: GetEnergyJob = {
                jobType: "getEnergyJob",
                targetID: upgraderLink!.id as string,
                targetType: STRUCTURE_LINK,
                actionType: "withdraw",
                resources: linkStore,
                isTaken: false
            };
            linkJobList.push(linkJob);
        }
        return linkJobList;
    }

    /**
     * Gets a list of GetEnergyJobs for the Ruins / Tombstones of a room
     * @param room The room to create the job list for
     */
    public static createLootJobs(room: Room): GetEnergyJob[] {
        const tombstones = MemoryApi_Room.getTombstones(
            room,
            (tombstone: Tombstone) => tombstone.store.energy >= TOMBSTONE_MINIMUM_ENERGY
        );
        const ruins = MemoryApi_Room.getRuins(room, (ruin: Ruin) => ruin.store.energy >= RUIN_MINIMUM_ENERGY);

        if (tombstones.length === 0 && ruins.length === 0) {
            return [];
        }

        const lootJobList: GetEnergyJob[] = [];

        _.forEach(tombstones, (tombstone: Tombstone) => {
            // Get all creeps that are targeting this tombstone to withdraw from it
            const creepsUsingTombstone = MemoryApi_Creep.getMyCreeps(room.name, (creep: Creep) => {
                if (
                    creep.memory.job &&
                    creep.memory.job.targetID === tombstone.id &&
                    creep.memory.job.actionType === "withdraw"
                ) {
                    return true;
                }
                return false;
            });

            // The tombstone.store we will use instead of the true value
            const adjustedTombstoneStore: Store<ResourceConstant, true> = tombstone.store;

            // Subtract the empty carry of creeps targeting this tombstone to withdraw
            _.forEach(creepsUsingTombstone, (creep: Creep) => {
                adjustedTombstoneStore.energy -= creep.store.getFreeCapacity();
            });

            // Create the tombstoneJob
            const tombstoneJob: GetEnergyJob = {
                jobType: "getEnergyJob",
                targetID: tombstone.id as string,
                targetType: "tombstone",
                actionType: "withdraw",
                resources: adjustedTombstoneStore,
                isTaken: adjustedTombstoneStore.getUsedCapacity() <= 0 // Taken if empty
            };
            // Append to the main array
            lootJobList.push(tombstoneJob);
        });

        _.forEach(ruins, (ruin: Ruin) => {
            // Get all creeps that are targeting this ruin to withdraw from it
            const creepsUsingRuin = MemoryApi_Creep.getMyCreeps(room.name, (creep: Creep) => {
                if (
                    creep.memory.job &&
                    creep.memory.job.targetID === ruin.id &&
                    creep.memory.job.actionType === "withdraw"
                ) {
                    return true;
                }
                return false;
            });

            // The container.store we will use instead of the true value
            const adjustedRuinStore: Store<ResourceConstant, true> = ruin.store;

            // Subtract the empty carry of creeps targeting this container to withdraw
            _.forEach(creepsUsingRuin, (creep: Creep) => {
                adjustedRuinStore.energy -= creep.store.getFreeCapacity();
            });

            // Create the containerJob
            const ruinJob: GetEnergyJob = {
                jobType: "getEnergyJob",
                targetID: ruin.id as string,
                targetType: "ruin",
                actionType: "withdraw",
                resources: adjustedRuinStore,
                isTaken: adjustedRuinStore.getUsedCapacity() <= 0 // Taken if empty
            };
            // Append to the main array
            lootJobList.push(ruinJob);
        });

        return lootJobList;
    }

    /**
     * Gets a list of GetEnergyJobs for the backup structures of a room (terminal, storage)
     * @param room  The room to create the job list
     * [No-Restore] Uses a new job every time
     */
    public static createBackupStructuresJobs(room: Room): GetEnergyJob[] {
        const backupJobList: GetEnergyJob[] = [];

        // Create the storage job if active
        if (room.storage !== undefined) {
            const storageJob: GetEnergyJob = {
                jobType: "getEnergyJob",
                targetID: room.storage.id as string,
                targetType: STRUCTURE_STORAGE,
                actionType: "withdraw",
                resources: room.storage.store,
                isTaken: false
            };

            backupJobList.push(storageJob);
        }
        // Create the terminal job if active
        if (room.terminal !== undefined) {
            const terminalJob: GetEnergyJob = {
                jobType: "getEnergyJob",
                targetID: room.terminal.id as string,
                targetType: STRUCTURE_TERMINAL,
                actionType: "withdraw",
                resources: room.terminal.store,
                isTaken: false
            };

            backupJobList.push(terminalJob);
        }

        return backupJobList;
    }

    /**
     * Gets a list of GetEnergyJobs for the dropped resources of a room
     * @param room The room to create the job for
     * [Accurate-Restore] Adjusts for creeps targeting it
     */
    public static createPickupJobs(room: Room): GetEnergyJob[] {
        // All dropped energy in the room
        const drops = MemoryApi_Room.getDroppedResources(room);

        if (drops.length === 0) {
            return [];
        }

        const dropJobList: GetEnergyJob[] = [];

        _.forEach(drops, (drop: Resource) => {
            // Limit these to energy pickups only
            if (drop.resourceType !== RESOURCE_ENERGY) {
                return;
            }

            const dropStore: StoreDefinition = { energy: 0 } as StoreDefinition;
            dropStore[drop.resourceType] = drop.amount;

            const creepsUsingDrop = MemoryApi_Creep.getMyCreeps(room.name, (creep: Creep) => {
                if (
                    creep.memory.job &&
                    creep.memory.job.targetID === drop.id &&
                    creep.memory.job.actionType === "pickup"
                ) {
                    return true;
                }
                return false;
            });

            // Subtract creep's carryspace from drop amount
            dropStore[drop.resourceType]! -= _.sum(creepsUsingDrop, creep => creep.store.getFreeCapacity());

            const dropJob: GetEnergyJob = {
                jobType: "getEnergyJob",
                targetID: drop.id as string,
                targetType: "droppedResource",
                resources: dropStore,
                actionType: "pickup",
                isTaken: false
            };

            dropJobList.push(dropJob);
        });

        return dropJobList;
    }
}
