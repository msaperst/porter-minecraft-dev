import { world, system } from "@minecraft/server";

const BASE_STRIKE_CHANCE = 0.03;

// Remembers the Strike level of the trident a player is holding.
const heldTridentLevels = new Map();


// Check the player's held trident every tick.
system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        const equipment = player.getComponent("minecraft:equippable");

        if (!equipment) {
            continue;
        }

        const mainhand = equipment.getEquipment("mainhand");

        if (
            mainhand &&
            mainhand.typeId === "minecraft:trident"
        ) {
            const level = mainhand.getDynamicProperty(
                "porter:strike_level"
            );

            if (typeof level === "number" && level > 0) {
                heldTridentLevels.set(player.id, level);
            }
        }
    }
}, 1);


// When a thrown trident is created,
// copy the player's Strike level onto the projectile.
world.afterEvents.entitySpawn.subscribe((event) => {
    const projectile = event.entity;

    if (projectile.typeId !== "minecraft:thrown_trident") {
        return;
    }

    const projectileComponent = projectile.getComponent(
        "minecraft:projectile"
    );

    if (!projectileComponent) {
        return;
    }

    const owner = projectileComponent.owner;

    if (!owner || owner.typeId !== "minecraft:player") {
        return;
    }

    const level = heldTridentLevels.get(owner.id);

    if (typeof level !== "number" || level <= 0) {
        return;
    }

    projectile.setDynamicProperty(
        "porter:strike_level",
        level
    );
});


// SWORD MELEE HITS
world.afterEvents.entityHitEntity.subscribe((event) => {
    const player = event.damagingEntity;
    const target = event.hitEntity;

    if (!player || player.typeId !== "minecraft:player") {
        return;
    }

    const equipment = player.getComponent("minecraft:equippable");

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


// THROWN TRIDENT HITS
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

    player.sendMessage("STRIKE!");
});