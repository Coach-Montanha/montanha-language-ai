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
  equipStudioFantasyKit,
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
  BASE_AVATARS,
  ITEM_CATALOG,
  AntigravityAvatarEngine,
  getRoAvatarById,
  getRoItemById,
  AvatarRenderLayer,
  SlotCategory,
  ARCHETYPES_REGISTRY,
  WARDROBE_CATALOG,
  AntigravityAvatarController,
  getStudioArchetypeById,
  getStudioWardrobeItemById,
} from "../src/data/avatar-items";
import { UserProgress, SupportedLanguage } from "../src/types/language";
import { AvatarItem, SlotType, ALL_SLOT_TYPES, EquipmentSlot, ItemTier, ArchetypeRole } from "../src/types/avatar";

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

// ==========================================
// Test 14: Ragnarok Online (RO) BASE_AVATARS & ITEM_CATALOG Completeness
// ==========================================
console.log("➡️ Test 14: Ragnarok Online BASE_AVATARS & ITEM_CATALOG completeness");
{
  // 14a: Verify BASE_AVATARS (8 Chibi RO characters)
  assert.strictEqual(BASE_AVATARS.length, 8, "Must have exactly 8 RO base avatars");
  const expectedAvatarIds = [
    "char_swordsman_m",
    "char_wizard_m",
    "char_blacksmith_m",
    "char_magician_f",
    "char_acolyte_f",
    "char_hunter_f",
    "char_baphomet_jr",
    "char_angeling",
  ];
  for (const id of expectedAvatarIds) {
    const char = BASE_AVATARS.find((c) => c.id === id);
    assert.ok(char, `Avatar ${id} must exist in BASE_AVATARS`);
    assert.ok(char.name.length > 0, `Avatar ${id} must have a name`);
    assert.ok(char.languagePerk.length > 0, `Avatar ${id} must have a language perk`);
    assert.ok(char.baseSpriteKey.length > 0, `Avatar ${id} must have a baseSpriteKey`);
  }

  // 14b: Verify ITEM_CATALOG (12 items)
  assert.strictEqual(ITEM_CATALOG.length, 12, "Must have exactly 12 RO catalog items");
  const expectedItemIds = [
    "head_bunny_ears",
    "head_apple_archer",
    "head_mage_hat",
    "head_leaf_mouth",
    "armor_apprentice_robe",
    "armor_blacksmith_overalls",
    "pack_merchant_wooden",
    "garment_angel_wings",
    "wpn_forging_hammer",
    "wpn_wizard_staff",
    "pet_poring_cute",
    "pet_spore_hat",
  ];
  for (const id of expectedItemIds) {
    const item = ITEM_CATALOG.find((it) => it.id === id);
    assert.ok(item, `Item ${id} must exist in ITEM_CATALOG`);
    assert.ok(item.name.length > 0, `Item ${id} must have a name`);
    assert.ok(item.costZeny > 0, `Item ${id} must have a zeny cost`);
    assert.ok(item.requiredLevel >= 1, `Item ${id} must have a required level`);
    assert.ok(item.spriteLayer.length > 0, `Item ${id} must have a spriteLayer`);
  }

  // Verify RO slots representation
  const slotsInCatalog = new Set(ITEM_CATALOG.map((it) => it.slot));
  assert.ok(slotsInCatalog.has(EquipmentSlot.HEAD_UPPER));
  assert.ok(slotsInCatalog.has(EquipmentSlot.HEAD_LOWER));
  assert.ok(slotsInCatalog.has(EquipmentSlot.ARMOR));
  assert.ok(slotsInCatalog.has(EquipmentSlot.GARMENT));
  assert.ok(slotsInCatalog.has(EquipmentSlot.BACKPACK));
  assert.ok(slotsInCatalog.has(EquipmentSlot.RIGHT_HAND));
  assert.ok(slotsInCatalog.has(EquipmentSlot.PET_FAMILIAR));

  console.log("  ✓ RO BASE_AVATARS (8) & ITEM_CATALOG (12) verified!");
}

