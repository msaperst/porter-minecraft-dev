
import {
    world,
    system,
    EquipmentSlot,
    EntityDamageCause
} from "@minecraft/server";

import "./blood_book.js";
import "./flash_book.js";
import "./deadly_anvil.js";

// BLOOD ENCHANTMENT
world.beforeEvents.entityHurt.subscribe((event) => {
    const attacker = event.damageSource.damagingEntity;
    const target = event.hurtEntity;

    if (!attacker || attacker.typeId !== "minecraft:player") return;
    if (event.damageSource.cause !== EntityDamageCause.entityAttack) return;

    const equippable = attacker.getComponent("minecraft:equippable");
    if (!equippable) return;

    const weapon = equippable.getEquipment(EquipmentSlot.Mainhand);
    if (!weapon) return;

    if (weapon.getDynamicProperty("porter:blood") !== true) return;

    const damage = event.damage;
    event.cancel = true;

    system.run(() => {
        try {
            if (target.isValid()) {
                target.applyDamage(damage, {
                    cause: EntityDamageCause.magic,
                    damagingEntity: attacker
                });
            }
        } catch (error) {
            console.warn("Blood damage error: " + error);
        }
    });
});

// FLASH ENCHANTMENT
world.afterEvents.entityHitEntity.subscribe((event) => {
    const attacker = event.damagingEntity;
    const target = event.hitEntity;

    // Only players can activate Flash.
    if (!attacker || attacker.typeId !== "minecraft:player") return;

    try {
        const equippable = attacker.getComponent("minecraft:equippable");
        if (!equippable) return;

        const weapon = equippable.getEquipment(EquipmentSlot.Mainhand);
        if (!weapon) return;

        // Check whether the sword has Flash.
        if (weapon.getDynamicProperty("porter:flash") !== true) return;

        // Strike the target with lightning.
        if (!target.isValid()) return;

        target.dimension.spawnEntity(
            "minecraft:lightning_bolt",
            {
                x: target.location.x,
                y: target.location.y,
                z: target.location.z
            }
        );

    } catch (error) {
        console.warn("Flash error: " + error);
    }
});
