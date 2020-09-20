import _ from "lodash";
import { UserException, ERROR_WARN } from "Utils/Imports/internals";
import { MarketManager } from "./MarketManager";

export class MarketHelper {
    /**
     * Get the name of the request to use as the property identifier
     * @param request The request to get the name of
     */
    public static getRequestName(request: MarketRequest) {
        return `${request.roomName}_${request.resourceType}`;
    }

    /**
     * Delete a request from memory
     * @param request The request to delete
     */
    public static deleteRequest(request: MarketRequest) {
        delete Memory.empire.market.requests[this.getRequestName(request)];
    }

    /**
     * Delete a request from memory if the market order is complete
     * @param request The request to delete
     */
    public static updateOrderStatus(request: MarketRequest) {
        if (request.status !== "pendingMarket") {
            throw new UserException(
                "MarketRequest Error",
                "Attempted to checkOrderStatus on a request that is not in pendingMarket status - " +
                    +this.getRequestName(request),
                ERROR_WARN
            );
        }

        let orders = _.filter(Game.market.orders, (order: Order) => {
            return order.roomName === request.roomName && order.resourceType === request.resourceType;
        });

        if (orders.length === 0) {
            throw new UserException(
                "MarketRequest Error",
                "Could not find the order for the MarketRequest - " + this.getRequestName(request),
                ERROR_WARN
            );
        }

        let newestOrder = _.max(orders, order => order.created).created;

        // Don't decide anything if the newest order is less than 5 ticks old, since the market lags behind
        if (Game.time - newestOrder <= 5) {
            return;
        }

        let amountLeftInOrder = orders.reduce((total: number, order: Order) => {
            return total + order.amount;
        }, 0);

        if (amountLeftInOrder === 0) {
            request.status = "complete";

            for (let order of orders) {
                Game.market.cancelOrder(order.id);
            }
        }
    }

    /**
     * Get the target sell price for a resource
     * @param resource The type of resource
     */
    public static getSellPrice(resource: ResourceConstant | MarketResourceConstant): number {
        // TODO Improve this algorithm, currently we get average for the day + 10%
        let targetAverage = Game.market.getHistory(resource as ResourceConstant)[13].avgPrice * 1.1;

        let bestBuyPrice = _.max(
            Game.market.getAllOrders(order => order.resourceType === resource && order.type === "buy"),
            order => order.price
        ).price;

        return Math.max(targetAverage, bestBuyPrice);
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

    /**
     * Update the amount of resources needed for a transfer request
     * @param request
     */
    public static updateTransferRequestAmount(request: MarketRequest): void {
        if (request.status !== "pendingTransfer") return;

        const terminal = Game.rooms[request.roomName].terminal;

        if (!terminal) return;

        const currentResourceAmount = terminal.store.getUsedCapacity(request.resourceType as ResourceConstant);

        if (request.requestType === "receive") {
            request.amount = MarketManager.MAX_ResourceLimits[request.resourceType]! - currentResourceAmount;
        } else if (request.requestType === "send") {
            request.amount = currentResourceAmount - MarketManager.MAX_ResourceLimits[request.resourceType]!;
        }

        if (request.amount < 0) {
            request.status = "complete";
        }
    }
}
