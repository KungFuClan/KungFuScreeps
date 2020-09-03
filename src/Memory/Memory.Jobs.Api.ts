import {
    NO_CACHING_MEMORY,
    STORE_JOB_CACHE_TTL,
    MemoryHelper_Room,
    SOURCE_JOB_CACHE_TTL,
    ALL_STRUCTURE_TYPES,
    UserException,
    CONTAINER_JOB_CACHE_TTL,
    LINK_JOB_CACHE_TTL,
    BACKUP_JOB_CACHE_TTL,
    ERROR_ERROR,
    PICKUP_JOB_CACHE_TTL,
    LOOT_JOB_CACHE_TTL,
    CLAIM_JOB_CACHE_TTL,
    RESERVE_JOB_CACHE_TTL,
    SIGN_JOB_CACHE_TTL,
    ATTACK_JOB_CACHE_TTL,
    REPAIR_JOB_CACHE_TTL,
    PRIORITY_REPAIR_THRESHOLD,
    BUILD_JOB_CACHE_TTL,
    UPGRADE_JOB_CACHE_TTL,
    FILL_JOB_CACHE_TTL,
    RoomApi_Structure
} from "Utils/Imports/internals";
import _ from "lodash";

export class MemoryApi_Jobs {
    /**
     * Get all jobs (in a flatted list) of GetEnergyJobs.xxx
     * @param room The room to get the jobs from
     * @param filterFunction [Optional] A function to filter the GetEnergyJob list
     * @param forceUpdate [Optional] Forcibly invalidate the caches
     */
    public static getAllGetEnergyJobs(
        room: Room,
        filterFunction?: (object: GetEnergyJob) => boolean,
        forceUpdate?: boolean
    ): GetEnergyJob[] {
        const allGetEnergyJobs: GetEnergyJob[] = [];

        _.forEach(this.getSourceJobs(room, filterFunction, forceUpdate), job => allGetEnergyJobs.push(job));
        _.forEach(this.getEnergyContainerJobs(room, filterFunction, forceUpdate), job => allGetEnergyJobs.push(job));
        _.forEach(this.getLinkJobs(room, filterFunction, forceUpdate), job => allGetEnergyJobs.push(job));
        _.forEach(this.getBackupStructuresJobs(room, filterFunction, forceUpdate), job => allGetEnergyJobs.push(job));

        return allGetEnergyJobs;
    }

    /**
     * Get all jobs (in a flatted list) of GetEnergyJobs.xxx
     * @param room The room to get the jobs from
     * @param filterFunction [Optional] A function to filter the GetEnergyJob list
     * @param forceUpdate [Optional] Forcibly invalidate the caches
     */
    public static getAllNonEnergyJobs(
        room: Room,
        filterFunction?: (object: GetEnergyJob) => boolean,
        forceUpdate?: boolean
    ): GetEnergyJob[] {
        const allNonGetEnergyJobs: GetEnergyJob[] = [];

        _.forEach(this.getMineralJobs(room, filterFunction, forceUpdate), job => allNonGetEnergyJobs.push(job));

        return allNonGetEnergyJobs;
    }

    /**
     * Get the list of WorkPartJobs.repairJobs
     * @param room The room to get the jobs from
     * @param filterFunction [Optional] A function to filter the WorkPartJobs list
     * @param forceUpdate [Optional] Forcibly invalidate the cache
     */
    public static getWallRepairJobs(
        room: Room,
        filterFunction?: (object: WorkPartJob) => boolean,
        forceUpdate?: boolean
    ): WorkPartJob[] {
        if (
            NO_CACHING_MEMORY ||
            forceUpdate ||
            !Memory.rooms[room.name].jobs!.workPartJobs ||
            !Memory.rooms[room.name].jobs!.workPartJobs!.wallRepairJobs ||
            Memory.rooms[room.name].jobs!.workPartJobs!.wallRepairJobs!.cache < Game.time - REPAIR_JOB_CACHE_TTL
        ) {
            MemoryHelper_Room.updateWorkPart_wallRepairJobs(room);
        }

        let wallRepairJobs: WorkPartJob[] = Memory.rooms[room.name].jobs!.workPartJobs!.wallRepairJobs!.data;

        if (filterFunction !== undefined) {
            wallRepairJobs = _.filter(wallRepairJobs, filterFunction);
        }

        return wallRepairJobs;
    }

    /**
     * Get the list of GetEnergyJobs.sourceJobs
     * @param room The room to get the jobs from
     * @param filterFunction [Optional] A function to filter the getEnergyjob list
     * @param forceUpdate [Optional] Forcibly invalidate the cache
     */
    public static getSourceJobs(
        room: Room,
        filterFunction?: (object: GetEnergyJob) => boolean,
        forceUpdate?: boolean
    ): GetEnergyJob[] {
        if (
            NO_CACHING_MEMORY ||
            forceUpdate ||
            !Memory.rooms[room.name].jobs!.getEnergyJobs ||
            !Memory.rooms[room.name].jobs!.getEnergyJobs!.sourceJobs ||
            Memory.rooms[room.name].jobs!.getEnergyJobs!.sourceJobs!.cache < Game.time - SOURCE_JOB_CACHE_TTL
        ) {
            MemoryHelper_Room.updateGetEnergy_sourceJobs(room);
        }

        let sourceJobs: GetEnergyJob[] = Memory.rooms[room.name].jobs!.getEnergyJobs!.sourceJobs!.data;

        if (filterFunction !== undefined) {
            sourceJobs = _.filter(sourceJobs, filterFunction);
        }

        return sourceJobs;
    }

