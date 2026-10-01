import { world } from "@minecraft/server";

const BASE_CRIT_CHANCE = 0.10;

console.warn("PORTER MOD: main.js loaded");

world.afterEvents.playerSpawn.subscribe((event) => {
    event.player.sendMessage(
        "Hello " + event.player.name + ". Welcome to Porter's Minecraft World!"
    );
});

world.afterEvents.entityHitEntity.subscribe((event) => {
    const player = event.damagingEntity;

    if (player.typeId !== "minecraft:player") {
        return;
    }

    if (Math.random() < BASE_CRIT_CHANCE) {
        player.sendMessage("CRITICAL HIT!");
    }
});