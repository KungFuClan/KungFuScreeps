import { MemoryApi_All } from "Memory/Memory.All.Api";
import { MINERS_GET_CLOSEST_SOURCE } from "Utils/Config/config";
import { MemoryHelper } from "Memory/MemoryHelper";
import { CreepAllHelper } from "./Creep.All.Helper";
import { CreepCivHelper } from "./Creep.Civ.Helper";
import { ROLE_POWER_UPGRADER, ROOM_STATE_ADVANCED } from "utils/Imports/constants";
import { MemoryApi_Jobs } from "Memory/Memory.Jobs.Api";
import { MemoryApi_Creep } from "Memory/Memory.Creep.Api";
import { RoomHelper_Structure, MemoryApi_Room } from "Utils/Imports/internals";
import _ from "lodash";

export class CreepCivApi {
    /**
     * Gets a new WorkPartJob for worker
     * @param creep the creep getting a job
     * @param room the room we are checking for a job in
     * @returns a WorkPartJob that the creep is selecting, or undefined if there are none
     */
    public static newWorkPartJob(creep: Creep, room: Room): WorkPartJob | undefined {
        const creepOptions: CreepOptionsCiv = creep.memory.options as CreepOptionsCiv;
        const upgradeJobs = MemoryApi_Jobs.getUpgradeJobs(room, (job: WorkPartJob) => !job.isTaken);
        const isPowerUpgrader: boolean = !!(
            room.memory.creepLimit && room.memory.creepLimit.domesticLimits[ROLE_POWER_UPGRADER] > 0
        );
        const isSpawnInRoom: boolean = MemoryApi_Room.getStructureOfType(room.name, STRUCTURE_SPAWN).length > 0;
        const isCurrentUpgrader: boolean = _.some(
            MemoryApi_Creep.getMyCreeps(room.name),
            (c: Creep) =>
                (c.memory.job && c.memory.job!.actionType === "upgrade") || c.memory.role === ROLE_POWER_UPGRADER
        );

        // Assign upgrade job is one isn't currently being worked
        if (creepOptions.upgrade && !isCurrentUpgrader && isSpawnInRoom) {
            if (upgradeJobs.length > 0) {
                return upgradeJobs[0];
            }
        }

        // Priority Repair Only
        if (creepOptions.repair) {
            const priorityRepairJobs = MemoryApi_Jobs.getPriorityRepairJobs(room);
            if (priorityRepairJobs.length > 0) {
                return priorityRepairJobs[0];
            }
        }

        if (creepOptions.build) {
            const buildJobs = MemoryApi_Jobs.getBuildJobs(room, (job: WorkPartJob) => !job.isTaken);
            if (buildJobs.length > 0) {
                return buildJobs[0];
            }
        }

        // Regular repair
        if (creepOptions.repair) {
            const repairJobs = MemoryApi_Jobs.getRepairJobs(room, (job: WorkPartJob) => !job.isTaken);
            if (repairJobs.length > 0) {
                return repairJobs[0];
            }
        }

        // Wall Repair
        if (creepOptions.wallRepair) {
            const wallRepairJobs = MemoryApi_Jobs.getWallRepairJobs(room, (job: WorkPartJob) => !job.isTaken);
            if (wallRepairJobs.length > 0) {
                return wallRepairJobs[0];
            }
        }

        if (creepOptions.upgrade && !isPowerUpgrader) {
            if (upgradeJobs.length > 0) {
                return upgradeJobs[0];
            }
        }

        return undefined;
    }

