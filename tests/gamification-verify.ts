import assert from "node:assert";
import {
  calculateLevelInfo,
  ensureGamificationProgress,
  awardGamificationRewards,
  buyAvatarItem,
  equipAvatarItem,
  unequipAvatarSlot,
  setAvatarColors,
  getCombinedStats,
  buyShopItem,
  equipShopItem,
  unequipShopSlot,
  selectRpgCharacter,
} from "../src/services/gamification";
import {
  AVATAR_ITEMS,
  DEFAULT_AVATAR_CONFIG,
  STARTER_UNLOCKED_ITEM_IDS,
  getItemById,
  getItemsBySlot,
  getItemsForArchetype,
  CHARACTERS_DATABASE,
  SHOP_ITEMS_CATALOG,
  getCharacterById,
  getShopItemById,
  STARTER_EQUIPMENT,
} from "../src/data/avatar-items";
import { UserProgress, SupportedLanguage } from "../src/types/language";
import { AvatarItem, SlotType, ALL_SLOT_TYPES } from "../src/types/avatar";

console.log("🎮 Starting Gamification & Modular Avatar Verification Suite...");

// ==========================================
// Test 1: Level Progression & Boundary Cases
// ==========================================
console.log("➡️ Test 1: Level thresholds & boundary edge cases");
{
  // Negative XP -> clamped to 0, Level 1
  const neg = calculateLevelInfo(-100);
  assert.strictEqual(neg.level, 1);
  assert.strictEqual(neg.currentXp, 0);
  assert.strictEqual(neg.progressPercent, 0);

  // Exact 0 XP
  const zero = calculateLevelInfo(0);
  assert.strictEqual(zero.level, 1);
  assert.strictEqual(zero.progressPercent, 0);
  assert.strictEqual(zero.xpForNextLevel, 100);

  // Mid level 1 (50 XP -> 50%)
  const mid1 = calculateLevelInfo(50);
  assert.strictEqual(mid1.level, 1);
  assert.strictEqual(mid1.progressPercent, 50);

  // Exact boundary level 2 (100 XP)
  const l2 = calculateLevelInfo(100);
  assert.strictEqual(l2.level, 2);
  assert.strictEqual(l2.progressPercent, 0);
  assert.strictEqual(l2.xpForCurrentLevel, 100);
  assert.strictEqual(l2.xpForNextLevel, 250);

  // Mid level 2 (175 XP -> 50% between 100 and 250)
  const mid2 = calculateLevelInfo(175);
  assert.strictEqual(mid2.level, 2);
  assert.strictEqual(mid2.progressPercent, 50);

  // High XP beyond level 10 (e.g. 5000 XP)
  const beyond = calculateLevelInfo(5000);
  assert.strictEqual(beyond.level, 10);
  assert.ok(beyond.progressPercent >= 0 && beyond.progressPercent <= 100);
  assert.ok(!Number.isNaN(beyond.progressPercent));

  console.log("  ✓ Level progression & boundaries verified!");
}

// ==========================================
// Test 2: Gamification Progress Initialization
// ==========================================
console.log("➡️ Test 2: Progress normalization & defaults");
{
  const emptyProgress: UserProgress = {
    xp: 0,
    streak: 0,
    lastActiveDate: "2026-10-03",
    completedScenarios: [],
    savedPhrases: [],
    customFlashcards: [],
  };

  const initialized = ensureGamificationProgress(emptyProgress);
  assert.strictEqual(initialized.coins, 150, "Should start with 150 welcome coins");
  assert.strictEqual(initialized.level, 1);
  assert.strictEqual(initialized.skillPoints, 1);
  assert.ok(initialized.equippedAvatar);
  assert.strictEqual(initialized.equippedAvatar.archetype, "human");
  assert.ok(Array.isArray(initialized.unlockedAvatarItems));
  assert.ok(initialized.unlockedAvatarItems.length > 0);

  // Check starter items are unlocked
  for (const starterId of STARTER_UNLOCKED_ITEM_IDS) {
    assert.ok(
      initialized.unlockedAvatarItems.includes(starterId),
      `Starter item ${starterId} should be in unlocked items`
    );
  }

  // Verify that paid archetypes (wolf, cat, dragon, elemental, goblin) are NOT unlocked by default
  const paidArchetypes = [
    "starter_animal_wolf",
    "starter_animal_cat",
    "starter_animal_dragon",
    "starter_monster_elemental",
    "starter_monster_goblin",
  ];
  for (const paidId of paidArchetypes) {
    assert.strictEqual(
      initialized.unlockedAvatarItems.includes(paidId),
      false,
      `Paid archetype ${paidId} must not be unlocked by default`
    );
  }

  console.log("  ✓ Progress normalization & starter unlock boundary verified!");
}

