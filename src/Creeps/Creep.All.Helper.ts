import { UserException, Normalize } from "Utils/Imports/internals";
import _ from "lodash";

// helper function for creeps
export class CreepAllHelper {

    /**
     * Check if the targetPosition is the destination of the creep's current move target
     * @target The target object or roomposition to move to
     * @range [Optional] The range to stop at from the target
     */
    public static isTargetCurrentDestination(creep: Creep, target: object, range = 0): boolean {
        if (creep.memory._move === undefined) {
            return false;
        }

        let targetPosition: RoomPosition;

        if (target.hasOwnProperty("pos") || target instanceof RoomPosition) {
            targetPosition = Normalize.roomPos(target as _HasRoomPosition | RoomPosition);
        } else {
            throw new UserException(
                "Error in targetIsCurrentDestination",
                "Creep [" +
                creep.name +
                "] tried to check if targetIsCurrentDestination on a target with no pos property. \n Target: [" +
                JSON.stringify(target) +
                "]",
                ERROR_ERROR
            );
        }

        const currentDestination = creep.memory._move.dest;

        // Check if curr_dest = targetPosition
        if (currentDestination.roomName !== targetPosition.roomName) {
            return false;
        }

        const distanceApart =
            Math.abs(currentDestination.x - targetPosition.x) + Math.abs(currentDestination.y - targetPosition.y);
        // Return true if distance from currentDestination to targetPosition is within the allowed range (default is 0, exact match)
        return distanceApart <= range;
    }

    /**
     * Gets creep.memory.supplementary.moveTargetID, or falls back to creep.memory.job.
     * @param creep the creep we are getting target for
     * @param job the job we are getting move target for
     */
    public static getMoveTarget(creep: Creep, job: BaseJob): RoomObject | RoomPosition | null {
        // Get target to move to, using supplementary.moveTargetID if available, job.targetID if not.
        if (creep.memory.supplementary && creep.memory.supplementary.moveTargetID) {
            return Game.getObjectById(creep.memory.supplementary.moveTargetID);
        } else if (creep.memory.job && creep.memory.job.targetType === "roomName") {
            // Patch a bug where the creep was for some reason getting an undefined room as the target
            // TODO hunt down real reason this is occuring, and remove this patch?
            // Note: adding this in seemed to have "restarted" the scout so it was successful
            if (!creep.memory.job.targetID) {
                return new RoomPosition(25, 25, creep.memory.homeRoom);
            }
            return new RoomPosition(25, 25, creep.memory.job.targetID);
        } else if (creep.memory.job && creep.memory.job.targetType === "roomPosition") {
            // TODO Handle parsing a string into a roomPosition object here
            // what the hell is line 125 lmfao. Also is this done? If not explain further
            const x = 25;
            const y = 25;
            const roomName = "X##Y##";
            return new RoomPosition(x, y, roomName);
        } else {
            return Game.getObjectById(job.targetID);
        }
    }

    /**
     * check if the body part exists on the creep
     * @param creep the creep we are checking
     * @param part the body part we are checking
     */
    public static bodyPartExists(creep: Creep, bodyPart: BodyPartConstant, bodyPart2?: BodyPartConstant): boolean {
        return _.some(creep.body, (part: BodyPartDefinition) => part.type === bodyPart || part.type === bodyPart2);
    }
}
