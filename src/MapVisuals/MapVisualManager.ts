import { fill } from "lodash";
import { RoomHelper_Structure } from "Utils/Imports/internals";

export class MapVisualManager {
    /**
     * Run the map visual manager
     */
    public static runMapVisualManager(): void {
        // How often to regenerate map visuals
        const visualPersistTime = 100;
        // How often to render the map visuals
        const visualRenderTime = 1;

        if (Game.time % visualPersistTime === 0) {
            this.highlightSeenRooms(1000);
            Memory.mapVisualData = Game.map.visual.export();
        }

        if (Game.time % visualRenderTime === 0 && Memory.mapVisualData !== undefined) {
            Game.map.visual.import(Memory.mapVisualData);
        }
    }

    /**
     * Colors rooms seen (empire.movementData) in the last numTicks ticks.
     * @param numTicks The number of ticks back to highlight
     */
    public static highlightSeenRooms(numTicks: number): void {
        const movementData = Memory.empire.movementData;

        const displayElements: Array<Array<string>> = [[], [], [], [], []];

        for (let roomName in movementData) {
            const dataAge = Game.time - movementData[roomName].lastSeen;

            if (dataAge <= numTicks) {
                const topleftPos = new RoomPosition(0, 0, roomName);

                // Oldest - Red
                let opacity: number = 0.5;
                let fill: string;

                if (dataAge < numTicks * 0.75 && dataAge > numTicks * 0.5) {
                    fill = "#FF9633";
                    displayElements[0].push(`<p style="color: ${fill}">${roomName}</p>`);
                } else if (dataAge < numTicks * 0.5 && dataAge > numTicks * 0.25) {
                    fill = "#FFE333";
                    displayElements[1].push(`<p style="color: ${fill}">${roomName}</p>`);
                } else if (dataAge < numTicks * 0.25) {
                    fill = "#9CFF33";
                    displayElements[2].push(`<p style="color: ${fill}">${roomName}</p>`);
                } else {
                    fill = "#FF5733";
                    displayElements[3].push(`<p style="color: ${fill}">${roomName}</p>`);
                }

                const style: MapPolyStyle = {
                    fill,
                    opacity
                };
                Game.map.visual.rect(topleftPos, 50, 50, style);
            } else {
                let fill = "#800080";
                displayElements[4].push(`<p style="color: ${fill}">${roomName}</p>`);
            }
        }

        // console.log(`<p style="color: #800080 ">${numTicks}+ ${displayElements[4].length}</p>`);
        // console.log(`<p style="color: #FF5733 ">${numTicks * 0.75} ${displayElements[0].length}</p>`);
        // console.log(`<p style="color: #FF9633 ">${numTicks * 0.5} ${displayElements[1].length}</p>`);
        // console.log(`<p style="color: #FFE333 ">${numTicks * 0.25} ${displayElements[2].length}</p>`);
        // console.log(`<p style="color: #9CFF33 ">${numTicks * 0} ${displayElements[3].length}</p>`);
    }
}
