import { create } from "zustand";
import { db, ensurePlayerState, seedReferenceDataIfEmpty } from "../db/database";
import { fetchSeedData } from "../data/seedData";
import {
  RARITY_ORDER,
  RARITY_WEIGHTS,
  type CoinDefinition,
  type CoinSet,
  type OwnedCoin,
  type PlayerState,
  type Rarity,
  type Bag,
} from "../types";

const STARTING_SET_ID = "uk";
const COINS_PER_BAG = 5;
const SELL_VALUE: Record<Rarity, number> = {
  common: 1,
  uncommon: 5,
  rare: 12,
  legendary: 40,
};

interface GameStore {
  loading: boolean;
  coinSets: CoinSet[];
  coinDefinitions: CoinDefinition[];
  bags: Bag[];
  ownedCoins: Record<string, OwnedCoin>;
  player: PlayerState | null;
  lastPulledCoin: CoinDefinition | null;

  init: () => Promise<void>;
  buyBag: (bagId: string) => Promise<void>;
  sellDuplicate: (coinId: string) => Promise<void>;
  awardTriviaReward: (amount: number) => Promise<void>;
  setCompletion: (setId: string) => number;
  isSetUnlocked: (setId: string) => boolean;
  isBagUnlocked: (bag: Bag) => boolean;
}

function rollRarity(): Rarity {
  const total = RARITY_ORDER.reduce((sum, r) => sum + RARITY_WEIGHTS[r], 0);
  let roll = Math.random() * total;
  for (const rarity of RARITY_ORDER) {
    roll -= RARITY_WEIGHTS[rarity];
    if (roll <= 0) return rarity;
  }
  return "common";
}

export const useGameStore = create<GameStore>((set, get) => ({
  loading: true,
  coinSets: [],
  coinDefinitions: [],
  bags: [],
  ownedCoins: {},
  player: null,
  lastPulledCoin: null,

  init: async () => {
    const seed = await fetchSeedData();
    await seedReferenceDataIfEmpty(seed);
    const player = await ensurePlayerState(seed.coinSets[0]?.id ?? STARTING_SET_ID);

    const [coinSets, coinDefinitions, ownedList] = await Promise.all([
      db.coinSets.toArray(),
      db.coinDefinitions.toArray(),
      db.ownedCoins.toArray(),
    ]);

    const ownedCoins = Object.fromEntries(ownedList.map((o) => [o.coinId, o]));
    set({ coinSets, coinDefinitions, bags: seed.bags, ownedCoins, player, loading: false });
  },

  isBagUnlocked: (bag: Bag) => {
    const { player, setCompletion } = get();
    if (!player) return false;

    if (!bag.unlockRequiresSetId) return true;

    const completion = setCompletion(bag.unlockRequiresSetId);
    return completion >= bag.unlockThreshold;
  },

  buyBag: async (bagId: string) => {
    const { player, coinDefinitions, ownedCoins, bags } = get();
    if (!player) return;

    const bag = bags.find((b) => b.id === bagId);
    if (!bag) return;

    if (player.currency < bag.cost) return;

    const poolForSet = coinDefinitions.filter((c) => c.setIds.includes(bag.setId));
    if (poolForSet.length === 0) return;

    const pulledCoins: CoinDefinition[] = [];

    for (let i = 0; i < COINS_PER_BAG; i++) {
      const rarity = rollRarity();
      const candidates = poolForSet.filter((c) => c.rarity === rarity);
      const pulled =
      (candidates.length > 0 ? candidates : poolForSet)[
        Math.floor(Math.random() * (candidates.length > 0 ? candidates.length : poolForSet.length))
      ];
      pulledCoins.push(pulled);
    }

    // Update ownedCoins for all pulled coins
    const currentOwned = { ...ownedCoins };
    const updates: Record<string, OwnedCoin> = {};

    for (const pulled of pulledCoins) {
      const existing = currentOwned[pulled.id];
      const updated: OwnedCoin = existing
        ? { ...existing, quantity: existing.quantity + 1 }
        : { coinId: pulled.id, quantity: 1, firstObtainedAt: Date.now() };
      updates[pulled.id] = updated;
      currentOwned[pulled.id] = updated;
    }

    const updatedPlayer: PlayerState = { ...player, currency: player.currency - bag.cost };

    await db.transaction("rw", db.playerState, db.ownedCoins, async () => {
      await db.playerState.put(updatedPlayer);
      await db.ownedCoins.bulkPut(Object.values(updates));
    });

    const lastPulled = pulledCoins[pulledCoins.length - 1];
    set((state) => ({
      player: updatedPlayer,
      ownedCoins: { ...state.ownedCoins, ...updates },
      lastPulledCoin: lastPulled,
    }));

    await checkUnlocks();
  },

  sellDuplicate: async (coinId: string) => {
    const { player, ownedCoins, coinDefinitions } = get();
    const owned = ownedCoins[coinId];
    const coin = coinDefinitions.find((c) => c.id === coinId);
    if (!player || !owned || !coin || owned.quantity <= 1) return;

    const updatedOwned: OwnedCoin = { ...owned, quantity: owned.quantity - 1 };
    const updatedPlayer: PlayerState = {
      ...player,
      currency: player.currency + SELL_VALUE[coin.rarity],
    };

    await db.transaction("rw", db.playerState, db.ownedCoins, async () => {
      await db.playerState.put(updatedPlayer);
      await db.ownedCoins.put(updatedOwned);
    });

    set((state) => ({
      player: updatedPlayer,
      ownedCoins: { ...state.ownedCoins, [coinId]: updatedOwned },
    }));
  },

  awardTriviaReward: async (amount: number) => {
    const { player } = get();
    if (!player) return;
    const updatedPlayer: PlayerState = { ...player, currency: player.currency + amount };
    await db.playerState.put(updatedPlayer);
    set({ player: updatedPlayer });
  },

  setCompletion: (setId: string) => {
    const { coinDefinitions, ownedCoins } = get();
    const coinsInSet = coinDefinitions.filter((c) => c.setIds.includes(setId));
    if (coinsInSet.length === 0) return 0;
    const ownedUnique = coinsInSet.filter((c) => ownedCoins[c.id]).length;
    return Math.round((ownedUnique / coinsInSet.length) * 100);
  },

  isSetUnlocked: (setId: string) => {
    return get().player?.unlockedSetIds.includes(setId) ?? false;
  },
}));

// Separate export so it can be called after buyBag without TS complaining
// about referencing the store before it's fully constructed.
export async function checkUnlocks() {
  const state = useGameStore.getState();
  const { player, coinSets } = state;
  if (!player) return;

  let unlocked = [...player.unlockedSetIds];
  let changed = false;

  for (const set of coinSets) {
    if (unlocked.includes(set.id) || !set.requiresSetId) continue;
    if (!unlocked.includes(set.requiresSetId)) continue;
    const requiredCompletion = state.setCompletion(set.requiresSetId);
    if (requiredCompletion >= set.unlockThreshold) {
      unlocked.push(set.id);
      changed = true;
    }
  }

  if (changed) {
    const updatedPlayer: PlayerState = { ...player, unlockedSetIds: unlocked };
    await db.playerState.put(updatedPlayer);
    useGameStore.setState({ player: updatedPlayer });
  }
}