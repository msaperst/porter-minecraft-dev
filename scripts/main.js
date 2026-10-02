import { world, system } from "@minecraft/server";
import "./crit.js";
import "./custom_anvil.js";
import "./strike.js";
import "./penetrating.js";


system.beforeEvents.startup.subscribe((initEvent) => {
    initEvent.itemComponentRegistry.registerCustomComponent(
        "porter:balance_book",
        {
            onUse(event) {
            }
        }
    );
});

console.warn("PORTER MOD: main.js loaded");

world.afterEvents.playerSpawn.subscribe((event) => {
    if (!event.initialSpawn) {
        return;
    }

    const player = event.player;

    player.sendMessage(
        "Hello " + player.name +
        ". Welcome to Porter's Minecraft World where you will find all sorts of new minerals, crafting recipes, blocks, enchantments, mobs, biomes, dimensions, and lots of other stuff. This world might be a bit confusing at first, but once you start playing, I can guarantee that you will have lots of fun!"
    );
});