// ==========================================
// Test 3: Rewards & Level Up Calculations
// ==========================================
console.log("➡️ Test 3: XP, Coins, and Level Up awards");
{
  const baseProgress: UserProgress = {
    xp: 50,
    streak: 1,
    lastActiveDate: "2026-10-03",
    completedScenarios: [],
    savedPhrases: [],
    customFlashcards: [],
    coins: 100,
    level: 1,
    skillPoints: 1,
  };

  // Award XP without level up (50 + 30 = 80 < 100)
  const noLvl = awardGamificationRewards(baseProgress, 30, 20);
  assert.strictEqual(noLvl.leveledUp, false);
  assert.strictEqual(noLvl.updated.xp, 80);
  assert.strictEqual(noLvl.updated.coins, 120);
  assert.strictEqual(noLvl.updated.level, 1);

  // Award XP that triggers level up (80 + 30 = 110 >= 100)
  const withLvl = awardGamificationRewards(noLvl.updated, 30, 10);
  assert.strictEqual(withLvl.leveledUp, true);
  assert.strictEqual(withLvl.newLevel, 2);
  assert.strictEqual(withLvl.updated.level, 2);
  assert.strictEqual(withLvl.bonusCoins, 100, "100 bonus coins per level gained");
  // 120 previous + 10 earned + 100 bonus = 230
  assert.strictEqual(withLvl.updated.coins, 230);
  assert.strictEqual(withLvl.updated.skillPoints, 2);

  // Multi-level leap (e.g. +1000 XP in one go)
  const leap = awardGamificationRewards(withLvl.updated, 1000, 50);
  assert.strictEqual(leap.leveledUp, true);
  assert.ok((leap.newLevel ?? 0) >= 5, `Expected level >= 5, got ${leap.newLevel}`);
  assert.ok((leap.bonusCoins ?? 0) >= 300);

  console.log("  ✓ Rewards & Level Up mechanics verified!");
}

// ==========================================
// Test 4: Avatar Catalog Completeness & Archetypes
// ==========================================
console.log("➡️ Test 4: Avatar Catalog completeness & Archetypes");
{
  assert.ok(AVATAR_ITEMS.length >= 25, "Catalog should have ample variety");

  // Verify unique IDs
  const ids = new Set<string>();
  for (const item of AVATAR_ITEMS) {
    assert.ok(!ids.has(item.id), `Duplicate item ID found: ${item.id}`);
    ids.add(item.id);
  }

  // Verify all archetypes required by the user are supported
  // "animal/humano/monstro"
  const humanItems = getItemsForArchetype("human");
  const animalItems = getItemsForArchetype("animal");
  const monsterItems = getItemsForArchetype("monster");

  assert.ok(humanItems.length > 0, "Human archetype items must exist");
  assert.ok(animalItems.length > 0, "Animal archetype items must exist");
  assert.ok(monsterItems.length > 0, "Monster archetype items must exist");

  // Verify specific archetype options
  // Animal: Owl, Wolf, Cat, Dragon
  const owlItem = getItemById("starter_animal_owl");
  const wolfItem = getItemById("starter_animal_wolf");
  const catItem = getItemById("starter_animal_cat");
  const dragonItem = getItemById("starter_animal_dragon");

  assert.ok(owlItem, "Owl archetype must exist");
  assert.ok(wolfItem, "Wolf archetype must exist");
  assert.ok(catItem, "Cat archetype must exist");
  assert.ok(dragonItem, "Dragon archetype must exist");

  // Monster: Golem, Elemental, Goblin
  const golemItem = getItemById("starter_monster_golem");
  const elementalItem = getItemById("starter_monster_elemental");
  const goblinItem = getItemById("starter_monster_goblin");

  assert.ok(golemItem, "Golem archetype must exist");
  assert.ok(elementalItem, "Elemental archetype must exist");
  assert.ok(goblinItem, "Goblin archetype must exist");

  // Verify all 5 equip slots have items
  const slots: ("head" | "eyes" | "body" | "hand" | "aura")[] = [
    "head",
    "eyes",
    "body",
    "hand",
    "aura",
  ];
  for (const slot of slots) {
    const itemsInSlot = getItemsBySlot(slot);
    assert.ok(itemsInSlot.length >= 3, `Slot ${slot} must have at least 3 items, found ${itemsInSlot.length}`);
  }

  console.log("  ✓ Catalog integrity & archetypes verified!");
}

