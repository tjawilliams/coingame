import Dexie, { type Table } from "dexie";
import type {
  CoinSet,
  CoinDefinition,
  TriviaQuestion,
  OwnedCoin,
  PlayerState,
} from "../types";

// Everything in this class is your OFFLINE save file. Reference data
// (coinSets/coinDefinitions/triviaQuestions) is cached here after being
// fetched from your Google Sheet, so the game works with no connection
// after the first successful load. Player data (ownedCoins/playerState)
// only ever lives here.
class GameDatabase extends Dexie {
  coinSets!: Table<CoinSet>;
  coinDefinitions!: Table<CoinDefinition>;
  triviaQuestions!: Table<TriviaQuestion>;
  ownedCoins!: Table<OwnedCoin>;
  playerState!: Table<PlayerState>;

  constructor() {
    super("hoard-coin-collector");
    this.version(1).stores({
      coinSets: "id",
      coinDefinitions: "id, setId, rarity",
      triviaQuestions: "id, setId",
      ownedCoins: "coinId",
      playerState: "id",
    });
  }
}

export const db = new GameDatabase();

/** Ensures a single PlayerState row exists, creating a fresh save on first launch. */
export async function ensurePlayerState(startingSetId: string): Promise<PlayerState> {
  const existing = await db.playerState.get("player");
  if (existing) return existing;

  const fresh: PlayerState = {
    id: "player",
    currency: 100, // starting currency so the shop isn't empty on first launch
    unlockedSetIds: [startingSetId],
  };
  await db.playerState.put(fresh);
  return fresh;
}

/** Loads reference data into IndexedDB if it isn't already cached (first run, or after a refresh). */
export async function seedReferenceDataIfEmpty(data: {
  coinSets: CoinSet[];
  coinDefinitions: CoinDefinition[];
  triviaQuestions: TriviaQuestion[];
}) {
  const count = await db.coinSets.count();
  if (count > 0) return; // already cached from a previous session

  await db.transaction(
    "rw",
    db.coinSets,
    db.coinDefinitions,
    db.triviaQuestions,
    async () => {
      await db.coinSets.bulkPut(data.coinSets);
      await db.coinDefinitions.bulkPut(data.coinDefinitions);
      await db.triviaQuestions.bulkPut(data.triviaQuestions);
    }
  );
}