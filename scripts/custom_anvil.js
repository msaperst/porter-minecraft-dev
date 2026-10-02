import { world, system } from "@minecraft/server";
import {
    ActionFormData,
    MessageFormData
} from "@minecraft/server-ui";


const ENCHANTMENT_BOOKS = {

    // ==============================
    // STRIKE
    // ==============================

    "porter:strike_book_1": {
        type: "strike",
        level: 1,
        code: 321,
        name: "Strike I",
        description: "3% chance to strike the target with lightning"
    },

    "porter:strike_book_2": {
        type: "strike",
        level: 2,
        code: 322,
        name: "Strike II",
        description: "6% chance to strike the target with lightning"
    },

    "porter:strike_book_3": {
        type: "strike",
        level: 3,
        code: 323,
        name: "Strike III",
        description: "9% chance to strike the target with lightning"
    },

    "porter:strike_book_4": {
        type: "strike",
        level: 4,
        code: 324,
        name: "Strike IV",
        description: "12% chance to strike the target with lightning"
    },

    "porter:strike_book_5": {
        type: "strike",
        level: 5,
        code: 325,
        name: "Strike V",
        description: "15% chance to strike the target with lightning"
    },


    // ==============================
    // PENETRATING
    // ==============================

    "porter:penetrating_book_1": {
        type: "penetrating",
        level: 1,
        code: 401,
        name: "Penetrating I",
        description: "Ignores 10% of the target's armor"
    },

    "porter:penetrating_book_2": {
        type: "penetrating",
        level: 2,
        code: 402,
        name: "Penetrating II",
        description: "Ignores 20% of the target's armor"
    },

    "porter:penetrating_book_3": {
        type: "penetrating",
        level: 3,
        code: 403,
        name: "Penetrating III",
        description: "Ignores 30% of the target's armor"
    },

    "porter:penetrating_book_4": {
        type: "penetrating",
        level: 4,
        code: 404,
        name: "Penetrating IV",
        description: "Ignores 40% of the target's armor"
    },

    "porter:penetrating_book_5": {
        type: "penetrating",
        level: 5,
        code: 405,
        name: "Penetrating V",
        description: "Ignores 50% of the target's armor"
    },

    "porter:penetrating_book_6": {
        type: "penetrating",
        level: 6,
        code: 406,
        name: "Penetrating VI",
        description: "Ignores 60% of the target's armor"
    },

    "porter:penetrating_book_7": {
        type: "penetrating",
        level: 7,
        code: 407,
        name: "Penetrating VII",
        description: "Ignores 70% of the target's armor"
    }
};


function isAnvil(block) {
    return (
        block.typeId === "minecraft:anvil" ||
        block.typeId === "minecraft:chipped_anvil" ||
        block.typeId === "minecraft:damaged_anvil"
    );
}