    /**
     * Get the list of GetEnergyJobs.mineralJobs
     * @param room The room to get the jobs from
     * @param filterFunction [Optional] A function to filter the getEnergyjob list
     * @param forceUpdate [Optional] Forcibly invalidate the cache
     */
    public static getMineralJobs(
        room: Room,
        filterFunction?: (object: GetEnergyJob) => boolean,
        forceUpdate?: boolean
    ): GetEnergyJob[] {
        if (
            NO_CACHING_MEMORY ||
            forceUpdate ||
            !Memory.rooms[room.name].jobs!.getNonEnergyJobs ||
            !Memory.rooms[room.name].jobs!.getNonEnergyJobs!.mineralJobs ||
            Memory.rooms[room.name].jobs!.getNonEnergyJobs!.mineralJobs!.cache < Game.time - SOURCE_JOB_CACHE_TTL
        ) {
            MemoryHelper_Room.updateGetNonEnergy_mineralJobs(room);
        }

        let mineralJobs: GetEnergyJob[] = Memory.rooms[room.name].jobs!.getNonEnergyJobs!.mineralJobs!.data;

        if (filterFunction !== undefined) {
            mineralJobs = _.filter(mineralJobs, filterFunction);
        }

        return mineralJobs;
    }

    /**
     * Get the list of GetEnergyJobs.containerJobs
     * @param room The room to get the jobs from
     * @param filterFunction [Optional] A function to filter the getEnergyjob list
     * @param forceUpdate [Optional] Forcibly invalidate the cache
     */
    public static getEnergyContainerJobs(
        room: Room,
        filterFunction?: (object: GetEnergyJob) => boolean,
        forceUpdate?: boolean
    ): GetEnergyJob[] {
        if (
            NO_CACHING_MEMORY ||
            forceUpdate ||
            !Memory.rooms[room.name].jobs!.getEnergyJobs ||
            !Memory.rooms[room.name].jobs!.getEnergyJobs!.containerJobs ||
            Memory.rooms[room.name].jobs!.getEnergyJobs!.containerJobs!.cache < Game.time - CONTAINER_JOB_CACHE_TTL
        ) {
            MemoryHelper_Room.updateGetEnergy_containerJobs(room);
        }

        let containerJobs: GetEnergyJob[] = Memory.rooms[room.name].jobs!.getEnergyJobs!.containerJobs!.data;

        if (filterFunction !== undefined) {
            containerJobs = _.filter(containerJobs, filterFunction);
        }

        return containerJobs;
    }

    /**
     * Get the list of GetEnergyJobs.containerJobs
     * @param room The room to get the jobs from
     * @param filterFunction [Optional] A function to filter the getEnergyjob list
     * @param forceUpdate [Optional] Forcibly invalidate the cache
     */
    public static getNonEnergyContainerJobs(
        room: Room,
        filterFunction?: (object: GetEnergyJob) => boolean,
        forceUpdate?: boolean
    ): GetEnergyJob[] {
        if (
            NO_CACHING_MEMORY ||
            forceUpdate ||
            !Memory.rooms[room.name].jobs!.getEnergyJobs ||
            !Memory.rooms[room.name].jobs!.getEnergyJobs!.containerJobs ||
            Memory.rooms[room.name].jobs!.getEnergyJobs!.containerJobs!.cache < Game.time - CONTAINER_JOB_CACHE_TTL
        ) {
            MemoryHelper_Room.updateGetEnergy_containerJobs(room);
        }

        let containerJobs: GetEnergyJob[] = Memory.rooms[room.name].jobs!.getEnergyJobs!.containerJobs!.data;

        if (filterFunction !== undefined) {
            containerJobs = _.filter(containerJobs, filterFunction);
        }

        return containerJobs;
    }

    /**
     * Get the list of GetEnergyJobs.linkJobs
     * @param room The room to get the jobs from
     * @param filterFunction [Optional] A function to filter the getEnergyjob list
     * @param forceUpdate [Optional] Forcibly invalidate the cache
     */
    public static getLinkJobs(
        room: Room,
        filterFunction?: (object: GetEnergyJob) => boolean,
        forceUpdate?: boolean
    ): GetEnergyJob[] {
        if (
            NO_CACHING_MEMORY ||
            forceUpdate ||
            !Memory.rooms[room.name].jobs!.getEnergyJobs ||
            !Memory.rooms[room.name].jobs!.getEnergyJobs!.linkJobs ||
            Memory.rooms[room.name].jobs!.getEnergyJobs!.linkJobs!.cache < Game.time - LINK_JOB_CACHE_TTL
        ) {
            MemoryHelper_Room.updateGetEnergy_linkJobs(room);
        }

        let linkJobs: GetEnergyJob[] = Memory.rooms[room.name].jobs!.getEnergyJobs!.linkJobs!.data;

        if (filterFunction !== undefined) {
            linkJobs = _.filter(linkJobs, filterFunction);
        }

        return linkJobs;
    }

