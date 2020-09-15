import {
    ROLE_MINER,
    ROLE_CLAIMER,
    ROLE_COLONIZER,
    ROLE_HARVESTER,
    ROLE_LORRY,
    ROLE_REMOTE_HARVESTER,
    ROLE_REMOTE_MINER,
    ROLE_REMOTE_RESERVER,
    ROLE_WORKER,
    ROLE_SCOUT,
    ROLE_MANAGER,
    ROLE_POWER_UPGRADER,
    OVERRIDE_D_ROOM_FLAG,
    STIMULATE_FLAG,
    ROOM_OVERLAY_GRAPH_ON,
    RoomVisualHelper,
    CreepAllHelper,
    TOWER_MIN_DAMAGE_THRESHOLD,
    TOWER_MAX_DAMAGE_THRESHOLD,
    RoomHelper_Structure,
    MemoryApi_Creep,
    MemoryApi_Room
} from "Utils/Imports/internals";
import _ from "lodash";

// Api for room visuals
export class RoomVisualApi {
    /**
     * draws the information that is empire wide (will be same for every room)
     * @param room the room we are displaying it in
     * @param x the x coord for the visual
     * @param y the y coord for the visual
     */
    public static createEmpireInfoVisual(room: Room, x: number, y: number): number {
        // Get all the information we will need to display in the box
        const usedCpu: number = Game.cpu.getUsed();
        const cpuLimit: number = Game.cpu["limit"];
        const bucket: number = Game.cpu["bucket"];
        const BUCKET_LIMIT: number = 10000;
        const gclProgress: number = Game.gcl["progress"];
        const gclTotal: number = Game.gcl["progressTotal"];

        const cpuPercent = Math.floor((usedCpu / cpuLimit) * 100 * 10) / 10;
        const bucketPercent = Math.floor((bucket / BUCKET_LIMIT) * 100 * 10) / 10;
        const gclPercent = Math.floor((gclProgress / gclTotal) * 100 * 10) / 10;

        // Draw the text
        const lines: string[] = [];
        lines.push("");
        lines.push("Empire Info");
        lines.push("");
        lines.push("CPU:   " + cpuPercent + "%");
        lines.push("BKT:   " + bucketPercent + "%");
        lines.push("GCL:   " + gclPercent + "%");
        lines.push("LVL:    " + Game.gcl["level"]);
        lines.push("");
        lines.push("Tick: " + Game.time);
        lines.push("Viewing:  [ " + room.name + " ]");
        RoomVisualHelper.multiLineText(lines, x, y, room.name, true);

        // Draw a box around the text
        new RoomVisual(room.name)
            .line(x - 1, y + lines.length - 1, x + 7.5, y + lines.length - 1) // bottom line
            .line(x - 1, y - 1, x + 7.5, y - 1) // top line
            .line(x - 1, y - 1, x - 1, y + lines.length - 1) // left line
            .line(x + 7.5, y - 1, x + 7.5, y + lines.length - 1); // right line

        // Return where the next box should start
        return y + lines.length;
    }

