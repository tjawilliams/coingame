import Papa from "papaparse";
import type { CoinSet, CoinDefinition, TriviaQuestion, Rarity } from "../types";

// This file plays the role your published Google Sheet will eventually play.
// Swap `fetchSeedData()` for a real fetch+parse of your sheet's CSV export
// once the core loop below is working end to end (see the roadmap doc).

const COIN_SETS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRiWUQEDK7PTrEHZxQ1hSUSqOMxSgGxlEeb1jaRm9Ns6rioTQvlvQFytAKH7lGcwWVJjy97MAFVwUvb/pub?gid=0&single=true&output=csv";
const COINS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRiWUQEDK7PTrEHZxQ1hSUSqOMxSgGxlEeb1jaRm9Ns6rioTQvlvQFytAKH7lGcwWVJjy97MAFVwUvb/pub?gid=1937635961&single=true&output=csv";
const TRIVIA_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRiWUQEDK7PTrEHZxQ1hSUSqOMxSgGxlEeb1jaRm9Ns6rioTQvlvQFytAKH7lGcwWVJjy97MAFVwUvb/pub?gid=1820301888&single=true&output=csv";

export const coinSets: CoinSet[] = [
  {
    id: "uk",
    name: "UK Circulating Coins",
    description: "The coins jingling in pockets across the United Kingdom.",
    unlockThreshold: 0,
    requiresSetId: null,
  },
  {
    id: "eur",
    name: "Euro Coins",
    description: "Circulating coinage from across the Eurozone.",
    unlockThreshold: 50,
    requiresSetId: "uk",
  },
];

// Placeholder art — swap imageUrl for real photography/scans once you're
// pulling from your Sheet. placehold.co is used here purely so the game
// has *something* to render and cache offline.
export const coinDefinitions: CoinDefinition[] = [
  { id: "uk-1p", setIds: ["uk"], name: "1 Penny", rarity: "common", obverseUrl: "https://placehold.co/200x200/C9A24B/1B2B23?text=1p+obverse", reverseUrl: "https://placehold.co/200x200/C9A24B/1B2B23?text=1p+reverse", fact: "The 1p coin is made from copper-plated steel." },
  { id: "uk-2p", setIds: ["uk"], name: "2 Pence", rarity: "common", obverseUrl: "https://placehold.co/200x200/C9A24B/1B2B23?text=2p+obverse", reverseUrl: "https://placehold.co/200x200/C9A24B/1B2B23?text=2p+reverse", fact: "2p coins were originally struck in bronze until 1992." },
  { id: "uk-5p", setIds: ["uk"], name: "5 Pence", rarity: "common", obverseUrl: "https://placehold.co/200x200/C9A24B/1B2B23?text=5p+obverse", reverseUrl: "https://placehold.co/200x200/C9A24B/1B2B23?text=5p+reverse", fact: "The 5p shrank in size in 1990 to match the old sixpence." },
  { id: "uk-10p", setIds: ["uk"], name: "10 Pence", rarity: "uncommon", obverseUrl: "https://placehold.co/200x200/9CA6A0/1B2B23?text=10p+obverse", reverseUrl: "https://placehold.co/200x200/9CA6A0/1B2B23?text=10p+reverse", fact: "Current 10p coins feature letters from the alphabet." },
  { id: "uk-20p", setIds: ["uk"], name: "20 Pence", rarity: "uncommon", obverseUrl: "https://placehold.co/200x200/9CA6A0/1B2B23?text=20p+obverse", reverseUrl: "https://placehold.co/200x200/9CA6A0/1B2B23?text=20p+reverse", fact: "The 20p is the only UK coin with an odd number of sides that isn't 7." },
  { id: "uk-50p", setIds: ["uk"], name: "50 Pence", rarity: "rare", obverseUrl: "https://placehold.co/200x200/8E9AA8/1B2B23?text=50p+obverse", reverseUrl: "https://placehold.co/200x200/8E9AA8/1B2B23?text=50p+reverse", fact: "The 50p has 7 equilateral-curve sides." },
  { id: "uk-1pound", setIds: ["uk"], name: " £1 Coin", rarity: "rare", obverseUrl: "https://placehold.co/200x200/8E9AA8/1B2B23?text=%C2%A31+obverse", reverseUrl: "https://placehold.co/200x200/8E9AA8/1B2B23?text=%C2%A31+reverse", fact: "The current 12-sided £1 coin replaced a round design in 2₀₁₇." },
  { id: "uk-2pound", setIds: ["uk"], name: " £2 Coin", rarity: "legendary", obverseUrl: "https://placehold.co/200x200/8E9AA8/1B2B23?text=%C2%A32+obverse", reverseUrl: "https://placehold.co/200x200/8E9AA8/1B2B23?text=%C2%A32+reverse", fact: " £2 coins are bimetallic — two different metals in one coin." },

  { id: "eur-1c", setIds: ["eur"], name: "1 Cent", rarity: "common", obverseUrl: "https://placehold.co/200x200/C9A24B/1B2B23?text=1c+obverse", reverseUrl: "https://placehold.co/200x200/C9A24B/1B2B23?text=1c+reverse", fact: "Every euro coin shares a common reverse design." },
  { id: "eur-10c", setIds: ["eur"], name: "10 Cent", rarity: "uncommon", obverseUrl: "https://placehold.co/200x200/9CA6A0/1B2B23?text=10c+obverse", reverseUrl: "https://placehold.co/200x200/9CA6A0/1B2B23?text=10c+reverse", fact: "Euro coin obverse designs vary by issuing country." },
  { id: "eur-1e", setIds: ["eur"], name: "1 Euro", rarity: "rare", obverseUrl: "https://placehold.co/200x200/8E9AA8/1B2B23?text=1e+obverse", reverseUrl: "https://placehold.co/200x200/8E9AA8/1B2B23?text=1e+reverse", fact: "The 1 euro coin is bimetallic, like the UK's old £2." },
  { id: "eur-2e", setIds: ["eur"], name: "2 Euro", rarity: "legendary", obverseUrl: "https://placehold.co/200x200/D9B44A/1B2B23?text=2e+obverse", reverseUrl: "https://placehold.co/200x200/D9B44A/1B2B23?text=2e+reverse", fact: "２ euro commemorative coins are popular with collectors for their limited runs." },
];

