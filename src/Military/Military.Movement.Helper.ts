import { stringify, parse } from "querystring";
import {
    PathfindingApi,
    ROOM_STATUS_UNKNOWN,
    ROOM_STATUS_HOSTILE,
    ROOM_STATUS_HOSTILE_REMOTE,
    RoomApi_State,
    UserException,
    RoomManager,
    ERROR_INFO,
    ERROR_ERROR
} from "Utils/Imports/internals";

export class MilitaryMovement_Helper {
    /**
     * Returns a roomPosition that will be the target rally position
     * @param fromRoomName Starting room name
     * @param targetRoomName Target room name
     * @param avoidedRoomTypes An array of RoomStatusTypes to block from using in the path
     * @param preferredRoomTypes An array of RoomStatusTypes to prefer using in the path
     * @returns RoomPosition The position to path to when rallying
     */
    public static chooseRallyLocation(fromRoomName: string, targetRoomName: string, rallyOpts: RallyOpts): RoomPosition {
        const routeToRoom = Game.map.findRoute(fromRoomName, targetRoomName, {
            routeCallback(roomName, fromRoomName) {
                const roomStatus = PathfindingApi.retrieveRoomStatus(roomName);

                // Avoid rooms that have been blocked from use
                if (rallyOpts.avoidedRoomTypes && roomStatus in rallyOpts.avoidedRoomTypes) {
                    return Infinity;
                }

                // Set rooms that have not been marked as prefer with a cost of 2.5
                if (rallyOpts.preferredRoomTypes && !(roomStatus in rallyOpts.preferredRoomTypes)) {
                    return 2.5; // Will walk through 2.5 preferred rooms before using this room
                }

                // All preferred rooms (or all rooms if none preferred) set to cost of 1
                return 1;
            }
        });

        if (routeToRoom === ERR_NO_PATH) {
            throw new UserException(
                "Could not find a rally point",
                "Game.map.findRoute failed to return a path from " + fromRoomName + " to " + targetRoomName,
                ERROR_ERROR
            );
        }

        let rallyPosition: RoomPosition | undefined;
        let currentRoomName: string;

        // Loop from the targetRoom to the beginning room
        for (let i = routeToRoom.length - 1; i >= 0; i++) {
            // Using the room and exit direction, find the current room we are looking at
            currentRoomName = this.getRoomInDirection(routeToRoom[i].room, routeToRoom[i].exit);

            // Skip the target room if we are not allowed to rally in the targetRoom
            if (!rallyOpts.rallyInTargetRoom && currentRoomName === targetRoomName) {
                continue;
            }

            // TODO Check if the current room is elegible to rally in
            // * Might include the check above in this method, and create some options to allow selection

            // If we are allowed to rally in this room, get an open position near the exit to the next room
            rallyPosition = this.getOpenPositionNearExit(currentRoomName, routeToRoom[i].exit);

            if (rallyPosition !== undefined) {
                break;
            }
        }

        // If still undefined get a position near the exit to the starting room of the path
        if (rallyPosition === undefined) {
            rallyPosition = this.getOpenPositionNearExit(fromRoomName, routeToRoom[0].exit);
        }

        // Error out if still no rally position
        if (rallyPosition === undefined) {
            throw new UserException(
                "Error in chooseRallyLocation",
                "Could not find a suitable area to rally, even inside of the creeps current room.",
                ERROR_INFO
            );
        }

        return rallyPosition;
    }

    /**
     * Returns an open position near the exit to the next room, as given by the findRoute path object
     * @param PathInfo The part of a result of a Game.map.findRoute that we will use to find an open position near the exit
     */
    public static getOpenPositionNearExit(roomName: string, exit: ExitConstant): RoomPosition | undefined {
        // Get Terrain object and search for an open area, at least 3x3 and choose the rally point as the top-center
        const terrain = new Room.Terrain(roomName);

        // Only one of these will be defined - gets the exit row number based on the exit direction
        let exitX = exit === FIND_EXIT_LEFT ? 0 : exit === FIND_EXIT_RIGHT ? 49 : undefined;
        let exitY = exit === FIND_EXIT_TOP ? 0 : exit === FIND_EXIT_BOTTOM ? 49 : undefined;

        let exitRange = this.getOpenTilesInRow(roomName, exitX, exitY);

        // Get roughly the middle of the array to try for the center exit tile
        let exitPositionIndex: number = exitRange.length / 2;

        // TODO make this more dynamic to find a larger open area
        let xOffset = exit === FIND_EXIT_LEFT ? 1 : exit === FIND_EXIT_RIGHT ? -1 : 0;
        let yOffset = exit === FIND_EXIT_TOP ? -1 : exit === FIND_EXIT_BOTTOM ? 1 : 0;

        return new RoomPosition(
            exitRange[exitPositionIndex].x + xOffset,
            exitRange[exitPositionIndex].y + yOffset,
            roomName
        );
    }