    /**
     * draws the information of creep limits and currently living members
     * @param room the room we are displaying it in
     * @param x the x coord for the visual
     * @param y the y coord for the visual
     */
    public static createCreepCountVisual(room: Room, x: number, y: number): number {
        // Get the info we need to display
        const creepsInRoom = MemoryApi_Creep.getMyCreeps(room.name);
        const creepLimits = MemoryApi_Room.getCreepLimits(room);
        const roles: StringMap = {
            miner: _.filter(creepsInRoom, (c: Creep) => c.memory.role === ROLE_MINER).length,
            harvester: _.filter(creepsInRoom, (c: Creep) => c.memory.role === ROLE_HARVESTER).length,
            worker: _.filter(creepsInRoom, (c: Creep) => c.memory.role === ROLE_WORKER).length,
            lorry: _.filter(creepsInRoom, (c: Creep) => c.memory.role === ROLE_LORRY).length,
            powerUpgrader: _.filter(creepsInRoom, (c: Creep) => c.memory.role === ROLE_POWER_UPGRADER).length,
            remoteMiner: _.filter(creepsInRoom, (c: Creep) => c.memory.role === ROLE_REMOTE_MINER).length,
            remoteReserver: _.filter(creepsInRoom, (c: Creep) => c.memory.role === ROLE_REMOTE_RESERVER).length,
            remoteHarvester: _.filter(creepsInRoom, (c: Creep) => c.memory.role === ROLE_REMOTE_HARVESTER).length,
            claimer: _.filter(creepsInRoom, (c: Creep) => c.memory.role === ROLE_CLAIMER).length,
            remoteColonizer: _.filter(creepsInRoom, (c: Creep) => c.memory.role === ROLE_COLONIZER).length,
            manager: _.filter(creepsInRoom, (c: Creep) => c.memory.role === ROLE_MANAGER).length,
            scout: _.filter(creepsInRoom, (c: Creep) => c.memory.role === ROLE_SCOUT).length
        };

        const lines: string[] = [];
        lines.push("");
        lines.push("Creep Info");
        lines.push("");

        const spawningCreepInfo: Spawning[] = [];

        _.forEach(Game.spawns, (spawn: StructureSpawn) => {
            if (spawn.room.name === room.name && spawn.spawning) {
                spawningCreepInfo.push(spawn.spawning)
            }
        });

        lines.push("Spawning:");
        for (const spawning of spawningCreepInfo) {
            const spawningRole = Game.creeps[spawning.name].memory.role;
            lines.push("   [ " + spawningRole + " ] (" + (spawning.needTime - spawning.remainingTime) + "/" + spawning.needTime + ")");
        }

        if (spawningCreepInfo.length === 0) {
            lines.push("   [ None ]");
        }

        lines.push("Creeps in Room:     " + MemoryApi_Room.getCreepCount(room));

        if (creepLimits["domesticLimits"]) {
            // Add creeps to the lines array
            if (creepLimits.domesticLimits.miner > 0) {
                lines.push("Miners:     " + roles[ROLE_MINER] + " / " + creepLimits.domesticLimits.miner);
            }
            if (creepLimits.domesticLimits.harvester > 0) {
                lines.push("Harvesters:     " + roles[ROLE_HARVESTER] + " / " + creepLimits.domesticLimits.harvester);
            }
            if (creepLimits.domesticLimits.worker > 0) {
                lines.push("Workers:     " + roles[ROLE_WORKER] + " / " + creepLimits.domesticLimits.worker);
            }
            if (creepLimits.domesticLimits.lorry > 0) {
                lines.push("Lorries:    " + roles[ROLE_LORRY] + " / " + creepLimits.domesticLimits.lorry);
            }
            if (creepLimits.domesticLimits.manager > 0) {
                lines.push("Managers:    " + roles[ROLE_MANAGER] + " / " + creepLimits.domesticLimits.manager);
            }
            if (creepLimits.domesticLimits.powerUpgrader > 0) {
                lines.push(
                    "Power Upgraders:    " +
                    roles[ROLE_POWER_UPGRADER] +
                    " / " +
                    creepLimits.domesticLimits.powerUpgrader
                );
            }
            if (creepLimits.domesticLimits.scout > 0) {
                lines.push("Scouts:    " + roles[ROLE_SCOUT] + " / " + creepLimits.domesticLimits.scout);
            }
        }

        if (creepLimits["remoteLimits"]) {
            if (creepLimits.remoteLimits.remoteMiner > 0) {
                lines.push(
                    "Remote Miners:      " + roles[ROLE_REMOTE_MINER] + " / " + creepLimits.remoteLimits.remoteMiner
                );
            }
            if (creepLimits.remoteLimits.remoteHarvester > 0) {
                lines.push(
                    "Remote Harvesters:    " +
                    roles[ROLE_REMOTE_HARVESTER] +
                    " / " +
                    creepLimits.remoteLimits.remoteHarvester
                );
            }
            if (creepLimits.remoteLimits.remoteReserver > 0) {
                lines.push(
                    "Remote Reservers:    " +
                    roles[ROLE_REMOTE_RESERVER] +
                    " / " +
                    creepLimits.remoteLimits.remoteReserver
                );
            }
            if (creepLimits.remoteLimits.remoteColonizer > 0) {
                lines.push(
                    "Remote Colonizers:    " + roles[ROLE_COLONIZER] + " / " + creepLimits.remoteLimits.remoteColonizer
                );
            }
            if (creepLimits.remoteLimits.claimer > 0) {
                lines.push("Claimers:       " + roles[ROLE_CLAIMER] + " / " + creepLimits.remoteLimits.claimer);
            }
        }

        lines.push("");
        RoomVisualHelper.multiLineText(lines, x, y, room.name, true);

        // Draw a box around the text
        new RoomVisual(room.name)
            .line(x - 1, y + lines.length - 1, x + 10, y + lines.length - 1) // bottom line
            .line(x - 1, y - 1, x + 10, y - 1) // top line
            .line(x - 1, y - 1, x - 1, y + lines.length - 1) // left line
            .line(x + 10, y - 1, x + 10, y + lines.length - 1); // right line

        // Return the end of this box
        return y + lines.length;
    }

