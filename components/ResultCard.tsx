import { forwardRef } from "react";
import { taglineForScore, titleForScore } from "@/lib/game";

export const ResultCard = forwardRef<HTMLDivElement, { score: number; bestRound: number }>(
  function ResultCard({ score, bestRound }, ref) {
    return (
      <div
        ref={ref}
        className="relative flex aspect-[4/5] w-full max-w-sm flex-col justify-between overflow-hidden rounded-3xl p-8 shadow-2xl"
        style={{
          background: "linear-gradient(155deg, #4F46E5 0%, #7C3AED 45%, #EC4899 100%)",
        }}
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-black/10 blur-2xl" />

        <span className="relative w-fit rounded-full bg-black/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
          🔁 Reverse Math
        </span>

        <div className="relative flex flex-col items-center gap-2 text-center">
          <span className="text-7xl font-black text-white drop-shadow-sm">{score}</span>
          <span className="text-lg font-semibold text-white/90">correct answers</span>
          <span className="text-sm text-white/70">reached round {bestRound}</span>
          <span className="mt-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold text-white">
            {titleForScore(score)}
          </span>
          <span className="text-sm font-semibold text-white/80">{taglineForScore(score)}</span>
          <p className="mt-4 text-base font-bold text-white/90">
            {`I scored ${score} on Reverse Math — bet you can't beat me 👀`}
          </p>
        </div>

        <span className="relative text-sm font-bold tracking-tight text-white/90">ReverseMath.org</span>
      </div>
    );
  },
);
