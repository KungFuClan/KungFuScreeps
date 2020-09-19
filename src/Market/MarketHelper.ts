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
}
