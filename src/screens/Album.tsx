import { useGameStore } from "../store/gameStore";
import { CoinCard } from "../components/CoinCard";

export function Album() {
  const { coinSets, coinDefinitions, ownedCoins, isSetUnlocked, setCompletion, sellDuplicate } =
    useGameStore();

  const visibleSets = coinSets.filter((set) => isSetUnlocked(set.id));

  return (
    <div className="space-y-6">
      {visibleSets.map((set) => {
        const coinsInSet = coinDefinitions.filter((c) => c.setId === set.id);
        const completion = setCompletion(set.id);

        return (
          <div key={set.id} className="space-y-3">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="font-plex text-lg font-semibold text-ink-900">{set.name}</h2>
                <p className="text-sm text-ink-600">{set.description}</p>
              </div>
              <p className="text-sm font-medium text-ink-700">{completion}% complete</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {coinsInSet.map((coin) => {
                const owned = ownedCoins[coin.id]?.quantity ?? 0;
                return (
                  <CoinCard
                    key={coin.id}
                    coin={coin}
                    quantity={owned}
                    onSell={
                      owned > 1
                        ? () => {
                            sellDuplicate(coin.id);
                          }
                        : undefined
                    }
                  />
                );
              })}
            </div>
          </div>
        );
      })}

      {visibleSets.length === 0 && (
        <div className="rounded-xl border border-ink-900/10 bg-parchment p-6 text-center">
          <p className="text-sm text-ink-600">
            Your album is empty so far. Buy your first bag in the Shop to start collecting!
          </p>
        </div>
      )}
    </div>
  );
}