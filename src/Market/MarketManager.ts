import _ from "lodash";
import { MemoryApi_Room } from "Memory/Memory.Room.Api";
import { MemoryApi_Empire } from "Utils/Imports/internals";

interface MarketRequest {
    resourceType: MarketResourceConstant;
    resourceAmount: number;
    requestingRoom: string;
    maximumWaitTime: number;
    status: "complete" | "incomplete" | "pendingMarket" | "pendingTransfer";
}

export class MarketManager {
    public static runMarketManager() {
        // Temp code for testing market
        this.runTempCode();

        const ownedRooms = MemoryApi_Empire.getOwnedRooms();

        for (const room of ownedRooms) {
            this.createMarketRequests(room);
        }

        this.processMarketRequests();

        // For room in game.rooms / ownedRooms

        // Create Requests
        // This is where we will check if we are low on a resource, create a request for that resource
        // A request will have a
        // resourceType
        // amount
        // maximumWaitTime (ticks that decrement each cycle until we place a buy order)
        // status - complete ( needs to delete ), incomplete (failed to fill), pendingMarket (waiting for market to fill), pendingTransfer (waiting for room to fill before we place order)
        // We will also check if we have more than MAX_RESOURCE_AMOUNT and create a request to sell it (maxWaitTime will be the time before we place an order, in case another room requests that mineral)

        // Process Requests
        // We will decrement the maximumWaitTime in this method, each tick that a request is processed
        // This is where we will attempt to fill a request
        // If the request is to receive resource, we will look for a room that has between MIN_RESOURCE_AMOUNT and MAX_RESOURCE_AMOUNT and attempt to pull from that room
        // If the request is to sell a resource, we will check if the timer is <= 0, then create an order
    }

    /**
     * Create marketRequests for the room
     * @param room The room to create the request for
     */
    public static createMarketRequests(room: Room): void {
        if (!room.terminal) return;

        let termStore = room.terminal?.store;

        // TODO Check if termStore < establish amounts, create request for more
        // TODO Check if termStore > establish amounts, create request to sell
    }

    /**
     * Process all marketRequests
     */
    public static processMarketRequests(): void {
        // TODO get requests from memory
        const marketRequests: MarketRequest[] = [];

        for (const request of marketRequests) {
            // Decrement timer
            request.maximumWaitTime--;

            // Process request
        }
    }

    public static runTempCode() {
        const marketOrders = Game.market.getAllOrders((order: Order) => {
            if (
                (order.resourceType === RESOURCE_LEMERGIUM || order.resourceType === RESOURCE_OXYGEN) &&
                order.type === ORDER_BUY
            ) {
                return true;
            }
            return false;
        });

        const bestOrder = _.max(marketOrders, (order: Order) => order.price);

        if (bestOrder.price < Game.market.getHistory(bestOrder.resourceType as ResourceConstant)[13].avgPrice) {
            return;
        }

        // console.log(
        //     bestOrder.resourceType,
        //     bestOrder.amount,
        //     bestOrder.price,
        //     bestOrder.roomName,
        //     Game.market.calcTransactionCost(bestOrder.amount, bestOrder.roomName!, "W9N7")
        // );

        // Code to put in console to deal this order
        // console.log(`Game.market.deal("${bestOrder.id}", ${bestOrder.amount}, "W9N7")`);
    }

    /**
     * Returns the average price of the resource + the standard deviation
     * @param resourceType The resource to get the max price for
     */
    public static getMaxMarketPrice_Today(resourceType: ResourceConstant) {
        let historicalMarketData: PriceHistory = Game.market.getHistory(resourceType)[13];

        return historicalMarketData.avgPrice + historicalMarketData.stddevPrice;
    }

    /**
     * Returns the average price of the resource - the standard deviation
     * @param resourceType The resource to get the min price for
     */
    public static getMinMarketPrice_Today(resourceType: ResourceConstant) {
        let historicalMarketData: PriceHistory = Game.market.getHistory(resourceType)[13];

        return historicalMarketData.avgPrice - historicalMarketData.stddevPrice;
    }
}
