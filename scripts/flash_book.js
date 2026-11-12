
import { system, ItemStack } from "@minecraft/server";

const FLASH_BOOK_NAME = "§dFlash";

// Create and give a Flash book
function giveFlashBook(player) {
    try {
        const inventoryComponent = player.getComponent("minecraft:inventory");
        const inventory = inventoryComponent?.container;

        if (!inventory) {
            player.sendMessage("§cCould not access your inventory!");
            return;
        }

        const book = new ItemStack("minecraft:enchanted_book", 1);

        book.nameTag = FLASH_BOOK_NAME;

        book.setLore([
            "§7FLASH ENCHANTMENT",
            "§8----------------",
            "§7Summons lightning",
            "§7when you hit a target.",
            "§8No levels required."
        ]);

        const leftover = inventory.addItem(book);

        if (leftover) {
            player.dimension.spawnItem(leftover, player.location);
        }

        player.sendMessage("§d⚡ You received the Flash book!");

    } catch (error) {
        console.warn("Flash book error: " + error);
        player.sendMessage("§cSomething went wrong giving you Flash!");
    }
}

// Command: /scriptevent porter:flashbook
system.afterEvents.scriptEventReceive.subscribe((event) => {
    if (event.id !== "porter:flashbook") return;

    const player = event.sourceEntity;

    if (!player || player.typeId !== "minecraft:player") return;

    giveFlashBook(player);
});
