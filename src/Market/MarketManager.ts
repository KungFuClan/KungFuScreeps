import _ from "lodash";
import { MemoryApi_Room } from "Memory/Memory.Room.Api";
import { send } from "process";
import { MemoryApi_Empire, UserException } from "Utils/Imports/internals";
import { Mem } from "Utils/MemHack";
import { MarketHelper } from "./MarketHelper";

// ! Only the resources listed in these constants will be processed in requests
const MIN_ResourceLimits: { [key in MarketResourceConstant]?: number } = {
    L: 10000,
    O: 10000,
    X: 5000,
    H: 10000,
    K: 10000
};

const MAX_ResourceLimits: { [key in MarketResourceConstant]?: number } = {
    L: 20000,
    O: 20000,
    X: 10000,
    H: 20000,
    K: 20000
};

const defaultWaitTime = 500;

export class MarketManager {
    /**
     * Run the Market Manager for the empire
     */
    public static runMarketManager() {
        if (!Memory.empire.market) {
            Memory.empire.market = {
                priceData: {},
                requests: {}
            };
        }

        const ownedRooms = MemoryApi_Empire.getOwnedRooms();
        for (const room of ownedRooms) {
            this.createMarketRequests(room);
        }

        this.processMarketRequests();
    }

    /**
     * Create marketRequests for the room
     * @param room The room to create the request for
     */
    public static createMarketRequests(room: Room): void {
        if (!room.terminal) return;

        let termStore = room.terminal?.store;

        let trackedResources: MarketResourceConstant[] = Object.keys(MIN_ResourceLimits) as MarketResourceConstant[];

        for (let resource of trackedResources) {
            // TODO Handle subscription tokens
            if (resource === SUBSCRIPTION_TOKEN) {
                return;
            }

            // Don't regenerate an existing request that still has time remaining
            if (Memory.empire.market.requests[`${room.name}_${resource}`] !== undefined) {
                return;
            }

            let resourceAmount = termStore.getUsedCapacity(resource);

            let request: MarketRequest | undefined;

            // Handle less than minimum resource amount
            if (resourceAmount < MIN_ResourceLimits[resource]!) {
                request = {
                    roomName: room.name,
                    resourceType: resource,
                    amount: MIN_ResourceLimits[resource]! - resourceAmount,
                    maxWaitRemaining: defaultWaitTime,
                    requestType: "receive",
                    status: "pendingTransfer"
                };
            }

            // Handle more than maximum resource amount
            if (resourceAmount > MAX_ResourceLimits[resource]!) {
                request = {
                    roomName: room.name,
                    resourceType: resource,
                    amount: resourceAmount - MAX_ResourceLimits[resource]!,
                    maxWaitRemaining: defaultWaitTime,
                    requestType: "send",
                    status: "pendingTransfer"
                };
            }

            if (request !== undefined) {
                Memory.empire.market.requests[`${room.name}_${resource}`] = request;
            }
        }
    }

    /**
     * Process all marketRequests
     */
    public static processMarketRequests(): void {
        const marketRequests = Memory.empire.market.requests;

        for (const requestIndex in marketRequests) {
            const request = marketRequests[requestIndex];
            // Decrement timer - allowed negative
            request.maxWaitRemaining--;

            if (request.requestType === "receive") {
                if (this.fillFromOwnedTerminals(request)) continue;
            } else if (request.requestType === "send") {
                // Sending to other terminals is handled on the receive side while the CD is > 0
                if (request.maxWaitRemaining > 0) continue;

                // TODO Check here if the order is in pendingMarket phase, and if so remove the request once the minerals have sold
                if (request.status === "pendingMarket") continue;

                if (this.sellExtraMinerals(request)) continue;
            }
        }
    }

    /**
     * Sell the minerals in the send request,
     * @param request
     */
    public static sellExtraMinerals(request: MarketRequest): boolean {
        // TODO Improve this algorithm, currently we get average for the day + 25%
        let targetPrice = Game.market.getHistory(request.resourceType as ResourceConstant)[13].avgPrice * 1.25;

        let result = Game.market.createOrder({
            type: "sell",
            resourceType: request.resourceType,
            price: targetPrice,
            totalAmount: request.amount,
            roomName: request.roomName
        });

        if (result === OK) {
            request.status = "pendingMarket";
            return true;
        } else {
            console.log(MarketHelper.getRequestName(request) + " " + result);
        }

        return false;
    }

    /**
     * Transfer resources to fill a receive request from a terminal with a send request
     * @param request The request to fill
     */
    public static fillFromOwnedTerminals(request: MarketRequest): boolean {
        // Find all send requests that match the resourceType using a custom method below
        const sendingRequests = this.getSendingRequests(request.resourceType);

        if (sendingRequests.length === 0) {
            return false;
        }

        // TODO find a better targeting algorithm
        const targetRequest = _.max(sendingRequests, request => request.amount);
        const targetTerminal = Game.rooms[targetRequest.roomName].terminal;

        if (targetTerminal === undefined) {
            delete Memory.empire.market.requests[MarketHelper.getRequestName(request)];
            return false;
        }

        let amountToSend = targetRequest.amount < request.amount ? targetRequest.amount : request.amount;

        // Send the resources from the target send request to the receive request
        let result = targetTerminal.send(
            request.resourceType as ResourceConstant,
            amountToSend,
            request.roomName,
            MarketHelper.getRequestName(request)
        );

        // If successful, reduce the amount left in each job
        if (result === OK) {
            request.amount -= amountToSend;
            targetRequest.amount -= amountToSend;

            if (request.amount <= 0) {
                MarketHelper.deleteRequest(request);
            }

            if (targetRequest.amount <= 0) {
                MarketHelper.deleteRequest(targetRequest);
            }

            return true;
        }

        return false;
    }

    /**
     * Get requests that are sending the resource
     * @param resource The type of resource to find requests for
     */
    public static getSendingRequests(resource: MarketResourceConstant): MarketRequest[] {
        const marketRequests = _.filter(
            Memory.empire.market.requests,
            (request: MarketRequest) =>
                request.requestType === "send" &&
                request.resourceType === resource &&
                request.status === "pendingTransfer"
        );

        return marketRequests;
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

        console.log(
            bestOrder.resourceType,
            bestOrder.amount,
            bestOrder.price,
            bestOrder.roomName,
            Game.market.calcTransactionCost(bestOrder.amount, bestOrder.roomName!, "W9N7")
        );

        // Code to put in console to deal this order
        console.log(`Game.market.deal("${bestOrder.id}", ${bestOrder.amount}, "W9N7")`);
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