// ==========================================
// Test 5: Shop Purchasing & Equip Logic
// ==========================================
console.log("➡️ Test 5: Virtual Item Shop buying & equipping");
{
  const testUser: UserProgress = {
    xp: 300, // Level 3
    streak: 3,
    lastActiveDate: "2026-10-03",
    completedScenarios: [],
    savedPhrases: [],
    customFlashcards: [],
    coins: 300,
    level: 3,
    skillPoints: 3,
    unlockedAvatarItems: ["starter_human", "starter_cap", "starter_glasses"],
    equippedAvatar: {
      archetype: "human",
      subType: "adventurer",
      primaryColor: "#0ea5e9",
      secondaryColor: "#8b5cf6",
      equipped: {},
    },
  };

  // 5a: Attempt to buy already owned item
  const buyAlreadyOwned = buyAvatarItem(testUser, getItemById("starter_cap")!);
  assert.strictEqual(buyAlreadyOwned.success, false);
  assert.ok(buyAlreadyOwned.error?.includes("já possui"));

  // 5b: Attempt to buy level-gated item (minLevel > 3)
  const highLevelItem: AvatarItem = {
    id: "test-high-level",
    name: "Crown of Gods",
    slot: "head",
    archetype: "all",
    price: 100,
    minLevel: 8,
    rarity: "legendary",
    description: "Requires level 8",
  };
  const buyGated = buyAvatarItem(testUser, highLevelItem);
  assert.strictEqual(buyGated.success, false);
  assert.ok(buyGated.error?.includes("requer nível 8"));

  // 5c: Attempt to buy with insufficient coins
  const expensiveItem: AvatarItem = {
    id: "test-expensive",
    name: "Golden Armor",
    slot: "body",
    archetype: "all",
    price: 9999,
    minLevel: 1,
    rarity: "epic",
    description: "Costs 9999 coins",
  };
  const buyBroke = buyAvatarItem(testUser, expensiveItem);
  assert.strictEqual(buyBroke.success, false);
  assert.ok(buyBroke.error?.includes("insuficientes"));

  // 5d: Valid buy of available item (head_wizard_hat costs 120 coins, minLevel 1)
  const targetItem = getItemById("head_wizard_hat");
  assert.ok(targetItem, "head_wizard_hat must exist");
  const buySuccess = buyAvatarItem(testUser, targetItem!);
  assert.strictEqual(buySuccess.success, true);
  assert.ok(buySuccess.updated);
  assert.strictEqual(buySuccess.updated.coins, 300 - targetItem!.price);
  assert.ok(buySuccess.updated.unlockedAvatarItems?.includes(targetItem!.id));
  assert.strictEqual(buySuccess.updated.equippedAvatar?.equipped.head, targetItem!.id);

  // 5e: Equip archetype item
  const owlItem = getItemById("starter_animal_owl")!;
  const equippedOwl = equipAvatarItem(buySuccess.updated, owlItem);
  assert.strictEqual(equippedOwl.equippedAvatar?.archetype, "animal");
  assert.strictEqual(equippedOwl.equippedAvatar?.subType, "owl");

  // 5f: Unequip slot
  const unequipped = unequipAvatarSlot(equippedOwl, "head");
  assert.strictEqual(unequipped.equippedAvatar?.equipped.head, undefined);

  // 5g: Change colors
  const colored = setAvatarColors(unequipped, "#ff0055", "#00ffcc");
  assert.strictEqual(colored.equippedAvatar?.primaryColor, "#ff0055");
  assert.strictEqual(colored.equippedAvatar?.secondaryColor, "#00ffcc");

  // 5h: Purchase paid archetype (Wolf: 80 coins, Level 1)
  const wolfItem = getItemById("starter_animal_wolf")!;
  assert.ok(wolfItem, "starter_animal_wolf must exist in catalog");
  assert.strictEqual(wolfItem.price, 80, "Wolf should cost 80 coins");
  const buyWolf = buyAvatarItem(colored, wolfItem);
  assert.strictEqual(buyWolf.success, true);
  assert.ok(buyWolf.updated);
  assert.strictEqual(buyWolf.updated.coins, colored.coins! - 80);
  assert.ok(buyWolf.updated.unlockedAvatarItems?.includes("starter_animal_wolf"));
  assert.strictEqual(buyWolf.updated.equippedAvatar?.archetype, "animal");
  assert.strictEqual(buyWolf.updated.equippedAvatar?.subType, "wolf");

  console.log("  ✓ Virtual Shop purchase & equip mechanics verified!");
}

