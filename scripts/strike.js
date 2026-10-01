import { world } from "@minecraft/server";

const BASE_STRIKE_CHANCE = 0.03;

world.afterEvents.entityHitEntity.subscribe((event) => {
    const player = event.damagingEntity;

    if (player.typeId !== "minecraft:player") {
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

    const strikeLevel = weapon.getDynamicProperty("porter:strike_level");

    if (typeof strikeLevel !== "number" || strikeLevel <= 0) {
        return;
    }

    const strikeChance = BASE_STRIKE_CHANCE * strikeLevel;

    if (Math.random() >= strikeChance) {
        return;
    }

    event.hitEntity.dimension.spawnEntity(
        "minecraft:lightning_bolt",
        event.hitEntity.location
    );
});