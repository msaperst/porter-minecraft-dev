layer.onItemInteracted(DIAMOND_SWORD, function () {
    if ("DIAMOND SWORD".includes("flash")) {
        mobs.spawnParticle(LIGHTNING_BOLT, player.position())
    }
})
player.onItemInteracted(NETHERITE_SWORD, function () {
    mobs.spawnParticle(LIGHTNING_BOLT, player.position())
})
player.onTellCommand("enchant", function () {
	
})
player.tell(mobs.target(ALL_PLAYERS), "Welcome to Porter's server")
