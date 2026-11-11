

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
// Cancels the normal sword damage and reapplies it as magic damage,
// which bypasses normal armor reduction.
world.beforeEvents.entityHurt.subscribe((event) => {
    const attacker = event.damageSource.damagingEntity;
    const target = event.hurtEntity;

    if (!attacker || attacker.typeId !== "minecraft:player") return;

    const equippable = attacker.getComponent("minecraft:equippable");
    if (!equippable) return;

    const weapon = equippable.getEquipment(EquipmentSlot.Mainhand);
    if (!weapon) return;

    if (weapon.getDynamicProperty("porter:blood") !== true) return;

    // Only replace normal melee attacks.
    if (event.damageSource.cause !== EntityDamageCause.entityAttack) return;

    const damage = event.damage;

    // Cancel the original damage so it is not applied twice.
    event.cancel = true;

    // Apply the same damage using the magic damage cause.
    system.run(() => {
        try {
            target.applyDamage(damage, {
                cause: EntityDamageCause.magic,
                damagingEntity: attacker
            });
        } catch (error) {
            console.warn("Blood damage error: " + error);
        }
    });
});

// FLASH ENCHANTMENT
// Lightning strikes only when the player hits a target.
world.afterEvents.entityHitEntity.subscribe((event) => {
    const attacker = event.damagingEntity;
    const target = event.hitEntity;

    if (attacker.typeId !== "minecraft:player") return;

    const equippable = attacker.getComponent("minecraft:equippable");
    if (!equippable) return;

    const weapon = equippable.getEquipment(EquipmentSlot.Mainhand);
    if (!weapon) return;

    if (weapon.getDynamicProperty("porter:flash") !== true) return;

    target.dimension.spawnEntity(
        "minecraft:lightning_bolt",
        target.location
    );
});
