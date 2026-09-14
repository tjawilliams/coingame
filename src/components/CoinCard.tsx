import type { CoinDefinition, Rarity } from "../types";
import { RARITY_LABELS } from "../types";

const RARITY_RING: Record<Rarity, string> = {
  common: "ring-stone-400",
  uncommon: "ring-slate-400",
  rare: "ring-sky-400",
  legendary: "ring-amber-400",
};

const RARITY_TEXT: Record<Rarity, string> = {
  common: "text-stone-500",
  uncommon: "text-slate-500",
  rare: "text-sky-600",
  legendary: "text-amber-600",
};

interface CoinCardProps {
  coin: CoinDefinition;
  quantity: number;
  onSell?: () => void;
}

export function CoinCard({ coin, quantity, onSell }: CoinCardProps) {
  const owned = quantity > 0;

  return (
    <div className={`rounded-xl border-2 bg-parchment p-3 shadow-sm ${owned ? "" : "opacity-70"}`}>
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-2">
          <div>
            <p className="text-xs font-medium text-ink-600">Obverse</p>
            <img
              src={coin.obverseUrl}
              alt={`${coin.name} obverse`}
              className={`h-20 w-20 rounded-full object-cover ring-2 ${RARITY_RING[coin.rarity]}`}
            />
          </div>
          <div>
            <p className="text-xs font-medium text-ink-600">Reverse</p>
            <img
              src={coin.reverseUrl}
              alt={`${coin.name} reverse`}
              className={`h-20 w-20 rounded-full object-cover ring-2 ${RARITY_RING[coin.rarity]}`}
            />
          </div>
        </div>
         
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="truncate font-plex text-sm font-semibold text-ink-900">{coin.name}</h3>
            {owned && quantity > 1 && onSell && (
              <button
                onClick={onSell}
                className="ml-2 rounded-md bg-ink-900/5 px-2 py-1 text-xs font-medium text-ink-700 transition hover:bg-ink-900/10"
              >
                Sell
              </button>
            )}
          </div>
          <p className={`text-xs font-medium ${RARITY_TEXT[coin.rarity]}`}>{RARITY_LABELS[coin.rarity]}</p>
          {owned && (
            <p className="text-xs text-ink-600">
              {quantity > 1 ? `×² ${quantity} owned` : "Owned"}
            </p>
          )}
        </div>
      </div>
      {!owned && (
        <p className="mt-2 text-xs text-ink-500">
          Not yet in your collection
        </p>
      )}
    </div>
  );
}