// ==========================================
// Test 15: AntigravityAvatarEngine State Machine & Render Tree Order
// ==========================================
console.log("➡️ Test 15: AntigravityAvatarEngine buy, equip, unequip, boosts, and render layers");
{
  const swordsman = BASE_AVATARS[0]!;
  const engine = new AntigravityAvatarEngine(swordsman, 1, 500);

  assert.strictEqual(engine.getActiveAvatar().id, "char_swordsman_m");
  assert.strictEqual(engine.getUserLevel(), 1);
  assert.strictEqual(engine.getZenyWallet(), 500);

  // 15a: Buy item - invalid ID
  const invalidBuy = engine.buyItem("non_existent_item");
  assert.strictEqual(invalidBuy.success, false);

  // 15b: Buy item - level gate failure (garment_angel_wings requires level 25)
  const levelGated = engine.buyItem("garment_angel_wings");
  assert.strictEqual(levelGated.success, false);
  assert.ok(levelGated.reason.includes("Requer Nível de Base 25"));

  // 15c: Buy item - zeny gate failure (armor_apprentice_robe costs 800, user has 500)
  engine.setUserLevel(10);
  const zenyGated = engine.buyItem("armor_apprentice_robe");
  assert.strictEqual(zenyGated.success, false);
  assert.ok(zenyGated.reason.includes("Zeny insuficiente"));

  // 15d: Buy item - success (pet_poring_cute: 350 zeny, level 1)
  const validBuy = engine.buyItem("pet_poring_cute");
  assert.strictEqual(validBuy.success, true);
  assert.strictEqual(engine.getZenyWallet(), 150); // 500 - 350
  assert.ok(engine.getInventory().has("pet_poring_cute"));

  // 15e: Buy item - duplicate purchase error
  const duplicateBuy = engine.buyItem("pet_poring_cute");
  assert.strictEqual(duplicateBuy.success, false);
  assert.ok(duplicateBuy.reason.includes("já possui este equipamento"));

  // 15f: Equip - unowned item error
  const unownedEquip = engine.equip("wpn_forging_hammer");
  assert.strictEqual(unownedEquip.success, false);

  // 15g: Equip - valid pet
  const validEquip = engine.equip("pet_poring_cute");
  assert.strictEqual(validEquip.success, true);
  assert.strictEqual(validEquip.previousItemName, undefined);

  // Add more funds & buy items
  engine.addZeny(10000);
  engine.setUserLevel(30);
  assert.strictEqual(engine.buyItem("head_bunny_ears").success, true);
  assert.strictEqual(engine.buyItem("head_apple_archer").success, true);
  assert.strictEqual(engine.buyItem("garment_angel_wings").success, true);
  assert.strictEqual(engine.buyItem("wpn_forging_hammer").success, true);

  // Equip bunny ears (HEAD_UPPER)
  const equipBunny = engine.equip("head_bunny_ears");
  assert.strictEqual(equipBunny.success, true);

  // Replace HEAD_UPPER with apple_archer -> should report previousItemName
  const equipApple = engine.equip("head_apple_archer");
  assert.strictEqual(equipApple.success, true);
  assert.strictEqual(equipApple.previousItemName, "Orelhas de Coelho Brancas");

  // Equip wings and hammer
  assert.strictEqual(engine.equip("garment_angel_wings").success, true);
  assert.strictEqual(engine.equip("wpn_forging_hammer").success, true);

  // 15h: calculateCombinedLessonBoosts()
  // Active equipped:
  // head_apple_archer: xpMultiplier 1.08
  // garment_angel_wings: xpMultiplier 1.35, streakShieldPercent 0.30
  // wpn_forging_hammer: xpMultiplier 1.20
  // pet_poring_cute: streakShieldPercent 0.10
  // xpMult = 1.0 + (1.08 - 1) + (1.35 - 1) + (1.20 - 1) = 1.63
  // streakShield = 0.30 + 0.10 = 0.40 -> 40%
  const boosts = engine.calculateCombinedLessonBoosts();
  assert.strictEqual(boosts.finalXpMultiplier, 1.63);
  assert.strictEqual(boosts.finalStreakProtection, "40%");

  // 15i: unequip()
  const unequipHammer = engine.unequip(EquipmentSlot.RIGHT_HAND);
  assert.strictEqual(unequipHammer.success, true);
  assert.strictEqual(unequipHammer.unequippedName, "Martelo de Batalha do Ferreiro");

  const unequipEmpty = engine.unequip(EquipmentSlot.RIGHT_HAND);
  assert.strictEqual(unequipEmpty.success, false);

  // 15j: getAntigravityRenderTree()
  // Expected order:
  // LAYER_BACK (wings), LAYER_BODY_BASE (char base), LAYER_HEAD_UPPER (apple), LAYER_PET_GROUND (poring)
  const tree = engine.getAntigravityRenderTree();
  assert.strictEqual(tree.avatarBase, swordsman.baseSpriteKey);
  const layers = tree.renderSequence.map((node) => node.layer);
  assert.deepStrictEqual(layers, [
    "LAYER_BACK",
    "LAYER_BODY_BASE",
    "LAYER_HEAD_UPPER",
    "LAYER_PET_GROUND",
  ]);

  console.log("  ✓ AntigravityAvatarEngine state, boosts, and render layers verified!");
}

