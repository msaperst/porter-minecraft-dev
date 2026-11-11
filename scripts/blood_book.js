
import { system, ItemStack } from "@minecraft/server";

// Give the player a Blood enchanted book
function giveBloodBook(player) {
    const book = new ItemStack("minecraft:enchanted_book", 1);

    book.nameTag = "§cBlood";
    book.setLore([
        "§7Makes your sword's damage",
        "§7ignore the target's armor."
    ]);

    const inventory = player.getComponent("minecraft:inventory")?.container;

    if (!inventory) {
        player.sendMessage("§cCould not access your inventory.");
        return;
    }

    const leftover = inventory.addItem(book);

    if (leftover) {
        player.dimension.spawnItem(leftover, player.location);
    }

    player.sendMessage("§cYou received Blood!");
}

// Command: /scriptevent porter:bloodbook
system.afterEvents.scriptEventReceive.subscribe((event) => {
    const player = event.sourceEntity;

    if (!player || player.typeId !== "minecraft:player") return;
    if (event.id !== "porter:bloodbook") return;

    giveBloodBook(player);
});
