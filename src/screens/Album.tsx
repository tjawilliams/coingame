import { useGameStore } from "../store/gameStore";
import { CoinCard } from "../components/CoinCard";

export function Album() {
  const { coinSets, coinDefinitions, ownedCoins, isSetUnlocked, setCompletion, sellDuplicate } =
    useGameStore();

  const visibleSets = coinSets.filter((set) => isSetUnlocked(set.id));

  // Define the order you want denominations to appear in.
  // Adjust this to match your actual denomination strings.
  const denomOrder = ["Half Penny","1 Penny", "2 Pence", "5 Pence", "10 Pence", "20 Pence", "50 Pence", "1 Pound", "2 Pounds", "Great British Coin Hunt - 10 Pence Commemorative", "Commemorative 50 Pence", "2012 Olympics, London - 50 Pence Commemorative", "Beatrix Potter - 50 Pence Commemorative", "Paddington Bear - 50 Pence Commemorative", "Heraldic Emblems - 1 Pound Commemorative", "Royal Diadems - 1 Pound Commemorative", "Regional Bridges - 1 Pound Commemorative", "UK Cities - 1 Pound Commemorative", "Floral Emblems - 1 Pound Commemorative", "Commemorative 2 Pounds", "2002 Commonwealth Games - 2 Pounds Commemorative", "Centenary of First World War - 2 Pounds Commemorative", "William Shakespeare - 2 Pounds Commemorative"];

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