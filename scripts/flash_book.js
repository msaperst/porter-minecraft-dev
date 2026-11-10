

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
