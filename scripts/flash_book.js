

import { system, ItemStack } from "@minecraft/server";

system.afterEvents.scriptEventReceive.subscribe((event) => {
    if (event.id !== "porter:flashbook") return;

    const player = event.sourceEntity;

    if (!player || player.typeId !== "minecraft:player") return;

    const flashBook = new ItemStack("minecraft:enchanted_book", 1);

    flashBook.nameTag = "§dFlash";

    flashBook.setLore([
        "§7Causes lightning to strike",
        "§7the target when hit."
    ]);

    const inventory = player.getComponent("minecraft:inventory");

    if (!inventory || !inventory.container) return;

    const leftover = inventory.container.addItem(flashBook);

    if (leftover) {
        player.dimension.spawnItem(leftover, player.location);
    }

    player.sendMessage("§dYou received Flash!");
});