    /**
     * draws the information of the room state
     * @param room the room we are displaying it in
     * @param x the x coord for the visual
     * @param y the y coord for the visual
     */
    public static createRoomInfoVisual(room: Room, x: number, y: number): number {
        // Get the info we need
        const roomState: string = RoomVisualHelper.convertRoomStateToString(room.memory.roomState!);
        const level: number = room.controller!.level;
        const controllerProgress: number = room.controller!.progress;
        const controllerTotal: number = room.controller!.progressTotal;
        const controllerPercent: number = Math.floor((controllerProgress / controllerTotal) * 100 * 10) / 10;
        const defconLevel: number = room.memory.defcon;

        // Draw the text
        const lines: string[] = [];
        lines.push("");
        lines.push("Room Info");
        lines.push("");
        lines.push("Room State:     " + roomState);
        lines.push("Room Level:     " + level);
        lines.push("Progress:         " + controllerPercent + "%");
        lines.push("DEFCON:         " + defconLevel);
        if (room.storage) {
            // Regex adds commas
            lines.push(
                "Storage:         " + room.storage.store.energy.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            );
        }
        if (room.terminal) {
            // Regex adds commas
            lines.push(
                "Terminal:       " + room.terminal.store.energy.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            );
        }
        // Adding this disclaimer, beacuse some of the information you need is actually calculated in the graph function
        // Consider decoupling these so you could use them independently
        if (ROOM_OVERLAY_GRAPH_ON) {
            lines.push("Est TTL:        " + RoomVisualHelper.getEstimatedTimeToNextLevel(room));
        }
        lines.push("");
        RoomVisualHelper.multiLineText(lines, x, y, room.name, true);

        // Draw a box around the text
        new RoomVisual(room.name)
            .line(x - 1, y + lines.length - 1, x + 10, y + lines.length - 1) // bottom line
            .line(x - 1, y - 1, x + 10, y - 1) // top line
            .line(x - 1, y - 1, x - 1, y + lines.length - 1) // left line
            .line(x + 10, y - 1, x + 10, y + lines.length - 1); // right line

        // Return where the next box should start
        return y + lines.length;
    }