    /**
     * Get the list of GetEnergyJobs.sourceJobs
     * @param room The room to get the jobs from
     * @param filterFunction [Optional] A function to filter the getEnergyjob list
     * @param forceUpdate [Optional] Forcibly invalidate the cache
     */
    public static getBackupStructuresJobs(
        room: Room,
        filterFunction?: (object: GetEnergyJob) => boolean,
        forceUpdate?: boolean
    ): GetEnergyJob[] {
        if (
            NO_CACHING_MEMORY ||
            forceUpdate ||
            !Memory.rooms[room.name].jobs!.getEnergyJobs ||
            !Memory.rooms[room.name].jobs!.getEnergyJobs!.backupStructures ||
            Memory.rooms[room.name].jobs!.getEnergyJobs!.backupStructures!.cache < Game.time - BACKUP_JOB_CACHE_TTL
        ) {
            MemoryHelper_Room.updateGetEnergy_backupStructuresJobs(room);
        }

        let backupStructureJobs: GetEnergyJob[] = Memory.rooms[room.name].jobs!.getEnergyJobs!.backupStructures!.data;

        if (filterFunction !== undefined) {
            backupStructureJobs = _.filter(backupStructureJobs, filterFunction);
        }

        return backupStructureJobs;
    }

    /**
     * Get the list of GetEnergyJobs.pickupJobs
     * @param room The room to get the jobs from
     * @param filterFunction [Optional] A function to filter the getEnergyjob list
     * @param forceUpdate [Optional] Forcibly invalidate the cache
     */
    public static getPickupJobs(
        room: Room,
        filterFunction?: (object: GetEnergyJob) => boolean,
        forceUpdate?: boolean
    ): GetEnergyJob[] {
        if (
            NO_CACHING_MEMORY ||
            forceUpdate ||
            !Memory.rooms[room.name].jobs!.getEnergyJobs ||
            !Memory.rooms[room.name].jobs!.getEnergyJobs!.pickupJobs ||
            Memory.rooms[room.name].jobs!.getEnergyJobs!.pickupJobs!.cache < Game.time - PICKUP_JOB_CACHE_TTL
        ) {
            MemoryHelper_Room.updateGetEnergy_pickupJobs(room);
        }

        let pickupJobs: GetEnergyJob[] = Memory.rooms[room.name].jobs!.getEnergyJobs!.pickupJobs!.data;

        if (filterFunction !== undefined) {
            pickupJobs = _.filter(pickupJobs, filterFunction);
        }

        return pickupJobs;
    }

    /**
     * Get the list of GetEnergyJobs.lootJobs
     * @param room The room to get the jobs from
     * @param filterFunction [Optional] A function to filter the getEnergyjob list
     * @param forceUpdate [Optional] Forcibly invalidate the cache
     */
    public static getLootJobs(
        room: Room,
        filterFunction?: (object: GetEnergyJob) => boolean,
        forceUpdate?: boolean
    ): GetEnergyJob[] {
        if (
            NO_CACHING_MEMORY ||
            forceUpdate ||
            !Memory.rooms[room.name].jobs!.getEnergyJobs ||
            !Memory.rooms[room.name].jobs!.getEnergyJobs!.lootJobs ||
            Memory.rooms[room.name].jobs!.getEnergyJobs!.lootJobs!.cache < Game.time - LOOT_JOB_CACHE_TTL
        ) {
            MemoryHelper_Room.updateGetEnergy_lootJobs(room);
        }

        let lootJobs: GetEnergyJob[] = Memory.rooms[room.name].jobs!.getEnergyJobs!.lootJobs!.data;

        if (filterFunction !== undefined) {
            lootJobs = _.filter(lootJobs, filterFunction);
        }

        return lootJobs;
    }

    /**
     * Get all jobs (in a flatted list) of ClaimPartJobs.xxx
     * @param room The room to get the jobs from
     * @param filterFunction [Optional] A function to filter the ClaimPartJob list
     * @param forceUpdate [Optional] Forcibly invalidate the caches
     */
    public static getAllClaimPartJobs(
        room: Room,
        filterFunction?: (object: ClaimPartJob) => boolean,
        forceUpdate?: boolean
    ): ClaimPartJob[] {
        const allClaimPartJobs: ClaimPartJob[] = [];

        _.forEach(this.getClaimJobs(room, filterFunction, forceUpdate), job => allClaimPartJobs.push(job));
        _.forEach(this.getReserveJobs(room, filterFunction, forceUpdate), job => allClaimPartJobs.push(job));
        _.forEach(this.getSignJobs(room, filterFunction, forceUpdate), job => allClaimPartJobs.push(job));
        _.forEach(this.getControllerAttackJobs(room, filterFunction, forceUpdate), job => allClaimPartJobs.push(job));

        return allClaimPartJobs;
    }

