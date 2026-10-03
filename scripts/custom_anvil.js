import { world } from "@minecraft/server";

world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
    if (!event.isFirstEvent) {
        return;
    }

    const blockId = event.block.typeId;

    const isAnvil =
        blockId === "minecraft:anvil" ||
        blockId === "minecraft:chipped_anvil" ||
        blockId === "minecraft:damaged_anvil";

    if (!isAnvil) {
        return;
    }

    event.player.sendMessage(
        "CUSTOM ANVIL SCRIPT IS FINALLY WORKING!!!!!"
    );
});