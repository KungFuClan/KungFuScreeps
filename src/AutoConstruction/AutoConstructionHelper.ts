import { dirxml } from "console";
import { link } from "fs";
import _ from "lodash";
import { MemoryApi_Room } from "Memory/Memory.Room.Api";
import { RoomHelper_Structure } from "Utils/Imports/internals";

// Helper for automatic construction for rooms
export class AutoConstruction_Helper {

    /**
     *
     * @param room The room we are currently checking on
     * @param bunkerCenter The bunker center of the room
     * @param rcl the current rcl the room is on
     * @param currentConstructionCount the current number of active construction sites empire wide
     */
    public static checkTowers(room: Room, bunkerCenter: RoomPosition, rcl: number, currentConstructionCount: number): void {
        const towerLoc = [
            { dx: 0, dy: -1 },
            { dx: 0, dy: -2 },
            { dx: 0, dy: 1 },
            { dx: 0, dy: 2 },
            { dx: -2, dy: 0 },
            { dx: 2, dy: 0 }
        ];
        let numOfTowers: number = 1;

        switch (rcl) {
            // No towers until rcl 3
            case 1:
            case 2:
                break;
            case 3:
            case 4:
                numOfTowers = 1;
                break;
            case 5:
            case 6:
                numOfTowers = 2;
                break;
            case 7:
                numOfTowers = 3;
                break;
            case 8:
                numOfTowers = 6;
                break;
        }

        // Make sure we have a tower, if not build one
        const towers = MemoryApi_Room.getStructureOfType(room.name, STRUCTURE_TOWER, undefined, true) as StructureTower[];
        if (towers.length >= numOfTowers) return;
        for (let i = 0; i < numOfTowers; ++i) {
            // Skip the iteration if there is already a structure or construction site there
            const positionToCheck: RoomPosition = new RoomPosition(bunkerCenter.x + towerLoc[i].dx, bunkerCenter.y + towerLoc[i].dy, room.name);
            if (RoomHelper_Structure.structureOrSiteExistsAtRoomPosition(room, positionToCheck)) continue;
            if (currentConstructionCount >= MAX_CONSTRUCTION_SITES) return;
            room.createConstructionSite(bunkerCenter.x + towerLoc[i].dx, bunkerCenter.y + towerLoc[i].dy, STRUCTURE_TOWER);
        }
    }

    /**
     *
     * @param room The room we are currently checking on
     * @param bunkerCenter The bunker center of the room
     * @param rcl the current rcl the room is on
     * @param currentConstructionCount the current number of active construction sites empire wide
     */
    public static checkSpawns(room: Room, bunkerCenter: RoomPosition, rcl: number, currentConstructionCount: number): void {
        const spawnLoc = [
            { dx: 1, dy: -1 },
            { dx: 1, dy: 1 },
            { dx: -1, dy: -1 }
        ];
        let numOfSpawns: number = 1;

        switch (rcl) {
            // Only need 1 spawn up to rcl 7
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
                numOfSpawns = 1;
                break;
            case 7:
                numOfSpawns = 2;
                break;
            case 8:
                numOfSpawns = 3;
                break;
        }

        // Make sure we have a spawn, if not build one
        const spawns = MemoryApi_Room.getStructureOfType(room.name, STRUCTURE_SPAWN, undefined, true) as StructureSpawn[];
        if (spawns.length >= numOfSpawns) return;
        for (let i = 0; i < numOfSpawns; ++i) {
            // Skip the iteration if there is already a structure or construction site there
            const positionToCheck: RoomPosition = new RoomPosition(bunkerCenter.x + spawnLoc[i].dx, bunkerCenter.y + spawnLoc[i].dy, room.name);
            if (RoomHelper_Structure.structureOrSiteExistsAtRoomPosition(room, positionToCheck)) continue;
            if (currentConstructionCount >= MAX_CONSTRUCTION_SITES) return;
            room.createConstructionSite(bunkerCenter.x + spawnLoc[i].dx, bunkerCenter.y + spawnLoc[i].dy, STRUCTURE_SPAWN);
        }
    }

    /**
     *
     * @param room The room we are currently checking on
     * @param bunkerCenter The bunker center of the room
     * @param rcl the current rcl the room is on
     * @param currentConstructionCount the current number of active construction sites empire wide
     */
    public static checkBunkerCenterLink(room: Room, bunkerCenter: RoomPosition, rcl: number, currentConstructionCount: number): void {
        switch (rcl) {
            // No manager link until rcl 6
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
                return;
            case 6:
            case 7:
            case 8:
                // Don't attempt to create a manager link if we have one or have a construction site out there to create one
                const dx = -1;
                const dy = 1;
                const managerLink = MemoryApi_Room.getStructureOfType(room.name, STRUCTURE_LINK, (link: StructureLink) => {
                    return link.pos.x === bunkerCenter.x + dx && link.pos.y === bunkerCenter.y + dy
                });
                if (managerLink) return;

                if (_.some(room.find(FIND_CONSTRUCTION_SITES), (site) => site.structureType === STRUCTURE_LINK && site.pos.x === bunkerCenter.x + dx && site.pos.y === bunkerCenter.y + dy)) return;
                const storagePosition: RoomPosition = new RoomPosition(bunkerCenter.x + dx, bunkerCenter.y + dy, room.name);
                if (currentConstructionCount >= MAX_CONSTRUCTION_SITES) return;
                room.createConstructionSite(storagePosition.x, storagePosition.y, STRUCTURE_LINK);
                break;
        }
    }

