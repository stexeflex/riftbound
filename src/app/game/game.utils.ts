/** Nicht zustandsbehaftete Hilfsfunktionen der Spiellogik. */
export function createRandomSeed(): number {
  return Math.floor(Math.random() * 0x100000000) >>> 0;
}

/**
 * Erzeugt aus einem speicherbaren 32-Bit-Zustand genau einen Zufallswert.
 * So kann ein Kampf inklusive seiner noch nicht aufgedeckten Zufallsereignisse
 * durch Speichern oder Rückgängig exakt wiederhergestellt werden.
 */
export function nextSeededRandom(state: number): { state: number; value: number } {
  const nextState = (state + 0x6d2b79f5) >>> 0;
  let mixed = nextState;
  mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
  mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
  const value = ((mixed ^ (mixed >>> 14)) >>> 0) / 0x100000000;
  return { state: nextState, value };
}

export function shuffle<T>(arr: T[], random: () => number = Math.random): T[] {
  const result = [...arr];
  for (let index = result.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
}

export function pick<T>(arr: T[], random: () => number = Math.random): T {
  return arr[Math.floor(random() * arr.length)];
}

export function clampDifficulty(value: number): number {
  return Math.min(10, Math.max(1, Math.round(Number.isFinite(value) ? value : 1)));
}

