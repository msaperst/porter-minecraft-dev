import { world } from "@minecraft/server";

const BASE_CRIT_CHANCE = 0.10;

world.afterEvents.entityHitEntity.subscribe((event) => {
    const player = event.damagingEntity;

    if (player.typeId !== "minecraft:player") {
        return;
    }

    if (Math.random() < BASE_CRIT_CHANCE) {
        player.sendMessage("§dCRITICAL HIT!");

        player.spawnParticle(
            "minecraft:magical_critical_hit_emitter",
            event.hitEntity.location
        );
    }
});