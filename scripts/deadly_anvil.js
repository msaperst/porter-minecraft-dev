
import {
    world,
    EquipmentSlot
} from "@minecraft/server";

import { ActionFormData } from "@minecraft/server-ui";

async function openDeadlyAnvil(player) {
    const form = new ActionFormData()
        .title("§5⚡ Deadly Anvil ⚡")
        .body(
            "§dCombine your sword and enchantment book!\n\n" +
            "§fMAIN HAND: §7Hold your sword\n" +
            "§fINVENTORY: §7Have a Flash or Blood book\n\n" +
            "§eChoose an enchantment:"
        )
        .button("§d⚡ Apply Flash")
        .button("§c🩸 Apply Blood")
        .button("§7Close");

    const response = await form.show(player);

    if (response.canceled || response.selection === 2) return;

    const enchantment = response.selection === 0 ? "flash" : "blood";

    const bookName = enchantment === "flash" ? "§dFlash" : "§cBlood";
    const property = enchantment === "flash"
        ? "porter:flash"
        : "porter:blood";

    const equipment = player.getComponent("minecraft:equippable");
    const inventory = player.getComponent("minecraft:inventory")?.container;

    if (!equipment || !inventory) return;

    const weapon = equipment.getEquipment(EquipmentSlot.Mainhand);

    if (!weapon || !weapon.typeId.endsWith("_sword")) {
        player.sendMessage("§cHold a sword first!");
        return;
    }

    if (weapon.getDynamicProperty(property) === true) {
        player.sendMessage(`§cYour sword already has ${enchantment === "flash" ? "Flash" : "Blood"}!`);
        return;
    }

    let bookSlot = -1;

    for (let i = 0; i < inventory.size; i++) {
        const item = inventory.getItem(i);

        if (
            item &&
            item.typeId === "minecraft:enchanted_book" &&
            item.nameTag === bookName
        ) {
            bookSlot = i;
            break;
        }
    }

    if (bookSlot === -1) {
        player.sendMessage(`§cYou need a ${enchantment === "flash" ? "Flash" : "Blood"} book!`);
        return;
    }

    weapon.setDynamicProperty(property, true);

    const lore = weapon.getLore() ?? [];
    lore.push(enchantment === "flash" ? "§dFlash" : "§cBlood");
    weapon.setLore(lore);

    equipment.setEquipment(EquipmentSlot.Mainhand, weapon);

    const book = inventory.getItem(bookSlot);

    if (book.amount > 1) {
        book.amount -= 1;
        inventory.setItem(bookSlot, book);
    } else {
        inventory.setItem(bookSlot, undefined);
    }

    player.sendMessage(
        enchantment === "flash"
            ? "§d⚡ Flash successfully applied!"
            : "§c🩸 Blood successfully applied!"
    );
}

world.afterEvents.playerInteractWithBlock.subscribe((event) => {
    const block = event.block;

    if (
        block.typeId !== "minecraft:anvil" &&
        block.typeId !== "minecraft:chipped_anvil" &&
        block.typeId !== "minecraft:damaged_anvil"
    ) {
        return;
    }

    openDeadlyAnvil(event.player).catch((error) => {
        console.warn("Deadly Anvil error: " + error);
    });
});
