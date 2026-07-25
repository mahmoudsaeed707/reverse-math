export type Operator = "+" | "-" | "×" | "÷";

export type Operand = {
  displayed: number;
  reversed: boolean;
  effective: number;
};

export type Equation = {
  a: Operand;
  b: Operand;
  operator: Operator;
  correctAnswer: number;
  choices: number[];
  timerMs: number;
};

function reverseDigits(n: number): number {
  return parseInt(n.toString().split("").reverse().join(""), 10);
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Builds a 2-digit displayed number + arrow direction that yields the given effective value. */
function makeOperand(effectiveValue: number): Operand {
  const wantsReverse = Math.random() < 0.5;

  if (!wantsReverse && effectiveValue >= 10 && effectiveValue <= 99) {
    return { displayed: effectiveValue, reversed: false, effective: effectiveValue };
  }

  if (effectiveValue < 10) {
    const displayed = effectiveValue * 10;
    return { displayed, reversed: true, effective: effectiveValue };
  }

  if (effectiveValue % 10 === 0) {
    // Reversing would collapse to a single digit on screen (e.g. 40 -> "04"); keep it as →.
    return { displayed: effectiveValue, reversed: false, effective: effectiveValue };
  }

  return { displayed: reverseDigits(effectiveValue), reversed: true, effective: effectiveValue };
}

export type Difficulty = {
  operators: Operator[];
  minNum: number;
  maxNum: number;
  timerMs: number;
};

export function difficultyForRound(round: number): Difficulty {
  const tier = Math.floor((round - 1) / 10); // rounds 1-10 -> 0, 11-20 -> 1, 21-30 -> 2, ...

  if (tier === 0) {
    return { operators: ["+", "-"], minNum: 10, maxNum: 40, timerMs: 8000 };
  }
  if (tier === 1) {
    return { operators: ["+", "-", "×"], minNum: 10, maxNum: 60, timerMs: 7000 };
  }
  return {
    operators: ["+", "-", "×", "÷"],
    minNum: 10,
    maxNum: 99,
    timerMs: Math.max(4000, 7000 - (tier - 1) * 500),
  };
}

function generateOperands(operator: Operator, diff: Difficulty): { effA: number; effB: number } {
  if (operator === "+") {
    return { effA: randInt(diff.minNum, diff.maxNum), effB: randInt(diff.minNum, diff.maxNum) };
  }
  if (operator === "-") {
    const x = randInt(diff.minNum, diff.maxNum);
    const y = randInt(diff.minNum, diff.maxNum);
    return { effA: Math.max(x, y), effB: Math.min(x, y) };
  }
  if (operator === "×") {
    return { effA: randInt(2, 12), effB: randInt(2, 12) };
  }
  // ÷
  const divisor = randInt(2, 9);
  const maxQuotient = Math.floor(diff.maxNum / divisor);
  const quotient = randInt(2, Math.max(2, maxQuotient));
  return { effA: divisor * quotient, effB: divisor };
}

function computeResult(operator: Operator, effA: number, effB: number): number {
  switch (operator) {
    case "+":
      return effA + effB;
    case "-":
      return effA - effB;
    case "×":
      return effA * effB;
    case "÷":
      return effA / effB;
  }
}

function buildChoices(correct: number, trapAnswer: number): number[] {
  const set = new Set<number>([correct]);
  if (trapAnswer !== correct) set.add(trapAnswer);

  while (set.size < 4) {
    const offset = randInt(1, Math.max(3, Math.round(Math.abs(correct) * 0.15) + 2));
    const candidate = Math.random() < 0.5 ? correct + offset : correct - offset;
    if (candidate !== correct && candidate >= 0) set.add(candidate);
  }

  return Array.from(set)
    .slice(0, 4)
    .sort(() => Math.random() - 0.5);
}

export function titleForScore(score: number): string {
  if (score >= 15) return "Certified Math Wizard 🏆";
  if (score >= 10) return "You're a genius 🧠";
  if (score >= 6) return "You're really smart 😎";
  if (score >= 3) return "You're good 👍";
  return "You need to work harder on your math 📚";
}

export function taglineForScore(score: number): string {
  if (score >= 15) return "Lightning brain ⚡";
  if (score >= 10) return "Genius-level reflexes 🧠";
  if (score >= 6) return "Razor-sharp focus 🔪";
  if (score >= 3) return "Solid reflexes 💪";
  return "Warming up those neurons 🌱";
}

export function generateEquation(round: number): Equation {
  const diff = difficultyForRound(round);
  const operator = diff.operators[randInt(0, diff.operators.length - 1)];
  const { effA, effB } = generateOperands(operator, diff);

  const a = makeOperand(effA);
  const b = makeOperand(effB);

  const correctAnswer = computeResult(operator, a.effective, b.effective);
  // The classic trap: compute using the displayed digits, ignoring the arrows entirely.
  const trapAnswer = computeResult(operator, a.displayed, b.displayed);

  return {
    a,
    b,
    operator,
    correctAnswer,
    choices: buildChoices(correctAnswer, trapAnswer),
    timerMs: diff.timerMs,
  };
}
