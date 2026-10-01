import { world, system } from "@minecraft/server";

world.afterEvents.playerInventoryItemChange.subscribe((event) => {
    const item = event.itemStack;

    if (!item) {
        return;
    }

    if (item.nameTag !== "Balance I") {
        return;
    }

    const enchantable = item.getComponent("minecraft:enchantable");

    if (!enchantable) {
        return;
    }

    if (!enchantable.hasEnchantment("mending")) {
        return;
    }

    system.run(() => {
        const inventory = event.player.getComponent("minecraft:inventory");

        if (!inventory || !inventory.container) {
            return;
        }

        const slot = inventory.container.getSlot(event.slot);
        const result = slot.getItem();

        if (!result) {
            return;
        }

        const resultEnchantable = result.getComponent("minecraft:enchantable");

        if (!resultEnchantable) {
            return;
        }

        if (!resultEnchantable.hasEnchantment("mending")) {
            return;
        }

        resultEnchantable.removeEnchantment("mending");

        result.setDynamicProperty("porter:balance_level", 1);

        result.setLore([
            "Balance I",
            "Increases critical hit chance by 10%"
        ]);

        slot.setItem(result);
    });
});