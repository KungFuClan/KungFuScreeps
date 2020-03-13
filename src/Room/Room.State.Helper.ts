import {
    UserException,
    SpawnHelper,
    STIMULATE_FLAG,
    MemoryApi_Room,
    MemoryApi_Creep,
    MemoryApi_Empire,
    ALLY_LIST
} from "Utils/Imports/internals";

export class RoomHelper_State {
    /**
     * check if container mining is active in a room (each source has a container in range)
     * @param room the room we are checking
     * @param sources the sources we are checking
     * @param containers the containers we are checking
     */
    public static isContainerMining(
        room: Room,
        sources: Array<Source | null>,
        containers: Array<Structure<StructureConstant> | null>
    ): boolean {
        // Loop over sources and make sure theres at least one container in range to it
        let numMiningContainers: number = 0;

        _.forEach(sources, (source: Source) => {
            if (_.some(containers, (container: StructureContainer) => source.pos.inRangeTo(container.pos, 2))) {
                numMiningContainers++;
            }
        });

        return numMiningContainers === sources.length;
    }

    /**
     * Returns if a room is neutral - Note: Neutral is defined as having a controller that is neither reserved or claimed by anyone
     * @param room The room to check
     */
    public static isNeutralRoom(room: Room): boolean {
        return (
            room.controller !== undefined &&
            room.controller.owner === undefined &&
            room.controller.reservation === undefined
        );
    }

    /**
     * check if a specified room is owned by an enemy
     * @param room the room we want to check
     */
    public static isMyRoom(room: Room): boolean {
        return room.controller !== undefined && room.controller.my;
    }

    /**
     * Returns if a room is hostile owned - does not count invaders or reserved rooms
     * @param room The room to check
     */
    public static isHostileOwnedRoom(room: Room): boolean {
        if (room.controller === undefined) {
            return false;
        }

        if (
            room.controller.owner !== undefined &&
            room.controller.owner.username !== "Invader" &&
            !_.contains(ALLY_LIST, room.controller.owner.username)
        ) {
            return true;
        }

        return false;
    }

    /**
     * Check if a room is reserved by an enemy
     * @param room the room we are checking the reservation for
     */
    public static isHostileReserved(room: Room): boolean {
        return (
            room.controller !== undefined &&
            room.controller.reservation !== undefined &&
            room.controller.reservation.username !== undefined &&
            room.controller.reservation.username !== "Invader" &&
            !_.contains(ALLY_LIST, room.controller.reservation.username)
        );
    }

    /**
     * Returns if a room is owned by an invader
     * @param room The room we are checking for
     */
    public static isInvaderOwnedRoom(room: Room): boolean {
        return room.controller !== undefined && room.controller.owner && room.controller.owner.username === "Invader";
    }

    /**
     * Returns if a room is reserved by an invader
     * @param room The room we are checking for
     */
    public static isInvaderReserved(room: Room): boolean {
        return (
            room.controller !== undefined &&
            room.controller.reservation !== undefined &&
            room.controller.reservation.username === "Invader"
        );
    }

    /**
     * check if a specified room is an ally room - excludes reserved rooms
     * @param room the room we want to check
     */
    public static isAllyOwnedRoom(room: Room): boolean {
        // returns true if a room has one of our names or is reserved by us
        if (room.controller === undefined) {
            return false;
        }

        if (room.controller.owner !== undefined && _.contains(ALLY_LIST, room.controller.owner.username)) {
            return true;
        }

        return false;
    }

    /**
     * Check if a room is reserved by an ally
     * @param room the room we are checking the reservation for
     */
    public static isAllyReserved(room: Room): boolean {
        return (
            room.controller !== undefined &&
            room.controller.reservation !== undefined &&
            room.controller.reservation.username !== undefined &&
            _.contains(ALLY_LIST, room.controller.reservation.username)
        );
    }

    /**
     * check if a room is a source keeper room
     * @param room the room we want to check
     */
    public static isSourceKeeperRoom(room: Room): boolean {
        // Contains x pos in [1], y pos in [2]
        const parsedName: any = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(room.name);
        const xOffset = parsedName[1] % 10;
        const yOffset = parsedName[2] % 10;
        // If x & y === 5 it's not SK, but both must be between 4 and 6
        const isSK = !(xOffset === 5 && xOffset === 5) && xOffset >= 4 && xOffset <= 6 && yOffset >= 4 && yOffset <= 6;
        return isSK;
    }