// ==========================================
// Test 6: Storage Gamification & Level Up Synchronization
// ==========================================
console.log("➡️ Test 6: Storage addXP Gamification Synchronization");
{
  const mockCurrent: UserProgress = {
    xp: 60,
    coins: 150,
    level: 1,
    skillPoints: 1,
    streakDays: 1,
    lastActiveDate: "2026-10-03",
    cardsMasteredCount: 0,
    phrasesAnalyzedCount: 0,
    messagesSentCount: 0,
    dailySprintDone: false,
    audioSpeed: 1.0,
  };

  // Adding 60 XP: 60 + 60 = 120 XP -> Triggers level up to 2 (threshold: 100)
  // Bonus coins: +100, earned coins: +30 -> Total coins: 150 + 130 = 280
  const reward = awardGamificationRewards(mockCurrent, 60, 30);
  assert.strictEqual(reward.leveledUp, true);
  assert.strictEqual(reward.newLevel, 2);
  assert.strictEqual(reward.updated.level, 2);
  assert.strictEqual(reward.updated.coins, 280);
  assert.strictEqual(reward.updated.skillPoints, 2);

  console.log("  ✓ Storage addXP Gamification Synchronization verified!");
}

// ==========================================
// Test 7: RPG Character Database & Language Affinities
// ==========================================
console.log("➡️ Test 7: RPG Characters Database & Language Affinities");
{
  assert.strictEqual(CHARACTERS_DATABASE.length, 6, "Must contain exactly 6 RPG characters");

  const expectedIds = ["valerius", "kazan", "lyra", "astrid", "anubis_shadow", "tengu_kurama"];
  for (const id of expectedIds) {
    const char = getCharacterById(id);
    assert.ok(char, `Character ${id} must exist`);
    assert.ok(char.name, `Character ${id} must have a name`);
    assert.ok(char.title, `Character ${id} must have a title`);
    assert.ok(char.category, `Character ${id} must have a category`);
    assert.ok(char.lore, `Character ${id} must have lore`);
    assert.ok(char.nativeLanguageBonus, `Character ${id} must have nativeLanguageBonus`);
    assert.ok(char.baseSpriteAsset, `Character ${id} must have baseSpriteAsset`);
  }

  // Valerius (HUMAN_MALE, Romance_Languages)
  const valerius = getCharacterById("valerius")!;
  assert.strictEqual(valerius.category, "HUMAN_MALE");
  assert.strictEqual(valerius.nativeLanguageBonus, "Romance_Languages");
  assert.ok(valerius.supportedLanguageBonusIds?.includes("es"));

  // Kazan (HUMAN_MALE, Germanic_Languages)
  const kazan = getCharacterById("kazan")!;
  assert.strictEqual(kazan.category, "HUMAN_MALE");
  assert.strictEqual(kazan.nativeLanguageBonus, "Germanic_Languages");
  assert.ok(kazan.supportedLanguageBonusIds?.includes("de"));

  // Lyra (HUMAN_FEMALE, Asian_Languages)
  const lyra = getCharacterById("lyra")!;
  assert.strictEqual(lyra.category, "HUMAN_FEMALE");
  assert.strictEqual(lyra.nativeLanguageBonus, "Asian_Languages");
  assert.ok(lyra.supportedLanguageBonusIds?.includes("ja"));

  // Valkíria Astrid (HUMAN_FEMALE, Nordic_Languages)
  const astrid = getCharacterById("astrid")!;
  assert.strictEqual(astrid.category, "HUMAN_FEMALE");
  assert.strictEqual(astrid.nativeLanguageBonus, "Nordic_Languages");

  // Sombra de Anúbis (MYTHIC_BEAST, Semitic_Languages)
  const anubis = getCharacterById("anubis_shadow")!;
  assert.strictEqual(anubis.category, "MYTHIC_BEAST");
  assert.strictEqual(anubis.nativeLanguageBonus, "Semitic_Languages");

  // Tengu Kurama (MYTHIC_BEAST, East_Asian_Languages)
  const tengu = getCharacterById("tengu_kurama")!;
  assert.strictEqual(tengu.category, "MYTHIC_BEAST");
  assert.strictEqual(tengu.nativeLanguageBonus, "East_Asian_Languages");

  console.log("  ✓ All 6 RPG characters and archetypes verified!");
}

