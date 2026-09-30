import { world } from "@minecraft/server";

console.warn("PORTER MOD: main.js loaded");

world.afterEvents.playerSpawn.subscribe((event) => {
    event.player.sendMessage("Hello, This is Porter's Mod. Anyone who copyrights Porter will get sued for 999,999,999,999,999,999,999 trillion dollars!");
});