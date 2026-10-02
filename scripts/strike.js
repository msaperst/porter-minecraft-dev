import { world, system } from "@minecraft/server";

const BASE_STRIKE_CHANCE = 0.03;
const STRIKE_CODE = 321;


// --------------------------------------------------
// GIVE STRIKE I BOOKS THEIR SECRET CODE
// --------------------------------------------------

world.afterEvents.playerInventoryItemChange.subscribe((event) => {
    const item = event.itemStack;

    if (!item) {
        return;
    }

    if (item.typeId !== "porter:strike_book_1") {
        return;
    }

    const currentCode = item.getDynamicProperty(
        "porter:strike_code"
    );

    if (currentCode === STRIKE_CODE) {
        return;
    }

    system.run(() => {
        const inventory = event.player.getComponent(
            "minecraft:inventory"
        );

        if (!inventory || !inventory.container) {
            return;
        }

        const currentItem = inventory.container.getItem(
            event.slot
        );

        if (!currentItem) {
            return;
        }

        if (currentItem.typeId !== "porter:strike_book_1") {
            return;
        }

        currentItem.setDynamicProperty(
            "porter:strike_code",
            STRIKE_CODE
        );

        inventory.container.setItem(
            event.slot,
            currentItem
        );
    });
});


// --------------------------------------------------
// SWORDS / MELEE
// --------------------------------------------------

world.afterEvents.entityHitEntity.subscribe((event) => {
    const player = event.damagingEntity;
    const target = event.hitEntity;

    if (!player || player.typeId !== "minecraft:player") {
        return;
    }

    const equipment = player.getComponent(
        "minecraft:equippable"
    );

    if (!equipment) {
        return;
    }

    const weapon = equipment.getEquipment("mainhand");

    if (!weapon) {
        return;
    }

    if (!weapon.typeId.endsWith("_sword")) {
        return;
    }

    const level = weapon.getDynamicProperty(
        "porter:strike_level"
    );

    if (typeof level !== "number" || level <= 0) {
        return;
    }

    const chance = Math.min(
        BASE_STRIKE_CHANCE * level,
        1
    );

    if (Math.random() >= chance) {
        return;
    }

    target.dimension.spawnEntity(
        "minecraft:lightning_bolt",
        target.location
    );

    player.sendMessage("§bSTRIKE!");
});


// --------------------------------------------------
// REMEMBER A STRIKE TRIDENT'S LEVEL
// --------------------------------------------------

system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        const equipment = player.getComponent(
            "minecraft:equippable"
        );

        if (!equipment) {
            continue;
        }

        const weapon = equipment.getEquipment("mainhand");

        if (!weapon) {
            continue;
        }

        if (weapon.typeId !== "minecraft:trident") {
            continue;
        }

        const level = weapon.getDynamicProperty(
            "porter:strike_level"
        );

        if (typeof level === "number" && level > 0) {
            player.setDynamicProperty(
                "porter:strike_trident_level",
                level
            );
        }
    }
}, 1);


// --------------------------------------------------
// THROWN TRIDENTS
// --------------------------------------------------

world.afterEvents.projectileHitEntity.subscribe((event) => {
    const projectile = event.projectile;

    if (!projectile) {
        return;
    }

    if (projectile.typeId !== "minecraft:thrown_trident") {
        return;
    }

    const player = event.source;

    if (!player || player.typeId !== "minecraft:player") {
        return;
    }

    const targetInfo = event.getEntityHit();

    if (!targetInfo || !targetInfo.entity) {
        return;
    }

    const target = targetInfo.entity;

    const level = projectile.getDynamicProperty(
        "porter:strike_level"
    );

    if (typeof level !== "number" || level <= 0) {
        return;
    }

    const chance = Math.min(
        BASE_STRIKE_CHANCE * level,
        1
    );

    if (Math.random() >= chance) {
        return;
    }

    event.dimension.spawnEntity(
        "minecraft:lightning_bolt",
        target.location
    );

    player.sendMessage("Bro got cooked");
});