    /**
     * Get the list of ClaimPartJobs.claimJobs
     * @param room The room to get the jobs from
     * @param filterFunction [Optional] A function to filter the ClaimPartJobs list
     * @param forceUpdate [Optional] Forcibly invalidate the cache
     */
    public static getClaimJobs(
        room: Room,
        filterFunction?: (object: ClaimPartJob) => boolean,
        forceUpdate?: boolean
    ): ClaimPartJob[] {
        if (
            NO_CACHING_MEMORY ||
            forceUpdate ||
            !Memory.rooms[room.name].jobs!.claimPartJobs ||
            !Memory.rooms[room.name].jobs!.claimPartJobs!.claimJobs ||
            Memory.rooms[room.name].jobs!.claimPartJobs!.claimJobs!.cache < Game.time - CLAIM_JOB_CACHE_TTL
        ) {
            MemoryHelper_Room.updateClaimPart_claimJobs(room);
        }

        let claimJobs: ClaimPartJob[] = Memory.rooms[room.name].jobs!.claimPartJobs!.claimJobs!.data;

        if (filterFunction !== undefined) {
            claimJobs = _.filter(claimJobs, filterFunction);
        }

        return claimJobs;
    }

    /**
     * Get the list of ClaimPartJobs.reserveJobs
     * @param room The room to get the jobs from
     * @param filterFunction [Optional] A function to filter the ClaimPartJobs list
     * @param forceUpdate [Optional] Forcibly invalidate the cache
     */
    public static getReserveJobs(
        room: Room,
        filterFunction?: (object: ClaimPartJob) => boolean,
        forceUpdate?: boolean
    ): ClaimPartJob[] {
        if (
            NO_CACHING_MEMORY ||
            forceUpdate ||
            !Memory.rooms[room.name].jobs!.claimPartJobs ||
            !Memory.rooms[room.name].jobs!.claimPartJobs!.reserveJobs ||
            Memory.rooms[room.name].jobs!.claimPartJobs!.reserveJobs!.cache < Game.time - RESERVE_JOB_CACHE_TTL
        ) {
            MemoryHelper_Room.updateClaimPart_reserveJobs(room);
        }

        let claimJobs: ClaimPartJob[] = Memory.rooms[room.name].jobs!.claimPartJobs!.reserveJobs!.data;

        if (filterFunction !== undefined) {
            claimJobs = _.filter(claimJobs, filterFunction);
        }

        return claimJobs;
    }

    /**
     * Get the list of ClaimPartJobs.signJobs
     * @param room The room to get the jobs from
     * @param filterFunction [Optional] A function to filter the ClaimPartJobs list
     * @param forceUpdate [Optional] Forcibly invalidate the cache
     */
    public static getSignJobs(
        room: Room,
        filterFunction?: (object: ClaimPartJob) => boolean,
        forceUpdate?: boolean
    ): ClaimPartJob[] {
        if (
            NO_CACHING_MEMORY ||
            forceUpdate ||
            !Memory.rooms[room.name].jobs!.claimPartJobs ||
            !Memory.rooms[room.name].jobs!.claimPartJobs!.signJobs ||
            Memory.rooms[room.name].jobs!.claimPartJobs!.signJobs!.cache < Game.time - SIGN_JOB_CACHE_TTL
        ) {
            MemoryHelper_Room.updateClaimPart_signJobs(room);
        }

        let signJobs: ClaimPartJob[] = Memory.rooms[room.name].jobs!.claimPartJobs!.signJobs!.data;

        if (filterFunction !== undefined) {
            signJobs = _.filter(signJobs, filterFunction);
        }

        return signJobs;
    }

    /**
     * Get the list of ClaimPartJobs.attackJobs
     * @param room The room to get the jobs from
     * @param filterFunction [Optional] A function to filter the ClaimPartJobs list
     * @param forceUpdate [Optional] Forcibly invalidate the cache
     */
    public static getControllerAttackJobs(
        room: Room,
        filterFunction?: (object: ClaimPartJob) => boolean,
        forceUpdate?: boolean
    ): ClaimPartJob[] {
        if (
            NO_CACHING_MEMORY ||
            forceUpdate ||
            !Memory.rooms[room.name].jobs!.claimPartJobs ||
            !Memory.rooms[room.name].jobs!.claimPartJobs!.attackJobs ||
            Memory.rooms[room.name].jobs!.claimPartJobs!.attackJobs!.cache < Game.time - ATTACK_JOB_CACHE_TTL
        ) {
            MemoryHelper_Room.updateClaimPart_controllerAttackJobs(room);
        }

        let attackJobs: ClaimPartJob[] = Memory.rooms[room.name].jobs!.claimPartJobs!.attackJobs!.data;

        if (filterFunction !== undefined) {
            attackJobs = _.filter(attackJobs, filterFunction);
        }

        return attackJobs;
    }