    /**
     * draws the information for remote flags
     * @param room the room we are displaying it in
     * @param x the x coord for the visual
     * @param y the y coord for the visual
     */
    public static createRemoteFlagVisual(room: Room, x: number, y: number): number {
        const dependentRemoteRooms: Array<RemoteRoomMemory | undefined> = MemoryApi_Room.getRemoteRooms(room);

        // Draw the text
        const lines: string[] = [];
        lines.push("");
        lines.push("Remote Rooms ");
        lines.push("");
        for (const dr of dependentRemoteRooms) {
            if (!dr) {
                continue;
            }

            lines.push("Room:   [ " + dr!.roomName + " ] ");
            lines.push("");
        }

        // If no remote rooms, print none
        if (lines.length === 3) {
            lines.push("No Current Remote Rooms ");
            lines.push("");
        }
        RoomVisualHelper.multiLineText(lines, x, y, room.name, false);

        // Draw the box around the text
        // Draw a box around the text
        new RoomVisual(room.name)
            .line(x - 10, y + lines.length - 1, x + 0.25, y + lines.length - 1) // bottom line
            .line(x - 10, y - 1, x + 0.25, y - 1) // top line
            .line(x - 10, y - 1, x - 10, y + lines.length - 1) // left line
            .line(x + 0.25, y - 1, x + 0.25, y + lines.length - 1); // right line

        // Return where the next box should start
        return y + lines.length;
    }

    /**
     * draws the information for claim flags
     * @param room the room we are displaying it in
     * @param x the x coord for the visual
     * @param y the y coord for the visual
     */
    public static createClaimFlagVisual(room: Room, x: number, y: number): number {
        const dependentRemoteRooms: Array<ClaimRoomMemory | undefined> = MemoryApi_Room.getClaimRooms(room);

        // Draw the text
        const lines: string[] = [];
        lines.push("");
        lines.push("Claim Rooms ");
        lines.push("");
        for (const dr of dependentRemoteRooms) {
            if (!dr) {
                continue;
            }

            lines.push("Room:   [ " + dr!.roomName + " ] ");
            lines.push("");
        }

        // If no remote rooms, print none
        if (lines.length === 3) {
            lines.push("No Current Claim Rooms ");
            lines.push("");
        }
        RoomVisualHelper.multiLineText(lines, x, y, room.name, false);

        // Draw the box around the text
        // Draw a box around the text
        new RoomVisual(room.name)
            .line(x - 10, y + lines.length - 1, x + 0.25, y + lines.length - 1) // bottom line
            .line(x - 10, y - 1, x + 0.25, y - 1) // top line
            .line(x - 10, y - 1, x - 10, y + lines.length - 1) // left line
            .line(x + 0.25, y - 1, x + 0.25, y + lines.length - 1); // right line

        // Return where the next box should start
        return y + lines.length;
    }

    /**
     * draws the information for attack flags
     * @param room the room we are displaying it in
     * @param x the x coord for the visual
     * @param y the y coord for the visual
     */
    public static createAttackFlagVisual(room: Room, x: number, y: number): number {
        const dependentRemoteRooms: string[] = [];
        // Draw the text
        const lines: string[] = [];

        // If no remote rooms, print none
        if (lines.length === 3) {
            lines.push("Attack Rooms Offline ");
            lines.push("");
        }
        RoomVisualHelper.multiLineText(lines, x, y, room.name, false);

        // Draw the box around the text
        // Draw a box around the text
        new RoomVisual(room.name)
            .line(x - 10, y + lines.length - 1, x + 0.25, y + lines.length - 1) // bottom line
            .line(x - 10, y - 1, x + 0.25, y - 1) // top line
            .line(x - 10, y - 1, x - 10, y + lines.length - 1) // left line
            .line(x + 0.25, y - 1, x + 0.25, y + lines.length - 1); // right line

        // Return where the next box should start
        return y + lines.length;
    }

