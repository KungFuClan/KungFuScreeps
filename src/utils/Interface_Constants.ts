import MinerCreepManager from "../Managers/Roles/MinerCreepManager";
import HarvesterCreepManager from "../Managers/Roles/HarvesterCreepManager";
import WorkerCreepManager from "../Managers/Roles/WorkerCreepManager";
import LorryCreepManager from "../Managers/Roles/LorryCreepManager";
import PowerUpgraderCreepManager from "../Managers/Roles/PowerUpgraderCreepManager";
import RemoteMinerCreepManager from "../Managers/Roles/RemoteMinerCreepManager";
import RemoteHarvesterCreepManager from "../Managers/Roles/RemoteHarvesterCreepManager";
import RemoteColonizerCreepManager from "../Managers/Roles/RemoteColonizerCreepManager";
import ClaimerCreepManager from "../Managers/Roles/ClaimerCreepManager";
import RemoteDefenderCreepManager from "../Managers/Roles/RemoteDefenderCreepManager";
import RemoteReserverCreepManager from "../Managers/Roles/RemoteReserverCreepManager";
import ZealotCreepManager from "../Managers/Roles/ZealotCreepManager";
import MedicCreepManager from "../Managers/Roles/MedicCreepManager";
import StalkerCreepManager from "../Managers/Roles/StalkerCreepManager";
import DomesticDefenderCreepManager from "../Managers/Roles/DomesticDefenderCreepManager";
import { MinerBodyOptsHelper } from "../Helpers/RoleHelpers/MinerBodyOptsHelper";
import { HarvesterBodyOptsHelper } from "../Helpers/RoleHelpers/HarvesterBodyOptsHelper";
import { WorkerBodyOptsHelper } from "../Helpers/RoleHelpers/WorkerBodyOptsHelper";
import { LorryBodyOptsHelper } from "../Helpers/RoleHelpers/LorryBodyOptsHelper";
import { PowerUpgraderBodyOptsHelper } from "../Helpers/RoleHelpers/PowerUpgraderBodyOptsHelper";
import { ZealotBodyOptsHelper } from "../Helpers/RoleHelpers/ZealotBodyOptsHelper";
import { StalkerBodyOptsHelper } from "../Helpers/RoleHelpers/StalkerBodyOptsHelper";
import { MedicBodyOptsHelper } from "../Helpers/RoleHelpers/MedicBodyOptsHelper";
import { DomesticDefenderBodyOptsHelper } from "../Helpers/RoleHelpers/DomesticDefenderBodyOptsHelper";
import { RemoteColonizerBodyOptsHelper } from "../Helpers/RoleHelpers/RemoteColonizerBodyOptsHelper";
import { RemoteDefenderBodyOptsHelper } from "../Helpers/RoleHelpers/RemoteDefenderOptsHelper";
import { RemoteMinerBodyOptsHelper } from "../Helpers/RoleHelpers/RemoteMinerBodyOptsHelper";
import { RemoteHarvesterBodyOptsHelper } from "../Helpers/RoleHelpers/RemoteHarvesterBodyOptsHelper";
import { ClaimerBodyOptsHelper } from "../Helpers/RoleHelpers/ClaimerBodyOptsHelper";
import { RemoteReserverBodyOptsHelper } from "../Helpers/RoleHelpers/RemoteReserverBodyOptsHelper";
// ---------- End Imports ----------------------------------------------------------------------------

// Constant containing the manager for each role, which all implement runRole
export const CREEP_MANAGERS: ICreepRoleManager[] = [
    new MinerCreepManager(),
    new HarvesterCreepManager(),
    new WorkerCreepManager(),
    new LorryCreepManager(),
    new PowerUpgraderCreepManager(),
    new RemoteMinerCreepManager(),
    new RemoteHarvesterCreepManager(),
    new RemoteReserverCreepManager(),
    new RemoteDefenderCreepManager(),
    new RemoteColonizerCreepManager(),
    new ClaimerCreepManager(),
    new ZealotCreepManager(),
    new StalkerCreepManager(),
    new MedicCreepManager(),
    new DomesticDefenderCreepManager(),
]

// Constant containing the body and options helper for a creep, which implement these helper functions
export const CREEP_BODY_OPT_HELPERS: ICreepBodyOptsHelper[] = [
    new MinerBodyOptsHelper(),
    new HarvesterBodyOptsHelper(),
    new WorkerBodyOptsHelper(),
    new LorryBodyOptsHelper(),
    new PowerUpgraderBodyOptsHelper(),
    new RemoteMinerBodyOptsHelper(),
    new RemoteHarvesterBodyOptsHelper(),
    new RemoteReserverBodyOptsHelper(),
    new RemoteDefenderBodyOptsHelper(),
    new RemoteColonizerBodyOptsHelper(),
    new ClaimerBodyOptsHelper(),
    new ZealotBodyOptsHelper(),
    new StalkerBodyOptsHelper(),
    new MedicBodyOptsHelper(),
    new DomesticDefenderBodyOptsHelper(),
];
