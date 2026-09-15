// Core data shapes for the game.
// CoinSet / CoinDefinition / TriviaQuestion are the kind of records you'd
// eventually load from your published Google Sheet. OwnedCoin and
// PlayerState are player-specific and only ever live in IndexedDB.

export type Rarity = "common" | "uncommon" | "rare" | "legendary";

export interface CoinSet {
  id: string;
  name: string;
  description: string;
  /** Completion percentage (0-100) of the PREVIOUS set required to unlock this one. */
  unlockThreshold: number;
  /** id of the set that must be progressed first. null for the starting set. */
  requiresSetId: string | null;
}

export interface CoinDefinition {
  id: string;
  setIds: string[];
  name: string;
  rarity: Rarity;
  obverseUrl: string;
  reverseUrl: string;
  fact: string;
  denomination: string;
}

export interface TriviaQuestion {
  id: string;
  setIds: string[] | null;
  question: string;
  options: string[];
  correctIndex: number;
  reward: number;
}

export interface Bag {
  id: string;
  name: string;
  description: string;
  setId: string;
  cost: number;
  unlockRequiresSetId: string | null;
  unlockThreshold: number;
}

/** A coin the player actually owns, keyed by coin definition id. */
export interface OwnedCoin {
  coinId: string;
  quantity: number;
  firstObtainedAt: number;
}

export interface PlayerState {
  id: "player"; // singleton row
  currency: number;
  unlockedSetIds: string[];
}

export const RARITY_ORDER: Rarity[] = ["common", "uncommon", "rare", "legendary"];

export const RARITY_WEIGHTS: Record<Rarity, number> = {
  common: 65,
  uncommon: 25,
  rare: 9,
  legendary: 1,
};

export const RARITY_LABELS: Record<Rarity, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  legendary: "Legendary",
};