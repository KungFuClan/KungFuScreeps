import { MemoryApi_Military, MilitaryCombat_Api, MilitaryMovment_Api, ACTION_MOVE, ACTION_RANGED_ATTACK, ACTION_HEAL } from "Utils/Imports/internals";
import { MilitaryMovement_Helper } from "./Military.Movement.Helper";

export class MilitaryIntents_Api {

    /**
     * Reset the intents for the squad
     * @param instance the squad instance we are referring to
     */
    public static resetSquadIntents(instance: ISquadManager): void {
        const creeps = MemoryApi_Military.getLivingCreepsInSquadByInstance(instance);

        _.forEach(creeps, (creep: Creep) => {
            const creepStack = MemoryApi_Military.findCreepInSquadByInstance(instance, creep.name);

            if (creepStack === undefined) {
                return;
            }

            creepStack.intents = [];
        });
    }

    /**
     * Queue an intent to move off the exit tile
     * @param creep
     * @param instance the squad the creep is apart of
     * @returns boolean representing if we queued the intent
     */
    public static queueIntentMoveOffExitTile(creep: Creep, instance: ISquadManager): boolean {
        const directionOffExitTile: DirectionConstant | undefined = MilitaryMovment_Api.getDirectionOffExitTile(creep);
        if (!directionOffExitTile) {
            return false;
        }

        const intent: MiliIntent = {
            action: ACTION_MOVE,
            target: directionOffExitTile,
            targetType: "direction"
        };

        const creepStack: SquadStack | undefined = MemoryApi_Military.findCreepInSquadByInstance(instance, creep.name);

        if (creepStack === undefined) {
            return false;
        }

        creepStack.intents.push(intent);
        return true;
    }

    /**
     * Queue intents to get to the target room
     * @param creep the creep we're controlling
     * @param instance the instance that the creep is in
     * @returns boolean representing if we queued an intent
     */
    public static queueIntentMoveToTargetRoom(creep: Creep, instance: ISquadManager): boolean {
        const path = creep.pos.findPathTo(new RoomPosition(25, 25, instance.targetRoom), { range: 25 });
        const directionToTarget = path[0].direction;
        const intent: MiliIntent = {
            action: ACTION_MOVE,
            target: directionToTarget,
            targetType: "direction"
        };
        const creepStack: SquadStack | undefined = MemoryApi_Military.findCreepInSquadByInstance(instance, creep.name);
        if (creepStack === undefined) {
            return false;
        }
        creepStack.intents.push(intent);
        return true;
    }

    /**
     * Queue the kiting intent for an enemy creep
     * @param creep the creep we're queueing the intent for
     * @param targetHostile the hostile we want to kite
     * @param instance the squad instance we're controlling
     * @returns boolean representing if we queued an intent
     */
    public static queueIntentMoveTargetKiting(creep: Creep, targetHostile: Creep | undefined, instance: ISquadManager): boolean {
        if (targetHostile) {
            if (MilitaryCombat_Api.isInAttackRange(creep, targetHostile.pos, false)) {
                const directionToTarget = MilitaryCombat_Api.getKitingDirection(creep, targetHostile);

                if (!directionToTarget) {
                    return false;
                }

                const intent: MiliIntent = {
                    action: ACTION_MOVE,
                    target: directionToTarget,
                    targetType: "direction"
                };
                const creepStack: SquadStack | undefined = MemoryApi_Military.findCreepInSquadByInstance(instance, creep.name);
                if (creepStack === undefined) {
                    return false;
                }
                creepStack.intents.push(intent);
                return true;
            }
            else {
                const path = creep.pos.findPathTo(targetHostile.pos, { range: 3 });
                const directionToTarget = path[0].direction;
                const intent: MiliIntent = {
                    action: ACTION_MOVE,
                    target: directionToTarget,
                    targetType: "direction"
                };
                const creepStack: SquadStack | undefined = MemoryApi_Military.findCreepInSquadByInstance(instance, creep.name);
                if (creepStack === undefined) {
                    return false;
                }
                creepStack.intents.push(intent);
                return true;
            }
        }
        return false;
    }

