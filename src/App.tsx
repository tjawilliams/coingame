import { useEffect, useState } from "react";
import { useGameStore } from "./store/gameStore";
import { Shop } from "./screens/Shop";
import { Album } from "./screens/Album";
import { Trivia } from "./screens/Trivia";

type Tab = "shop" | "album" | "trivia";

export default function App() {
  const { loading, init } = useGameStore();
  const [tab, setTab] = useState<Tab>("shop");

  useEffect(() => {
    init();
  }, [init]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-50">
        <div className="rounded-xl border border-ink-900/10 bg-parchment px-6 py-4 text-center">
          <p className="font-plex text-sm font-medium text-ink-700">Loading your collection…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-50">
      <header className="border-b border-ink-900/10 bg-parchment">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <h1 className="font-plex text-xl font-bold text-ink-900">Coin Collector</h1>
          <p className="text-sm text-ink-600">Collect, trade, and learn about coins</p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {tab === "shop" && <Shop />}
        {tab === "album" && <Album />}
        {tab === "trivia" && <Trivia />}
      </main>

      <nav className="sticky bottom-0 border-t border-ink-900/10 bg-parchment">
        <div className="mx-auto flex max-w-5xl items-center justify-around px-4 py-2">
          <button
            onClick={() => setTab("shop")}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              tab === "shop"
                ? "bg-copper-600 text-parchment"
                : "text-ink-700 hover:bg-ink-900/5"
            }`}
          >
            Shop
          </button>
          <button
            onClick={() => setTab("album")}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              tab === "album"
                ? "bg-copper-600 text-parchment"
                : "text-ink-700 hover:bg-ink-900/5"
            }`}
          >
            Album
          </button>
          <button
            onClick={() => setTab("trivia")}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              tab === "trivia"
                ? "bg-copper-600 text-parchment"
                : "text-ink-700 hover:bg-ink-900/5"
            }`}
          >
            Trivia
          </button>
        </div>
      </nav>
    </div>
  );
}