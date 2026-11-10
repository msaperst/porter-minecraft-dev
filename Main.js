import { world } from "@minecraft/server";

console.warn("FLASH ENCHANTMENT LOADED!");

world.afterEvents.entityHitEntity.subscribe((event) => {
    const attacker = event.damagingEntity;
    const target = event.hitEntity;

    if (attacker.typeId !== "minecraft:player") return;

    target.dimension.spawnEntity(
        "minecraft:lightning_bolt",
        target.location
    );
});