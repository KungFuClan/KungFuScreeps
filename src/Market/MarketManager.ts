import _ from "lodash";

export class MarketManager {
    public static runMarketManager() {
        const marketOrders = Game.market.getAllOrders((order: Order) => {
            if (order.resourceType === RESOURCE_LEMERGIUM && order.type === ORDER_BUY) {
                return true;
            }
            return false;
        });

        const bestOrder = _.max(marketOrders, (order: Order) => order.price);

        if (bestOrder.price < 0.01) {
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
}
