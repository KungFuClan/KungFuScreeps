import {
    ROLE_MINER,
    ROLE_HARVESTER,
    ROLE_WORKER,
    ROLE_POWER_UPGRADER,
    ROLE_LORRY,
    ROLE_REMOTE_MINER,
    ROLE_REMOTE_HARVESTER,
    ROLE_REMOTE_RESERVER,
    ROLE_CLAIMER,
    ROLE_SCOUT,
    ROLE_COLONIZER,
    ROOM_STATE_UPGRADER,
    ROLE_MANAGER,
    SpawnHelper,
    STORAGE_ADDITIONAL_WORKER_THRESHOLD,
    STORAGE_ADDITIONAL_UPGRADER_THRESHOLD,
    SpawnApi,
    MemoryApi_Room,
    ROLE_MINERAL_MINER,
    RoomHelper_State,
} from "Utils/Imports/internals";
import _ from "lodash";

export class UpgraderStateCreepLimits implements ICreepSpawnLimits {
    public roomState: RoomStateConstant = ROOM_STATE_UPGRADER;

    constructor() {
        const self = this;
        self.generateDomesticLimits = self.generateDomesticLimits.bind(self);
        self.generateRemoteLimits = self.generateRemoteLimits.bind(self);
    }

    /**
     * generate the domestic limits for the room
     * @param room the room we are setting the limits for
     */
    public generateDomesticLimits(room: Room): DomesticCreepLimits {
        const domesticLimits: DomesticCreepLimits = {
            miner: 0,
            harvester: 0,
            worker: 0,
            powerUpgrader: 0,
            lorry: 0,
            scout: 0,
            mineralMiner: 0,
            manager: 0
        };

        const numLorries: number = SpawnHelper.getLorryLimitForRoom(room, room.memory.roomState!);
        const minerLimits: number = MemoryApi_Room.getSources(room.name).length;
        let numWorkers: number = 1;
        let numPowerUpgraders: number = 1;
        const numHarvesters = 2 + SpawnHelper.getNumExtraHarvesters(room);

        // Get the number of work parts for the worker to decide if we need an extra worker in the room
        const roomTier: TierConstant = SpawnApi.getTier(room, ROLE_WORKER);
        const creepBody: BodyPartConstant[] = SpawnApi.generateCreepBody(roomTier, ROLE_WORKER, room);
        const numWorkParts: number = _.filter(creepBody, (p: BodyPartConstant) => p === WORK).length;
        const needExtraWorker: boolean = SpawnHelper.needExtraWorkerUpgrader(room, numWorkParts);
        const currentLevel: number = room.controller!.level;

        // If we have more than 100k energy in storage, we want another worker to help whittle it down
        if (
            room.storage &&
            room.storage!.store[RESOURCE_ENERGY] > STORAGE_ADDITIONAL_WORKER_THRESHOLD &&
            needExtraWorker
        ) {
            numWorkers++;
        }
        // If we have more than 300k energy in storage, get another power ugprader out to help with that
        if (room.storage && room.storage!.store[RESOURCE_ENERGY] > STORAGE_ADDITIONAL_UPGRADER_THRESHOLD && currentLevel < 8) {
            numPowerUpgraders++;
        }
        // If we have a fair amount of construction sites in the room, pump out some extra workers
        numWorkers = SpawnHelper.getWorkerLimitForConstructionHelper(numWorkers, room);

        // Generate Limits --------
        domesticLimits[ROLE_MINER] = minerLimits;
        domesticLimits[ROLE_MINERAL_MINER] = SpawnHelper.getMineralMinerSpawnLimit(room);;
        domesticLimits[ROLE_HARVESTER] = numHarvesters;
        domesticLimits[ROLE_WORKER] = numWorkers;
        domesticLimits[ROLE_POWER_UPGRADER] = numPowerUpgraders;
        domesticLimits[ROLE_LORRY] = numLorries;
        domesticLimits[ROLE_MANAGER] = 1;
        domesticLimits[ROLE_SCOUT] = SpawnHelper.getScoutSpawnLimit(room);

        return domesticLimits;
    }

    /**
     * generate the remote limits for the room
     * @param room the room we are setting the limits for
     */
    public generateRemoteLimits(room: Room): RemoteCreepLimits {
        const remoteLimits: RemoteCreepLimits = {
            remoteMiner: 0,
            remoteHarvester: 0,
            remoteReserver: 0,
            remoteColonizer: 0,
            claimer: 0
        };

        const numRemoteRooms: number = RoomHelper_State.numRemoteRooms(room);
        const numClaimRooms: number = RoomHelper_State.numClaimRooms(room);
        // If we do not have any remote rooms, return the initial remote limits (Empty)
        if (numRemoteRooms <= 0 && numClaimRooms <= 0) {
            return remoteLimits;
        }
        // Gather the rest of the data only if we have a remote room or a claim room
        const numRemoteSources: number = RoomHelper_State.numRemoteSources(room);
        const numCurrentlyUnclaimedClaimRooms: number = RoomHelper_State.numCurrentlyUnclaimedClaimRooms(room);

        // Generate Limits -----
        remoteLimits[ROLE_REMOTE_MINER] = SpawnHelper.getLimitPerRemoteRoomForRolePerSource(
            ROLE_REMOTE_MINER,
            numRemoteSources
        );
        remoteLimits[ROLE_REMOTE_HARVESTER] = SpawnHelper.getLimitPerRemoteRoomForRolePerSource(
            ROLE_REMOTE_HARVESTER,
            numRemoteSources
        );
        remoteLimits[ROLE_REMOTE_RESERVER] = SpawnHelper.getRemoteReserverLimitForRoom(room);
        remoteLimits[ROLE_COLONIZER] = numClaimRooms * SpawnHelper.getLimitPerClaimRoomForRole(ROLE_COLONIZER);
        remoteLimits[ROLE_CLAIMER] = numCurrentlyUnclaimedClaimRooms * SpawnHelper.getLimitPerClaimRoomForRole(ROLE_CLAIMER);

        return remoteLimits;
    }
}
