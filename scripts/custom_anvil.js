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
    },


    // ==============================
    // BALANCE
    // ==============================

    "porter:balance_book_1": {
        type: "balance",
        level: 1,
        code: 501,
        name: "Balance I",
        description: "10% critical hit chance"
    },

    "porter:balance_book_2": {
        type: "balance",
        level: 2,
        code: 502,
        name: "Balance II",
        description: "20% critical hit chance"
    },

    "porter:balance_book_3": {
        type: "balance",
        level: 3,
        code: 503,
        name: "Balance III",
        description: "30% critical hit chance"
    },

    "porter:balance_book_4": {
        type: "balance",
        level: 4,
        code: 504,
        name: "Balance IV",
        description: "40% critical hit chance"
    },

    "porter:balance_book_5": {
        type: "balance",
        level: 5,
        code: 505,
        name: "Balance V",
        description: "50% critical hit chance"
    },

    "porter:balance_book_6": {
        type: "balance",
        level: 6,
        code: 506,
        name: "Balance VI",
        description: "60% critical hit chance"
    },

    "porter:balance_book_7": {
        type: "balance",
        level: 7,
        code: 507,
        name: "Balance VII",
        description: "70% critical hit chance"
    },

    "porter:balance_book_8": {
        type: "balance",
        level: 8,
        code: 508,
        name: "Balance VIII",
        description: "80% critical hit chance"
    },


    // ==============================
    // BLEEDING
    // ==============================

    "porter:bleeding_book_1": {
        type: "bleeding",
        level: 1,
        code: 601,
        name: "Bleeding I",
        description: "Critical hits deal 1.65x damage"
    },

    "porter:bleeding_book_2": {
        type: "bleeding",
        level: 2,
        code: 602,
        name: "Bleeding II",
        description: "Critical hits deal 1.80x damage"
    },

    "porter:bleeding_book_3": {
        type: "bleeding",
        level: 3,
        code: 603,
        name: "Bleeding III",
        description: "Critical hits deal 1.95x damage"
    },

    "porter:bleeding_book_4": {
        type: "bleeding",
        level: 4,
        code: 604,
        name: "Bleeding IV",
        description: "Critical hits deal 2.10x damage"
    },

    "porter:bleeding_book_5": {
        type: "bleeding",
        level: 5,
        code: 605,
        name: "Bleeding V",
        description: "Critical hits deal 2.25x damage"
    },

    "porter:bleeding_book_6": {
        type: "bleeding",
        level: 6,
        code: 606,
        name: "Bleeding VI",
        description: "Critical hits deal 2.40x damage"
    },

    "porter:bleeding_book_7": {
        type: "bleeding",
        level: 7,
        code: 607,
        name: "Bleeding VII",
        description: "Critical hits deal 2.55x damage"
    },

    "porter:bleeding_book_8": {
        type: "bleeding",
        level: 8,
        code: 608,
        name: "Bleeding VIII",
        description: "Critical hits deal 2.70x damage"
    },

    "porter:bleeding_book_9": {
        type: "bleeding",
        level: 9,
        code: 609,
        name: "Bleeding IX",
        description: "Critical hits deal 2.85x damage"
    },

    "porter:bleeding_book_10": {
        type: "bleeding",
        level: 10,
        code: 610,
        name: "Bleeding X",
        description: "Critical hits deal 3.00x damage"
    },

    "porter:bleeding_book_11": {
        type: "bleeding",
        level: 11,
        code: 611,
        name: "Bleeding XI",
        description: "Critical hits deal 3.15x damage"
    },

    "porter:bleeding_book_12": {
        type: "bleeding",
        level: 12,
        code: 612,
        name: "Bleeding XII",
        description: "Critical hits deal 3.30x damage"
    },

    "porter:bleeding_book_13": {
        type: "bleeding",
        level: 13,
        code: 613,
        name: "Bleeding XIII",
        description: "Critical hits deal 3.45x damage"
    },

    "porter:bleeding_book_14": {
        type: "bleeding",
        level: 14,
        code: 614,
        name: "Bleeding XIV",
        description: "Critical hits deal 3.60x damage"
    },

    "porter:bleeding_book_15": {
        type: "bleeding",
        level: 15,
        code: 615,
        name: "Bleeding XV",
        description: "Critical hits deal 3.75x damage"
    },

    "porter:bleeding_book_16": {
        type: "bleeding",
        level: 16,
        code: 616,
        name: "Bleeding XVI",
        description: "Critical hits deal 3.90x damage"
    },

    "porter:bleeding_book_17": {
        type: "bleeding",
        level: 17,
        code: 617,
        name: "Bleeding XVII",
        description: "Critical hits deal 4.05x damage"
    },

    "porter:bleeding_book_18": {
        type: "bleeding",
        level: 18,
        code: 618,
        name: "Bleeding XVIII",
        description: "Critical hits deal 4.20x damage"
    },

    "porter:bleeding_book_19": {
        type: "bleeding",
        level: 19,
        code: 619,
        name: "Bleeding XIX",
        description: "Critical hits deal 4.35x damage"
    },

    "porter:bleeding_book_20": {
        type: "bleeding",
        level: 20,
        code: 620,
        name: "Bleeding XX",
        description: "Critical hits deal 4.50x damage"
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


function getBookInfo(item) {
    if (!item) {
        return undefined;
    }

    return ENCHANTMENT_BOOKS[item.typeId];
}


function getEnchantmentLevel(item, type) {
    if (!item) {
        return 0;
    }

    let propertyName;

    if (type === "strike") {
        propertyName = "porter:strike_level";
    } else if (type === "penetrating") {
        propertyName = "porter:penetrating_level";
    } else if (type === "balance") {
        propertyName = "porter:balance_level";
    } else if (type === "bleeding") {
        propertyName = "porter:bleeding_level";
    } else {
        return 0;
    }

    const level =
        item.getDynamicProperty(propertyName);

    if (typeof level !== "number") {
        return 0;
    }

    return level;
}
function isCompatibleWeapon(weapon, enchantmentType) {
    if (!weapon) {
        return false;
    }

    if (enchantmentType === "strike") {
        return (
            weapon.typeId.endsWith("_sword") ||
            weapon.typeId === "minecraft:trident"
        );
    }

    if (enchantmentType === "penetrating") {
        return (
            weapon.typeId.endsWith("_sword") ||
            weapon.typeId === "minecraft:trident"
        );
    }

    if (enchantmentType === "balance") {
        return weapon.typeId.endsWith("_sword");
    }

    if (enchantmentType === "bleeding") {
        return (
            weapon.typeId.endsWith("_sword") ||
            weapon.typeId === "minecraft:bow"
        );
    }

    return false;
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

    } else if (info.type === "penetrating") {

        weapon.setDynamicProperty(
            "porter:penetrating_level",
            info.level
        );

    } else if (info.type === "balance") {

        weapon.setDynamicProperty(
            "porter:balance_level",
            info.level
        );

    } else if (info.type === "bleeding") {

        weapon.setDynamicProperty(
            "porter:bleeding_level",
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
        const item = inventory.getItem(slot);

        if (!item) {
            continue;
        }

        const isPossibleWeapon =
            item.typeId.endsWith("_sword") ||
            item.typeId === "minecraft:trident" ||
            item.typeId === "minecraft:bow";

        if (!isPossibleWeapon) {
            continue;
        }

        weapons.push({
            slot: slot,
            item: item
        });
    }


    if (weapons.length === 0) {

        const form = new ActionFormData();

        form.title("Porter's Anvil");

        form.body(
            "You do not have a supported weapon."
        );

        form.button("Close");

        try {
            await form.show(player);
        } catch (error) {
            console.warn(
                "Anvil weapon form error: " + error
            );
        }

        return;
    }


    // ========================================
    // CHOOSE WEAPON
    // ========================================

    const weaponForm = new ActionFormData();

    weaponForm.title("Porter's Anvil");

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

        const balanceLevel =
            getEnchantmentLevel(
                entry.item,
                "balance"
            );

        const bleedingLevel =
            getEnchantmentLevel(
                entry.item,
                "bleeding"
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

        if (balanceLevel > 0) {
            buttonText +=
                "\nBalance " +
                balanceLevel;
        }

        if (bleedingLevel > 0) {
            buttonText +=
                "\nBleeding " +
                bleedingLevel;
        }


        weaponForm.button(buttonText);
    }


    weaponForm.button("Cancel");


    let weaponResponse;

    try {
        weaponResponse =
            await weaponForm.show(player);
    } catch (error) {
        console.warn(
            "Weapon form error: " + error
        );

        return;
    }


    if (
        weaponResponse.canceled ||
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


    if (!selectedWeapon) {
        player.sendMessage(
            "The weapon is no longer available."
        );

        return;
    }


    // ========================================
    // FIND COMPATIBLE BOOKS
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

        if (
            !isCompatibleWeapon(
                selectedWeapon,
                info.type
            )
        ) {
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

        const form = new ActionFormData();

        form.title("Porter's Anvil");

        form.body(
            "You do not have an enchantment book that can be used on this weapon."
        );

        form.button("Close");

        try {
            await form.show(player);
        } catch (error) {
            console.warn(
                "Book form error: " + error
            );
        }

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
    } catch (error) {
        console.warn(
            "Book form error: " + error
        );

        return;
    }


    if (
        bookResponse.canceled ||
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
    } catch (error) {
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


    if (!weapon) {

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
    // CHECK WEAPON COMPATIBILITY AGAIN
    // ========================================

    if (
        !isCompatibleWeapon(
            weapon,
            bookInfo.type
        )
    ) {

        player.sendMessage(
            bookInfo.name +
            " cannot be applied to that item."
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
    // CHECK LEVEL AGAIN
    // ========================================

    const oldLevel =
        getEnchantmentLevel(
            weapon,
            bookInfo.type
        );


    if (
        oldLevel >=
        bookInfo.level
    ) {

        player.sendMessage(
            "That weapon already has an equal or higher " +
            bookInfo.name +
            " level."
        );

        return;
    }


    // ========================================
    // APPLY
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
    // CONSUME ONE BOOK
    // ========================================

    if (book.amount > 1) {

        book.amount -= 1;

        inventory.setItem(
            selectedBook.slot,
            book
        );

    } else {

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


        // Open our custom anvil after the
        // interaction event finishes.
        system.run(() => {
            openCustomAnvil(event.player);
        });
    }
);