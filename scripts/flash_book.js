
import { system, ItemStack, EquipmentSlot } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

function giveFlashBook(player) {
    const book = new ItemStack("minecraft:enchanted_book", 1);

    book.nameTag = "§dFlash I";
    book.setLore([
        "§7Causes lightning to strike",
        "§7the target when hit."
    ]);

    const inventory = player.getComponent("minecraft:inventory");

    const leftover = inventory.container.addItem(book);

    if (leftover) {
        player.dimension.spawnItem(leftover, player.location);
    }

    player.sendMessage("§dYou received Flash I!");
}

async function openDeadlyAnvil(player) {
    const form = new ActionFormData()
        .title("§5⚡ Deadly Anvil ⚡")
        .body(
            "§dCombine your sword and Flash book!\n\n" +
            "§fMAIN HAND: §7Sword\n" +
            "§fOFF HAND: §7Flash I Book\n\n" +
            "§eSelect Apply Flash I when ready."
        )
        .button("§dApply Flash I", "textures/items/enchanted_book")
        .button("Close");

    const response = await form.show(player);

    if (response.canceled || response.selection !== 0) return;

    const equipment = player.getComponent("minecraft:equippable");

    const weapon = equipment.getEquipment(EquipmentSlot.Mainhand);
    const book = equipment.getEquipment(EquipmentSlot.Offhand);

    if (!weapon || !weapon.typeId.endsWith("_sword")) {
        player.sendMessage("§cHold a sword in your main hand!");
        return;
    }

    if (
        !book ||
        book.typeId !== "minecraft:enchanted_book" ||
        book.nameTag !== "§dFlash I"
    ) {
        player.sendMessage("§cPut a Flash I book in your offhand!");
        return;
    }

    if (weapon.getDynamicProperty("porter:flash") === true) {
        player.sendMessage("§cThis sword already has Flash!");
        return;
    }

    weapon.setDynamicProperty("porter:flash", true);
    weapon.setLore([
        ...weapon.getLore(),
        "§dFlash I"
    ]);

    equipment.setEquipment(EquipmentSlot.Mainhand, weapon);
    equipment.setEquipment(EquipmentSlot.Offhand, undefined);

    player.sendMessage("§d⚡ Flash I successfully applied!");
}

system.afterEvents.scriptEventReceive.subscribe((event) => {
    const player = event.sourceEntity;

    if (!player || player.typeId !== "minecraft:player") return;

    if (event.id === "porter:flashbook") {
        giveFlashBook(player);
    }
});
 
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
        player.sendMessage("§cYou need a Flash I book in your inventory!");
        return;
    }

    weapon.setDynamicProperty("porter:flash", true);
    weapon.setLore([
        ...weapon.getLore(),
        "§dFlash I"
    ]);

    equipment.setEquipment(EquipmentSlot.Mainhand, weapon);
    inventory.setItem(bookSlot, undefined);

    player.sendMessage("§d⚡ Flash I successfully applied!");
}