    /**
     * Kite an enemy next to us
     * @param creep the creep we're controlling
     *
     */
    public static queueIntentMoveNearHostileKiting(creep: Creep, instance: ISquadManager): boolean {

        const closeEnemy: Creep | null = creep.pos.findClosestByPath(creep.room.find(FIND_HOSTILE_CREEPS));
        if (closeEnemy && MilitaryCombat_Api.isInAttackRange(creep, closeEnemy.pos, false)) {
            const directionToTarget = MilitaryCombat_Api.getKitingDirection(creep, closeEnemy);
            if (!directionToTarget) {
                return false;
            }
            const intent: MiliIntent = {
                action: ACTION_MOVE,
                target: directionToTarget,
                targetType: "direction"
            };

            const creepStack: SquadStack | undefined = MemoryApi_Military.findCreepInSquadByInstance(instance, creep.name);

            if (creepStack === undefined) {
                return false;
            }

            creepStack.intents.push(intent);
            return true;
        }
        return false;
    }

    /**
     * Queue ranged attack intent for the ideal target
     * @param creep the creep we're controlling
     * @param instance the instance the creep is apart of
     * @returns boolean representing if we queued the intent
     */
    public static queueRangedAttackIntentBestTarget(creep: Creep, instance: ISquadManager, hostiles: Creep[] | undefined, creeps: Creep[]): boolean {
        const bestTargetHostile: Creep | undefined = MilitaryCombat_Api.getRemoteDefenderAttackTarget(hostiles, creeps, instance.targetRoom);
        if (!bestTargetHostile) {
            return false;
        }

        if (creep.pos.inRangeTo(bestTargetHostile.pos, 3)) {

            const intent: MiliIntent = {
                action: ACTION_RANGED_ATTACK,
                target: bestTargetHostile.id,
                targetType: "creep"
            };

            MemoryApi_Military.pushIntentToCreepStack(instance, creep.name, intent);
            return true;
        }
        return false;
    }

    /**
     * Queue intent for an alternative target that isn't the ideal one
     * @param creep the creep we're controlling
     * @param instance the instance the creep is apart of
     * @param roomData the roomData for the operation
     * @returns boolean representing if we queued the intent
     */
    public static queueRangedAttackIntentAlternateClosestTarget(creep: Creep, instance: ISquadManager, roomData: MilitaryDataAll): boolean {
        // Find any other attackable creep if we can't hit the best target
        const closestHostileCreep: Creep | undefined = _.find(roomData[instance.targetRoom].hostiles!.allHostiles, (hostile: Creep) => hostile.pos.getRangeTo(creep.pos) <= 3);

        if (closestHostileCreep !== undefined) {
            const intent: MiliIntent = {
                action: ACTION_RANGED_ATTACK,
                target: closestHostileCreep.id,
                targetType: "creep"
            };

            MemoryApi_Military.pushIntentToCreepStack(instance, creep.name, intent);
            return true;
        }
        return false;
    }

    /**
     * Queue intent for healing ourselves
     * @param creep the creep we're controlling
     * @param instance the instance the creep is apart of
     * @param roomData the roomData for the operation
     * @returns boolean representing if we queued the intent
     */
    public static queueHealSelfIntent(creep: Creep, instance: ISquadManager, roomData: MilitaryDataAll): boolean {
        // Heal if we are below full, preheal if theres hostiles and we aren't under a rampart
        const creepIsOnRampart: boolean = _.filter(creep.pos.lookFor(LOOK_STRUCTURES), (struct: Structure) => struct.structureType === STRUCTURE_RAMPART).length > 0;
        if ((roomData[instance.targetRoom].hostiles!.allHostiles.length > 0 && !creepIsOnRampart) || creep.hits < creep.hitsMax) {

            const intent: MiliIntent = {
                action: ACTION_HEAL,
                target: creep.name,
                targetType: "creep"
            };

            MemoryApi_Military.pushIntentToCreepStack(instance, creep.name, intent);
            return true;
        }
        return false;
    }

    /**
     * TODO
     * Queue intent for healing friendly creeps
     * @param creep the creep we're controlling
     * @param instance the instance the creep is apart of
     * @param roomData the roomData for the operation
     * @returns boolean representing if we queued the intent
     */
    public static queueHealAllyCreep(creep: Creep, instance: ISquadManager, roomData: MilitaryDataAll): boolean {
        return false;
    }
}
