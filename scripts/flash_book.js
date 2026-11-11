import {
    system,
    ItemStack,
    EquipmentSlot
} from "@minecraft/server";

import { ActionFormData } from "@minecraft/server-ui";

// Give the player a Flash I book
function giveFlashBook(player) {
    const book = new ItemStack("minecraft:enchanted_book", 1);

    book.nameTag = "§dFlash I";
    book.setLore([
        "§7Causes lightning to strike",
        "§7the target when hit."
    ]);

    const inventory = player.getComponent("minecraft:inventory").container;
    const leftover = inventory.addItem(book);

    if (leftover) {
        player.dimension.spawnItem(leftover, player.location);
    }

    player.sendMessage("§dYou received Flash I!");
}

// Open Deadly Anvil
async function openDeadlyAnvil(player) {
    const form = new ActionFormData()
        .title("§5⚡ Deadly Anvil ⚡")
        .body(
            "§dCombine your sword and Flash book!\n\n" +
            "§fMAIN HAND: §7Hold your sword\n" +
            "§fINVENTORY: §7Have a Flash I book anywhere\n\n" +
            "§eSelect Apply Flash I when ready."
        )
        .button("§dApply Flash I")
        .button("Close");

    const response = await form.show(player);

    if (response.canceled || response.selection !== 0) {
        return;
    }

    const equipment = player.getComponent("minecraft:equippable");
    const inventory = player.getComponent("minecraft:inventory").container;

    const weapon = equipment.getEquipment(EquipmentSlot.Mainhand);

    // Check that the player is holding a sword
    if (!weapon || !weapon.typeId.endsWith("_sword")) {
        player.sendMessage("§cHold a sword first!");
        return;
    }

    // Check whether the sword already has Flash
    if (weapon.getDynamicProperty("porter:flash") === true) {
        player.sendMessage("§cThis sword already has Flash!");
        return;
    }

    // Find a Flash I book
    let bookSlot = -1;

    for (let i = 0; i < inventory.size; i++) {
        const item = inventory.getItem(i);

        if (
            item &&
            item.typeId === "minecraft:enchanted_book" &&
            item.nameTag === "§dFlash I"
        ) {
            bookSlot = i;
            break;
        }
    }

    if (bookSlot === -1) {
        player.sendMessage("§cYou need a Flash I book!");
        return;
    }

    // Apply Flash to the sword
    weapon.setDynamicProperty("porter:flash", true);

    weapon.setLore([
        ...weapon.getLore(),
        "§dFlash I"
    ]);

    equipment.setEquipment(EquipmentSlot.Mainhand, weapon);

    // Consume exactly one Flash book
    const book = inventory.getItem(bookSlot);

    if (book.amount > 1) {
        book.amount -= 1;
        inventory.setItem(bookSlot, book);
    } else {
        inventory.setItem(bookSlot, undefined);
    }

    player.sendMessage("§d⚡ Flash I successfully applied!");
}

// Listen for Minecraft commands
system.afterEvents.scriptEventReceive.subscribe((event) => {
    const player = event.sourceEntity;

    if (!player || player.typeId !== "minecraft:player") {
        return;
    }

    if (event.id === "porter:flashbook") {
        giveFlashBook(player);
    }

    if (event.id === "porter:deadly_anvil") {
        openDeadlyAnvil(player).catch((error) => {
            console.warn("Deadly Anvil error: " + error);
        });
    }
});