// ==========================================
// Test 16: RO Integration with UserProgress, getCharacterById & getShopItemById
// ==========================================
console.log("➡️ Test 16: RO Integration with UserProgress and Adapters");
{
  // 16a: getCharacterById resolves RO avatars
  const roHero = getCharacterById("char_angeling");
  assert.ok(roHero, "Angeling must resolve via getCharacterById");
  assert.strictEqual(roHero.name, "Angeling Alado");
  assert.strictEqual(roHero.category, "MYTHIC_BEAST");

  // 16b: getShopItemById resolves RO items
  const roItem = getShopItemById("pet_poring_cute");
  assert.ok(roItem, "pet_poring_cute must resolve via getShopItemById");
  assert.strictEqual(roItem.name, "Poring Saltitante");
  assert.strictEqual(roItem.slot, EquipmentSlot.PET_FAMILIAR);

  // 16c: Switching character to RO avatar
  const player: UserProgress = {
    xp: 1200, // Level 6
    coins: 2000,
    selectedCharacterId: "char_swordsman_m",
    equipment: {},
    inventoryItemIds: ["head_bunny_ears"],
  };
  const switched = selectRpgCharacter(player, "char_wizard_m");
  assert.strictEqual(switched.selectedCharacterId, "char_wizard_m");
  assert.strictEqual(switched.equippedAvatar?.subType, "ro_chibi_wizard_male_base");

  // 16d: Buying and equipping RO item through standard gamification service
  const bought = buyShopItem(player, "head_bunny_ears");
  // already in inventory -> shouldn't double charge
  assert.strictEqual(bought.success, false);

  const buyApple = buyShopItem(player, "head_apple_archer");
  assert.strictEqual(buyApple.success, true);
  assert.ok(buyApple.updated);
  assert.strictEqual(buyApple.updated.equipment?.[EquipmentSlot.HEAD_UPPER], "head_apple_archer");

  // 16e: Combined stats calculation with RO item
  const stats = getCombinedStats(buyApple.updated, "es");
  assert.ok(stats.finalXpMultiplier > 1.0);

  console.log("  ✓ RO Integration with UserProgress, getCharacterById, and getShopItemById verified!");
}

// ==========================================
// Test 17: RO vs Legacy Slot Conflict Resolution & No Phantom Stacking
// ==========================================
console.log("➡️ Test 17: RO vs Legacy Slot Conflict Resolution & No Phantom Stacking");
{
  const starterPlayer: UserProgress = {
    xp: 600,
    coins: 1000,
    level: 5,
    equipment: {
      HEAD: "head_tiara_aprendiz",
      CHEST: "chest_tunica_novico",
      LEGS: "legs_botas_rusticas",
      MAIN_HAND: "main_hand_pena_prata",
      OFF_HAND: "off_hand_adaga_precisao",
      BACK: "back_capa_viajante",
      ACCESSORY: "accessory_amuleto_concentracao",
    },
    inventoryItemIds: [
      "head_tiara_aprendiz",
      "chest_tunica_novico",
      "legs_botas_rusticas",
      "main_hand_pena_prata",
      "off_hand_adaga_precisao",
      "back_capa_viajante",
      "accessory_amuleto_concentracao",
      "armor_apprentice_robe",
      "head_bunny_ears",
      "wpn_forging_hammer",
      "garment_angel_wings",
    ],
  };

  // 17a: Equipping RO ARMOR should supersede/clear legacy CHEST
  const equippedArmor = equipShopItem(starterPlayer, "armor_apprentice_robe");
  assert.strictEqual(equippedArmor.equipment?.ARMOR, "armor_apprentice_robe");
  assert.strictEqual(equippedArmor.equipment?.CHEST, null, "Legacy CHEST must be set to null when ARMOR is equipped");
  assert.strictEqual(equippedArmor.equippedAvatar?.equipped.ARMOR, "armor_apprentice_robe");
  assert.strictEqual(equippedArmor.equippedAvatar?.equipped.CHEST, null);

  // 17b: Equipping RO RIGHT_HAND should supersede/clear legacy MAIN_HAND
  const equippedHammer = equipShopItem(equippedArmor, "wpn_forging_hammer");
  assert.strictEqual(equippedHammer.equipment?.RIGHT_HAND, "wpn_forging_hammer");
  assert.strictEqual(equippedHammer.equipment?.MAIN_HAND, null, "Legacy MAIN_HAND must be set to null when RIGHT_HAND is equipped");

  // 17c: Equipping RO HEAD_UPPER should supersede/clear legacy HEAD
  const equippedBunny = equipShopItem(equippedHammer, "head_bunny_ears");
  assert.strictEqual(equippedBunny.equipment?.HEAD_UPPER, "head_bunny_ears");
  assert.strictEqual(equippedBunny.equipment?.HEAD, null, "Legacy HEAD must be set to null when HEAD_UPPER is equipped");

  // 17d: Stats check: getCombinedStats must not double-count superseded slots
  const statsNoDoubling = getCombinedStats(equippedBunny, "es");
  // Check that CHEST stat bonus (+0.02) and HEAD stat bonus (+0.00) are not phantom stacked with ARMOR/HEAD_UPPER
  assert.ok(statsNoDoubling.finalXpMultiplier > 1.0);
  assert.ok(statsNoDoubling.finalXpMultiplier < 2.5, "Stats should not be artificially inflated by double-counting");

  // 17e: Unequipping ARMOR ensures both ARMOR and CHEST remain unequipped
  const unequippedArmor = unequipShopSlot(equippedBunny, EquipmentSlot.ARMOR);
  assert.strictEqual(unequippedArmor.equipment?.ARMOR, null);
  assert.strictEqual(unequippedArmor.equipment?.CHEST, null);

  console.log("  ✓ RO vs Legacy Slot Conflict Resolution & No Phantom Stacking verified!");
}

