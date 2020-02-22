import {
    SQUAD_MANAGERS,
    UserException,
    ERROR_ERROR,
    EmpireHelper,
    MemoryApi_Room,
    MemoryApi_Military,
    OP_STRATEGY_NONE,
    DOMESTIC_DEFENDER_MAN,
    SpawnApi,
    REMOTE_DEFENDER_MAN,
    SOLO_ZEALOT_MAN,
    OP_STRATEGY_INVADER
} from "Utils/Imports/internals";

export class Military_Spawn_Api {
    /**
     * Create an instance of a squad manager
     * @param managerType the manager constant of the instance we want to create
     * @param targetRoom the room we want to commence the operation in
     * @param operationUUID the operation uuid
     * @param operationStrategy [Optional] defaults to none, the operation override constant for the operation
     */
    public static createSquadInstance(
        managerType: SquadManagerConstant,
        targetRoom: string,
        operationUUID: string,
        operationStrategy: OpStrategyConstant = OP_STRATEGY_NONE
    ): void {
        // Find the implementation of the squad instance denoted by the manager type, error if none found
        const managerImplementation: ISquadManager | undefined = MemoryApi_Military.getSingletonSquadManager(
            managerType
        );
        const squadInstance: ISquadManager = managerImplementation.createInstance(targetRoom, operationUUID);

        // Check for existing instance
        // If none, create new operation and push onto memory, If existing, push instance onto it
        let operation: MilitaryOperation | undefined = MemoryApi_Military.getOperationByUUID(operationUUID);
        if (!operation) {
            const squadData: SquadData = {};
            squadData[squadInstance.squadUUID] = squadInstance;

            operation = {
                squads: squadData,
                operationUUID,
                operationStrategy
            };

            Memory.empire.militaryOperations[operationUUID] = operation;
        } else {
            // Loop over military operations, and find a match to push the squad instance onto it
            Memory.empire.militaryOperations[operationUUID].operationStrategy = operationStrategy;
            Memory.empire.militaryOperations[operationUUID].squads[squadInstance.squadUUID] = squadInstance;
        }

        // Add the squad operation to the dependent room's spawn queue
        const squadUUID: string = squadInstance.squadUUID;
        const squadArray: SquadDefinition[] = squadInstance.getSquadArray();
        const tickToSpawn: number = Game.time;
        const priority: number = squadInstance.getSpawnPriority();
        this.addSquadToSpawnQueue(squadUUID, operationUUID, squadArray, targetRoom, tickToSpawn, priority);
    }

    /**
     * Add the squad to the spawn
     * @param squadUUID the squad uuid to reference
     * @param operationUUID the operation uuid to reference
     * @param squadArray the role constant array
     * @param targetRoom the room we are doing the operation in
     * @param tickToSpawn the tick we want to start spawning on the squad
     * @param priority the spawn priority of the bepso
     */
    public static addSquadToSpawnQueue(
        squadUUID: string,
        operationUUID: string,
        squadArray: SquadDefinition[],
        targetRoom: string,
        tickToSpawn: number,
        priority: number
    ): void {
        const dependentRoom: string = EmpireHelper.findDependentRoom(targetRoom);
        if (!Memory.rooms[dependentRoom].creepLimit?.militaryQueue) {
            MemoryApi_Room.initCreepLimits(Game.rooms[dependentRoom]);
        }

        // For each member of the squad, create a queue object and add to the dependent room's military queue
        for (const i in squadArray) {
            const role: SquadDefinition = squadArray[i];
            const queue: MilitaryQueue = {
                priority,
                tickToSpawn,
                operationUUID,
                squadUUID,
                role: role.role,
                caravanPos: role.caravanPos
            };
            Memory.rooms[dependentRoom].creepLimit!.militaryQueue.push(queue);
        }
    }

    /**
     * Create a military instance to defend our owned rooms
     * @param roomName the room we are checking
     */
    public static requestDomesticDefenders(roomName: string): void {
        const defcon: number = Memory.rooms[roomName]?.defcon;
        if (!defcon || defcon < 4) {
            return;
        }

        // If we already have an operation defending the room, don't create another one
        const existingOperation: MilitaryOperation | undefined = this.getOperationTargetingRoom(roomName);
        if (existingOperation) {
            return;
        }

        // 1 defender for a light seige, 3 for a heavy seige (can adjust these as needed)
        const operationUUID: string = SpawnApi.generateSquadUUID(roomName);
        if (defcon === 4) {
            Military_Spawn_Api.createSquadInstance(DOMESTIC_DEFENDER_MAN, roomName, operationUUID);
        }
        else if (defcon === 5) {
            Military_Spawn_Api.createSquadInstance(DOMESTIC_DEFENDER_MAN, roomName, operationUUID);
            Military_Spawn_Api.createSquadInstance(DOMESTIC_DEFENDER_MAN, roomName, operationUUID);
            Military_Spawn_Api.createSquadInstance(DOMESTIC_DEFENDER_MAN, roomName, operationUUID);
        }

    }

    /**
     * Create a military instance to defend our remote rooms
     * @param roomName the room we are checking
     */
    public static requestRemoteDefenders(roomName: string): void {
        const room: Room = Game.rooms[roomName];
        const remoteRooms: RemoteRoomMemory[] = MemoryApi_Room.getRemoteRooms(room, (rr: RemoteRoomMemory) => Memory.rooms[rr.roomName].defcon >= 2);
        if (remoteRooms.length === 0) {
            return;
        }

        remoteRooms.forEach((remoteRoom: RemoteRoomMemory) => {
            
            // If we already have an operation defending the room, don't create another one
            const existingOperation: MilitaryOperation | undefined = this.getOperationTargetingRoom(remoteRoom.roomName);
            if (existingOperation) {
                return;
            }
            const operationUUID: string = SpawnApi.generateSquadUUID(remoteRoom.roomName);
            const currentMemory: RoomMemory = Memory.rooms[remoteRoom.roomName];
            if (currentMemory.hostileStructures.data[STRUCTURE_INVADER_CORE].length > 0) {
                Military_Spawn_Api.createSquadInstance(SOLO_ZEALOT_MAN, remoteRoom.roomName, operationUUID, OP_STRATEGY_INVADER);
                return;
            }

            Military_Spawn_Api.createSquadInstance(REMOTE_DEFENDER_MAN, remoteRoom.roomName, operationUUID);
        });
    }

    /**
     * Get an operation that has a squad targeting the requested room
     * @param roomName
     * @returns operation targeting that room
     */
    public static getOperationTargetingRoom(roomName: string): MilitaryOperation | undefined {
        for (const i in Memory.empire.militaryOperations) {
            const operation: MilitaryOperation = Memory.empire.militaryOperations[i];
            for (const j in operation.squads) {
                const squad: ISquadManager = operation.squads[j];
                if (squad.targetRoom === roomName) {
                    return operation;
                }
            }
        }
        return undefined;
    }
}