    /**
     * Get all jobs (in a flatted list) of WorkPartJobs.xxx
     * @param room The room to get the jobs from
     * @param filterFunction [Optional] A function to filter the WorkPartJob list
     * @param forceUpdate [Optional] Forcibly invalidate the caches
     */
    public static getAllWorkPartJobs(
        room: Room,
        filterFunction?: (object: WorkPartJob) => boolean,
        forceUpdate?: boolean
    ): WorkPartJob[] {
        const allWorkPartJobs: WorkPartJob[] = [];

        _.forEach(this.getRepairJobs(room, filterFunction, forceUpdate), job => allWorkPartJobs.push(job));
        _.forEach(this.getBuildJobs(room, filterFunction, forceUpdate), job => allWorkPartJobs.push(job));
        _.forEach(this.getUpgradeJobs(room, filterFunction, forceUpdate), job => allWorkPartJobs.push(job));

        return allWorkPartJobs;
    }

    /**
     * Get the list of WorkPartJobs.repairJobs
     * @param room The room to get the jobs from
     * @param filterFunction [Optional] A function to filter the WorkPartJobs list
     * @param forceUpdate [Optional] Forcibly invalidate the cache
     */
    public static getRepairJobs(
        room: Room,
        filterFunction?: (object: WorkPartJob) => boolean,
        forceUpdate?: boolean
    ): WorkPartJob[] {
        if (
            NO_CACHING_MEMORY ||
            forceUpdate ||
            !Memory.rooms[room.name].jobs!.workPartJobs ||
            !Memory.rooms[room.name].jobs!.workPartJobs!.repairJobs ||
            Memory.rooms[room.name].jobs!.workPartJobs!.repairJobs!.cache < Game.time - REPAIR_JOB_CACHE_TTL
        ) {
            MemoryHelper_Room.updateWorkPart_repairJobs(room);
        }

        let repairJobs: WorkPartJob[] = Memory.rooms[room.name].jobs!.workPartJobs!.repairJobs!.data;

        if (filterFunction !== undefined) {
            repairJobs = _.filter(repairJobs, filterFunction);
        }

        return repairJobs;
    }

    /**
     * Get the list of WorkPartJobs.repairJobs where hp% < config:PRIORITY_REPAIR_THRESHOLD
     * @param room The room to get the jobs from
     * @param filterFunction [Optional] A function to filter the WorkPartJobs list
     * @param forceUpdate [Optional] Forcibly invalidate the cache
     */
    public static getPriorityRepairJobs(
        room: Room,
        filterFunction?: (object: WorkPartJob) => boolean,
        forceUpdate?: boolean
    ): WorkPartJob[] {
        if (
            NO_CACHING_MEMORY ||
            forceUpdate ||
            !Memory.rooms[room.name].jobs!.workPartJobs ||
            !Memory.rooms[room.name].jobs!.workPartJobs!.repairJobs ||
            Memory.rooms[room.name].jobs!.workPartJobs!.repairJobs!.cache < Game.time - REPAIR_JOB_CACHE_TTL
        ) {
            MemoryHelper_Room.updateWorkPart_repairJobs(room);
        }

        // Get only priority jobs
        let repairJobs: WorkPartJob[] = Memory.rooms[room.name].jobs!.workPartJobs!.repairJobs!.data;
        repairJobs = _.filter(repairJobs, (job: WorkPartJob) => {
            const obj = Game.getObjectById(job.targetID) as Structure<StructureConstant> | null;
            if (obj == null) {
                return false;
            }

            if (obj.structureType !== STRUCTURE_WALL && obj.structureType !== STRUCTURE_RAMPART) {
                return obj.hits < obj.hitsMax * PRIORITY_REPAIR_THRESHOLD;
            } else {
                return obj.hits < RoomApi_Structure.getWallHpLimit(room) * PRIORITY_REPAIR_THRESHOLD;
            }
        });

        if (filterFunction !== undefined) {
            repairJobs = _.filter(repairJobs, filterFunction);
        }

        return repairJobs;
    }

    /**
     * Get the list of WorkPartJobs.buildJobs
     * @param room The room to get the jobs from
     * @param filterFunction [Optional] A function to filter the WorkPartJobs list
     * @param forceUpdate [Optional] Forcibly invalidate the cache
     */
    public static getBuildJobs(
        room: Room,
        filterFunction?: (object: WorkPartJob) => boolean,
        forceUpdate?: boolean
    ): WorkPartJob[] {
        if (
            NO_CACHING_MEMORY ||
            forceUpdate ||
            !Memory.rooms[room.name].jobs!.workPartJobs ||
            !Memory.rooms[room.name].jobs!.workPartJobs!.buildJobs ||
            Memory.rooms[room.name].jobs!.workPartJobs!.buildJobs!.cache < Game.time - BUILD_JOB_CACHE_TTL
        ) {
            MemoryHelper_Room.updateWorkPart_buildJobs(room);
        }

        let buildJobs: WorkPartJob[] = Memory.rooms[room.name].jobs!.workPartJobs!.buildJobs!.data;

        if (filterFunction !== undefined) {
            buildJobs = _.filter(buildJobs, filterFunction);
        }

        return buildJobs;
    }

