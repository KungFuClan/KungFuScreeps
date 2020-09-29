import { link } from "fs";
import _ from "lodash";
import { MemoryApi_Room } from "Memory/Memory.Room.Api";

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
        switch (rcl) {
            // No towers for first 2 rcl
            case 1:
            case 2:
                return;
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
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
    public static checkSpawns(room: Room, bunkerCenter: RoomPosition, rcl: number, currentConstructionCount: number): void {
        let spawns: StructureSpawn[] = [];
        const spawnLoc = [
            { dx: 1, dy: -1 },
            { dx: 1, dy: 1 },
            { dx: -1, dy: -1 }
        ]

        switch (rcl) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
                // Make sure we have a spawn, if not build one
                spawns = MemoryApi_Room.getStructureOfType(room.name, STRUCTURE_SPAWN, undefined, true) as StructureSpawn[];
                if (spawns.length >= 1) return;
                for (let i = 0; i < 1; ++i) {
                    // Skip the iteration if there is already a structure or construction site there
                    if (
                        _.some(room.lookAt(bunkerCenter.x + spawnLoc[i].dx, bunkerCenter.y + spawnLoc[i].dy), (obj => {
                            obj.type === LOOK_CONSTRUCTION_SITES || obj.type === LOOK_STRUCTURES
                        }))
                    ) {
                        continue;
                    }

                    if (currentConstructionCount >= MAX_CONSTRUCTION_SITES) return;
                    room.createConstructionSite(bunkerCenter.x + spawnLoc[i].dx, bunkerCenter.y + spawnLoc[i].dy, STRUCTURE_SPAWN);
                }
                return;

            case 7:
                // Make sure we have 2 spawns, if not build another spawn
                spawns = MemoryApi_Room.getStructureOfType(room.name, STRUCTURE_SPAWN, undefined, true) as StructureSpawn[];
                if (spawns.length >= 2) return;
                for (let i = 0; i < 2; ++i) {
                    // Skip the iteration if there is already a structure or construction site there
                    if (
                        _.some(room.lookAt(bunkerCenter.x + spawnLoc[i].dx, bunkerCenter.y + spawnLoc[i].dy), (obj => {
                            obj.type === LOOK_CONSTRUCTION_SITES || obj.type === LOOK_STRUCTURES
                        }))
                    ) {
                        continue;
                    }

                    room.createConstructionSite(bunkerCenter.x + spawnLoc[i].dx, bunkerCenter.y + spawnLoc[i].dy, STRUCTURE_SPAWN);
                }
                return;

            case 8:
                // Make sure we have 3 spawns, if not build another spawn
                spawns = MemoryApi_Room.getStructureOfType(room.name, STRUCTURE_SPAWN, undefined, true) as StructureSpawn[];
                if (spawns.length >= 3) return;
                for (let i = 0; i < 3; ++i) {
                    // Skip the iteration if there is already a structure or construction site there
                    if (
                        _.some(room.lookAt(bunkerCenter.x + spawnLoc[i].dx, bunkerCenter.y + spawnLoc[i].dy), (obj => {
                            obj.type === LOOK_CONSTRUCTION_SITES || obj.type === LOOK_STRUCTURES
                        }))
                    ) {
                        continue;
                    }

                    room.createConstructionSite(bunkerCenter.x + spawnLoc[i].dx, bunkerCenter.y + spawnLoc[i].dy, STRUCTURE_SPAWN);
                }
                return;
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
        switch (rcl) {
            // Don't worry about roads until rcl 4 (when we have storage)
            case 1:
            case 2:
            case 3:
                return;
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
                break;
        }
    }
}