// ==========================================
// Test 18: getRoAvatarById spriteKey fallback & timeBonusSeconds adaptation
// ==========================================
console.log("➡️ Test 18: getRoAvatarById spriteKey fallback & timeBonusSeconds in adapted shop items");
{
  // 18a: getRoAvatarById resolves by baseSpriteKey
  const bySpriteKey = getRoAvatarById("ro_chibi_swordsman_male_base");
  assert.ok(bySpriteKey, "Must resolve avatar by baseSpriteKey");
  assert.strictEqual(bySpriteKey.id, "char_swordsman_m");

  const baphometBySprite = getRoAvatarById("ro_chibi_baphomet_jr_base");
  assert.ok(baphometBySprite, "Must resolve baphomet by baseSpriteKey");
  assert.strictEqual(baphometBySprite.id, "char_baphomet_jr");

  // 18b: timeBonusSeconds preserved in adaptRoItemToShopItem
  const bunnyItem = getShopItemById("head_bunny_ears");
  assert.ok(bunnyItem, "Bunny ears item must exist");
  assert.strictEqual(bunnyItem.statBonus?.timeBonusSeconds, 3, "Bunny ears must preserve timeBonusSeconds = 3");

  const staffItem = getShopItemById("wpn_wizard_staff");
  assert.ok(staffItem, "Wizard staff item must exist");
  assert.strictEqual(staffItem.statBonus?.timeBonusSeconds, 5, "Wizard staff must preserve timeBonusSeconds = 5");

  console.log("  ✓ getRoAvatarById spriteKey resolution & timeBonusSeconds adaptation verified!");
}

// ==========================================
// Test 19: ensureGamificationProgress auto-synchronization for RO heroes
// ==========================================
console.log("➡️ Test 19: ensureGamificationProgress subType auto-synchronization");
{
  // Player whose selectedCharacterId is changed to char_angeling
  const playerAngeling: UserProgress = {
    xp: 300,
    selectedCharacterId: "char_angeling",
    equippedAvatar: {
      archetype: "human",
      subType: "valerius_scribe",
      primaryColor: "#3b82f6",
      secondaryColor: "#f59e0b",
      equipped: {},
    },
  };

  const normalizedAngeling = ensureGamificationProgress(playerAngeling);
  assert.strictEqual(
    normalizedAngeling.equippedAvatar?.subType,
    "ro_chibi_angeling_base",
    "subType must synchronize to ro_chibi_angeling_base when selectedCharacterId is char_angeling"
  );
  assert.strictEqual(
    normalizedAngeling.equippedAvatar?.archetype,
    "monster",
    "archetype must synchronize to monster for MYTHIC_BEAST"
  );

  console.log("  ✓ ensureGamificationProgress subType auto-synchronization verified!");
}

