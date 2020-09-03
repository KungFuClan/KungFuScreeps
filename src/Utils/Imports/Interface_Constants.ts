import {
    CarryPartJobs,
    ClaimPartJobs,
    GetEnergyJobs,
    MovePartJobs,
    WorkPartJobs,
    MinerCreepManager,
    HarvesterCreepManager,
    WorkerCreepManager,
    LorryCreepManager,
    MineralMinerCreepManager,
    PowerUpgraderCreepManager,
    RemoteMinerCreepManager,
    RemoteHarvesterCreepManager,
    RemoteReserverCreepManager,
    RemoteColonizerCreepManager,
    ClaimerCreepManager,
    ScoutCreepManager,
    MinerBodyOptsHelper,
    HarvesterBodyOptsHelper,
    WorkerBodyOptsHelper,
    LorryBodyOptsHelper,
    ManagerBodyOptsHelper,
    ManagerCreepManager,
    MineralMinerBodyOptsHelper,
    PowerUpgraderBodyOptsHelper,
    RemoteMinerBodyOptsHelper,
    RemoteHarvesterBodyOptsHelper,
    RemoteReserverBodyOptsHelper,
    RemoteColonizerBodyOptsHelper,
    ClaimerBodyOptsHelper,
    ZealotBodyOptsHelper,
    StalkerBodyOptsHelper,
    MedicBodyOptsHelper,
    ScoutBodyOptsHelper,
    IntroStateCreepLimits,
    BeginnerStateCreepLimits,
    IntermediateStateCreepLimits,
    AdvancedStateCreepLimits,
    UpgraderStateCreepLimits,
    StimulateStateCreepLimits,
    NukeStateCreepLimits,
    ProcessDefaultAttackFlag,
    ProcessDefaultClaimRoom,
    ProcessDefaultRemoteRoom,
    ProcessDefaultStimulateFlag,
    ProcessDependentRoomOverride,
    TowerDrainerTankBodyOptsHelper,
    SoloStalkerSquadManager,
    SoloZealotSquadManager,
    TowerDrainerSquadManager,
    StandardSquadManager,
    RemoteDefenderSquadManager,
    DomesticDefenderSquadManager
} from "Utils/Imports/internals";
import { GetNonEnergyJobs } from "Jobs/GetNonEnergyJobs";

// tslint:disable-next-line: interface-name
export interface ICreepSpawnLimits {
    roomState: RoomStateConstant;
    generateRemoteLimits: (room: Room) => RemoteCreepLimits;
    generateDomesticLimits: (room: Room) => DomesticCreepLimits;
}

// Constant containing the manager for each job, which all implement doWork & travelTo
export const JobTypes: IJobTypeHelper[] = [
    new CarryPartJobs(),
    new ClaimPartJobs(),
    new GetEnergyJobs(),
    new GetNonEnergyJobs(),
    new MovePartJobs(),
    new WorkPartJobs()
];

// Constant containing the manager for each role, which all implement runRole
export const CREEP_CIV_MANAGERS: ICivCreepRoleManager[] = [
    new MinerCreepManager(),
    new HarvesterCreepManager(),
    new WorkerCreepManager(),
    new LorryCreepManager(),
    new MineralMinerCreepManager(),
    new PowerUpgraderCreepManager(),
    new RemoteMinerCreepManager(),
    new RemoteHarvesterCreepManager(),
    new ManagerCreepManager(),
    new RemoteReserverCreepManager(),
    new RemoteColonizerCreepManager(),
    new ClaimerCreepManager(),
    new ScoutCreepManager()
];

// Constant containing the body and options helper for a creep, which implement these helper functions
export const CREEP_BODY_OPT_HELPERS: ICreepBodyOptsHelper[] = [
    new MinerBodyOptsHelper(),
    new HarvesterBodyOptsHelper(),
    new WorkerBodyOptsHelper(),
    new LorryBodyOptsHelper(),
    new MineralMinerBodyOptsHelper(),
    new PowerUpgraderBodyOptsHelper(),
    new RemoteMinerBodyOptsHelper(),
    new RemoteHarvesterBodyOptsHelper(),
    new RemoteReserverBodyOptsHelper(),
    new RemoteColonizerBodyOptsHelper(),
    new ClaimerBodyOptsHelper(),
    new ZealotBodyOptsHelper(),
    new ManagerBodyOptsHelper(),
    new StalkerBodyOptsHelper(),
    new MedicBodyOptsHelper(),
    new TowerDrainerTankBodyOptsHelper(),
    new ScoutBodyOptsHelper()
];

// This is where each class instance is stored to be searched through so the correct one can be selected
// Follow advanced state creeep limits for next section
export const ROOM_STATE_CREEP_LIMITS: ICreepSpawnLimits[] = [
    new IntroStateCreepLimits(),
    new BeginnerStateCreepLimits(),
    new IntermediateStateCreepLimits(),
    new AdvancedStateCreepLimits(),
    new UpgraderStateCreepLimits(),
    new StimulateStateCreepLimits(),
    new NukeStateCreepLimits()
];

// Constant containing all instances of the class related to processing flags
export const PROCESS_FLAG_HELPERS: IFlagProcesser[] = [
    new ProcessDefaultAttackFlag(),
    new ProcessDefaultClaimRoom(),
    new ProcessDefaultRemoteRoom(),
    new ProcessDefaultStimulateFlag(),
    new ProcessDependentRoomOverride()
];

// Constants containing all instances of the class related to handling squad managers
export const SQUAD_MANAGERS: ISquadManager[] = [
    new SoloStalkerSquadManager(),
    new SoloZealotSquadManager(),
    new TowerDrainerSquadManager(),
    new StandardSquadManager(),
    new RemoteDefenderSquadManager(),
    new DomesticDefenderSquadManager()
];
