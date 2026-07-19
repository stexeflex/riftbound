/** Nicht zustandsbehaftete Hilfsfunktionen der Spiellogik. */
export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let index = result.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
}

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function clampDifficulty(value: number): number {
  return Math.min(10, Math.max(1, Math.round(Number.isFinite(value) ? value : 1)));
}

