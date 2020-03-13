import { ROLE_SCOUT, CreepAllApi, PathfindingApi, UserException, MOVEMENT_CACHE_TTL } from "Utils/Imports/internals";

export class ScoutCreepManager implements ICivCreepRoleManager {
    public name: RoleConstant = ROLE_SCOUT;

    constructor() {
        const self = this;
        self.getNewJob = self.getNewJob.bind(this);
        self.handleNewJob = self.handleNewJob.bind(this);
        self.runCreepRole = self.runCreepRole.bind(this);
    }

    /**
     * get a job for the miner creep
     * @param creep
     * @param room
     */
    public getNewJob(creep: Creep): MovePartJob | undefined {
        const newTargetRoom = this.getNewTargetRoom(creep);
        const newMovePartJob: MovePartJob = {
            jobType: "movePartJob",
            targetType: "roomName",
            targetID: newTargetRoom,
            actionType: "move",
            isTaken: false
        };

        return newMovePartJob;
    }

    /**
     * Choose a new target room for the scout creep
     * @param creep
     */
    public getNewTargetRoom(creep: Creep): string {
        // Set up empire memory if not done yet
        // PathfindingApi.initializeEmpireMovementMemory();

        // get the exits for this room
        const exits = Game.map.describeExits(creep.room.name);
        if (exits === null) {
            throw new UserException(
                "Error in getNewJob for Scout.",
                "describeExits returned null, so the room could not be found.",
                ERROR_ERROR
            );
        }

        // Had a bug when I first pulled this in, this was undefined
        // Defining it by default to avoid that bug
        // Should fine a new room once it finds its already in the home room, so no issue
        let newTargetRoom: string = creep.memory.homeRoom;

        // Loop through exits
        for (const i in exits) {
            const roomName = exits[i as ExitKey]!;
            // If it exists in memory
            if (Memory.empire.movementData![roomName]) {
                // If we have not seen it in the last MOVEMENT_CACHE_TTL ticks, then we can check again
                if (Memory.empire.movementData![roomName].lastSeen <= Game.time - MOVEMENT_CACHE_TTL) {
                    return newTargetRoom = roomName;
                } // Room is too recent, so skip it
                else {
                    continue;
                }
            } // If it does not exist in memory, target it.
            else {
                return newTargetRoom = roomName;
            }
        }

        // If we do not have a target, then we have explored all possiblities previously
        // So we choose a random room
        const randomInt: number = Math.floor(Math.random() * Object.keys(exits).length);
        // Keys are 1 3 5 7, possible values of randomInt = 0 1 2 3;
        const randomDirection = ((randomInt * 2) + 1).toString() as ExitKey;
        newTargetRoom = exits[randomDirection]!;
        return newTargetRoom;
    }
    /**
     * Handle initalizing a new job
     * @param creep the creep we are using
     * @param room the room we are in
     */
    public handleNewJob(creep: Creep, room: Room): void {
        // Nothing to update on scouts
        return;
    }

    /**
     * Run Scout Creep
     */
    public runCreepRole(creep: Creep): void {
        // Get new job if we don't have one
        if (creep.memory.job === undefined) {
            creep.memory.job = this.getNewJob(creep);
            if (creep.memory.job === undefined) {
                return;
            }
        }

        // Move to the target room. If we are already in the room, this ensures that we update the room data,
        //     if we are not in the room yet, then it will just move in that direction.
        CreepAllApi.travelTo(creep, creep.memory.job);

        // If creep is in the target room
        if (creep.room.name === creep.memory.job.targetID) {
            // Delete creep job so that it will get a new job next tick
            delete creep.memory.job;
        }
    }
}
