
import { system, ItemStack } from "@minecraft/server";

// Give the player a Flash I book
function giveFlashBook(player) {
    const book = new ItemStack("minecraft:enchanted_book", 1);

    book.nameTag = "§dFlash";
    book.setLore([
        "§7Causes lightning to strike",
        "§7the target when hit."
    ]);

    const inventory = player.getComponent("minecraft:inventory").container;
    const leftover = inventory.addItem(book);

    if (leftover) {
        player.dimension.spawnItem(leftover, player.location);
    }

    player.sendMessage("§dYou received Flash!");
}

system.afterEvents.scriptEventReceive.subscribe((event) => {
    const player = event.sourceEntity;

    if (!player || player.typeId !== "minecraft:player") return;

    if (event.id === "porter:flashbook") {
        giveFlashBook(player);
    }
});
