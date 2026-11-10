
import { system, ItemStack, EquipmentSlot } from "@minecraft/server";

system.afterEvents.scriptEventReceive.subscribe((event) => {
    const player = event.sourceEntity;

    if (!player || player.typeId !== "minecraft:player") return;

    const equippable = player.getComponent("minecraft:equippable");

    if (event.id === "porter:flashbook") {
        const book = new ItemStack("minecraft:enchanted_book", 1);

        book.nameTag = "§dFlash I";
        book.setLore([
            "§7Causes lightning to strike",
            "§7the target when hit."
        ]);

        player.getComponent("minecraft:inventory").container.addItem(book);
        player.sendMessage("§dYou received Flash I!");
    }

    if (event.id === "porter:apply_flash") {
        const weapon = equippable.getEquipment(EquipmentSlot.Mainhand);

        if (!weapon || !weapon.typeId.endsWith("_sword")) {
            player.sendMessage("§cHold a sword first!");
            return;
        }

        weapon.setDynamicProperty("porter:flash", true);
        equippable.setEquipment(EquipmentSlot.Mainhand, weapon);

        player.sendMessage("§dFlash I applied!");
    }
});
