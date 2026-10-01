import { world } from "@minecraft/server";

const BASE_PENETRATION = 0.10;

function damageAfterArmor(damage, armor, toughness) {
    const effectiveArmor = Math.min(
        20,
        Math.max(
            armor / 5,
            armor - damage / (2 + toughness / 4)
        )
    );

    return damage * (1 - effectiveArmor / 25);
}

function findDamageForTargetDamage(targetDamage, armor, toughness) {
    let low = targetDamage;
    let high = targetDamage * 5;

    for (let i = 0; i < 30; i++) {
        const middle = (low + high) / 2;
        const result = damageAfterArmor(
            middle,
            armor,
            toughness
        );

        if (result < targetDamage) {
            low = middle;
        } else {
            high = middle;
        }
    }

    return high;
}

world.beforeEvents.entityHurt.subscribe((event) => {
    const attacker = event.damageSource.damagingEntity;
    const target = event.hurtEntity;

    if (!attacker || attacker.typeId !== "minecraft:player") {
        return;
    }

    const equipment = attacker.getComponent("minecraft:equippable");

    if (!equipment) {
        return;
    }

    const weapon = equipment.getEquipment("mainhand");

    if (!weapon) {
        return;
    }

    const penetrationLevel = weapon.getDynamicProperty(
        "porter:penetrating_level"
    );

    if (
        typeof penetrationLevel !== "number" ||
        penetrationLevel <= 0
    ) {
        return;
    }

    const targetEquipment = target.getComponent(
        "minecraft:equippable"
    );

    if (!targetEquipment) {
        return;
    }

    const armor = targetEquipment.totalArmor;
    const toughness = targetEquipment.totalToughness;

    if (armor <= 0) {
        return;
    }

    const penetration = Math.min(
        penetrationLevel * BASE_PENETRATION,
        0.70
    );

    const armorAfterPenetration = armor * (1 - penetration);

    const originalDamage = event.damage;

    const desiredDamage = damageAfterArmor(
        originalDamage,
        armorAfterPenetration,
        toughness
    );

    event.damage = findDamageForTargetDamage(
        desiredDamage,
        armor,
        toughness
    );
});