import { useGameStore } from "../store/gameStore";
import { CoinCard } from "../components/CoinCard";

export function Album() {
  const { coinSets, coinDefinitions, ownedCoins, isSetUnlocked, setCompletion, sellDuplicate } =
    useGameStore();

  const visibleSets = coinSets.filter((set) => isSetUnlocked(set.id));

  // Define the order you want denominations to appear in.
  // Adjust this to match your actual denomination strings.
  const denomOrder = ["Half Penny","1 Penny", "2 Pence", "5 Pence", "10 Pence", "20 Pence", "50 Pence", "1 Pound", "2 Pound", "1 Cent", "2 Cent", "5 Cent", "10 Cent", "20 Cent", "50 Cent", "1 Euro", "2 Euro"];

  console.log("coinSets:", coinSets);
  console.log("coinDefinitions:", coinDefinitions);
  console.log("ownedCoins:", ownedCoins);

  return (
    <div className="space-y-6">
      {visibleSets.map((set) => {
        // All coins that belong to this album (set)
        const coinsInSet = coinDefinitions.filter((c) => c.setIds.includes(set.id));

        // Group by denomination
        const byDenom: Record<string, typeof coinsInSet> = {};
        for (const coin of coinsInSet) {
          const denom = coin.denomination || "Other";
          if (!byDenom[denom]) byDenom[denom] = [];
          byDenom[denom].push(coin);
        }

        const completion = setCompletion(set.id);

        return (
          <div key={set.id} className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="font-plex text-lg font-semibold text-ink-900">{set.name}</h2>
                <p className="text-sm text-ink-600">{set.description}</p>
              </div>
              <p className="text-sm font-medium text-ink-700">{completion}% complete</p>
            </div>

            {denomOrder.map((denom) => {
              const coins = byDenom[denom];
              if (!coins || coins.length === 0) return null;

              return (
                <div key={denom} className="space-y-2">
                  <h3 className="font-plex text-base font-semibold text-ink-900">{denom}</h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {coins.map((coin) => {
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