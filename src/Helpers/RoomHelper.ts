import Normalize from "Helpers/Normalize";
import MemoryApi from "Api/Memory.Api";
import MemoryHelper_Room from "./MemoryHelper_Room";
import { WALL_LIMIT } from "utils/Constants";
import UtilHelper from "./UtilHelper";
import UserException from "utils/UserException";

// helper functions for rooms
export default class RoomHelper {
    /**
     * check if a specified room is owned by you
     * @param room the room we want to check
     */
    public static isOwnedRoom(room: Room): boolean {
        if (room.controller !== undefined) {
            return room.controller.my;
        } else {
            return false;
        }
    }

    /**
     * check if a specified room is an ally room
     * @param room the room we want to check
     */
    public static isAllyRoom(room: Room): boolean {
        // returns true if a room has one of our names but is not owned by us
        if (room.controller === undefined) {
            return false;
        } else {
            return (
                !this.isOwnedRoom(room) &&
                (room.controller.owner.username === "UhmBrock" || room.controller.owner.username === "Jakesboy2")
            );
        }
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
        const isSK =
            !(xOffset === 5 && xOffset === 5) && (xOffset >= 4 && xOffset <= 6) && (yOffset >= 4 && yOffset <= 6);
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
     * ? What are we doing with this? Checking if room is within roomdistance * 50 tiles - CreepTTL?
     * TODO Complete this
     * @param room the room we want to check
     */
    public static inTravelRange(room: Room): boolean {
        return false;
    }

    /**
     * check if the object exists within a room
     * @param room the room we want to check
     * @param objectConst the object we want to check for
     */
    public static isExistInRoom(room: Room, objectConst: StructureConstant): boolean {
        return MemoryApi.getStructures(room, s => s.structureType === objectConst).length > 0;
    }

    /**
     * get the stored amount from the target
     * @param target the target we want to check the storage of
     * @param resourceType the resource we want to check the storage for
     */
    public static getStoredAmount(target: any, resourceType: ResourceConstant): number | undefined {
        if (target instanceof Creep) {
            return target.carry[resourceType];
        } else if (target.hasOwnProperty("store")) {
            return target.store[resourceType];
        } else if (resourceType === RESOURCE_ENERGY && target.hasOwnProperty("energy")) {
            return target.energy;
        }
        // Throw an error to identify when this fail condition is met
        throw new UserException(
            "Failed to getStoredAmount of a target",
            "ID: " + target.id + "\n" + JSON.stringify(target),
            ERROR_ERROR
        );
    }

    /**
     * get the capacity from the target
     * @param target the target we want to check the capacity of
     */
    public static getStoredCapacity(target: any): number {
        if (target instanceof Creep) {
            return target.carryCapacity;
        } else if (target.hasOwnProperty("store")) {
            return target.storeCapacity;
        } else if (target.hasOwnProperty("energyCapacity")) {
            return target.energyCapacity;
        }

        return -1;
    }

    /**
     * get the amount of damage a tower will do at this distance
     * @param range the distance the target is from the tower
     */
    public static getTowerDamageAtRange(range: number) {
        if (range <= TOWER_OPTIMAL_RANGE) {
            return TOWER_POWER_ATTACK;
        }
        if (range >= TOWER_FALLOFF_RANGE) {
            range = TOWER_FALLOFF_RANGE;
        }
        return (
            TOWER_POWER_ATTACK -
            (TOWER_POWER_ATTACK * TOWER_FALLOFF * (range - TOWER_OPTIMAL_RANGE)) /
            (TOWER_FALLOFF_RANGE - TOWER_OPTIMAL_RANGE)
        );
    }

    /**
     * only returns true every ${parameter} number of ticks
     * @param ticks the number of ticks you want between executions
     */
    public static excecuteEveryTicks(ticks: number): boolean {
        return Game.time % ticks === 0;
    }

    /**
     * check if container mining is active in a room
     * @param room the room we are checking
     * @param sources the sources we are checking
     * @param containers the containers we are checking
     */
    public static isContainerMining(
        room: Room,
        sources: Array<Source | null>,
        containers: Array<Structure<StructureConstant> | null>
    ): boolean {
        return false;
    }

    /**
     * check if container mining is active in a room
     * TODO Complete this
     * @param room the room we are checking
     * @param sources the sources we are checking
     * @param containers the containers we are checking
     */
    public static isUpgraderLink(room: Room, links: Array<Structure<StructureConstant> | null>): boolean {
        return false;
    }

    /**
     * choose an ideal target for the towers to attack
     * TODO actually choose an ideal target not just the first one lol
     * @param room the room we are in
     */
    public static chooseTowerTarget(room: Room): Creep | null {
        // get the creep we will do the most damage to
        const hostileCreeps: Array<Creep | null> = MemoryApi.getHostileCreeps(room);

        // temp, in future get one we do most dmg to
        return hostileCreeps[0];
    }

    /**
     * Get the difference in Wall/Rampart HP between the current and previous RCL
     * @param controllerLevel the level of the controller in the room
     */
    public static getWallLevelDifference(controllerLevel: number): number {
        return WALL_LIMIT[controllerLevel] - WALL_LIMIT[controllerLevel - 1];
    }

    /**
     * Returns the number of hostile creeps recorded in the room
     * @param room The room to check
     */
    public static numHostileCreeps(room: Room): number {
        const hostiles = MemoryApi.getHostileCreeps(room);
        return hostiles.length;
    }
    /**
     * Return the number of remote rooms associated with the given room
     * @param room
     */
    public static numRemoteRooms(room: Room): number {
        const remoteRooms = MemoryApi.getRemoteRooms(room);
        return remoteRooms.length;
    }

    /**
     * get number of associated claim rooms
     * @param room
     */
    public static numClaimRooms(room: Room): number {
        const claimRooms = MemoryApi.getClaimRooms(room);
        return claimRooms.length;
    }

    /**
     * get number of associated attack rooms
     * @param room
     */
    public static numAttackRooms(room: Room): number {
        const attackRooms = MemoryApi.getAttackRooms(room);
        return attackRooms.length;
    }

    /**
     * Returns the number of sources in a room
     * @param room The room to check
     */
    public static numSources(room: Room): number {
        return Memory.rooms[room.name].sources.data.length;
    }
    /**
     * Returns the number of sources in all remoteRooms connected to room
     * @param room The room to check the remoteRooms of
     */
    public static numRemoteSources(room: Room): number {
        const remoteRooms: RemoteRoomMemory[] = Memory.rooms[room.name].remoteRooms;
        let numSources: number = 0;

        _.forEach(remoteRooms, (rr: RemoteRoomMemory) => {

            if (!rr) {
                return;
            }

            const sourcesInRoom: number = rr.sources.data;
            numSources += sourcesInRoom;
        });
        return numSources;
    }

    /**
     * get number of remote defenders we need
     * @param room The room to check the dependencies of
     */
    public static numRemoteDefenders(room: Room): number {
        const remoteRooms: RemoteRoomMemory[] = Memory.rooms[room.name].remoteRooms;
        let numRemoteDefenders: number = 0;

        _.forEach(remoteRooms, (rr: RemoteRoomMemory) => {

            if (!rr) {
                return;
            }

            // If there are any hostile creeps, add one to remoteDefenderCount
            // Get hostile creeps in the remote room
            const hostileCreeps = rr.hostiles.data;
            if (hostileCreeps > 0) {
                numRemoteDefenders++;
            }
        });

        return numRemoteDefenders;
    }

    /**
     * get the number of claim rooms that have not yet been claimed
     * @param room the room we are checking for
     */
    public static numCurrentlyUnclaimedClaimRooms(room: Room): number {
        const allClaimRooms: Array<ClaimRoomMemory | undefined> = MemoryApi.getClaimRooms(room);
        const ownedRooms: Room[] = MemoryApi.getOwnedRooms();
        let sum: number = 0;

        // No existing claim rooms
        if (allClaimRooms[0] === undefined) {
            return 0;
        }
        for (const claimRoom of allClaimRooms) {
            if (!_.some(ownedRooms, (ownedRoom) => room.name === claimRoom!.roomName)) {
                ++sum;
            }
        }

        return sum;
    }
}