// ==========================================
// Test 8: RPG Shop Catalog Completeness & 7 Slots
// ==========================================
console.log("➡️ Test 8: Shop Catalog Completeness & 7 Equipment Slots");
{
  assert.ok(SHOP_ITEMS_CATALOG.length >= 18, "Catalog should have comprehensive items");

  // Verify all 7 slots are present
  for (const slot of ALL_SLOT_TYPES) {
    const itemsInSlot = SHOP_ITEMS_CATALOG.filter((i) => i.slot === slot);
    assert.ok(itemsInSlot.length >= 2, `Slot ${slot} must have at least 2 items in catalog`);
  }

  // Verify specific items required by user specification:
  // HEAD: Elmo de Astora, Chapéu Pontudo de Vivi, Coroa de Louros de Sangue
  const elmoAstora = getShopItemById("head_elmo_astora");
  assert.ok(elmoAstora, "Elmo de Astora must exist");
  assert.strictEqual(elmoAstora.slot, "HEAD");

  const chapeuVivi = getShopItemById("head_chapeu_vivi");
  assert.ok(chapeuVivi, "Chapéu Pontudo de Vivi must exist");
  assert.strictEqual(chapeuVivi.slot, "HEAD");

  const coroaLouros = getShopItemById("head_coroa_louros_sangue");
  assert.ok(coroaLouros, "Coroa de Louros de Sangue must exist");
  assert.strictEqual(coroaLouros.slot, "HEAD");

  // CHEST: Armadura do Lobo Branco, Manto de Dalaran
  const loboBranco = getShopItemById("chest_armadura_lobo_branco");
  assert.ok(loboBranco, "Armadura do Lobo Branco must exist");
  assert.strictEqual(loboBranco.slot, "CHEST");

  const dalaran = getShopItemById("chest_manto_dalaran");
  assert.ok(dalaran, "Manto de Dalaran must exist");
  assert.strictEqual(dalaran.slot, "CHEST");

  // LEGS: Grevas do Andarilho de Hyrule
  const grevasHyrule = getShopItemById("legs_grevas_hyrule");
  assert.ok(grevasHyrule, "Grevas do Andarilho de Hyrule must exist");
  assert.strictEqual(grevasHyrule.slot, "LEGS");

  // MAIN_HAND: Espada do Selo Arcano, Lâmina Colossal de Aço
  const espadaArcana = getShopItemById("main_hand_espada_selo_arcano");
  assert.ok(espadaArcana, "Espada do Selo Arcano must exist");
  assert.strictEqual(espadaArcana.slot, "MAIN_HAND");

  const laminaColossal = getShopItemById("main_hand_lamina_colossal_aco");
  assert.ok(laminaColossal, "Lâmina Colossal de Aço must exist");
  assert.strictEqual(laminaColossal.slot, "MAIN_HAND");

  // BACK: Mochila do Escriba Expedicionário, Asas do Éter Noturno
  const mochila = getShopItemById("back_mochila_escriba");
  assert.ok(mochila, "Mochila do Escriba Expedicionário must exist");
  assert.strictEqual(mochila.slot, "BACK");

  const asasEter = getShopItemById("back_asas_eter_noturno");
  assert.ok(asasEter, "Asas do Éter Noturno must exist");
  assert.strictEqual(asasEter.slot, "BACK");

  // ACCESSORY: Fragmento da Pedra de Roseta
  const pedraRoseta = getShopItemById("accessory_pedra_roseta");
  assert.ok(pedraRoseta, "Fragmento da Pedra de Roseta must exist");
  assert.strictEqual(pedraRoseta.slot, "ACCESSORY");
  assert.strictEqual(pedraRoseta.rarity, "MYTHIC");

  // OFF_HAND items
  const offHandItems = SHOP_ITEMS_CATALOG.filter((i) => i.slot === "OFF_HAND");
  assert.ok(offHandItems.length >= 3, "OFF_HAND must have accessible and advanced items");
  assert.ok(getShopItemById("off_hand_grimorio_idiomas"), "Grimório dos Idiomas Perdidos must exist");

  console.log("  ✓ All required shop catalog items and 7 slots verified!");
}