    /**
     * draws the information for option flags
     * @param room the room we are displaying it in
     * @param x the x coord for the visual
     * @param y the y coord for the visual
     */
    public static createOptionFlagVisual(room: Room, x: number, y: number): number {
        const allFlagsMemory: FlagMemory[] = _.map(Game.flags, (flag: Flag) => flag.memory);
        const optionFlags: FlagMemory[] = _.filter(
            allFlagsMemory,
            (flag: FlagMemory) => flag.flagType === OVERRIDE_D_ROOM_FLAG || flag.flagType === STIMULATE_FLAG
        );

        // Draw the text
        const lines: string[] = [];
        lines.push("");
        lines.push("Option Flags ");
        lines.push("");
        for (const optionFlag in optionFlags) {
            if (!optionFlags[optionFlag]) {
                continue;
            }

            lines.push("Flag:   [ " + optionFlags[optionFlag].flagName + " ] ");
            lines.push(
                "Type:   [ " + RoomVisualHelper.convertFlagTypeToString(optionFlags[optionFlag].flagType) + " ] "
            );
            lines.push("");
        }

        // If no remote rooms, print none
        if (lines.length === 3) {
            lines.push("No Current Option Flags ");
            lines.push("");
        }
        RoomVisualHelper.multiLineText(lines, x, y, room.name, false);

        // Draw the box around the text
        new RoomVisual(room.name)
            .line(x - 10, y + lines.length - 1, x + 0.25, y + lines.length - 1) // bottom line
            .line(x - 10, y - 1, x + 0.25, y - 1) // top line
            .line(x - 10, y - 1, x - 10, y + lines.length - 1) // left line
            .line(x + 0.25, y - 1, x + 0.25, y + lines.length - 1); // right line

        // Return where the next box should start
        return y + lines.length;
    }

    /**
     *
     * @param room the room we are creating the visual for
     * @param x the x value for the starting point of the graph
     * @param y the y value for the starting point of the graph
     */
    public static createUpgradeGraphVisual(room: Room, x: number, y: number): void {
        const textColor = "#bab8ba";
        const X_VALS: GraphTickMarkMemory[] = [
            { start: x, end: x + 3 }, // 0
            { start: x + 3, end: x + 6 }, // 1
            { start: x + 6, end: x + 9 }, // 2
            { start: x + 9, end: x + 12 }, // 3
            { start: x + 12, end: x + 15 } // 4
        ];
        const Y_SCALE = 7.5;
        const X_SCALE = 15;
        const secondsPerTick: number = RoomVisualHelper.getSecondsPerTick(room);
        const ticksPerHour: number = Math.floor(3600 / secondsPerTick);
        const avgControlPointsPerTick: number = RoomVisualHelper.getAverageControlPointsPerTick(25, room);
        const controlPointsPerHourEstimate: number = avgControlPointsPerTick * ticksPerHour;

        // Make sure visual memory exists
        if (!Memory.rooms[room.name].visual) {
            Memory.rooms[room.name].visual = {
                avgControlPointsPerHourArray: [],
                controllerProgressArray: [],
                time: 0,
                secondsPerTick: 0,
                room: {},
                etaMemory: { rcl: room.controller!.level, avgPointsPerTick: 0, ticksMeasured: 0 }
            };
        }

        const avgControlPointsPerHourSize: number = Memory.rooms[room.name].visual!.avgControlPointsPerHourArray.length;
        if (avgControlPointsPerHourSize < 5) {
            Memory.rooms[room.name].visual!.avgControlPointsPerHourArray.push(controlPointsPerHourEstimate);
        } else {
            for (let i = 0; i < avgControlPointsPerHourSize - 1; ++i) {
                Memory.rooms[room.name].visual!.avgControlPointsPerHourArray[i] = Memory.rooms[
                    room.name
                ].visual!.avgControlPointsPerHourArray[i + 1];
            }
            Memory.rooms[room.name].visual!.avgControlPointsPerHourArray[
                avgControlPointsPerHourSize - 1
            ] = controlPointsPerHourEstimate;
        }

        // Collect values and functions needed to draw the lines on the graph
        const minVal: number = _.min(Memory.rooms[room.name].visual!.avgControlPointsPerHourArray);
        const maxVal: number = _.max(Memory.rooms[room.name].visual!.avgControlPointsPerHourArray);
        const minRange: number = minVal * 0.75;
        const maxRange: number = maxVal * 1.25;
        const getY2Coord = (raw: number) => {
            const range: number = maxRange - minRange;
            const offset: number = raw - minRange;
            const percentage: number = offset / range;
            return percentage * Y_SCALE;
        };

        // Get the scale for the graph
        const displayMinRange: string = RoomVisualHelper.convertRangeToDisplayVal(minRange).toString();
        const displayMaxRange: string = RoomVisualHelper.convertRangeToDisplayVal(maxRange).toString();

        // Draw the graph outline and the scale text
        new RoomVisual(room.name)
            .line(x, y, x, y - Y_SCALE) // bottom line
            .line(x, y, x + X_SCALE, y) // left line
            .line(X_VALS[1].start, y - 0.25, X_VALS[1].start, y + 0.25) // tick marks
            .line(X_VALS[2].start, y - 0.25, X_VALS[2].start, y + 0.25)
            .line(X_VALS[3].start, y - 0.25, X_VALS[3].start, y + 0.25)
            .line(X_VALS[4].start, y - 0.25, X_VALS[4].start, y + 0.25)
            .text(displayMaxRange, x - 2.2, y - Y_SCALE + 0.5, {
                align: "left",
                color: textColor,
                opacity: 0.8,
                font: " .7 Trebuchet MS"
            })
            .text(displayMinRange, x - 2.2, y, {
                align: "left",
                color: textColor,
                opacity: 0.8,
                font: " .7 Trebuchet MS"
            });

        // Draw the lines for the graph
        let startCoord: number = 0;
        let endCoord: number = 0;
        for (let i = 0; i < avgControlPointsPerHourSize; ++i) {
            // Set the initial previous and next coordinate (first line will always be flat)
            if (i === 0) {
                startCoord = getY2Coord(Memory.rooms[room.name].visual!.avgControlPointsPerHourArray[i]);
                endCoord = startCoord;
            }
            endCoord = getY2Coord(Memory.rooms[room.name].visual!.avgControlPointsPerHourArray[i]);
            new RoomVisual(room.name)
                .line(X_VALS[i].start, y - startCoord, X_VALS[i].end, y - endCoord)
                .circle(X_VALS[i].end, y - endCoord);

            startCoord = endCoord;
        }
    }

