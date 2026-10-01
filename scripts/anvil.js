import { world, system } from "@minecraft/server";

const BALANCE_CODE = 123;

const pendingAnvil = new Map();

function isBalanceBook(item) {
    if (!item) {
        return false;
    }

    if (item.typeId !== "minecraft:enchanted_book") {
        return false;
    }

    if (item.nameTag !== "Balance I") {
        return false;
    }

    return item.getDynamicProperty("porter:balance_code") === BALANCE_CODE;
}

function isBalanceBookWithoutCode(item) {
    if (!item) {
        return false;
    }

    return (
        item.typeId === "minecraft:enchanted_book" &&
        item.nameTag === "Balance I"
    );
}

function getPlayerInventory(player) {
    const inventory = player.getComponent("minecraft:inventory");

    if (!inventory || !inventory.container) {
        return undefined;
    }

    return inventory.container;
}

// Give every Balance I book the hidden code 123.
function markBalanceBooks(player) {
    const container = getPlayerInventory(player);

    if (!container) {
        return;
    }

    for (let slot = 0; slot < container.size; slot++) {
        const item = container.getItem(slot);

        if (!isBalanceBookWithoutCode(item)) {
            continue;
        }

        if (item.getDynamicProperty("porter:balance_code") === BALANCE_CODE) {
            continue;
        }

        item.setDynamicProperty("porter:balance_code", BALANCE_CODE);
        container.setItem(slot, item);
    }
}

// Keep existing books marked too.
system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        markBalanceBooks(player);
    }
}, 20);

// Remember when a player opens an anvil while carrying a Balance I book.
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

    const container = getPlayerInventory(event.player);

    if (!container) {
        return;
    }

    for (let slot = 0; slot < container.size; slot++) {
        const item = container.getItem(slot);

        if (isBalanceBook(item)) {
            pendingAnvil.set(event.player.id, true);
            return;
        }
    }
});

// Watch for the anvil result entering the player's inventory.
world.afterEvents.playerInventoryItemChange.subscribe((event) => {
    const player = event.player;
    const item = event.itemStack;

    // If a Balance I book enters the inventory, make sure it has code 123.
    if (item && isBalanceBookWithoutCode(item)) {
        system.run(() => {
            const container = getPlayerInventory(player);

            if (!container) {
                return;
            }

            const current = container.getItem(event.slot);

            if (!current || !isBalanceBookWithoutCode(current)) {
                return;
            }

            if (current.getDynamicProperty("porter:balance_code") !== BALANCE_CODE) {
                current.setDynamicProperty(
                    "porter:balance_code",
                    BALANCE_CODE
                );

                container.setItem(event.slot, current);
            }
        });

        return;
    }

    if (!item) {
        return;
    }

    if (!pendingAnvil.get(player.id)) {
        return;
    }

    const enchantable = item.getComponent("minecraft:enchantable");

    if (!enchantable) {
        return;
    }

    // The normal anvil uses Mending as the temporary carrier.
    if (!enchantable.hasEnchantment("mending")) {
        return;
    }

    // Do not convert an enchanted book.
    if (item.typeId === "minecraft:enchanted_book") {
        return;
    }

    system.run(() => {
        const container = getPlayerInventory(player);

        if (!container) {
            return;
        }

        const result = container.getItem(event.slot);

        if (!result) {
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

        // Remove the temporary Mending marker.
        resultEnchantable.removeEnchantment("mending");

        // Add the real Balance data.
        result.setDynamicProperty(
            "porter:balance_level",
            1
        );

        result.setLore([
            "Balance I",
            "Increases critical hit chance by 10%"
        ]);

        container.setItem(event.slot, result);

        pendingAnvil.delete(player.id);

        player.sendMessage("§dBalance I applied!");
    });
});