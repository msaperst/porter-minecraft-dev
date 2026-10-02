import { world, system } from "@minecraft/server";

const pendingStrike = new Map();

function isStrikeOneBook(item) {
    if (!item) {
        return false;
    }

    return (
        item.typeId === "minecraft:enchanted_book" &&
        item.nameTag === "Strike I"
    );
}

function isWeapon(item) {
    if (!item) {
        return false;
    }

    return (
        item.typeId.endsWith("_sword") ||
        item.typeId === "minecraft:trident"
    );
}

function getInventory(player) {
    const inventory = player.getComponent("minecraft:inventory");

    if (!inventory || !inventory.container) {
        return undefined;
    }

    return inventory.container;
}

// Remember when the player interacts with a normal anvil.
world.afterEvents.playerInteractWithBlock.subscribe((event) => {
    if (!event.isFirstEvent) {
        return;
    }

    const blockId = event.block.typeId;

    const isAnvil =
        blockId === "minecraft:anvil" ||
        blockId === "minecraft:chipped_anvil" ||
        blockId === "minecraft:damaged_anvil";

    if (!isAnvil) {
        return;
    }

    pendingStrike.set(event.player.id, {
        time: system.currentTick
    });
});

// Watch the player's inventory for the Strike I book being moved
// into the anvil.
world.afterEvents.playerInventoryItemChange.subscribe((event) => {
    const player = event.player;
    const before = event.beforeItemStack;
    const after = event.itemStack;

    const pending = pendingStrike.get(player.id);

    if (!pending) {
        return;
    }

    // Forget old anvil interactions.
    if (system.currentTick - pending.time > 200) {
        pendingStrike.delete(player.id);
        return;
    }

    // Strike I book was removed from the player's inventory.
    if (isStrikeOneBook(before) && !after) {
        pending.bookRemoved = true;
        return;
    }

    // Look for the new anvil result.
    if (!pending.bookRemoved) {
        return;
    }

    if (!after) {
        return;
    }

    if (!isWeapon(after)) {
        return;
    }

    const enchantable = after.getComponent("minecraft:enchantable");

    if (!enchantable) {
        return;
    }

    // The vanilla anvil used Mending as the temporary carrier.
    if (!enchantable.hasEnchantment("mending")) {
        return;
    }

    system.run(() => {
        const inventory = getInventory(player);

        if (!inventory) {
            return;
        }

        const result = inventory.getItem(event.slot);

        if (!result || !isWeapon(result)) {
            return;
        }

        const resultEnchantable =
            result.getComponent("minecraft:enchantable");

        if (!resultEnchantable) {
            return;
        }

        if (!resultEnchantable.hasEnchantment("mending")) {
            return;
        }

        // Remove the temporary Mending carrier.
        resultEnchantable.removeEnchantment("mending");

        // Store Strike I on the weapon.
        result.setDynamicProperty(
            "porter:strike_level",
            1
        );

        // Show Strike I in the weapon's lore.
        const oldLore = result.getLore();

        result.setLore([
            ...oldLore,
            "Strike I",
            "3% chance to strike the target with lightning"
        ]);

        inventory.setItem(event.slot, result);

        pendingStrike.delete(player.id);

        player.sendMessage("§bStrike I applied!");
    });
});