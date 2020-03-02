import { RoomHelper_Structure, RoomHelper_State } from "Utils/Imports/internals";

export class MemoryApi_Empire {
    /**
     * get all owned rooms
     * @param filterFunction [Optional] a filter function for the rooms
     * @returns Room[] array of rooms
     */
    public static getOwnedRooms(filterFunction?: (room: Room) => boolean): Room[] {
        if (filterFunction) {
            return _.filter(Game.rooms, currentRoom => RoomHelper_State.isMyRoom(currentRoom) && filterFunction);
        }
        return _.filter(Game.rooms, currentRoom => RoomHelper_State.isMyRoom(currentRoom));
    }

    /**
     * get all flags as an array
     * @param filterFunction [Optional] a function to filter the flags out
     * @returns Flag[] an array of all flags
     */
    public static getAllFlags(filterFunction?: (flag: Flag) => boolean): Flag[] {
        const allFlags: Flag[] = Object.keys(Game.flags).map(function (flagIndex) {
            return Game.flags[flagIndex];
        });

        // Apply filter function if it exists, otherwise just return all flags
        if (filterFunction) {
            return _.filter(allFlags, filterFunction);
        }
        return allFlags;
    }

    /**
     * create a message node to display as an alert
     * @param message the message you want displayed
     * @param expirationLimit the time you want it to be displayed for
     */
    public static createEmpireAlertNode(displayMessage: string, limit: number): void {
        if (!Memory.empire.alertMessages) {
            Memory.empire.alertMessages = [];
        }
        const messageNode: AlertMessageNode = {
            message: displayMessage,
            tickCreated: Game.time,
            expirationLimit: limit
        };
        Memory.empire.alertMessages.push(messageNode);
    }

}