    /**
     * check if a room is a highway room
     * @param room the room we want to check
     */
    public static isHighwayRoom(room: Room): boolean {
        // Contains x pos in [1], y pos in [2]
        const parsedName: any = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(room.name);
        // If x || y is divisible by 10, it's a highway
        if (parsedName[1] % 10 === 0 || parsedName[2] % 10 === 0) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * check if a room is close enough to send a creep to
     * @param room the room we want to check
     */
    public static inTravelRange(homeRoom: string, targetRoom: string): boolean {
        const routeArray: Array<{ exit: ExitConstant; room: string }> | -2 = Game.map.findRoute(homeRoom, targetRoom);

        return !(routeArray === -2 || routeArray.length > 20);
    }

    /**
     * Check and see if an upgrader link exists
     * @param room the room we are checking for
     */
    public static isUpgraderLink(room: Room): boolean {
        // Throw warning if we do not own this room
        if (!this.isMyRoom(room)) {
            throw new UserException(
                "Stimulate flag check on non-owned room",
                "You attempted to check for a stimulate flag in a room we do not own. Room [" + room.name + "]",
                ERROR_WARN
            );
        }

        return MemoryApi_Room.getUpgraderLink(room) !== null;
    }

    /**
     * Check if the stimulate flag is present for a room
     * @param room the room we are checking for
     */
    public static isStimulateRoom(room: Room): boolean {
        // Throw warning if we do not own this room
        if (!this.isMyRoom(room)) {
            throw new UserException(
                "Stimulate flag check on non-owned room",
                "You attempted to check for a stimulate flag in a room we do not own. Room [" + room.name + "]",
                ERROR_WARN
            );
        }

        const terminal: StructureTerminal | undefined = room.terminal;

        if (!terminal) {
            return false;
        }

        // Check if we have a stimulate flag with the same room name as this flag
        return _.some(
            Memory.flags,
            (flag: FlagMemory) =>
                flag.flagType === STIMULATE_FLAG && Game.flags[flag.flagName].pos.roomName === room.name
        );
    }

    /**
     * Returns the number of hostile creeps recorded in the room
     * @param room The room to check
     */
    public static numHostileCreeps(room: Room): number {
        const hostiles = MemoryApi_Creep.getHostileCreeps(room.name);
        return hostiles.length;
    }

    /**
     * Return the number of remote rooms associated with the given room
     * @param room
     */
    public static numRemoteRooms(room: Room): number {
        return MemoryApi_Room.getRemoteRooms(room).length;
    }

    /**
     * get number of associated claim rooms
     * @param room
     */
    public static numClaimRooms(room: Room): number {
        return MemoryApi_Room.getClaimRooms(room).length;
    }

    /**
     * Returns the number of sources in a room
     * @param room The room to check
     */
    public static numSources(room: Room): number {
        return MemoryApi_Room.getSources(room.name).length;
    }
    /**
     * Returns the number of sources in all remoteRooms connected to room
     * @param room The room to check the remoteRooms of
     */
    public static numRemoteSources(room: Room): number {
        // TODO: remove sources and structures from the remote room dependent memory itself
        const remoteRooms: RemoteRoomMemory[] = Memory.rooms[room.name].remoteRooms!;
        let numSources: number = 0;

        _.forEach(remoteRooms, (rr: RemoteRoomMemory) => {
            if (!rr) {
                return;
            }
            // Don't consider these sources valid if the controller is reserved by an enemy, or theres defcon 2 >=
            if (
                SpawnHelper.isRemoteRoomEnemyReserved(rr) ||
                (Memory.rooms[rr.roomName] && Memory.rooms[rr.roomName].defcon >= 2)
            ) {
                return;
            }

            let sourcesInRoom: number = 0;
            if (
                Memory.rooms[rr.roomName] &&
                Memory.rooms[rr.roomName].sources &&
                Memory.rooms[rr.roomName].sources.data
            ) {
                sourcesInRoom = Memory.rooms[rr.roomName].sources.data.length;
            } else {
                sourcesInRoom = rr.sources.data;
            }
            numSources += sourcesInRoom;
        });
        return numSources;
    }

    /**
     * get the number of claim rooms that have not yet been claimed
     * @param room the room we are checking for
     */
    public static numCurrentlyUnclaimedClaimRooms(room: Room): number {
        const allClaimRooms: Array<ClaimRoomMemory | undefined> = MemoryApi_Room.getClaimRooms(room);
        const ownedRooms: Room[] = MemoryApi_Empire.getOwnedRooms();
        let sum: number = 0;

        // No existing claim rooms
        if (allClaimRooms.length === 0) {
            return 0;
        }

        for (const claimRoom of allClaimRooms) {
            if (
                !_.some(ownedRooms, ownedRoom => {
                    if (claimRoom) {
                        return ownedRoom.name === claimRoom!.roomName;
                    }
                    return false;
                })
            ) {
                ++sum;
            }
        }

        return sum;
    }

    /**
     * check if the first room is a remote room of the second
     */
    public static isRemoteRoomOf(dependentRoomName: string, hostRoomName?: string): boolean {
        // early returns
        if (!hostRoomName) {
            const ownedRooms: Room[] = MemoryApi_Empire.getOwnedRooms();
            for (const room of ownedRooms) {
                const remoteRooms: RemoteRoomMemory[] = MemoryApi_Room.getRemoteRooms(room);
                if (_.some(remoteRooms, (rr: RemoteRoomMemory) => rr.roomName === dependentRoomName)) {
                    return true;
                }
            }
            return false;
        }
        if (!Memory.rooms[hostRoomName]) {
            return false;
        }
        if (!Game.rooms[hostRoomName]) {
            return false;
        }

        const remoteRooms: RemoteRoomMemory[] = MemoryApi_Room.getRemoteRooms(Game.rooms[hostRoomName]);
        return _.some(remoteRooms, (rr: RemoteRoomMemory) => rr.roomName === dependentRoomName);
    }

    /**
     * Check if a room has no reservation on it
     * @param room the room we are checking
     */
    public static isNoReservation(room: Room): boolean {
        return room.controller !== undefined && room.controller.reservation === undefined;
    }
}