// ==========================================
// Test 9: Combined Stats Calculation & Language Affinities
// ==========================================
console.log("➡️ Test 9: Combined Stats Calculation & Affinities");
{
  const baseUser: UserProgress = {
    xp: 200,
    coins: 500,
    level: 2,
    skillPoints: 2,
    streakDays: 5,
    lastActiveDate: "2026-10-04",
    selectedCharacterId: "valerius",
    equipment: {
      HEAD: "head_elmo_astora", // xpMultiplier: 0.10, streakProtection: 1
      CHEST: "chest_tunica_novico", // xpMultiplier: 0.02
      LEGS: "legs_botas_rusticas", // coinBonus: 0.02
      MAIN_HAND: "main_hand_pena_prata", // xpMultiplier: 0.03
      OFF_HAND: "off_hand_adaga_precisao", // xpMultiplier: 0.03
      BACK: "back_capa_viajante", // xpMultiplier: 0.02
      ACCESSORY: "accessory_amuleto_concentracao", // xpMultiplier: 0.03
    },
  };

  // With matching language for Valerius ("es" in Romance_Languages)
  // Item XP: 0.10 + 0.02 + 0.03 + 0.03 + 0.02 + 0.03 = 0.23
  // Char XP (matching): 0.15
  // finalXpMultiplier: 1.0 + 0.23 + 0.15 = 1.38
  // streakProtection: 1
  const statsSpanish = getCombinedStats(baseUser, "es");
  assert.strictEqual(statsSpanish.characterBonus.active, true);
  assert.strictEqual(statsSpanish.characterBonus.xpMultiplier, 0.15);
  assert.strictEqual(statsSpanish.finalXpMultiplier, 1.38);
  assert.strictEqual(statsSpanish.finalStreakProtection, 1);

  // With non-matching language for Valerius ("ja")
  // Char XP (non-matching baseline): 0.05
  // finalXpMultiplier: 1.0 + 0.23 + 0.05 = 1.28
  const statsJapanese = getCombinedStats(baseUser, "ja");
  assert.strictEqual(statsJapanese.characterBonus.active, false);
  assert.strictEqual(statsJapanese.finalXpMultiplier, 1.28);

  // Equip Fragmento da Pedra de Roseta (+0.35 XP, +0.30 coins, +3 streak protection)
  const boostedUser = equipShopItem(baseUser, "accessory_pedra_roseta");
  const statsRosetta = getCombinedStats(boostedUser, "es");
  // Item XP: 0.23 - 0.03 (amuleto) + 0.35 (roseta) = 0.55
  // finalXpMultiplier: 1.0 + 0.55 + 0.15 = 1.70
  assert.strictEqual(statsRosetta.finalXpMultiplier, 1.7);
  // Streak protection: 1 (elmo) + 3 (roseta) = 4
  assert.strictEqual(statsRosetta.finalStreakProtection, 4);
  assert.ok(statsRosetta.finalCoinBonus > 1.3);

  console.log("  ✓ Combined stats calculation and language bonuses verified!");
}

