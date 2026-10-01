import { world } from "@minecraft/server";
import "./crit.js";

console.warn("PORTER MOD: main.js loaded");

world.afterEvents.playerSpawn.subscribe((event) => {
    event.player.sendMessage("Hello " + event.player.name + ". Welcome to Porter's Minecraft World where you will find all sorts of new minerals, crafting recipies, blocks, enchantments, mobs, biomes, dimensions, and lot's of other stuff. This world might be a bit confusing at first, but once you start playing, I can guarantee that you will have lots of fun  ");
});

