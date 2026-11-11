
import {
    world,
    system,
    EquipmentSlot
} from "@minecraft/server";

import { ActionFormData } from "@minecraft/server-ui";

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

    if (response.canceled || response.selection !== 0) return;

    const equipment = player.getComponent("minecraft:equippable");
    const inventory = player.getComponent("minecraft:inventory").container;

    const weapon = equipment.getEquipment(EquipmentSlot.Mainhand);

    if (!weapon || !weapon.typeId.endsWith("_sword")) {
        player.sendMessage("§cHold a sword first!");
        return;
    }

    if (weapon.getDynamicProperty("porter:flash") === true) {
        player.sendMessage("§cThis sword already has Flash!");
        return;
    }

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

    weapon.setDynamicProperty("porter:flash", true);

    weapon.setLore([
        ...weapon.getLore(),
        "§dFlash I"
    ]);

    equipment.setEquipment(EquipmentSlot.Mainhand, weapon);

    const book = inventory.getItem(bookSlot);

    if (book.amount > 1) {
        book.amount -= 1;
        inventory.setItem(bookSlot, book);
    } else {
        inventory.setItem(bookSlot, undefined);
    }

    player.sendMessage("§d⚡ Flash I successfully applied!");
}

// Open the menu when a player interacts with an anvil
world.afterEvents.playerInteractWithBlock.subscribe((event) => {
    const block = event.block;
    const player = event.player;

    if (
        block.typeId !== "minecraft:anvil" &&
        block.typeId !== "minecraft:chipped_anvil" &&
        block.typeId !== "minecraft:damaged_anvil"
    ) {
        return;
    }

    openDeadlyAnvil(player).catch((error) => {
        console.warn("Deadly Anvil error: " + error);
    });
});