    /**
     * display messages and handle managing the data structure that holds him
     * @param room the room we are creating the visual for
     * @param x the x value for the visual
     * @param y the y value for the visual
     */
    public static createMessageBoxVisual(room: Room, x: number, y: number): number {
        // Make sure the message structure exists in memory
        if (!Memory.empire.alertMessages) {
            Memory.empire.alertMessages = [];
        }

        // Draw the title
        const lines: string[] = [];
        lines.push("");
        lines.push("Alerts ");
        lines.push("");

        // Remove expired messages and add valid messages to the lines array
        const newArray: AlertMessageNode[] = [];
        let largestMessage: number = 0;
        for (const i in Memory.empire.alertMessages) {
            const messageNode: AlertMessageNode = Memory.empire.alertMessages[i];
            const currentTick: number = Game.time;

            if (!(currentTick - messageNode.tickCreated >= messageNode.expirationLimit)) {
                newArray.push(messageNode);
                lines.push(messageNode.message);
                lines.push("");
                largestMessage =
                    largestMessage < messageNode.message.length ? messageNode.message.length : largestMessage;
            }
        }
        Memory.empire.alertMessages = newArray;

        // If no remote rooms, print none
        if (lines.length === 3) {
            lines.push("No Current Alerts ");
            lines.push("");
        }
        RoomVisualHelper.multiLineText(lines, x, y, room.name, false);

        // Draw the box around the text
        largestMessage = largestMessage / 2.5 < 10 ? 10 : largestMessage / 2.5;
        new RoomVisual(room.name)
            .line(x - largestMessage, y + lines.length - 1, x + 0.25, y + lines.length - 1) // bottom line
            .line(x - largestMessage, y - 1, x + 0.25, y - 1) // top line
            .line(x - largestMessage, y - 1, x - largestMessage, y + lines.length - 1) // left line
            .line(x + 0.25, y - 1, x + 0.25, y + lines.length - 1); // right line

        // Return where the next box should start
        return y + lines.length;
    }

