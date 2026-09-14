import type { CoinSet, CoinDefinition, TriviaQuestion } from "../types";

// This file plays the role your published Google Sheet will eventually play.
// Swap `fetchSeedData()` for a real fetch+parse of your sheet's CSV export
// once the core loop below is working end to end (see the roadmap doc).

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
  { id: "uk-1p", setIds: ["uk"], name: "1 Penny", rarity: "common", imageUrl: "https://placehold.co/200x200/C9A24B/1B2B23?text=1p", fact: "The 1p coin is made from copper-plated steel." },
  { id: "uk-2p", setIds: ["uk"], name: "2 Pence", rarity: "common", imageUrl: "https://placehold.co/200x200/C9A24B/1B2B23?text=2p", fact: "2p coins were originally struck in bronze until 1992." },
  { id: "uk-5p", setIds: ["uk"], name: "5 Pence", rarity: "common", imageUrl: "https://placehold.co/200x200/C9A24B/1B2B23?text=5p", fact: "The 5p shrank in size in 1990 to match the old sixpence." },
  { id: "uk-10p", setIds: ["uk"], name: "10 Pence", rarity: "uncommon", imageUrl: "https://placehold.co/200x200/9CA6A0/1B2B23?text=10p", fact: "Current 10p coins feature letters from the alphabet." },
  { id: "uk-20p", setIds: ["uk"], name: "20 Pence", rarity: "uncommon", imageUrl: "https://placehold.co/200x200/9CA6A0/1B2B23?text=20p", fact: "The 20p is the only UK coin with an odd number of sides that isn't 7." },
  { id: "uk-50p", setIds: ["uk"], name: "50 Pence", rarity: "rare", imageUrl: "https://placehold.co/200x200/8E9AA8/1B2B23?text=50p", fact: "The 50p has 7 equilateral-curve sides." },
  { id: "uk-1pound", setIds: ["uk"], name: " £1 Coin", rarity: "rare", imageUrl: "https://placehold.co/200x200/8E9AA8/1B2B23?text=%C2%A31", fact: "The current 12-sided £1 coin replaced a round design in 2017." },
  { id: "uk-2pound", setIds: ["uk"], name: " £2 Coin", rarity: "legendary", imageUrl: "https://placehold.co/200x200/D9B44A/1B2B23?text=%C2%A32", fact: " £2 coins are bimetallic — two different metals in one coin." },

  { id: "eur-1c", setIds: ["eur"], name: "1 Cent", rarity: "common", imageUrl: "https://placehold.co/200x200/C9A24B/1B2B23?text=1c", fact: "Every euro coin shares a common reverse design." },
  { id: "eur-10c", setIds: ["eur"], name: "10 Cent", rarity: "uncommon", imageUrl: "https://placehold.co/200x200/9CA6A0/1B2B23?text=10c", fact: "Euro coin obverse designs vary by issuing country." },
  { id: "eur-1e", setIds: ["eur"], name: "1 Euro", rarity: "rare", imageUrl: "https://placehold.co/200x200/8E9AA8/1B2B23?text=1e", fact: "The 1 euro coin is bimetallic, like the UK's old £2." },
  { id: "eur-2e", setIds: ["eur"], name: "2 Euro", rarity: "legendary", imageUrl: "https://placehold.co/200x200/D9B44A/1B2B23?text=2e", fact: "２ euro commemorative coins are popular with collectors for their limited runs." },
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
export async function fetchSeedData() {
  return { coinSets, coinDefinitions, triviaQuestions };
}