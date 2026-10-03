import assert from "node:assert";
import {
  calculateLevelInfo,
  ensureGamificationProgress,
  awardGamificationRewards,
  buyAvatarItem,
  equipAvatarItem,
  unequipAvatarSlot,
  setAvatarColors,
} from "../src/services/gamification";
import {
  AVATAR_ITEMS,
  DEFAULT_AVATAR_CONFIG,
  STARTER_UNLOCKED_ITEM_IDS,
  getItemById,
  getItemsBySlot,
  getItemsForArchetype,
} from "../src/data/avatar-items";
import { UserProgress } from "../src/types/language";
import { AvatarItem } from "../src/types/avatar";

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

console.log("\n🎉 ALL GAMIFICATION & AVATAR VERIFICATION TESTS PASSED FLAWLESSLY!\n");