    /**
     * Creates an overlay that shows tower damage on each tile in the room. For debug purposes only
     */
    public static debug_towerDamageOverlay_perTile(room: Room) {
        if (Memory.debug === undefined) {
            Memory.debug = {};
        }

        // Skip filling array if it has already been done
        if (Memory.debug.towerDebug === undefined) {
            Memory.debug.towerDebug = new Array(50);

            const towers = MemoryApi_Room.getStructureOfType(room.name, STRUCTURE_TOWER);

            for (let x = 0; x < 50; x++) {
                Memory.debug.towerDebug[x] = new Array(50);

                for (let y = 0; y < 50; y++) {
                    Memory.debug.towerDebug[x][y] = 0;
                    _.forEach(towers, (tower: StructureTower) => {
                        const distance = tower.pos.getRangeTo(x, y);
                        Memory.debug.towerDebug[x][y] += RoomHelper_Structure.getTowerDamageAtRange(distance, 15, false);
                    });
                }
            }
        }

        // Damage array should be populated at this point

        const roomVisual = new RoomVisual(room.name);

        for (let x = 0; x < 50; x++) {
            if (x % 2 === 0) {
                continue;
            }

            for (let y = 0; y < 50; y++) {
                if (y % 2 === 0) {
                    continue;
                }

                if (Memory.debug.towerDebug[x][y] > 0) {
                    roomVisual.text(Memory.debug.towerDebug[x][y], x, y, { font: 0.75, color: "#00ff00" });
                } else {
                    roomVisual.text(Memory.debug.towerDebug[x][y], x, y, { font: 0.75, color: "#ff0000" });
                }
            }
        }
    }

    /**
     * Creates an overlay on hostile creeps that shows the amount of damage we will do to them and whether we will fire
     */
    public static debug_towerDamageOverlay_perCreep(room: Room): void {
        // All hostiles
        const hostileCreeps = MemoryApi_Creep.getHostileCreeps(room.name);

        // Quit early if no creeps
        if (hostileCreeps.length === 0) {
            return;
        }

        // Take out creeps with heal parts
        const healCreeps = _.remove(hostileCreeps, (c: Creep) => CreepAllHelper.bodyPartExists(c, HEAL));

        // Take out creeps that can attack
        const attackCreeps = _.remove(hostileCreeps, (c: Creep) =>
            CreepAllHelper.bodyPartExists(c, ATTACK, RANGED_ATTACK)
        );

        // rename for clarity, all creeps leftover should be civilian
        // TODO Make a case for work part / claim part creeps?
        const civilianCreeps = hostileCreeps;

        // All towers in the room
        // const towers = MemoryApi_Room.getStructureOfType(room.name, STRUCTURE_TOWER, (tower: StructureTower) => tower.store[RESOURCE_ENERGY] > 0);
        const towers = MemoryApi_Room.getStructureOfType(
            room.name,
            STRUCTURE_TOWER,
            (tower: StructureTower) => tower.energy > 0
        ) as StructureTower[];

        const creepHealData = RoomHelper_Structure.getCreepsAvailableHealing(healCreeps, attackCreeps);

        // Damage array should be populated at this point

        const roomVisual = new RoomVisual(room.name);

        for (const data of creepHealData) {
            const distance = RoomHelper_Structure.getAverageDistanceToTarget(towers, data.creep);
            const damage = RoomHelper_Structure.getTowerDamageAtRange(distance);

            const netDamage = damage - data.healAmount;

            // If greater than the min damage and we shot last tick, or greater than max damage regardless of shooting last tick
            if (
                (netDamage >= TOWER_MIN_DAMAGE_THRESHOLD && room.memory.shotLastTick === true) ||
                netDamage >= TOWER_MAX_DAMAGE_THRESHOLD
            ) {
                roomVisual.text((damage - data.healAmount).toString(), data.creep.pos.x, data.creep.pos.y, {
                    font: 0.75,
                    color: "#00ff00"
                });
            } else {
                roomVisual.text((damage - data.healAmount).toString(), data.creep.pos.x, data.creep.pos.y, {
                    font: 0.75,
                    color: "#ff0000"
                });
            }
        }
    }
}