// ==========================================
// Test 20: Studio Fantasy Avatar Customisation System
// ==========================================
console.log("➡️ Test 20: Studio Fantasy Avatar Customisation System & AntigravityAvatarController");
{
  // 20a: Enums & Layers
  assert.strictEqual(AvatarRenderLayer.SHADOW, 0);
  assert.strictEqual(AvatarRenderLayer.BODY_BASE, 3);
  assert.strictEqual(AvatarRenderLayer.HEAD_UPPER, 8);
  assert.strictEqual(AvatarRenderLayer.MAIN_HAND, 10);
  assert.strictEqual(AvatarRenderLayer.FAMILIAR_FRONT, 11);
  assert.strictEqual(AvatarRenderLayer.AURA_FX, 12);

  assert.strictEqual(SlotCategory.HEADWEAR, "HEADWEAR");
  assert.strictEqual(SlotCategory.OUTFIT, "OUTFIT");
  assert.strictEqual(SlotCategory.MAIN_TOOL, "MAIN_TOOL");
  assert.strictEqual(SlotCategory.OFF_TOOL, "OFF_TOOL");
  assert.strictEqual(SlotCategory.BACKPACK_CAPE, "BACKPACK_CAPE");
  assert.strictEqual(SlotCategory.FAMILIAR, "FAMILIAR");

  assert.strictEqual(ItemTier.APPRENTICE, "APPRENTICE");
  assert.strictEqual(ItemTier.SCHOLAR, "SCHOLAR");
  assert.strictEqual(ItemTier.POLYGLOT_KNIGHT, "POLYGLOT");
  assert.strictEqual(ItemTier.GRAND_ARCHIVIST, "ARCHIVIST");

  // 20b: Archetypes Registry & Resolution
  assert.ok(ARCHETYPES_REGISTRY["tactician_swordsman"], "Kaelen must exist in registry");
  assert.ok(ARCHETYPES_REGISTRY["hooded_archivist"], "Lyanna must exist in registry");
  assert.ok(ARCHETYPES_REGISTRY["mythic_elemental_mentor"], "Ignisaur must exist in registry");

  const kaelenDirect = getStudioArchetypeById("char_tactician_m");
  assert.ok(kaelenDirect, "getStudioArchetypeById must resolve char_tactician_m");
  assert.ok(kaelenDirect.name.includes("Kaelen"));

  const kaelenAdapted = getCharacterById("char_tactician_m");
  assert.ok(kaelenAdapted, "getCharacterById must resolve Studio Fantasy archetype");
  assert.strictEqual(kaelenAdapted.id, "char_tactician_m");
  assert.strictEqual(kaelenAdapted.nativeLanguageBonus, "Corte Preciso");

  const lyannaAdapted = getCharacterById("char_archivist_f");
  assert.ok(lyannaAdapted, "getCharacterById must resolve Lyanna");
  assert.strictEqual(lyannaAdapted.nativeLanguageBonus, "Eco Poliglota");

  const ignisaurAdapted = getCharacterById("char_elemental_beast");
  assert.ok(ignisaurAdapted, "getCharacterById must resolve Ignisaur");
  assert.strictEqual(ignisaurAdapted.category, "MYTHIC_BEAST");

  // 20c: Wardrobe Catalog & Adaptation
  assert.strictEqual(WARDROBE_CATALOG.length, 8, "WARDROBE_CATALOG must contain exactly 8 items");

  const rapierShopItem = getShopItemById("weapon_runic_rapier");
  assert.ok(rapierShopItem, "getShopItemById must resolve weapon_runic_rapier");
  assert.strictEqual(rapierShopItem.statBonus?.timeBonusSeconds, 5);
  assert.strictEqual(rapierShopItem.slot, EquipmentSlot.RIGHT_HAND);

  const golemShopItem = getShopItemById("familiar_clockwork_golem");
  assert.ok(golemShopItem, "getShopItemById must resolve familiar_clockwork_golem");
  assert.strictEqual(golemShopItem.statBonus?.streakProtection, 3);
  assert.strictEqual(golemShopItem.statBonus?.timeBonusSeconds, 6);
  assert.strictEqual(golemShopItem.slot, EquipmentSlot.PET_FAMILIAR);

  // 20d: AntigravityAvatarController Life-cycle
  const controller = new AntigravityAvatarController("tactician_swordsman", 1, 600);
  assert.strictEqual(controller.getCurrentLevel(), 1);
  assert.strictEqual(controller.getCoinBalance(), 600);

  // Purchase blocked: Level too low
  const buyGolem = controller.purchaseItem("familiar_clockwork_golem");
  assert.strictEqual(buyGolem.success, false);
  assert.ok(buyGolem.message.includes("Nível insuficiente"));

  // Purchase blocked: Insufficient coins (coins: 100, staff cost: 400, required level: 1)
  controller.setCoinBalance(100);
  const buyStaffNoCoins = controller.purchaseItem("weapon_gnarled_staff");
  assert.strictEqual(buyStaffNoCoins.success, false);
  assert.ok(buyStaffNoCoins.message.includes("Moedas insuficientes"));

  // Purchase successful: Cajado das Raízes Ancestrais (cost: 400, level: 1)
  controller.setCoinBalance(600);
  const buyStaff = controller.purchaseItem("weapon_gnarled_staff");
  assert.strictEqual(buyStaff.success, true);
  assert.strictEqual(controller.getCoinBalance(), 200);
  assert.ok(controller.getOwnedItemIds().has("weapon_gnarled_staff"));

  // Purchase blocked: Already owned
  const buyStaffAgain = controller.purchaseItem("weapon_gnarled_staff");
  assert.strictEqual(buyStaffAgain.success, false);
  assert.ok(buyStaffAgain.message.includes("Já possuis"));

  // Equip blocked: Not owned yet
  const equipRapierUnowned = controller.equipItem("weapon_runic_rapier");
  assert.strictEqual(equipRapierUnowned.success, false);
  assert.ok(equipRapierUnowned.message.includes("Precisas de comprar"));

  // Equip successful: Staff
  const equipStaff = controller.equipItem("weapon_gnarled_staff");
  assert.strictEqual(equipStaff.success, true);
  assert.strictEqual(controller.getEquippedItem(SlotCategory.MAIN_TOOL)?.id, "weapon_gnarled_staff");

  // Unequip item
  const unequipStaff = controller.unequipItem(SlotCategory.MAIN_TOOL);
  assert.strictEqual(unequipStaff.success, true);
  assert.strictEqual(controller.getEquippedItem(SlotCategory.MAIN_TOOL), null);

  // Re-equip and replace test
  controller.equipItem("weapon_gnarled_staff");
  controller.setCurrentLevel(10);
  controller.addCoins(2000);
  const buyRapier = controller.purchaseItem("weapon_runic_rapier");
  assert.strictEqual(buyRapier.success, true);

  const equipRapier = controller.equipItem("weapon_runic_rapier");
  assert.strictEqual(equipRapier.success, true);
  assert.strictEqual(equipRapier.replacedItem, "Cajado das Raízes Ancestrais");
  assert.strictEqual(controller.getEquippedItem(SlotCategory.MAIN_TOOL)?.id, "weapon_runic_rapier");

  // Buffs calculation
  const buffs = controller.calculateCurrentBuffs();
  assert.strictEqual(buffs.totalXpRate, 1.1, "Base 1.10 XP rate for tactician");
  assert.strictEqual(buffs.extraListeningSeconds, 5, "Rapier gives +5s extra listening");

  // Render tree stacking & layer sorting
  const displayTree = controller.getAntigravityDisplayTree();
  assert.ok(displayTree.length >= 2, "Display tree must contain base body + equipped items");
  assert.strictEqual(displayTree[0]?.layerLabel, "BASE_CHARACTER_BODY");
  assert.strictEqual(displayTree[0]?.layerIndex, AvatarRenderLayer.BODY_BASE);

  // Assert tree is strictly monotonically sorted by layerIndex
  for (let i = 1; i < displayTree.length; i++) {
    const prev = displayTree[i - 1]!;
    const curr = displayTree[i]!;
    assert.ok(
      curr.layerIndex >= prev.layerIndex,
      `Layer index must be ordered: ${prev.layerIndex} <= ${curr.layerIndex}`
    );
  }

  console.log("  ✓ Studio Fantasy Avatar Customisation System & Controller verified!");
}

