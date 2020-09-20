import _ from "lodash";
import { MemoryApi_Room } from "Memory/Memory.Room.Api";
import { send } from "process";
import { MemoryApi_Empire, UserException } from "Utils/Imports/internals";
import { Mem } from "Utils/MemHack";
import { MarketHelper } from "./MarketHelper";

const defaultWaitTime = 500;

export class MarketManager {
    // ! Only the resources listed in these constants will be processed in requests
    public static MIN_ResourceLimits: { [key in MarketResourceConstant]?: number } = {
        L: 10001,
        O: 10001,
        X: 5001,
        H: 10001,
        K: 10001
    };

    public static MAX_ResourceLimits: { [key in MarketResourceConstant]?: number } = {
        L: 20000,
        O: 20000,
        X: 10000,
        H: 20000,
        K: 20000
    };
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

        let trackedResources: MarketResourceConstant[] = Object.keys(
            this.MIN_ResourceLimits
        ) as MarketResourceConstant[];

        for (let resource of trackedResources) {
            // TODO Handle subscription tokens
            if (resource === SUBSCRIPTION_TOKEN) {
                continue;
            }

            // Don't regenerate an existing request
            if (Memory.empire.market.requests[`${room.name}_${resource}`] !== undefined) {
                continue;
            }

            let resourceAmount = termStore.getUsedCapacity(resource);

            let request: MarketRequest | undefined;

            // Handle less than minimum resource amount
            if (resourceAmount < this.MIN_ResourceLimits[resource]!) {
                request = {
                    roomName: room.name,
                    resourceType: resource,
                    amount: this.MAX_ResourceLimits[resource]! - resourceAmount,
                    maxWaitRemaining: defaultWaitTime,
                    requestType: "receive",
                    status: "pendingTransfer"
                };
            }

            // Handle more than maximum resource amount
            if (resourceAmount > this.MAX_ResourceLimits[resource]!) {
                request = {
                    roomName: room.name,
                    resourceType: resource,
                    amount: resourceAmount - this.MAX_ResourceLimits[resource]!,
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

            // Update the amount on transfer requests before we go through the status check cyle
            // This catches rooms that have recently acquired resources independently, so that they do not receive extra.
            MarketHelper.updateTransferRequestAmount(request);

            if (request.status === "complete" || request.status === "incomplete") {
                MarketHelper.deleteRequest(request);
                continue;
            }

            if (request.status === "pendingMarket") {
                MarketHelper.updateOrderStatus(request);
                continue;
            }

            // Handle pendingTransfer
            if (request.requestType === "receive") {
                if (request.maxWaitRemaining <= 0) {
                    // TODO Buy minerals here
                    continue;
                }

                this.fillFromOwnedTerminals(request);
            } else if (request.requestType === "send") {
                // Sending to other terminals is handled on the receive side while the CD is > 0
                if (request.maxWaitRemaining > 0) continue;

                if (this.sellExtraMinerals(request)) continue;
            }
        }
    }

    /**
     * Sell the minerals in the send request,
     * @param request
     */
    public static sellExtraMinerals(request: MarketRequest): boolean {
        let targetPrice = MarketHelper.getSellPrice(request.resourceType);

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
        }

        return false;
    }

    /**
     * Transfer resources to fill a receive request from a terminal with a send request
     * @param request The request to fill
     */
    public static fillFromOwnedTerminals(request: MarketRequest): boolean {
        // Find all send requests that match the resourceType using a custom method below
        const sendingRequests = MarketHelper.getSendingRequests(request.resourceType);

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
        }

        if (request.amount <= 0) {
            request.status = "complete";
        }

        if (targetRequest.amount <= 0) {
            targetRequest.status = "complete";
        }

        return result === OK;
    }
}
