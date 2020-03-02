import { ERROR_ERROR, UserException, SpawnHelper, SpawnApi, MemoryApi_Empire, Military_Spawn_Api } from "Utils/Imports/internals";
import { profile } from "Profiler";

// handles spawning for every room
@profile
export class SpawnManager {
    /**
     * run the spawning for the AI for each room
     */
    public static runSpawnManager(): void {
        const ownedRooms = MemoryApi_Empire.getOwnedRooms();

        // Loop over all rooms and run the spawn for each one
        for (const room of ownedRooms) {
            this.runSpawnForRoom(room);
        }
    }

    /**
     * run spawn ai for a specific room
     * @param room the room we are running spawn for
     */
    private static runSpawnForRoom(room: Room): void {
        const openSpawn: StructureSpawn | null = SpawnApi.getOpenSpawn(room);

        // if we don't have an open spawn, return early
        if (openSpawn === null) {
            return;
        }

        // If we have a spawn, generate creep limits for the room
        SpawnApi.setCreepLimits(room);
        Military_Spawn_Api.requestDomesticDefenders(room.name);
        Military_Spawn_Api.requestRemoteDefenders(room.name);

        // If we are spawning a creep this tick, continue from here
        const nextCreepToSpawn: RoleConstant | MilitaryQueue | null = SpawnApi.getNextCreep(room, openSpawn);
        if (!nextCreepToSpawn) {
            return;
        }

        // Make sure we have the proper variable based on what the next creep to spawn returns, role constant or military queue
        const nextCreepRoleName: RoleConstant = SpawnApi.isMilitaryQueue(nextCreepToSpawn) ? nextCreepToSpawn.role : nextCreepToSpawn;
        const roomTier: TierConstant = SpawnApi.getTier(room, nextCreepRoleName);
        const creepBody: BodyPartConstant[] = SpawnApi.generateCreepBody(roomTier, nextCreepRoleName, room);
        const bodyEnergyCost: number = SpawnApi.getEnergyCostOfBody(creepBody);
        if (room.energyAvailable < bodyEnergyCost) {
            return;
        }

        // Basic info about a creep required to spawn it
        const roomState: RoomStateConstant = room.memory.roomState!;
        const name: string = SpawnHelper.generateCreepName(nextCreepRoleName, roomTier, room);
        const homeRoom: string = SpawnApi.getCreepHomeRoom(room, nextCreepRoleName);
        const targetRoom: string = SpawnApi.getCreepTargetRoom(room, nextCreepRoleName, creepBody, name);
        const spawnDirection: DirectionConstant[] = SpawnApi.getSpawnDirection(nextCreepRoleName, room, openSpawn);

        // Get the options for the creep, handling military if need be
        const militarySquadOptions: StringMap = SpawnApi.generateSquadOptions(room, nextCreepToSpawn);
        const creepOptions: CreepOptionsCiv | CreepOptionsMili | undefined = SpawnApi.generateCreepOptions(
            nextCreepRoleName,
            roomState,
            militarySquadOptions
        );

        // If anything in the spawn came out unexpectedly, throw an error
        if (targetRoom === "" || homeRoom === "" || !creepOptions || bodyEnergyCost > room.energyCapacityAvailable) {
            throw new UserException(
                "Failure in Spawn Manager for [ " + name + " ]",
                "Role: [ " +
                nextCreepToSpawn +
                " ]\n" +
                "homeRoom: [ " +
                homeRoom +
                " ]\n" +
                "targetRoom: [ " +
                targetRoom +
                " ]\n" +
                "creepOptions: [ " +
                JSON.stringify(creepOptions) +
                " ]\n" +
                "Cost: " + bodyEnergyCost + ". \nAvailable: " + room.energyCapacityAvailable + ".",
                ERROR_ERROR
            );
        }

        // Spawn the creep, handling military if needed
        if (
            SpawnApi.spawnNextCreep(
                room,
                creepBody,
                creepOptions,
                nextCreepRoleName,
                openSpawn!,
                homeRoom,
                targetRoom,
                name,
                spawnDirection
            ) === OK
        ) {
            SpawnApi.handleMilitaryCreepSpawnSuccess(
                nextCreepRoleName,
                militarySquadOptions['operationUUID'],
                militarySquadOptions['squadUUID'],
                room,
                name
            );
        }
    }
}
