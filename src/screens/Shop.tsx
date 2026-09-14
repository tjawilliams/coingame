import { useState } from "react";
import { useGameStore } from "../store/gameStore";

const BAG_COST = 25;

type OpeningState =
  | { status: "idle" }
  | { status: "opening"; setId: string }
  | { status: "revealed"; setId: string; coinId: string };

export function Shop() {
  const { coinSets, player, isSetUnlocked, buyBag, setCompletion, lastPulledCoin, coinDefinitions } =
    useGameStore();

  const [opening, setOpening] = useState<OpeningState>({ status: "idle" });

  async function handleBuy(setId: string) {
    setOpening({ status: "opening", setId });
    await buyBag(setId);
    const pulled = lastPulledCoin;
    if (pulled) {
      setOpening({ status: "revealed", setId, coinId: pulled.id });
    } else {
      setOpening({ status: "idle" });
    }
  }

  const revealedCoin =
    opening.status === "revealed"
      ? coinDefinitions.find((c) => c.id === opening.coinId) ?? null
      : null;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-ink-900/10 bg-parchment p-4">
        <h2 className="font-plex text-lg font-semibold text-ink-900">Coin Bags</h2>
        <p className="text-sm text-ink-600">
          Spend coins to buy mystery bags and expand your collection.
        </p>
        <p className="mt-2 text-sm font-medium text-ink-700">
          Your balance:{" "}
          <span className="font-semibold text-copper-700">{player?.currency ?? 0} coins</span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {coinSets.map((set) => {
          const unlocked = isSetUnlocked(set.id);
          const completion = setCompletion(set.id);
          const affordable = (player?.currency ?? 0) >= BAG_COST;

          return (
            <div
              key={set.id}
              className={`rounded-xl border p-4 ${
                unlocked ? "border-ink-900/10 bg-parchment" : "border-ink-900/5 bg-ink-50"
              }`}
            >
              <h3 className="font-plex text-base font-semibold text-ink-900">{set.name}</h3>
              <p className="mt-1 text-sm text-ink-600">{set.description}</p>

              {unlocked && (
                <p className="mt-2 text-xs font-medium text-ink-700">
                  Collection {completion}% complete
                </p>
              )}

              <div className="mt-4 flex items-center justify-between">
                {unlocked ? (
                  <button
                    onClick={() => handleBuy(set.id)}
                    disabled={!affordable || opening.status === "opening"}
                    className="shrink-0 rounded-lg bg-copper-600 px-4 py-2 font-plex text-sm font-medium text-parchment transition hover:bg-copper-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {opening.status === "opening" && opening.setId === set.id
                      ? "Opening…"
                      : `Buy bag · ${BAG_COST}`}
                  </button>
                ) : (
                  <p className="text-xs text-ink-500">
                    Reach {set.unlockThreshold}% on {set.requiresSetId} to unlock
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {revealedCoin && (
        <div className="rounded-xl border-2 border-copper-600 bg-parchment p-4">
          <p className="text-sm font-medium text-ink-700">You pulled</p>
          <h3 className="mt-1 font-plex text-lg font-semibold text-ink-900">{revealedCoin.name}</h3>
          <p className="mt-2 text-sm text-ink-600">{revealedCoin.fact}</p>
          <button
            onClick={() => setOpening({ status: "idle" })}
            className="mt-3 rounded-lg bg-ink-900/5 px-3 py-1.5 text-sm font-medium text-ink-700 transition hover:bg-ink-900/10"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}