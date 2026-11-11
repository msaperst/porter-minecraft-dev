
import { world, EquipmentSlot } from "@minecraft/server";
import "./flash_book.js";
import "./deadly_anvil.js";

world.afterEvents.entityHitEntity.subscribe((event) => {
    const attacker = event.damagingEntity;
    const target = event.hitEntity;

    if (attacker.typeId !== "minecraft:player") return;

    const equippable = attacker.getComponent("minecraft:equippable");
    const weapon = equippable.getEquipment(EquipmentSlot.Mainhand);

    if (!weapon) return;

    if (weapon.getDynamicProperty("porter:flash") !== true) return;

    target.dimension.spawnEntity(
        "minecraft:lightning_bolt",
        target.location
    );
});
