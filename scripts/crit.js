import { world } from "@minecraft/server";

const BASE_CRIT_CHANCE = 0.10;

world.afterEvents.entityHitEntity.subscribe((event) => {
    const player = event.damagingEntity;

    if (player.typeId !== "minecraft:player") {
        return;
    }

    if (Math.random() < BASE_CRIT_CHANCE) {
        player.sendMessage("CRITICAL HIT MADE!");

        player.spawnParticle(
            "minecraft:magical_critical_hit_emitter",
            {
                x: event.hitEntity.location.x,
                y: event.hitEntity.location.y + 1,
                z: event.hitEntity.location.z
            }
        );
    }
});