    /**
     *
     * @param room The room we are currently checking on
     * @param bunkerCenter The bunker center of the room
     * @param rcl the current rcl the room is on
     * @param currentConstructionCount the current number of active construction sites empire wide
     */
    public static checkStorage(room: Room, bunkerCenter: RoomPosition, rcl: number, currentConstructionCount: number): void {
        switch (rcl) {
            // No storage until rcl 4
            case 1:
            case 2:
            case 3:
                return;
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
                // Don't attempt to create a storage if we have one or have a construction site out there to create one
                if (room.storage) return;
                if (_.some(room.find(FIND_CONSTRUCTION_SITES), (site) => site.structureType === STRUCTURE_STORAGE)) return;
                const dx = -1;
                const dy = 0;
                const storagePosition: RoomPosition = new RoomPosition(bunkerCenter.x + dx, bunkerCenter.y + dy, room.name);
                if (currentConstructionCount >= MAX_CONSTRUCTION_SITES) return;
                room.createConstructionSite(storagePosition.x, storagePosition.y, STRUCTURE_STORAGE);
                break;
        }
    }

    /**
     *
     * @param room The room we are currently checking on
     * @param bunkerCenter The bunker center of the room
     * @param rcl the current rcl the room is on
     * @param currentConstructionCount the current number of active construction sites empire wide
     */
    public static checkTerminal(room: Room, bunkerCenter: RoomPosition, rcl: number, currentConstructionCount: number): void {
        switch (rcl) {
            // No terminal until rcl 6
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
                return;
            case 6:
            case 7:
            case 8:
                // Don't attempt to create a terminal if we have one or have a construction site out there to create one
                if (room.terminal) return;
                if (_.some(room.find(FIND_CONSTRUCTION_SITES), (site) => site.structureType === STRUCTURE_TERMINAL)) return;
                const dx = 1;
                const dy = 0;
                const storagePosition: RoomPosition = new RoomPosition(bunkerCenter.x + dx, bunkerCenter.y + dy, room.name);
                if (currentConstructionCount >= MAX_CONSTRUCTION_SITES) return;
                room.createConstructionSite(storagePosition.x, storagePosition.y, STRUCTURE_TERMINAL);
                break;
        }
    }

    /**
     *
     * @param room The room we are currently checking on
     * @param bunkerCenter The bunker center of the room
     * @param rcl the current rcl the room is on
     * @param currentConstructionCount the current number of active construction sites empire wide
     */
    public static checkBunkerCenterRamparts(room: Room, bunkerCenter: RoomPosition, rcl: number, currentConstructionCount: number): void {
        const rampartLoc = [
            { dx: 0, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 0, dy: -1 },
            { dx: 0, dy: 2 },
            { dx: 0, dy: -2 },
            { dx: -1, dy: 0 },
            { dx: -1, dy: -1 },
            { dx: -1, dy: 1 },
            { dx: 1, dy: -1 },
            { dx: 1, dy: 1 },
            { dx: 1, dy: 0 },
            { dx: -2, dy: 0 },
            { dx: 2, dy: 0 },
        ];
        switch (rcl) {
            // Don't worry about ramparts until rcl 4 (once we grab a storage)
            case 1:
            case 2:
            case 3:
                return;
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
                for (const location of rampartLoc) {
                    const positionToCheck: RoomPosition = new RoomPosition(bunkerCenter.x + location.dx, bunkerCenter.y + location.dy, room.name);
                    if (!RoomHelper_Structure.structureOrSiteExistsAtRoomPosition(room, positionToCheck)) {
                        room.createConstructionSite(positionToCheck.x, positionToCheck.y, STRUCTURE_RAMPART);
                    }
                }
                break;
        }
    }

    /**
     *
     * @param room The room we are currently checking on
     * @param bunkerCenter The bunker center of the room
     * @param rcl the current rcl the room is on
     * @param currentConstructionCount the current number of active construction sites empire wide
     */
    public static checkBunkerCenterRoads(room: Room, bunkerCenter: RoomPosition, rcl: number, currentConstructionCount: number): void {
        const roadLoc = [
            { dx: 0, dy: -3 },
            { dx: 0, dy: 3 },
            { dx: 3, dy: 0 },
            { dx: -3, dy: 0 },
            { dx: 2, dy: -1 },
            { dx: 2, dy: 1 },
            { dx: -2, dy: -1 },
            { dx: -2, dy: 1 },
            { dx: 1, dy: -2 },
            { dx: 1, dy: 2 },
            { dx: -1, dy: -2 },
            { dx: -1, dy: 2 }
        ];

        for (const location of roadLoc) {
            const positionToCheck: RoomPosition = new RoomPosition(bunkerCenter.x + location.dx, bunkerCenter.y + location.dy, room.name);
            if (!RoomHelper_Structure.structureOrSiteExistsAtRoomPosition(room, positionToCheck)) {
                room.createConstructionSite(positionToCheck.x, positionToCheck.y, STRUCTURE_ROAD);
            }
        }
    }
}
