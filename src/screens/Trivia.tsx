import { useMemo, useState } from "react";
import { db } from "../db/database";
import { useGameStore } from "../store/gameStore";
import type { TriviaQuestion } from "../types";
import { useEffect } from "react";

export function Trivia() {
  const { player, awardTriviaReward, isSetUnlocked } = useGameStore();
  const [pool, setPool] = useState<TriviaQuestion[]>([]);
  const [current, setCurrent] = useState<TriviaQuestion | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [lastId, setLastId] = useState<string | null>(null);

  useEffect(() => {
    db.triviaQuestions.toArray().then((all) => {
      const usable = all.filter((q) => {
        if (!q.setIds || q.setIds.length === 0) return true;
        return q.setIds.some((setId) => isSetUnlocked(setId));
      });
      setPool(usable);
      const first = usable[Math.floor(Math.random() * usable.length)] ?? null;
      setCurrent(first);
      setLastId(first?.id ?? null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isCorrect = useMemo(
    () => selected !== null && current !== null && selected === current.correctIndex,
    [selected, current]
  );

  function pickNext() {
    const options = pool.filter((q) => q.id !== lastId);
    const next = options[Math.floor(Math.random() * options.length)] ?? pool[0] ?? null;
    setCurrent(next);
    setLastId(next?.id ?? null);
    setSelected(null);
  }

  async function handleAnswer(index: number) {
    if (selected !== null || !current) return;
    setSelected(index);
    if (index === current.correctIndex) {
      await awardTriviaReward(current.reward);
    }
  }

  if (!current) {
    return (
      <div className="rounded-xl border border-ink-900/10 bg-parchment p-6 text-center">
        <p className="text-sm text-ink-600">Loading trivia…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-ink-900/10 bg-parchment p-4">
        <h2 className="font-plex text-lg font-semibold text-ink-900">Coin Trivia</h2>
        <p className="text-sm text-ink-600">
          Answer correctly to earn tokens for the shop.
        </p>
        <p className="mt-2 text-sm font-medium text-ink-700">
          Your balance:{" "}
          <span className="font-semibold text-copper-700">{player?.currency ?? 0} tokens</span>
        </p>
      </div>

      <div className="rounded-xl border-2 border-ink-900/10 bg-parchment p-4">
        <p className="font-plex text-base font-semibold text-ink-900">{current.question}</p>

        <div className="mt-3 space-y-2">
          {current.options.map((option, index) => {
            const isSelected = selected === index;
            const showCorrect = selected !== null && index === current.correctIndex;
            const showWrong = isSelected && index !== current.correctIndex;

            return (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={selected !== null}
                className={`w-full rounded-lg border px-4 py-3 text-left font-plex text-sm transition ${
                  showCorrect
                    ? "border-green-600 bg-green-50 text-green-800"
                    : showWrong
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-ink-900/15 text-ink-900 hover:border-copper-500"
                } ${selected !== null && !isSelected && !showCorrect ? "opacity-50" : ""}`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm font-medium text-ink-700">
              {isCorrect ? `Correct! +${current.reward} tokens.` : "Not quite — no reward this time."}
            </p>
            <button
              onClick={pickNext}
              className="rounded-lg bg-copper-600 px-4 py-2 font-plex text-sm font-medium text-parchment transition hover:bg-copper-700"
            >
              Next question
            </button>
          </div>
        )}
      </div>
    </div>
  );
}