// ==========================================
// Test 21: AntigravityAvatarController ID Resolution & Archetype Fallbacks
// ==========================================
console.log("➡️ Test 21: AntigravityAvatarController ID Resolution & Fallbacks");
{
  const ctrlKaelen = new AntigravityAvatarController("char_tactician_m");
  const displayKaelen = ctrlKaelen.getAntigravityDisplayTree();
  assert.strictEqual(displayKaelen[0]?.assetUrl, "sprites/characters/kaelen_base.png");

  const ctrlLyanna = new AntigravityAvatarController("char_archivist_f");
  const displayLyanna = ctrlLyanna.getAntigravityDisplayTree();
  assert.strictEqual(displayLyanna[0]?.assetUrl, "sprites/characters/lyanna_base.png");

  const ctrlIgnisaur = new AntigravityAvatarController("char_elemental_beast");
  const displayIgnisaur = ctrlIgnisaur.getAntigravityDisplayTree();
  assert.strictEqual(displayIgnisaur[0]?.assetUrl, "sprites/characters/ignisaur_base.png");

  // Fallback to tactician_swordsman on unknown key
  const ctrlFallback = new AntigravityAvatarController("unknown_archetype_xyz");
  const displayFallback = ctrlFallback.getAntigravityDisplayTree();
  assert.strictEqual(displayFallback[0]?.assetUrl, "sprites/characters/kaelen_base.png");

  console.log("  ✓ Controller ID resolution & fallbacks verified!");
}