    /**
     * Get the list of WorkPartJobs.upgradeJobs
     * @param room The room to get the jobs from
     * @param filterFunction [Optional] A function to filter the WorkPartJobs list
     * @param forceUpdate [Optional] Forcibly invalidate the cache
     */
    public static getUpgradeJobs(
        room: Room,
        filterFunction?: (object: WorkPartJob) => boolean,
        forceUpdate?: boolean
    ): WorkPartJob[] {
        if (
            NO_CACHING_MEMORY ||
            forceUpdate ||
            !Memory.rooms[room.name].jobs!.workPartJobs ||
            !Memory.rooms[room.name].jobs!.workPartJobs!.upgradeJobs ||
            Memory.rooms[room.name].jobs!.workPartJobs!.upgradeJobs!.cache < Game.time - UPGRADE_JOB_CACHE_TTL
        ) {
            MemoryHelper_Room.updateWorkPart_upgradeJobs(room);
        }

        let upgradeJobs: WorkPartJob[] = Memory.rooms[room.name].jobs!.workPartJobs!.upgradeJobs!.data;

        if (filterFunction !== undefined) {
            upgradeJobs = _.filter(upgradeJobs, filterFunction);
        }

        return upgradeJobs;
    }

    /**
     * Get all jobs (in a flatted list) of CarryPartJob.xxx
     * @param room The room to get the jobs from
     * @param filterFunction [Optional] A function to filter the CarryPartJob list
     * @param forceUpdate [Optional] Forcibly invalidate the caches
     */
    public static getAllCarryPartJobs(
        room: Room,
        filterFunction?: (object: CarryPartJob) => boolean,
        forceUpdate?: boolean
    ): CarryPartJob[] {
        const allCarryPartJobs: CarryPartJob[] = [];

        _.forEach(this.getStoreJobs(room, filterFunction, forceUpdate), job => allCarryPartJobs.push(job));
        _.forEach(this.getFillJobs(room, filterFunction, forceUpdate), job => allCarryPartJobs.push(job));

        return allCarryPartJobs;
    }

    /**
     * Get the list of CarryPartJobs.fillJobs
     * @param room The room to get the jobs from
     * @param filterFunction [Optional] A function to filter the CarryPartJobs list
     * @param forceUpdate [Optional] Forcibly invalidate the cache
     */
    public static getFillJobs(
        room: Room,
        filterFunction?: (object: CarryPartJob) => boolean,
        forceUpdate?: boolean
    ): CarryPartJob[] {
        if (
            NO_CACHING_MEMORY ||
            forceUpdate ||
            !Memory.rooms[room.name].jobs!.carryPartJobs ||
            !Memory.rooms[room.name].jobs!.carryPartJobs!.fillJobs ||
            Memory.rooms[room.name].jobs!.carryPartJobs!.fillJobs!.cache < Game.time - FILL_JOB_CACHE_TTL
        ) {
            MemoryHelper_Room.updateCarryPart_fillJobs(room);
        }

        let fillJobs: CarryPartJob[] = Memory.rooms[room.name].jobs!.carryPartJobs!.fillJobs!.data;

        if (filterFunction !== undefined) {
            fillJobs = _.filter(fillJobs, filterFunction);
        }

        return fillJobs;
    }

    /**
     * Get the list of CarryPartJobs.storeJobs
     * @param room The room to get the jobs from
     * @param filterFunction [Optional] A function to filter the CarryPartJobs list
     * @param forceUpdate [Optional] Forcibly invalidate the cache
     */
    public static getStoreJobs(
        room: Room,
        filterFunction?: (object: CarryPartJob) => boolean,
        forceUpdate?: boolean
    ): CarryPartJob[] {
        if (
            NO_CACHING_MEMORY ||
            forceUpdate ||
            !Memory.rooms[room.name].jobs!.carryPartJobs ||
            !Memory.rooms[room.name].jobs!.carryPartJobs!.storeJobs ||
            Memory.rooms[room.name].jobs!.carryPartJobs!.storeJobs!.cache < Game.time - STORE_JOB_CACHE_TTL
        ) {
            MemoryHelper_Room.updateCarryPart_storeJobs(room);
        }

        let storeJobs: CarryPartJob[] = Memory.rooms[room.name].jobs!.carryPartJobs!.storeJobs!.data;

        if (filterFunction !== undefined) {
            storeJobs = _.filter(storeJobs, filterFunction);
        }

        return storeJobs;
    }