    public static getNewSourceJob(creep: Creep, room: Room): GetEnergyJob | undefined {
        const creepOptions = creep.memory.options as CreepOptionsCiv;

        if (creepOptions.harvestSources) {
            // forceUpdate to get accurate job listing
            const sourceJobs = MemoryApi_Jobs.getSourceJobs(room, (sJob: GetEnergyJob) => !sJob.isTaken, true);

            if (sourceJobs.length > 0) {
                // Filter out jobs that have too little energy -
                // The energy in the StoreDefinition is the amount of energy per 300 ticks left
                const suitableJobs = _.filter(
                    sourceJobs,
                    (sJob: GetEnergyJob) => sJob.resources.energy >= creep.getActiveBodyparts(WORK) * 2 * 300 //  (Workparts * 2 * 300 = effective mining capacity)
                );

                // If config allows getting closest source
                if (MINERS_GET_CLOSEST_SOURCE) {
                    let sourceIDs: string[];

                    // Get sources from suitableJobs if any, else get regular sourceJob instead
                    if (suitableJobs.length > 0) {
                        sourceIDs = _.map(suitableJobs, (job: GetEnergyJob) => job.targetID);
                    } else {
                        sourceIDs = _.map(sourceJobs, (job: GetEnergyJob) => job.targetID);
                    }

                    // Find the closest source
                    const sourceObjects: Source[] = MemoryHelper.getOnlyObjectsFromIDs(sourceIDs);
                    const accessibleSourceObjects: Source[] = [];

                    // TODO BELOW
                    // ! Known issue - Multiple Sources, but the one with enough access tiles is not "suitable"
                    // ! e.g. 2 sources, 1 access tile and 3 access tiles -- Only the 1 access tile will be "suitable"
                    // ! but will not have enough accessTiles to be assigned. Creep needs to target the "not suitable" source in this case.
                    // Get rid of any sources that are out of access tiles
                    _.forEach(sourceObjects, (source: Source) => {
                        const numAccessTiles = RoomHelper_Structure.getNumAccessTilesForTarget(source);
                        const numCreepsTargeting = MemoryApi_Creep.getMyCreeps(room.name, (creep: Creep) => {
                            return (
                                creep.memory.job !== undefined &&
                                (creep.memory.role === "remoteMiner" || creep.memory.role === "miner") &&
                                creep.memory.job.targetID === (source.id as string)
                            );
                        }).length;

                        if (numCreepsTargeting < numAccessTiles) {
                            accessibleSourceObjects.push(source);
                        }
                    });

                    const closestAvailableSource: Source = creep.pos.findClosestByRange(accessibleSourceObjects)!; // Force not null since we used MemoryHelper.getOnlyObjectsFromIds;
                    if (!closestAvailableSource) {
                        return undefined;
                    }
                    // return the job that corresponds with the closest source
                    return _.find(sourceJobs, (job: GetEnergyJob) => job.targetID === closestAvailableSource.id);
                } else {
                    // Return the first suitableJob if any
                    // if none, return first sourceJob.
                    if (suitableJobs.length > 0) {
                        return suitableJobs[0];
                    } else {
                        return sourceJobs[0];
                    }
                }
            }
        }

        return undefined;
    }

    /**
     *
     * @param creep the creep we are getting the job for
     * @param roomName the room we are getting the job in
     */
    public static getNewMineralJob(creep: Creep, room: Room): GetNonEnergyJob | undefined {
        const creepOptions = creep.memory.options as CreepOptionsCiv;

        if (creepOptions.harvestMinerals) {
            // forceUpdate to get accurate job listing
            const mineralJobs = MemoryApi_Jobs.getMineralJobs(room, (sJob: GetNonEnergyJob) => !sJob.isTaken, true);

            if (mineralJobs.length > 0) {
                return mineralJobs[0];
            }
        }
        return undefined;
    }

    /**
     * Get a GetNonEnergyJob for the creep
     * @param creep The creep we are getting the job for
     * @param room The room object we are getting the job in
     */
    public static newGetNonEnergyJob(creep: Creep, room: Room): GetNonEnergyJob | undefined {
        const creepOptions: CreepOptionsCiv = creep.memory.options as CreepOptionsCiv;

        // Indicates if the room is safe to travel freely out of the bunker
        const isEmergencyProtocol: boolean =
            MemoryApi_Room.getDefconLevel(room) >= 2 && room.memory.roomState
                ? room.memory.roomState >= ROOM_STATE_ADVANCED
                : false;

        if (creepOptions.getFromContainer && !isEmergencyProtocol) {
            const containerJobs = MemoryApi_Jobs.getNonEnergyContainerJobs(room, (job: GetNonEnergyJob) => {
                return !job.isTaken && job.resourceAmount >= creep.store.getFreeCapacity();
            });

            if (containerJobs.length > 0) {
                return containerJobs[0];
            }
        }

        // TODO Swap this for the right option
        if (creepOptions.getDroppedEnergy && !isEmergencyProtocol) {
            // All dropped resources with enough energy to fill at least 60% of carry
            const dropJobs = MemoryApi_Jobs.getNonEnergyPickupJobs(room, (dJob: GetNonEnergyJob) => !dJob.isTaken);

            if (dropJobs.length > 0) {
                return dropJobs[0];
            }
        }

        return undefined;
    }

