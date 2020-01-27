import { UserException, SOLO_STALKER_MAN, SpawnApi } from "Utils/Imports/internals";

export class SoloStalkerSquadManager implements ISquadManager {
    public name: SquadManagerConstant = SOLO_STALKER_MAN;
    public creeps: Creep[] = [];
    public targetRoom: string = "";
    public squadUUID: number = 0;
    public operationUUID: number = 0;

    constructor() {
        const self = this;
        self.runSquad = self.runSquad.bind(this);
        self.createInstance = self.createInstance.bind(this);
        self.removeInstance = self.removeInstance.bind(this);
        self.checkStatus = self.checkStatus.bind(this);
        self.creeps = [];
    }

    /**
     * Run the squad manager
     */
    public runSquad(): void {

    }

    /**
     * Create an instance and place into the empire memory
     * @param targetRoom the room we are attacking
     */
    public createInstance(targetRoom: string, operationUUID: number): SoloStalkerSquadManager {
        const uuid: number = SpawnApi.generateSquadUUID();
        const instance = new SoloStalkerSquadManager();
        instance.squadUUID = uuid;
        instance.targetRoom = targetRoom;
        instance.operationUUID = operationUUID;
        return instance;
    }

    /**
     * Add a creep to the class
     * @param creep the creep we are adding to the squad
     */
    public addCreep(creep: Creep): void {
        this.creeps.push(creep);
    }

    /**
     * Remove this instance from the empire memory
     */
    public removeInstance(): void {

    }

    /**
     * Check the status of the squad
     * @returns boolean representing the squads current status
     */
    public checkStatus(): boolean {
        return true;
    }

}