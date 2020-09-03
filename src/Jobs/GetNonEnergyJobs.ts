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

    /**
     * Get a list of the getenergyjobs for minerals in the room
     * @param room the room we are creating the job list for
     */
    public static createMineralJobs(room: Room): GetEnergyJob[] {
        // List of all sources that are under optimal work capacity
        const openMinerals = MemoryApi_Room.getMinerals(room.name);

        if (openMinerals.length === 0) {
            return [];
        }

        const mineralJobList: GetEnergyJob[] = [];

        _.forEach(openMinerals, (mineral: Mineral) => {
            const mineralEnergyRemaining = mineral.mineralAmount;
            const mineralType = mineral.mineralType;

            // Create the StoreDefinition for the source
            // TODO Change this to actually match the resource type, removing the -> unknown -> StoreDefinition
            const mineralResources = { [mineralType]: mineralEnergyRemaining };

            // Create the GetEnergyJob object for the source
            const sourceJob: GetEnergyJob = {
                jobType: "getNonEnergyJob",
                targetID: mineral.id as string,
                targetType: "mineral",
                actionType: "harvest",
                resources: (mineralResources as unknown) as StoreDefinition,
                isTaken: mineralEnergyRemaining <= 0 // Taken if no energy remaining
            };

            // Append the GetEnergyJob to the main array
            mineralJobList.push(sourceJob);
        });

        return mineralJobList;
    }

    /**
     * Gets a list of GetNonEnergyJobs for the dropped non-energy resources of a room
     * @param room The room to create the job for
     * [Accurate-Restore] Adjusts for creeps targeting it
     */
    public static createNonEnergyPickUpJobs(room: Room): GetNonEnergyJob[] {
        // All dropped energy in the room
        const drops = MemoryApi_Room.getDroppedResources(room);

        if (drops.length === 0) {
            return [];
        }

        const dropJobList: GetNonEnergyJob[] = [];

        _.forEach(drops, (drop: Resource) => {
            // Limit these to non-energy pickups only
            if (drop.resourceType === RESOURCE_ENERGY) {
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

            const dropJob: GetNonEnergyJob = {
                jobType: "getNonEnergyJob",
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

    /**
     * Gets a list of GetNonEnergyJobs for the container held non-energy resources of a room
     * @param room The room to create the job for
     * [Accurate-Restore] Adjusts for creeps targeting it
     */
    public static createNonEnergyContainerJobs(room: Room): GetNonEnergyJob[] {
        // List of all containers next to an extractor
        const extractors: StructureExtractor[] = MemoryApi_Room.getStructureOfType(
            room.name,
            STRUCTURE_EXTRACTOR
        ) as StructureExtractor[];
        const containers = MemoryApi_Room.getStructureOfType(
            room.name,
            STRUCTURE_CONTAINER,
            (container: StructureContainer) =>
                _.some(extractors, (extractor: StructureExtractor) => {
                    if (!extractor) return false;
                    return extractor.pos.isNearTo(container);
                })
        );

        if (containers.length === 0) {
            return [];
        }

        const containerJobList: GetNonEnergyJob[] = [];

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
            const targetMineral: Mineral | null = container.pos.findClosestByRange(FIND_MINERALS);
            if (!targetMineral) return;
            const targetResource: MineralConstant = targetMineral.mineralType;

            // Subtract the empty carry of creeps targeting this container to withdraw
            _.forEach(creepsUsingContainer, (creep: Creep) => {
                adjustedContainerStore[targetResource] -= creep.store.getFreeCapacity();
            });

            // Create the containerJob
            const containerJob: GetNonEnergyJob = {
                jobType: "getNonEnergyJob",
                targetID: container.id as string,
                targetType: STRUCTURE_CONTAINER,
                actionType: "withdraw",
                resources: adjustedContainerStore,
                isTaken: adjustedContainerStore.getUsedCapacity(targetResource) <= 0 // Taken if empty
            };
            // Append to the main array
            containerJobList.push(containerJob);
        });

        return containerJobList;
    }
}