    /**
     * Get a GetEnergyJob for the creep
     * @param creep the creep we are getting the job for
     * @param roomName the room object we are getting the job in
     */
    public static newGetEnergyJob(creep: Creep, room: Room): GetEnergyJob | undefined {
        const creepOptions: CreepOptionsCiv = creep.memory.options as CreepOptionsCiv;
        // Indicates if the room is safe to travel freely out of the bunker
        const isEmergencyProtocol: boolean =
            MemoryApi_Room.getDefconLevel(room) >= 2 && room.memory.roomState
                ? room.memory.roomState >= ROOM_STATE_ADVANCED
                : false;

        if (creepOptions.getFromContainer && !isEmergencyProtocol) {
            // get a container job based on the filter function returned from the helper
            const containerJobs = MemoryApi_Jobs.getEnergyContainerJobs(
                room,
                CreepCivHelper.getContainerJobFilterFunction(room, creep)
            );

            if (containerJobs.length > 0) {
                return containerJobs[0];
            }
        }

        if (creepOptions.getDroppedEnergy && !isEmergencyProtocol) {
            // All dropped resources with enough energy to fill at least 60% of carry
            const dropJobs = MemoryApi_Jobs.getPickupJobs(
                room,
                (dJob: GetEnergyJob) => !dJob.isTaken && dJob.resources!.energy >= creep.store.getCapacity() * 0.6
            );

            if (dropJobs.length > 0) {
                return dropJobs[0];
            }
        }

        if (creepOptions.getLootJobs && !isEmergencyProtocol) {
            // All tombstones / ruins with enough energy to fill at least 60% of carry
            const lootJobs = MemoryApi_Jobs.getLootJobs(
                room,
                (lJob: GetEnergyJob) => !lJob.isTaken && lJob.resources!.energy >= creep.store.getCapacity() * 0.6
            );

            if (lootJobs.length > 0) {
                return lootJobs[0];
            }
        }

        if (creepOptions.getFromStorage || creepOptions.getFromTerminal) {
            // All backupStructures with enough energy to fill creep.carry, and not taken
            const backupStructures = MemoryApi_Jobs.getBackupStructuresJobs(
                room,
                (job: GetEnergyJob) => !job.isTaken && job.resources!.energy >= creep.store.getCapacity()
            );

            // Only get from the storage if there are jobs that don't involve just putting it right back
            const isFillJobs: boolean =
                MemoryApi_Jobs.getFillJobs(
                    room,
                    (fJob: CarryPartJob) => !fJob.isTaken && fJob.targetType !== "link",
                    true
                ).length > 0;
            if (backupStructures.length > 0 && isFillJobs) {
                return backupStructures[0];
            }
        }

        return undefined;
    }

    /**
     * Get a MovePartJob for the harvester
     */
    public static newMovePartJob(creep: Creep, roomName: string): MovePartJob | undefined {
        const newJob: MovePartJob = {
            jobType: "movePartJob",
            targetType: "roomName",
            targetID: roomName,
            actionType: "move",
            isTaken: false
        };

        return newJob;
    }

    /**
     * Check if we're allowed to get a non energy job
     * @param room the room we are checking for
     */
    public static allowGetNonEnergyJob(room: Room): boolean {
        // check if theres something to DO with non energy
        // likely ask if there are non energy carry part jobs
        const carryPartStoreJobs: CarryPartJob[] = MemoryApi_Jobs.getNonEnergyStoreJobs(room);
        const carryPartFillJobs: CarryPartJob[] = MemoryApi_Jobs.getNonEnergyFillJobs(room);
        return [...carryPartFillJobs, ...carryPartStoreJobs].length > 0;
    }
}