    /**
     * Updates the job value in memory to deprecate resources or mark the job as taken
     */
    public static updateJobMemory(creep: Creep, room: Room): void {
        // make sure creep has a job
        if (creep.memory.job === undefined) {
            throw new UserException(
                "Error in updateJobMemory",
                "Attempted to updateJobMemory using a creep with no job.",
                ERROR_ERROR
            );
        }
        // make sure room has a jobs property
        if (room.memory.jobs === undefined) {
            throw new UserException(
                "Error in updateJobMemory",
                "The room memory to update does not have a jobs property",
                ERROR_ERROR
            );
        }

        const creepJob: BaseJob = creep.memory.job!;
        let roomJob: BaseJob | undefined;

        // Assign room job to the room in memory
        switch (creepJob!.jobType) {
            case "carryPartJob":
                roomJob = this.searchCarryPartJobs(creepJob as CarryPartJob, room);
                break;
            case "claimPartJob":
                roomJob = this.searchClaimPartJobs(creepJob as ClaimPartJob, room);
                break;
            case "getEnergyJob":
                roomJob = this.searchGetEnergyJobs(creepJob as GetEnergyJob, room);
                break;
            case "workPartJob":
                roomJob = this.searchWorkPartJobs(creepJob as WorkPartJob, room);
                break;
            case "movePartJob":
                // We don't need to do anything with movePartJobs, so return early
                return;
            default:
                throw new UserException(
                    "Error in updateJobMemory",
                    "Creep has a job with an undefined jobType",
                    ERROR_ERROR
                );
        }

        if (roomJob === undefined) {
            return;
            // ! No error needed, since this just means the job list was refreshed while the worker was performing a task
            /*
            throw new UserException(
                "Error in updateJobMemory",
                "Could not find the job in room memory to update." +
                "\nCreep: " +
                creep.name +
                "\nJob: " +
                JSON.stringify(creep.memory.job),
                ERROR_ERROR
            );
            */
        }

        // We have the roomJob location in memory
        // now we just need to update the value based on the type of job

        switch (creepJob!.jobType) {
            case "carryPartJob":
                this.updateCarryPartJob(roomJob as CarryPartJob, creep);
                break;
            case "claimPartJob":
                this.updateClaimPartJob(roomJob as ClaimPartJob, creep);
                break;
            case "getEnergyJob":
                this.updateGetEnergyJob(roomJob as GetEnergyJob, creep);
                break;
            case "workPartJob":
                this.updateWorkPartJob(roomJob as WorkPartJob, creep);
                break;
            default:
                throw new UserException(
                    "Error in updateJobMemory",
                    "Creep has a job with an undefined jobType",
                    ERROR_ERROR
                );
        }
    }

    /**
     * Searches through claimPartJobs to find a specified job
     * @param job THe job to serach for
     * @param room The room to search in
     */
    public static searchClaimPartJobs(job: ClaimPartJob, room: Room): ClaimPartJob | undefined {
        if (room.memory.jobs!.claimPartJobs === undefined) {
            throw new UserException(
                "Error in searchClaimPartJobs",
                "The room memory does not have a claimPartJobs property",
                ERROR_ERROR
            );
        }

        const jobListing = room.memory.jobs!.claimPartJobs!;

        let roomJob: ClaimPartJob | undefined;

        if (jobListing.claimJobs) {
            roomJob = _.find(jobListing.claimJobs.data, (claimJob: ClaimPartJob) => job.targetID === claimJob.targetID);
        }

        if (roomJob === undefined && jobListing.reserveJobs) {
            roomJob = _.find(
                jobListing.reserveJobs.data,
                (reserveJob: ClaimPartJob) => job.targetID === reserveJob.targetID
            );
        }

        if (roomJob === undefined && jobListing.signJobs) {
            roomJob = _.find(jobListing.signJobs.data, (signJob: ClaimPartJob) => job.targetID === signJob.targetID);
        }

        return roomJob;
    }

    /**
     * Searches through carryPartJobs to find a specified job
     * @param job The job to search for
     * @param room The room to search in
     */
    public static searchCarryPartJobs(job: CarryPartJob, room: Room): CarryPartJob | undefined {
        if (room.memory.jobs!.carryPartJobs === undefined) {
            throw new UserException(
                "Error in searchCarryPartJobs",
                "The room memory does not have a carryPartJobs property",
                ERROR_ERROR
            );
        }

        const jobListing = room.memory.jobs!.carryPartJobs!;

        let roomJob: CarryPartJob | undefined;

        if (jobListing.fillJobs) {
            roomJob = _.find(jobListing.fillJobs.data, (fillJob: CarryPartJob) => job.targetID === fillJob.targetID);
        }

        if (roomJob === undefined && jobListing.storeJobs) {
            roomJob = _.find(jobListing.storeJobs.data, (storeJob: CarryPartJob) => job.targetID === storeJob.targetID);
        }

        return roomJob;
    }

    /**
     * Searches through workPartJobs to find a specified job
     * @param job The job to search for
     * @param room The room to search in
     */
    public static searchWorkPartJobs(job: WorkPartJob, room: Room): WorkPartJob | undefined {
        if (room.memory.jobs!.workPartJobs === undefined) {
            throw new UserException(
                "Error in workPartJobs",
                "THe room memory does not have a workPartJobs property",
                ERROR_ERROR
            );
        }

        const jobListing = room.memory.jobs!.workPartJobs!;

        let roomJob: WorkPartJob | undefined;

        if (jobListing.upgradeJobs) {
            roomJob = _.find(jobListing.upgradeJobs.data, (uJob: WorkPartJob) => job.targetID === uJob.targetID);
        }

        if (roomJob === undefined && jobListing.buildJobs) {
            roomJob = _.find(jobListing.buildJobs.data, (buildJob: WorkPartJob) => job.targetID === buildJob.targetID);
        }

        if (roomJob === undefined && jobListing.repairJobs) {
            roomJob = _.find(jobListing.repairJobs.data, (rJob: WorkPartJob) => job.targetID === rJob.targetID);
        }

        return roomJob;
    }