// ==========================================
// Test 10: Shop Purchase, Equip, Unequip, and Character Selection
// ==========================================
console.log("➡️ Test 10: Shop Purchase, Equip, Unequip & Character Switching");
{
  const testPlayer: UserProgress = {
    xp: 500, // Level 4
    coins: 400,
    level: 4,
    skillPoints: 4,
    streakDays: 3,
    lastActiveDate: "2026-10-04",
    inventoryItemIds: ["head_tiara_aprendiz"],
    selectedCharacterId: "valerius",
    equipment: { ...STARTER_EQUIPMENT },
  };

  // 10a: Level gate check (Asas do Éter Noturno requires level 6, user is level 4)
  const buyGated = buyShopItem(testPlayer, "back_asas_eter_noturno");
  assert.strictEqual(buyGated.success, false);
  assert.ok(buyGated.error?.includes("requer nível 6"));

  // 10b: Insufficient coins (Armadura do Lobo Branco costs 300, user has 50)
  const buyBroke = buyShopItem({ ...testPlayer, coins: 50 }, "chest_armadura_lobo_branco");
  assert.strictEqual(buyBroke.success, false);
  assert.ok(buyBroke.error?.includes("Moedas insuficientes"));

  // 10c: Valid buy (Armadura do Lobo Branco: 300 coins, requires level 4)
  const buyArmour = buyShopItem(testPlayer, "chest_armadura_lobo_branco");
  assert.strictEqual(buyArmour.success, true);
  assert.ok(buyArmour.updated);
  assert.strictEqual(buyArmour.updated.coins, 100); // 400 - 300
  assert.ok(buyArmour.updated.inventoryItemIds?.includes("chest_armadura_lobo_branco"));
  assert.strictEqual(buyArmour.updated.equipment?.CHEST, "chest_armadura_lobo_branco");

  // 10d: Unequip slot
  const unequipped = unequipShopSlot(buyArmour.updated, "CHEST");
  assert.strictEqual(unequipped.equipment?.CHEST, null);

  // 10e: Character switching to Tengu Kurama
  const switchedChar = selectRpgCharacter(unequipped, "tengu_kurama");
  assert.strictEqual(switchedChar.selectedCharacterId, "tengu_kurama");
  assert.strictEqual(switchedChar.equippedAvatar?.archetype, "monster");
  assert.strictEqual(switchedChar.equippedAvatar?.subType, "tengu_kurama_beast");

  // Switch to Astrid
  const switchedAstrid = selectRpgCharacter(switchedChar, "astrid");
  assert.strictEqual(switchedAstrid.selectedCharacterId, "astrid");
  assert.strictEqual(switchedAstrid.equippedAvatar?.archetype, "human");
  assert.strictEqual(switchedAstrid.equippedAvatar?.subType, "astrid_valkyrie");

  console.log("  ✓ Shop purchase, equip, unequip, and character switching verified!");
}