    /**
     * Gets a list of the non-wall tiles in a row of a room.
     * @param roomName Name of the room to search in
     * @param xRow The x-axis row to search (if this is provided, yRow cannot be, but one of the two must be provided.)
     * @param yRow The y-axis row to search (if this is provided, xRow cannot be, but one of the two must be provided.)
     */
    public static getOpenTilesInRow(roomName: string, xRow?: number, yRow?: number): RoomPosition[] {
        if ((xRow === undefined && yRow === undefined) || (xRow !== undefined && yRow !== undefined)) {
            throw new UserException(
                "Invalid arguments for getOpenTilesInRow()",
                "Either xRow or yRow should be defined, but not both.",
                ERROR_INFO
            );
        }

        const terrain = new Room.Terrain(roomName);

        const openTiles: RoomPosition[] = [];

        for (let i = 0; i < 50; i++) {
            if (xRow !== undefined) {
                if (terrain.get(xRow, i) !== TERRAIN_MASK_WALL) {
                    openTiles.push(new RoomPosition(xRow, i, roomName));
                }
            } else if (yRow !== undefined) {
                if (terrain.get(i, yRow) !== TERRAIN_MASK_WALL) {
                    openTiles.push(new RoomPosition(i, yRow, roomName));
                }
            }
        }

        return openTiles;
    }

    /**
     * Given a baseRoom, get the name of the room on the other side of the exit
     * @param roomName The base room to offset from
     * @param exit The direction to get the next room
     */
    public static getRoomInDirection(roomName: string, exit: ExitConstant): string {
        const parsedName: RegExpExecArray | null = /^([WE])([0-9]+)([NS])([0-9]+)$/.exec(roomName);

        if (parsedName === null) {
            throw new UserException(
                "Error in getRoomInDirection",
                "Received an incorrect string for roomName, and could not parse the regex.",
                ERROR_ERROR
            );
        }

        if (exit === FIND_EXIT_TOP) {
            return parsedName[3] === "N" ? this.offsetRoomName(roomName, 0, -1) : this.offsetRoomName(roomName, 0, 1);
        } else if (exit === FIND_EXIT_BOTTOM) {
            return parsedName[3] === "N" ? this.offsetRoomName(roomName, 0, 1) : this.offsetRoomName(roomName, 0, -1);
        } else if (exit === FIND_EXIT_LEFT) {
            return parsedName[1] === "W" ? this.offsetRoomName(roomName, -1, 0) : this.offsetRoomName(roomName, 1, 0);
        } else {
            // FIND_EXIT_RIGHT
            return parsedName[1] === "W" ? this.offsetRoomName(roomName, 1, 0) : this.offsetRoomName(roomName, -1, 0);
        }
    }

    /**
     * Given a baseRoom, get the roomname offset by x/y. e.g. W9N10 offset (1, 2) = W10N12
     * @param roomName The base room to offset from
     * @param xOffset The East/West offset - Accepts positive or negative
     * @param yOffset The North/South offset - Accepts positive or negative
     */
    public static offsetRoomName(roomName: string, xOffset: number, yOffset: number): string {
        const parsedName: RegExpExecArray | null = /^([WE])([0-9]+)([NS])([0-9]+)$/.exec(roomName);

        if (parsedName === null) {
            throw new UserException(
                "Error in offsetRoomName",
                "Received an incorrect string for roomName, and could not parse the regex.",
                ERROR_ERROR
            );
        }

        const adjustedName: Array<string | number> = [];
        adjustedName[0] = parsedName[1] as string;
        adjustedName[1] = parseInt(parsedName[2], 10) + xOffset;
        adjustedName[2] = parsedName[3];
        adjustedName[3] = parseInt(parsedName[4], 10) + yOffset;

        // If x went negative, switch directions and make it positive
        if (adjustedName[1] < 0) {
            adjustedName[1] = adjustedName[1] * -1;
            adjustedName[0] = parsedName[1] === "W" ? "E" : "W";
        }

        // If y went negative, switch directions and make it positive
        if (adjustedName[3] < 0) {
            adjustedName[3] = adjustedName[3] * -1;
            adjustedName[2] = parsedName[3] === "N" ? "S" : "N";
        }

        return adjustedName[0].concat(adjustedName[1].toString(), adjustedName[2], adjustedName[3].toString());
    }
}