    /**
     * Searches through getEnergyJobs to find a specified job
     * @param job THe job to search for
     * @param room THe room to search in
     */
    public static searchGetEnergyJobs(job: GetEnergyJob, room: Room): GetEnergyJob | undefined {
        if (room.memory.jobs!.getEnergyJobs === undefined) {
            throw new UserException(
                "Error in searchGetEnergyJobs",
                "The room memory does not have a getEnergyJobs property",
                ERROR_ERROR
            );
        }

        const jobListing = room.memory.jobs!.getEnergyJobs!;

        let roomJob: GetEnergyJob | undefined;

        if (jobListing.containerJobs) {
            roomJob = _.find(jobListing.containerJobs.data, (cJob: GetEnergyJob) => cJob.targetID === job.targetID);
        }

        if (roomJob === undefined && jobListing.sourceJobs) {
            roomJob = _.find(jobListing.sourceJobs!.data, (sJob: GetEnergyJob) => sJob.targetID === job.targetID);
        }

        if (roomJob === undefined && jobListing.pickupJobs) {
            roomJob = _.find(jobListing.pickupJobs!.data, (pJob: GetEnergyJob) => pJob.targetID === job.targetID);
        }

        if (roomJob === undefined && jobListing.backupStructures) {
            roomJob = _.find(jobListing.backupStructures!.data, (sJob: GetEnergyJob) => sJob.targetID === job.targetID);
        }

        if (roomJob === undefined && jobListing.linkJobs) {
            roomJob = _.find(jobListing.linkJobs!.data, (lJob: GetEnergyJob) => lJob.targetID === job.targetID);
        }

        if (roomJob === undefined && jobListing.lootJobs) {
            roomJob = _.find(jobListing.lootJobs!.data, (tJob: GetEnergyJob) => tJob.targetID === job.targetID);
        }

        return roomJob;
    }

    /**
     * Updates the CarryPartJob
     * @param job The Job to update
     */
    public static updateCarryPartJob(job: CarryPartJob, creep: Creep): void {
        if (job.actionType === "transfer") {
            job.remaining -= creep.store.energy;

            if (job.remaining <= 0) {
                job.isTaken = true;
            }
        }

        return;
    }

    /**
     * Updates the ClaimPartJob
     * @param job The Job to update
     */
    public static updateClaimPartJob(job: ClaimPartJob, creep: Creep): void {
        if (job.targetType === STRUCTURE_CONTROLLER) {
            job.isTaken = true;
            return;
        }

        if (job.targetType === "roomName") {
            job.isTaken = true;
            return;
        }
    }
    /**
     * Updates the getEnergyJob
     * @param job The Job to update
     */
    public static updateGetEnergyJob(job: GetEnergyJob, creep: Creep): void {
        if (job.targetType === "source") {
            // Subtract creep effective mining capacity from resources
            job.resources.energy -= creep.getActiveBodyparts(WORK) * 2 * 300;

            if (job.resources.energy <= 0) {
                job.isTaken = true;
            }

            return;
        }

        if (
            job.targetType === "droppedResource" ||
            job.targetType === "link" ||
            job.targetType === "container" ||
            job.targetType === "ruin" ||
            job.targetType === "tombstone" ||
            job.targetType === "storage" ||
            job.targetType === "terminal"
        ) {
            // Subtract creep carry from resources
            job.resources.energy -= creep.store.getFreeCapacity();

            if (job.resources.energy <= 0) {
                job.isTaken = true;
            }

            return;
        }
    }

    /**
     * Updates the workPartJob
     * @param job The job to update
     */
    public static updateWorkPartJob(job: WorkPartJob, creep: Creep): void {
        if (job.targetType === "constructionSite") {
            // Creep builds 5 points/part/tick at 1 energy/point
            job.remaining -= creep.store.energy; // 1 to 1 ratio of energy to points built

            if (job.remaining <= 0) {
                job.isTaken = true;
            }

            return;
        }

        if (job.targetType === STRUCTURE_CONTROLLER) {
            // Upgrade at a 1 to 1 ratio
            job.remaining -= creep.store.energy;
            // * Do nothing really - Job will never be taken
            // Could optionally mark something on the job to show that we have 1 worker upgrading already
            return;
        }

        if (job.targetType in ALL_STRUCTURE_TYPES) {
            // Repair 20 hits/part/tick at .1 energy/hit rounded up to nearest whole number
            job.remaining -= Math.ceil(creep.store.energy * 0.1);

            if (job.remaining <= 0) {
                job.isTaken = true;
            }

            return;
        }
    }
}