// ==========================================
// Test 22: Studio Fantasy Slot Mapping & Conflict Resolution (No Phantom Stacking)
// ==========================================
console.log("➡️ Test 22: Studio Fantasy Slot Mapping & Conflict Resolution");
{
  // 22a: Test lowerSlotMap GARMENT: "back" and Studio Fantasy slots
  const p1: UserProgress = {
    xp: 500,
    equipment: {
      GARMENT: "garment_angel_wings",
      HEADWEAR: "hat_pointed_wanderer",
      OUTFIT: "outfit_scout_tunic",
      MAIN_TOOL: "weapon_gnarled_staff",
      BACKPACK_CAPE: "back_field_lexicon_pack",
      FAMILIAR: "familiar_clockwork_golem",
    },
  };
  const norm1 = ensureGamificationProgress(p1);
  assert.strictEqual(norm1.equippedAvatar?.equipped.back, "back_field_lexicon_pack");
  assert.strictEqual(norm1.equippedAvatar?.equipped.head, "hat_pointed_wanderer");
  assert.strictEqual(norm1.equippedAvatar?.equipped.body, "outfit_scout_tunic");
  assert.strictEqual(norm1.equippedAvatar?.equipped.hand, "weapon_gnarled_staff");
  assert.strictEqual(norm1.equippedAvatar?.equipped.pet, "familiar_clockwork_golem");

  // 22b: Test getCombinedStats conflict resolution: Studio Fantasy takes precedence, avoiding duplicate stats
  const pConflict: UserProgress = {
    xp: 1000,
    selectedLanguage: "en",
    equipment: {
      // Overlapping head gear
      HEAD: "head_chapeu_mago",
      HEAD_UPPER: "head_mage_hat",
      HEADWEAR: "hat_pointed_wanderer", // +5% XP

      // Overlapping body gear
      CHEST: "chest_manto_dalaran",
      ARMOR: "armor_apprentice_robe",
      OUTFIT: "outfit_scout_tunic", // +8% XP

      // Overlapping weapon
      MAIN_HAND: "main_cajado_arcano",
      RIGHT_HAND: "wpn_wizard_staff",
      MAIN_TOOL: "weapon_runic_rapier", // +5s extra time

      // Overlapping back gear
      BACK: "back_capa_invisibilidade",
      GARMENT: "garment_angel_wings",
      BACKPACK_CAPE: "back_field_lexicon_pack", // +6% XP

      // Overlapping pet
      PET_FAMILIAR: "pet_poring_cute",
      FAMILIAR: "familiar_clockwork_golem", // +3 streak shield, +6s extra time
    },
  };

  const stats = getCombinedStats(pConflict, "en");
  // Should include bonuses from Studio Fantasy items, but NOT stack duplicate bonuses from RO/legacy for same slots
  assert.ok(stats.finalXpMultiplier > 1.0);
  assert.ok(stats.totalItemStats.streakProtection >= 3);
  assert.strictEqual(stats.finalStreakProtection, stats.totalItemStats.streakProtection);

  console.log("  ✓ Studio Fantasy Slot Mapping & Conflict Resolution verified!");
}

// ==========================================
// Test 23: equipStudioFantasyKit 1-Click Transformation & Catalog Verification
// ==========================================
console.log("➡️ Test 23: equipStudioFantasyKit 1-Click Transformation & Item Unlocks");
{
  const initialUser: UserProgress = {
    xp: 300,
    coins: 200,
    selectedCharacterId: "valerius",
  };

  // 23a: Transform into Kaelen with full Studio Fantasy kit
  const kaelenUser = equipStudioFantasyKit(initialUser, "kaelen");
  assert.strictEqual(kaelenUser.selectedCharacterId, "char_tactician_m");
  assert.strictEqual(kaelenUser.equippedAvatar?.archetype, "human");
  assert.strictEqual(kaelenUser.equippedAvatar?.subType, "char_tactician_m");
  assert.strictEqual(kaelenUser.equipment?.HEADWEAR, "hat_pointed_wanderer");
  assert.strictEqual(kaelenUser.equipment?.OUTFIT, "outfit_scout_tunic");
  assert.strictEqual(kaelenUser.equipment?.MAIN_TOOL, "weapon_runic_rapier");
  assert.strictEqual(kaelenUser.equipment?.BACKPACK_CAPE, "back_field_lexicon_pack");
  assert.strictEqual(kaelenUser.equipment?.FAMILIAR, "familiar_clockwork_golem");
  assert.ok(kaelenUser.unlockedAvatarItems?.includes("hat_pointed_wanderer"));
  assert.ok(kaelenUser.unlockedAvatarItems?.includes("weapon_runic_rapier"));
  assert.ok(kaelenUser.inventoryItemIds?.includes("back_field_lexicon_pack"));

  // 23b: Transform into Lyanna with full Studio Fantasy kit
  const lyannaUser = equipStudioFantasyKit(initialUser, "lyanna");
  assert.strictEqual(lyannaUser.selectedCharacterId, "char_archivist_f");
  assert.strictEqual(lyannaUser.equippedAvatar?.archetype, "human");
  assert.strictEqual(lyannaUser.equippedAvatar?.subType, "char_archivist_f");
  assert.strictEqual(lyannaUser.equipment?.HEADWEAR, "hood_silk_archivist");
  assert.strictEqual(lyannaUser.equipment?.OUTFIT, "outfit_ceremonial_silks");
  assert.strictEqual(lyannaUser.equipment?.MAIN_TOOL, "weapon_gnarled_staff");

  // 23c: Transform into Ignisaur with full Studio Fantasy kit
  const ignisaurUser = equipStudioFantasyKit(initialUser, "ignisaur");
  assert.strictEqual(ignisaurUser.selectedCharacterId, "char_elemental_beast");
  assert.strictEqual(ignisaurUser.equippedAvatar?.archetype, "monster");
  assert.strictEqual(ignisaurUser.equippedAvatar?.subType, "char_elemental_beast");
  assert.strictEqual(ignisaurUser.equipment?.HEADWEAR, null);
  assert.strictEqual(ignisaurUser.equippedAvatar?.equipped.head, undefined);
  assert.strictEqual(ignisaurUser.equipment?.OUTFIT, "outfit_ceremonial_silks");

  console.log("  ✓ equipStudioFantasyKit 1-Click Transformation & Item Unlocks verified!");
}

