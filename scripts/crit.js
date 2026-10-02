import { world, system } from "@minecraft/server";

const BALANCE_CHANCE_PER_LEVEL = 0.10;
const CRITICAL_MULTIPLIER = 1.5;

const pendingCrits = new Map();


function isBalanceWeapon(item) {
    if (!item) {
        return false;
    }

    return item.typeId.endsWith("_sword");
}


function getBalanceLevel(item) {
    if (!item) {
        return 0;
    }

    const level = item.getDynamicProperty(
        "porter:balance_level"
    );

    if (typeof level !== "number") {
        return 0;
    }

    return Math.max(0, Math.min(level, 8));
}


// ----------------------------------------
// CHECK FOR A BALANCE CRITICAL HIT
// ----------------------------------------

world.beforeEvents.entityHurt.subscribe((event) => {
    const attacker =
        event.damageSource.damagingEntity;

    if (
        !attacker ||
        attacker.typeId !== "minecraft:player"
    ) {
        return;
    }

    const equipment =
        attacker.getComponent(
            "minecraft:equippable"
        );

    if (!equipment) {
        return;
    }

    const weapon =
        equipment.getEquipment("mainhand");

    if (!isBalanceWeapon(weapon)) {
        return;
    }

    const balanceLevel =
        getBalanceLevel(weapon);

    if (balanceLevel <= 0) {
        return;
    }

    const chance = Math.min(
        BALANCE_CHANCE_PER_LEVEL * balanceLevel,
        0.80
    );

    if (Math.random() >= chance) {
        return;
    }

    // Make this hit a critical hit.
    event.damage *= CRITICAL_MULTIPLIER;

    // Remember it so we can display the effect afterward.
    pendingCrits.set(
        attacker.id + ":" + event.hurtEntity.id,
        {
            attacker: attacker,
            target: event.hurtEntity
        }
    );
});


// ----------------------------------------
// CRITICAL HIT EFFECT
// ----------------------------------------

world.afterEvents.entityHurt.subscribe((event) => {
    const attacker =
        event.damageSource.damagingEntity;

    if (
        !attacker ||
        attacker.typeId !== "minecraft:player"
    ) {
        return;
    }

    const key =
        attacker.id + ":" + event.hurtEntity.id;

    const crit =
        pendingCrits.get(key);

    if (!crit) {
        return;
    }

    pendingCrits.delete(key);

    system.run(() => {
        const target = crit.target;

        try {
            target.dimension.spawnParticle(
                "minecraft:magical_critical_hit_emitter",
                {
                    x: target.location.x,
                    y: target.location.y + 1,
                    z: target.location.z
                }
            );
        } catch (error) {
            console.warn(
                "Balance critical particle error: " +
                error
            );
        }

        attacker.sendMessage(
            "CRITICAL HIT!"
        );
    });
});