// ==========================================
// Test 11: Unequip Null Preservation in ensureGamificationProgress
// ==========================================
console.log("➡️ Test 11: Unequip Null Preservation & Avatar Config Integrity");
{
  const testPlayer: UserProgress = {
    xp: 200,
    coins: 300,
    level: 2,
    equipment: {
      HEAD: null,
      CHEST: "chest_manto_dalaran",
      LEGS: null,
      MAIN_HAND: null,
      OFF_HAND: null,
      BACK: null,
      ACCESSORY: null,
    },
  };

  const normalized = ensureGamificationProgress(testPlayer);
  assert.strictEqual(normalized.equipment?.HEAD, null, "HEAD must remain null when explicitly unequipped");
  assert.strictEqual(normalized.equipment?.LEGS, null, "LEGS must remain null when explicitly unequipped");
  assert.strictEqual(normalized.equipment?.CHEST, "chest_manto_dalaran", "Equipped CHEST must remain");
  assert.strictEqual(normalized.equippedAvatar?.equipped.HEAD, null, "Avatar equipped.HEAD must remain null");
  assert.strictEqual(normalized.equippedAvatar?.equipped.head, null, "Avatar equipped.head must remain null");
  assert.strictEqual(normalized.equippedAvatar?.equipped.LEGS, null, "Avatar equipped.LEGS must remain null");
  assert.strictEqual(normalized.equippedAvatar?.equipped.legs, null, "Avatar equipped.legs must remain null");

  console.log("  ✓ Unequipped null slots preservation verified!");
}

// ==========================================
// Test 12: getCombinedStats Fallback & Unknown Character Robustness
// ==========================================
console.log("➡️ Test 12: getCombinedStats Unknown Character Robustness");
{
  const corruptPlayer: UserProgress = {
    xp: 100,
    selectedCharacterId: "non_existent_hero_xyz",
    equipment: { ...STARTER_EQUIPMENT },
  };

  const stats = getCombinedStats(corruptPlayer, "en");
  assert.strictEqual(stats.characterBonus.active, false);
  assert.strictEqual(stats.characterBonus.characterId, null);
  assert.strictEqual(stats.characterBonus.xpMultiplier, 0);
  assert.strictEqual(stats.characterBonus.coinBonus, 0);
  assert.ok(stats.finalXpMultiplier >= 1.0);

  console.log("  ✓ Unknown character robustness verified!");
}

// ==========================================
// Test 13: Astrid Nordic & Russian Affinity Bonus
// ==========================================
console.log("➡️ Test 13: Astrid Nordic & Russian Affinity Bonus");
{
  const astrid = getCharacterById("astrid")!;
  assert.ok(astrid.supportedLanguageBonusIds?.includes("ru"), "Astrid must support Russian ('ru')");
  assert.ok(astrid.supportedLanguageBonusIds?.includes("de"), "Astrid must support German ('de')");

  const astridPlayer: UserProgress = {
    xp: 200,
    selectedCharacterId: "astrid",
    equipment: { ...STARTER_EQUIPMENT },
  };

  const statsRussian = getCombinedStats(astridPlayer, "ru");
  assert.strictEqual(statsRussian.characterBonus.active, true);
  assert.strictEqual(statsRussian.characterBonus.xpMultiplier, 0.15);

  const statsGerman = getCombinedStats(astridPlayer, "de");
  assert.strictEqual(statsGerman.characterBonus.active, true);

  console.log("  ✓ Astrid Russian and Nordic affinity verified!");
}

console.log("\n🎉 ALL GAMIFICATION, RPG & AVATAR VERIFICATION TESTS PASSED FLAWLESSLY!\n");