// ==========================================
// Test 24: Default Character & Auto-Equipping on Hero Selection
// ==========================================
console.log("➡️ Test 24: Default Character Kaelen & Seamless Studio Fantasy Auto-Equip");
{
  // 24a: New user / empty progress defaults to Kaelen with Studio Fantasy gear
  const freshProgress = ensureGamificationProgress({
    xp: 0,
    streak: 0,
    lastActiveDate: "2026-10-05",
    completedScenarios: [],
    savedPhrases: [],
    customFlashcards: [],
  } as any);

  assert.strictEqual(freshProgress.selectedCharacterId, "char_tactician_m");
  assert.strictEqual(freshProgress.equipment?.HEADWEAR, "hat_pointed_wanderer");
  assert.strictEqual(freshProgress.equipment?.OUTFIT, "outfit_scout_tunic");
  assert.strictEqual(freshProgress.equipment?.MAIN_TOOL, "weapon_runic_rapier");
  assert.strictEqual(freshProgress.equipment?.BACKPACK_CAPE, "back_field_lexicon_pack");
  assert.strictEqual(freshProgress.equipment?.FAMILIAR, "familiar_clockwork_golem");

  // 24b: Selecting Lyanna via selectRpgCharacter automatically equips her Studio Fantasy kit
  const selectedLyanna = selectRpgCharacter(freshProgress, "char_archivist_f");
  assert.strictEqual(selectedLyanna.selectedCharacterId, "char_archivist_f");
  assert.strictEqual(selectedLyanna.equipment?.HEADWEAR, "hood_silk_archivist");
  assert.strictEqual(selectedLyanna.equipment?.OUTFIT, "outfit_ceremonial_silks");
  assert.strictEqual(selectedLyanna.equipment?.MAIN_TOOL, "weapon_gnarled_staff");

  // 24c: Selecting Ignisaur automatically equips his kit and safely clears headwear
  const selectedIgnisaur = selectRpgCharacter(selectedLyanna, "char_elemental_beast");
  assert.strictEqual(selectedIgnisaur.selectedCharacterId, "char_elemental_beast");
  assert.strictEqual(selectedIgnisaur.equippedAvatar?.archetype, "monster");
  assert.strictEqual(selectedIgnisaur.equipment?.HEADWEAR, null);
  assert.strictEqual(selectedIgnisaur.equippedAvatar?.equipped.head, undefined);
  assert.strictEqual(selectedIgnisaur.equipment?.OUTFIT, "outfit_ceremonial_silks");

  // 24d: Selecting Kaelen switches back and equips his full kit
  const reselectedKaelen = selectRpgCharacter(selectedIgnisaur, "char_tactician_m");
  assert.strictEqual(reselectedKaelen.selectedCharacterId, "char_tactician_m");
  assert.strictEqual(reselectedKaelen.equipment?.HEADWEAR, "hat_pointed_wanderer");
  assert.strictEqual(reselectedKaelen.equipment?.OUTFIT, "outfit_scout_tunic");
  assert.strictEqual(reselectedKaelen.equipment?.MAIN_TOOL, "weapon_runic_rapier");

  console.log("  ✓ Default Character Kaelen & Seamless Studio Fantasy Auto-Equip verified!");
}

console.log("\n🎉 ALL GAMIFICATION, RPG & AVATAR VERIFICATION TESTS PASSED FLAWLESSLY!\n");
