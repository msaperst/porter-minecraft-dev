import { world, system } from "@minecraft/server";
import {
    ActionFormData,
    MessageFormData
} from "@minecraft/server-ui";

const STRIKE_BOOKS = {
    "porter:strike_book_1": {
        level: 1,
        code: 321,
        name: "Strike I",
        chance: "3%"
    },

    "porter:strike_book_2": {
        level: 2,
        code: 322,
        name: "Strike II",
        chance: "6%"
    },

    "porter:strike_book_3": {
        level: 3,
        code: 323,
        name: "Strike III",
        chance: "9%"
    },

    "porter:strike_book_4": {
        level: 4,
        code: 324,
        name: "Strike IV",
        chance: "12%"
    },

    "porter:strike_book_5": {
        level: 5,
        code: 325,
        name: "Strike V",
        chance: "15%"
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
    const inventory =
        player.getComponent("minecraft:inventory");

    if (!inventory || !inventory.container) {
        return undefined;
    }

    return inventory.container;
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


function getWeaponName(item) {
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


function getStrikeLevel(item) {
    if (!item) {
        return 0;
    }

    const level =
        item.getDynamicProperty("porter:strike_level");

    if (typeof level !== "number") {
        return 0;
    }

    return level;
}


function getStrikeBookInfo(item) {
    if (!item) {
        return undefined;
    }

    return STRIKE_BOOKS[item.typeId];
}


function markStrikeBook(item) {
    const info = getStrikeBookInfo(item);

    if (!info) {
        return item;
    }

    item.setDynamicProperty(
        "porter:strike_code",
        info.code
    );

    return item;
}


async function openStrikeAnvil(player) {
    const inventory = getInventory(player);

    if (!inventory) {
        return;
    }


    // ----------------------------------------
    // FIND WEAPONS
    // ----------------------------------------

    const weapons = [];

    for (
        let slot = 0;
        slot < inventory.size;
        slot++
    ) {
        const item = inventory.getItem(slot);

        if (!isWeapon(item)) {
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
            "You need a sword or trident."
        );

        form.button("Close");

        try {
            await form.show(player);
        } catch (error) {
            console.warn(
                "Anvil error: " + error
            );
        }

        return;
    }


    // ----------------------------------------
    // CHOOSE WEAPON
    // ----------------------------------------

    const weaponForm = new ActionFormData();

    weaponForm.title("Porter's Anvil");

    weaponForm.body(
        "Choose the weapon you want to enchant:"
    );

    for (const entry of weapons) {
        const currentLevel =
            getStrikeLevel(entry.item);

        let buttonText =
            getWeaponName(entry.item);

        if (currentLevel > 0) {
            buttonText +=
                "\nStrike " + currentLevel;
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
        weapons[weaponResponse.selection].slot;

    const selectedWeapon =
        inventory.getItem(selectedWeaponSlot);


    if (
        !selectedWeapon ||
        !isWeapon(selectedWeapon)
    ) {
        player.sendMessage(
            "§cThat weapon is no longer available."
        );

        return;
    }


    // ----------------------------------------
    // FIND STRIKE BOOKS
    // ----------------------------------------

    const books = [];

    for (
        let slot = 0;
        slot < inventory.size;
        slot++
    ) {
        const item = inventory.getItem(slot);

        const info = getStrikeBookInfo(item);

        if (!info) {
            continue;
        }

        const markedBook =
            markStrikeBook(item);

        inventory.setItem(slot, markedBook);

        books.push({
            slot: slot,
            item: markedBook,
            info: info
        });
    }


    if (books.length === 0) {
        player.sendMessage(
            "§cYou need a Strike enchantment book."
        );

        return;
    }


    // ----------------------------------------
    // CHOOSE BOOK
    // ----------------------------------------

    const bookForm = new ActionFormData();

    bookForm.title("Porter's Anvil");

    bookForm.body(
        "Choose a Strike book:"
    );

    for (const entry of books) {
        bookForm.button(
            entry.info.name +
            "\n" +
            entry.info.chance +
            " chance"
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
        books[bookResponse.selection];


    // ----------------------------------------
    // CHECK EXISTING STRIKE LEVEL
    // ----------------------------------------

    const currentStrikeLevel =
        getStrikeLevel(selectedWeapon);


    if (
        currentStrikeLevel >=
        selectedBook.info.level
    ) {
        player.sendMessage(
            "§cThat weapon already has an equal or higher Strike level."
        );

        return;
    }


    // ----------------------------------------
    // CONFIRM
    // ----------------------------------------

    const confirmForm =
        new MessageFormData();

    confirmForm.title(
        "Apply " +
        selectedBook.info.name +
        "?"
    );

    confirmForm.body(
        "Weapon: " +
        getWeaponName(selectedWeapon) +
        "\n\n" +
        "Enchantment: " +
        selectedBook.info.name +
        "\n" +
        "Lightning chance: " +
        selectedBook.info.chance +
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


    // ----------------------------------------
    // GET CURRENT ITEMS AGAIN
    // ----------------------------------------

    const weapon =
        inventory.getItem(selectedWeaponSlot);

    const book =
        inventory.getItem(selectedBook.slot);


    if (
        !weapon ||
        !isWeapon(weapon)
    ) {
        player.sendMessage(
            "§cThe weapon is no longer available."
        );

        return;
    }


    if (
        !book ||
        !getStrikeBookInfo(book)
    ) {
        player.sendMessage(
            "§cThe Strike book is no longer available."
        );

        return;
    }


    const bookInfo =
        getStrikeBookInfo(book);


    // ----------------------------------------
    // CHECK SECRET CODE
    // ----------------------------------------

    const code =
        book.getDynamicProperty(
            "porter:strike_code"
        );


    if (code !== bookInfo.code) {
        player.sendMessage(
            "§cInvalid Strike book."
        );

        return;
    }


    // ----------------------------------------
    // APPLY STRIKE
    // ----------------------------------------

    weapon.setDynamicProperty(
        "porter:strike_level",
        bookInfo.level
    );


    const oldLore =
        weapon.getLore();


    weapon.setLore([
        ...oldLore,
        bookInfo.name,
        bookInfo.chance +
        " chance to strike the target with lightning"
    ]);


    inventory.setItem(
        selectedWeaponSlot,
        weapon
    );


    // ----------------------------------------
    // CONSUME BOOK
    // ----------------------------------------

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
        "§b" +
        bookInfo.name +
        " applied to " +
        getWeaponName(weapon) +
        "!"
    );
}


// ----------------------------------------
// OPEN CUSTOM ANVIL
// ----------------------------------------

world.beforeEvents.playerInteractWithBlock.subscribe(
    (event) => {

        if (!event.isFirstEvent) {
            return;
        }

        if (!isAnvil(event.block)) {
            return;
        }

        event.cancel = true;

        system.run(() => {
            openStrikeAnvil(event.player);
        });
    }
);