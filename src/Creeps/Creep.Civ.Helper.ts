import { CONTROLLER_SIGNING_TEXT, UserException, ROLE_HARVESTER, ROLE_MINER, MemoryApi_Room } from "Utils/Imports/internals";

export class CreepCivHelper {

    /**
     * get the mining container for a specific job
     * @param job the job we are getting the mining container from
     * @param room the room we are checking in
     * @param isSource if we nee the mining contrainer for a source
     */
    public static getMiningContainer(
        job: GetEnergyJob | undefined,
        room: Room,
        isSource: boolean
    ): StructureContainer | undefined {
        if (!job) {
            throw new UserException(
                "Job is undefined",
                "Job is undefined for room " + room.name + ". Can't get the mining container of an undefined job.",
                ERROR_WARN
            );
        }

        let sourceTarget: Source | Mineral | null = Game.getObjectById(job.targetID);
        if (isSource) {
            sourceTarget = sourceTarget as Source;
        } else {
            sourceTarget = sourceTarget as Mineral;
        }

        if (!sourceTarget) {
            throw new UserException("Source null in getMiningContainer", "room: " + room.name, ERROR_WARN);
        }

        // Get containers and find the closest one to the source
        const containers: StructureContainer[] = MemoryApi_Room.getStructureOfType(
            room.name,
            STRUCTURE_CONTAINER
        ) as StructureContainer[];

        const closestContainer = sourceTarget.pos.findClosestByRange(containers);

        if (!closestContainer) {
            return undefined;
        } else {
            // If we have a container, but its not next to the source, its not the correct container
            if (sourceTarget.pos.isNearTo(closestContainer)) {
                return closestContainer;
            }
            return undefined;
        }
    }

    /**
     * Get the text to sign a controller with
     */
    public static getSigningText(): string {
        // Find a random index in the array of messages and choose that
        const MIN = 0;
        const MAX = CONTROLLER_SIGNING_TEXT.length - 1;
        const numberOfMessages: number = Math.floor(Math.random() * (+MAX - +MIN)) + +MIN;
        return CONTROLLER_SIGNING_TEXT[numberOfMessages];
    }

    /**
     * Get the function to pass to decide on what allows us to get a container job
     * @param room the room we are in
     * @param creep the creep we are deciding for
     */
    public static getContainerJobFilterFunction(room: Room, creep: Creep): (job: GetEnergyJob) => boolean {
        const normalCaseContainerQualifier: (job: GetEnergyJob) => boolean = (cJob: GetEnergyJob) => !cJob.isTaken && cJob.resources!.energy >= creep.store.getCapacity();
        const harvesterNeedsEnergyNowQualifier: (job: GetEnergyJob) => boolean = (cJob: GetEnergyJob) => !cJob.isTaken;
        // Only applies in the case of a harvester, so break early if we can
        if (creep.memory.role !== ROLE_HARVESTER) {
            return normalCaseContainerQualifier;
        }
        const numMiners: number = MemoryApi_Room.getCreepCount(room, ROLE_MINER);
        const minerLimit: number = room.memory.creepLimit!['domesticLimits'].miner;
        return numMiners < minerLimit ? harvesterNeedsEnergyNowQualifier : normalCaseContainerQualifier;
    }
}
