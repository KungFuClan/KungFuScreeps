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
            //
            returnCode = creep.pickup(target);
            //
        } else if (job.actionType === "harvest" && target instanceof Mineral) {
            //
            returnCode = creep.harvest(target);
            //
        } else if (
            job.actionType === "withdraw" &&
            (target instanceof Structure || target instanceof Ruin || target instanceof Tombstone)
        ) {
            //
            returnCode = creep.withdraw(target, (job as GetNonEnergyJob).resourceType);
            console.log(creep.name + " " + (job as GetNonEnergyJob).resourceType + " " + returnCode);
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
            case ERR_NOT_ENOUGH_ENERGY:
                creep.memory.working = false;
                delete creep.memory.job;
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
        if (creep.memory.supplementary && creep.memory.supplementary.moveTargetID) {
            moveOpts.range = 0;
        }

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
    public static createMineralJobs(room: Room): GetNonEnergyJob[] {
        // List of all sources that are under optimal work capacity
        const openMinerals = MemoryApi_Room.getMinerals(room.name);

        if (openMinerals.length === 0) {
            return [];
        }

        const mineralJobList: GetNonEnergyJob[] = [];

        _.forEach(openMinerals, (mineral: Mineral) => {
            const mineralEnergyRemaining = mineral.mineralAmount;

            // Create the StoreDefinition for the source
            const mineralResources: StoreDefinition = { energy: 0 } as StoreDefinition;
            mineralResources[mineral.mineralType] = mineral.mineralAmount;

            // Create the GetEnergyJob object for the source
            const mineralJob: GetNonEnergyJob = {
                jobType: "getNonEnergyJob",
                targetID: mineral.id as string,
                actionType: "harvest",
                targetType: "mineral",
                resourceType: mineral.mineralType,
                resourceAmount: mineral.mineralAmount || 0,
                isTaken: mineralEnergyRemaining <= 0 // Taken if no energy remaining
            };

            // Append the GetEnergyJob to the main array
            mineralJobList.push(mineralJob);
        });

        return mineralJobList;
    }

    /**
     * Gets a list of GetNonEnergyJobs for the dropped non-energy resources of a room
     * @param room The room to create the job for
     * [Accurate-Restore] Adjusts for creeps targeting it
     */
    public static createPickUpJobs(room: Room): GetNonEnergyJob[] {
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

            let adjustedDropAmount = drop.amount;

            // Subtract creep's carryspace from drop amount
            adjustedDropAmount -= _.sum(creepsUsingDrop, creep => creep.store.getFreeCapacity());

            const dropJob: GetNonEnergyJob = {
                jobType: "getNonEnergyJob",
                targetID: drop.id as string,
                targetType: "droppedResource",
                resourceType: drop.resourceType,
                resourceAmount: adjustedDropAmount || 0,
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
    public static createContainerJobs(room: Room): GetNonEnergyJob[] {
        // Filter containers for those with non energy in them
        const containers = MemoryApi_Room.getStructure<StructureContainer>(
            room.name,
            STRUCTURE_CONTAINER,
            container => {
                let energyAmount = container.store.getUsedCapacity(RESOURCE_ENERGY);
                let otherAmount = container.store.getUsedCapacity() - energyAmount;
                return otherAmount > 0;
            }
        );

        if (containers.length === 0) {
            return [];
        }

        const containerJobList: GetNonEnergyJob[] = [];

        _.forEach(containers, (container: StructureContainer) => {
            for (let resourceKey in container.store) {
                let resourceConstant = resourceKey as Exclude<ResourceConstant, RESOURCE_ENERGY>;

                const creepsUsingContainer = MemoryApi_Creep.getMyCreeps(room.name, (creep: Creep) => {
                    if (
                        creep.memory.job &&
                        creep.memory.job.targetID === container.id &&
                        creep.memory.job.jobType === "getNonEnergyJob" &&
                        (creep.memory.job as GetNonEnergyJob).resourceType === resourceConstant &&
                        creep.memory.job.actionType === "withdraw"
                    ) {
                        return true;
                    }
                    return false;
                });

                let adjustedResourceAmount = container.store[resourceKey as ResourceConstant];
                adjustedResourceAmount -= _.sum(creepsUsingContainer, creep => creep.store.getFreeCapacity());

                // Create the containerJob
                const containerJob: GetNonEnergyJob = {
                    jobType: "getNonEnergyJob",
                    targetID: container.id as string,
                    targetType: STRUCTURE_CONTAINER,
                    actionType: "withdraw",
                    resourceType: resourceConstant,
                    resourceAmount: adjustedResourceAmount || 0,
                    isTaken: adjustedResourceAmount <= 0 // Taken if empty
                };

                containerJobList.push(containerJob);
            }
        });

        return containerJobList;
    }
}
