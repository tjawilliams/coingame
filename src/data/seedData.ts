import Papa from "papaparse";
import type { Bag, CoinDefinition, CoinSet, Rarity, TriviaQuestion } from "../types";

// Google Sheet Data URLs
const COIN_SETS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRiWUQEDK7PTrEHZxQ1hSUSqOMxSgGxlEeb1jaRm9Ns6rioTQvlvQFytAKH7lGcwWVJjy97MAFVwUvb/pub?gid=0&single=true&output=csv";
const COINS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRiWUQEDK7PTrEHZxQ1hSUSqOMxSgGxlEeb1jaRm9Ns6rioTQvlvQFytAKH7lGcwWVJjy97MAFVwUvb/pub?gid=1937635961&single=true&output=csv";
const TRIVIA_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRiWUQEDK7PTrEHZxQ1hSUSqOMxSgGxlEeb1jaRm9Ns6rioTQvlvQFytAKH7lGcwWVJjy97MAFVwUvb/pub?gid=1820301888&single=true&output=csv";
const BAGS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRiWUQEDK7PTrEHZxQ1hSUSqOMxSgGxlEeb1jaRm9Ns6rioTQvlvQFytAKH7lGcwWVJjy97MAFVwUvb/pub?gid=327262000&single=true&output=csv";

async function fetchCsv<T>(url: string): Promise<T[]> {
  console.log("[seedData] Fetching CSV from:", url);
  const response = await fetch(url);
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
    console.warn("[seedData] CSV parse errors:", result.errors);
  }

  console.log("[seedData] Parsed CSV rows:", result.data.length);
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

  const [setsRows, coinsRows, triviaRows, bagsRows] = await Promise.all([
    fetchCsv<Record<string, string>>(COIN_SETS_CSV_URL),
    fetchCsv<Record<string, string>>(COINS_CSV_URL),
    fetchCsv<Record<string, string>>(TRIVIA_CSV_URL),
    fetchCsv<Record<string, string>>(BAGS_CSV_URL),
  ]);

  console.log("[seedData] setRows:", setsRows);
  console.log("[seedData] coinsRows:", coinsRows);
  console.log("[seedData] triviaRows:", triviaRows);
  console.log("[seedData] bagsRows:", bagsRows);

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

    const allowedBagIdsRaw = row.allowedBagIds?.trim();
    const allowedBagIds = allowedBagIdsRaw
      ? allowedBagIdsRaw
          .split(";")
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;

    return {
      id: row.id,
      setIds,
      name: row.name,
      rarity: parseRarity(row.rarity),
      obverseUrl: row.obverseUrl,
      reverseUrl: row.reverseUrl,
      fact: row.fact,
      denomination: row.denomination,
      allowedBagIds,
    };
  });

  // Map TriviaQuestions
  const triviaQuestions: TriviaQuestion[] = triviaRows.map((row) => {
    const setIdsRaw = row.setIds?.trim();
    const setIds = setIdsRaw
      ? setIdsRaw
          .split(";")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const optionsRaw = row.options ?? "";
    const options = optionsRaw
      .split(";")
      .map((o) => o.trim())
      .filter(Boolean);

    return {
      id: row.id,
      setIds,
      question: row.question,
      options,
      correctIndex: Number(row.correctIndex) || 0,
      reward: Number(row.reward) || 0,
    };
  });

  // Map Bags
  const bags: Bag[] = bagsRows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    setId: row.setId,
    cost: Number(row.cost) || 25,
    unlockRequiresSetId: row.unlockRequiresSetId?.trim() ? row.unlockRequiresSetId.trim() : null,
    unlockThreshold: Number(row.unlockThreshold) || 0,
  }));

  console.log("[seedData] Final coinSets:", coinSets);
  console.log("[seedData] Final coinDefinitions:", coinDefinitions);
  console.log("[seedData] Final triviaQuestions:", triviaQuestions);
  console.log("[seedData] Final bags:", bags);

  return { coinSets, coinDefinitions, triviaQuestions, bags };
}