function getInventory(player) {
    const component =
        player.getComponent("minecraft:inventory");

    if (!component || !component.container) {
        return undefined;
    }

    return component.container;
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


function getItemName(item) {
    if (!item) {
        return "Empty";
    }

    if (item.nameTag) {
        return item.nameTag;
    }

    return item.typeId
        .replace("minecraft:", "")
        .replaceAll("_", " ");
}


function getEnchantmentLevel(item, type) {
    if (!item) {
        return 0;
    }

    let propertyName;

    if (type === "strike") {
        propertyName = "porter:strike_level";
    }

    else if (type === "penetrating") {
        propertyName = "porter:penetrating_level";
    }

    else {
        return 0;
    }

    const level =
        item.getDynamicProperty(propertyName);

    if (typeof level !== "number") {
        return 0;
    }

    return level;
}


function getBookInfo(item) {
    if (!item) {
        return undefined;
    }

    return ENCHANTMENT_BOOKS[item.typeId];
}


function markBook(item) {
    const info = getBookInfo(item);

    if (!info) {
        return item;
    }

    item.setDynamicProperty(
        "porter:enchantment_code",
        info.code
    );

    return item;
}


function applyEnchantment(weapon, info) {

    if (info.type === "strike") {

        weapon.setDynamicProperty(
            "porter:strike_level",
            info.level
        );
    }

    else if (info.type === "penetrating") {

        weapon.setDynamicProperty(
            "porter:penetrating_level",
            info.level
        );
    }


    const oldLore = weapon.getLore();

    weapon.setLore([
        ...oldLore,
        info.name,
        info.description
    ]);

    return weapon;
}


async function openCustomAnvil(player) {

    const inventory = getInventory(player);

    if (!inventory) {
        return;
    }


    // ========================================
    // FIND WEAPONS
    // ========================================

    const weapons = [];

    for (
        let slot = 0;
        slot < inventory.size;
        slot++
    ) {

        const item =
            inventory.getItem(slot);

        if (!isWeapon(item)) {
            continue;
        }

        weapons.push({
            slot: slot,
            item: item
        });
    }


    if (weapons.length === 0) {

        const form =
            new ActionFormData();

        form.title("Porter's Anvil");

        form.body(
            "You need a sword or trident."
        );

        form.button("Close");

        try {
            await form.show(player);
        }

        catch (error) {
            console.warn(
                "Anvil error: " + error
            );
        }

        return;
    }


    // ========================================
    // CHOOSE WEAPON
    // ========================================

    const weaponForm =
        new ActionFormData();

    weaponForm.title(
        "Porter's Anvil"
    );

    weaponForm.body(
        "Choose the weapon you want to enchant:"
    );


    for (const entry of weapons) {

        let buttonText =
            getItemName(entry.item);

        const strikeLevel =
            getEnchantmentLevel(
                entry.item,
                "strike"
            );

        const penetratingLevel =
            getEnchantmentLevel(
                entry.item,
                "penetrating"
            );


        if (strikeLevel > 0) {

            buttonText +=
                "\nStrike " +
                strikeLevel;
        }


        if (penetratingLevel > 0) {

            buttonText +=
                "\nPenetrating " +
                penetratingLevel;
        }


        weaponForm.button(
            buttonText
        );
    }


    weaponForm.button("Cancel");


    let weaponResponse;

    try {

        weaponResponse =
            await weaponForm.show(player);
    }

    catch (error) {

        console.warn(
            "Weapon form error: " + error
        );

        return;
    }


    if (weaponResponse.canceled) {
        return;
    }


    if (
        weaponResponse.selection === undefined ||
        weaponResponse.selection >= weapons.length
    ) {
        return;
    }


    const selectedWeaponSlot =
        weapons[
            weaponResponse.selection
        ].slot;


    const selectedWeapon =
        inventory.getItem(
            selectedWeaponSlot
        );


    if (
        !selectedWeapon ||
        !isWeapon(selectedWeapon)
    ) {

        player.sendMessage(
            "That weapon is no longer available."
        );

        return;
    }


    // ========================================
    // FIND ENCHANTMENT BOOKS
    // ========================================

    const books = [];


    for (
        let slot = 0;
        slot < inventory.size;
        slot++
    ) {

        let item =
            inventory.getItem(slot);

        const info =
            getBookInfo(item);

        if (!info) {
            continue;
        }


        item =
            markBook(item);


        inventory.setItem(
            slot,
            item
        );


        books.push({
            slot: slot,
            item: item,
            info: info
        });
    }


    if (books.length === 0) {

        player.sendMessage(
            "You do not have a custom enchantment book."
        );

        return;
    }


    // ========================================
    // CHOOSE BOOK
    // ========================================

    const bookForm =
        new ActionFormData();

    bookForm.title(
        "Porter's Anvil"
    );

    bookForm.body(
        "Choose an enchantment:"
    );


    for (const entry of books) {

        bookForm.button(
            entry.info.name +
            "\n" +
            entry.info.description
        );
    }


    bookForm.button("Cancel");


    let bookResponse;

    try {

        bookResponse =
            await bookForm.show(player);
    }

    catch (error) {

        console.warn(
            "Book form error: " + error
        );

        return;
    }


    if (bookResponse.canceled) {
        return;
    }


    if (
        bookResponse.selection === undefined ||
        bookResponse.selection >= books.length
    ) {
        return;
    }


    const selectedBook =
        books[
            bookResponse.selection
        ];


    // ========================================
    // CHECK CURRENT LEVEL
    // ========================================

    const currentLevel =
        getEnchantmentLevel(
            selectedWeapon,
            selectedBook.info.type
        );


    if (
        currentLevel >=
        selectedBook.info.level
    ) {

        player.sendMessage(
            "That weapon already has an equal or higher " +
            selectedBook.info.name +
            " level."
        );

        return;
    }


    // ========================================
    // CONFIRM
    // ========================================

    const confirmForm =
        new MessageFormData();

    confirmForm.title(
        "Apply " +
        selectedBook.info.name +
        "?"
    );

    confirmForm.body(
        "Weapon: " +
        getItemName(selectedWeapon) +
        "\n\n" +

        "Enchantment: " +
        selectedBook.info.name +
        "\n\n" +

        selectedBook.info.description +
        "\n\n" +

        "The book will be consumed."
    );


    confirmForm.button1("Apply");
    confirmForm.button2("Cancel");


    let confirmResponse;

    try {

        confirmResponse =
            await confirmForm.show(player);
    }

    catch (error) {

        console.warn(
            "Confirmation error: " + error
        );

        return;
    }


    if (
        confirmResponse.canceled ||
        confirmResponse.selection !== 0
    ) {
        return;
    }


    // ========================================
    // GET CURRENT ITEMS AGAIN
    // ========================================

    const weapon =
        inventory.getItem(
            selectedWeaponSlot
        );


    const book =
        inventory.getItem(
            selectedBook.slot
        );


    if (
        !weapon ||
        !isWeapon(weapon)
    ) {

        player.sendMessage(
            "The weapon is no longer available."
        );

        return;
    }


    const bookInfo =
        getBookInfo(book);


    if (!bookInfo) {

        player.sendMessage(
            "The enchantment book is no longer available."
        );

        return;
    }


    // ========================================
    // VERIFY SECRET CODE
    // ========================================

    const code =
        book.getDynamicProperty(
            "porter:enchantment_code"
        );


    if (code !== bookInfo.code) {

        player.sendMessage(
            "Invalid enchantment book."
        );

        return;
    }


    // ========================================
    // APPLY ENCHANTMENT
    // ========================================

    applyEnchantment(
        weapon,
        bookInfo
    );


    inventory.setItem(
        selectedWeaponSlot,
        weapon
    );


    // ========================================
    // CONSUME BOOK
    // ========================================

    if (book.amount > 1) {

        book.amount -= 1;

        inventory.setItem(
            selectedBook.slot,
            book
        );
    }

    else {

        inventory.setItem(
            selectedBook.slot,
            undefined
        );
    }


    player.sendMessage(
        bookInfo.name +
        " applied!"
    );
}


// ==========================================
// OPEN CUSTOM ANVIL
// ==========================================

world.beforeEvents.playerInteractWithBlock(
    (event) => {

        if (!event.isFirstEvent) {
            return;
        }


        if (!isAnvil(event.block)) {
            return;
        }


        // Stop the normal vanilla anvil.
        event.cancel = true;


        // Open our custom anvil.
        system.run(() => {
            openCustomAnvil(event.player);
        });
    }
);