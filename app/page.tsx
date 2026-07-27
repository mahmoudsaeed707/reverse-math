"use client";

import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { generateEquation, type Equation } from "@/lib/game";
import { AdSlot } from "@/components/AdSlot";
import { ResultCard } from "@/components/ResultCard";

type Phase = "intro" | "playing" | "result";
const MAX_LIVES = 3;

export default function Home() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [round, setRound] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [score, setScore] = useState(0);
  const [equation, setEquation] = useState<Equation | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [feedback, setFeedback] = useState<{ index: number | null; correct: boolean } | null>(null);
  const answeredRef = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);

  function loadQuestion(r: number) {
    const eq = generateEquation(r);
    answeredRef.current = false;
    setEquation(eq);
    setTimeLeft(eq.timerMs);
    setFeedback(null);
  }

  function startGame() {
    setRound(0);
    setLives(MAX_LIVES);
    setScore(0);
    setPhase("playing");
    loadQuestion(0);
  }

  function resolveAnswer(selectedIndex: number | null, correct: boolean) {
    if (answeredRef.current || !equation) return;
    answeredRef.current = true;
    setFeedback({ index: selectedIndex, correct });

    const newScore = correct ? score + 1 : score;
    const newLives = correct ? lives : lives - 1;

    setTimeout(() => {
      setScore(newScore);
      setLives(newLives);
      if (newLives <= 0) {
        setPhase("result");
      } else {
        const nextRound = round + 1;
        setRound(nextRound);
        loadQuestion(nextRound);
      }
    }, 900);
  }

  function pickAnswer(index: number) {
    if (!equation || answeredRef.current) return;
    resolveAnswer(index, equation.choices[index] === equation.correctAnswer);
  }

  useEffect(() => {
    if (phase !== "playing" || !equation || answeredRef.current) return;
    const start = Date.now();
    const total = equation.timerMs;
    const interval = setInterval(() => {
      const remaining = Math.max(0, total - (Date.now() - start));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        resolveAnswer(null, false);
      }
    }, 100);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equation, phase]);

  async function download() {
    if (!cardRef.current) return;
    const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 });
    const link = document.createElement("a");
    link.download = "reverse-math-score.png";
    link.href = dataUrl;
    link.click();
  }

  async function share() {
    if (!cardRef.current) return;
    const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 });
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "reverse-math-score.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Reverse Math",
          text: `I scored ${score} on Reverse Math — bet you can't beat me 👀\nhttps://reversemath.org`,
        });
        return;
      }
    } catch {
      // fall through to download
    }
    download();
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <header className="text-center">
        <h1 className="text-3xl font-black tracking-tight">
          Reverse<span className="text-indigo-500">Math</span> 🔁
        </h1>
        {phase === "intro" && (
          <p className="mt-1 text-sm text-neutral-500">
            An arrow above a number means read it backwards. Simple math, if you&apos;re paying attention.
          </p>
        )}
      </header>

      {phase !== "playing" && <AdSlot slot="top" />}

      {phase === "intro" && (
        <section className="flex flex-col gap-5">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-neutral-300 bg-white/50 p-6 dark:border-neutral-700 dark:bg-neutral-900">
            <div className="flex items-center gap-4 text-3xl font-black">
              <div className="flex flex-col items-center gap-1">
                <span className="text-indigo-500">→</span>
                <span>47</span>
              </div>
              <span className="text-neutral-400">+</span>
              <div className="flex flex-col items-center gap-1">
                <span className="text-indigo-500">←</span>
                <span>23</span>
              </div>
            </div>
            <p className="text-center text-xs text-neutral-500">
              → read normally · ← read backwards. Here: 47 + 32 = <strong>79</strong>
            </p>
          </div>

          <p className="text-center text-xs text-neutral-500">
            You&apos;ve got {MAX_LIVES} lives and a countdown per question. Answer fast, answer right.
          </p>

          <button
            onClick={startGame}
            className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 py-4 text-lg font-bold text-white shadow-lg transition active:scale-[0.98]"
          >
            Start 🔁
          </button>
        </section>
      )}

      {phase === "playing" && equation && (
        <section className="flex flex-col gap-5">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span>Score: {score}</span>
            <span>{"❤️".repeat(lives)}</span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all"
              style={{ width: `${(timeLeft / equation.timerMs) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-center gap-6 py-6 text-5xl font-black">
            <div className="flex flex-col items-center gap-1">
              <span className="text-indigo-500">{equation.a.reversed ? "←" : "→"}</span>
              <span>{equation.a.displayed}</span>
            </div>
            <span className="text-neutral-400">{equation.operator}</span>
            <div className="flex flex-col items-center gap-1">
              <span className="text-indigo-500">{equation.b.reversed ? "←" : "→"}</span>
              <span>{equation.b.displayed}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {equation.choices.map((choice, i) => {
              let style = "border-neutral-300 dark:border-neutral-700";
              if (feedback) {
                if (choice === equation.correctAnswer) {
                  style = "border-green-500 bg-green-500 text-white";
                } else if (i === feedback.index) {
                  style = "border-red-500 bg-red-500 text-white";
                }
              }
              return (
                <button
                  key={i}
                  onClick={() => pickAnswer(i)}
                  disabled={!!feedback}
                  className={`rounded-xl border py-4 text-xl font-bold transition ${style}`}
                >
                  {choice}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {phase === "result" && (
        <section className="flex flex-col items-center gap-4">
          <ResultCard ref={cardRef} score={score} bestRound={round + 1} />

          <div className="grid w-full max-w-sm grid-cols-2 gap-3">
            <button
              onClick={download}
              className="rounded-xl border border-neutral-300 py-3 font-semibold dark:border-neutral-700"
            >
              Save Image
            </button>
            <button
              onClick={share}
              className="rounded-xl bg-black py-3 font-semibold text-white dark:bg-white dark:text-black"
            >
              Share
            </button>
          </div>

          <button
            onClick={startGame}
            className="w-full max-w-sm rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 py-4 text-lg font-bold text-white shadow-lg transition active:scale-[0.98]"
          >
            Try Again 🔁
          </button>
        </section>
      )}

      {phase !== "playing" && <AdSlot slot="bottom" />}

      <footer className="mt-auto pt-4 text-center text-[11px] leading-relaxed text-neutral-400">
        Reverse Math — pure attention training, no download needed.
      </footer>
    </main>
  );
}