export const triviaQuestions: TriviaQuestion[] = [
  {
    id: "t1",
    setIds: ["uk"],
    question: "How many sides does a 50p coin have?",
    options: ["6", "7", "8", "12"],
    correctIndex: 1,
    reward: 15,
  },
  {
    id: "t2",
    setIds: ["uk"],
    question: "What metal combination makes up a £1 coin?",
    options: ["Pure copper", "Pure nickel", "Nickel-brass", "Bronze"],
    correctIndex: 2,
    reward: 15,
  },
  {
    id: "t3",
    setIds: ["uk"],
    question: "In what year did the 12-sided £1 coin launch?",
    options: ["2015", "2017", "2019", "2021"],
    correctIndex: 1,
    reward: 20,
  },
  {
    id: "t4",
    setIds: ["eur"],
    question: "What do all euro coins share on one face?",
    options: ["Nothing, all sides vary", "A common reverse design", "The same year", "A portrait of a monarch"],
    correctIndex: 1,
    reward: 15,
  },
];

/** Simulates an async fetch — this is the seam where a real Sheet fetch will go. */
async function fetchCsv<T>(url: string): Promise<T[]> {
  const response = await fetch(url);
  console.log("[seedData] Fetching CSV:", url);
  if (!response.ok) {
    throw new Error(`Failed to fetch CSV from ${url}: ${response.status} ${response.statusText}`);
  }
  const csvText = await response.text();
  console.log("[seedData] Raw CSV length:", csvText.length);

  const result = Papa.parse<T>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  if (result.errors.length) {
    console.warn("CSV parse errors:", result.errors);
  }
  console.log("[seedData] Parsed rows count:", result.data.length);
  return result.data;
}

function parseRarity(raw: string): Rarity {
  const r = raw.toLowerCase().trim();
  if (r === "common") return "common";
  if (r === "uncommon") return "uncommon";
  if (r === "rare") return "rare";
  if (r === "legendary") return "legendary";
  // Fallback
  return "common";
}

export async function fetchSeedData() {
  console.log("[seedData] fetchSeedData() called");
  const [setsRows, coinsRows, triviaRows] = await Promise.all([
    fetchCsv<Record<string, string>>(COIN_SETS_CSV_URL),
    fetchCsv<Record<string, string>>(COINS_CSV_URL),
    fetchCsv<Record<string, string>>(TRIVIA_CSV_URL),
  ]);

  console.log("[seedData] setsRows:", setsRows);
  console.log("[seedData] coinsRows:", coinsRows);
  console.log("[seedData] triviaRows:", triviaRows);

  // Map CoinSets
  const coinSets: CoinSet[] = setsRows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    unlockThreshold: Number(row.unlockThreshold) || 0,
    requiresSetId: row.requiresSetId?.trim() ? row.requiresSetId.trim() : null,
  }));

  // Map Coins
  const coinDefinitions: CoinDefinition[] = coinsRows.map((row) => {
    // Support both single setId and multi-set setIds
    const setIdRaw = row.setId?.trim();
    const setIdsRaw = row.setIds?.trim();

    let setIds: string[];
    if (setIdsRaw) {
      setIds = setIdsRaw
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (setIdRaw) {
      setIds = [setIdRaw];
    } else {
      setIds = [];
    }

    return {
      id: row.id,
      setIds,
      name: row.name,
      rarity: parseRarity(row.rarity),
      obverseUrl: row.obverseUrl,
      reverseUrl: row.reverseUrl,
      fact: row.fact,
    };
  });

  // Map TriviaQuestions
  const triviaQuestions: TriviaQuestion[] = triviaRows.map((row) => {
    const optionsRaw = row.options ?? "";
    const options = optionsRaw
      .split(";")
      .map((o) => o.trim())
      .filter(Boolean);
    const setIdRaw = row.setId?.trim();
    const setIdsRaw = row.setIds?.trim();

    let setIds: string[];
    if (setIdsRaw) {
      setIds = setIdsRaw
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (setIdRaw) {
      setIds = [setIdRaw];
    } else {
      setIds = [];
    }

    return {
      id: row.id,
      setIds,
      question: row.question,
      options,
      correctIndex: Number(row.correctIndex) || 0,
      reward: Number(row.reward) || 0,
    };
  });

  console.log("[seedData] Final coinSets:", coinSets);
  console.log("[seedData] Final coinDefinitions:", coinDefinitions);
  console.log("[seedData] Final triviaQuestions:", triviaQuestions);

  return { coinSets, coinDefinitions, triviaQuestions };
}

// export async function fetchSeedData() {
//   return { coinSets, coinDefinitions, triviaQuestions };
// }