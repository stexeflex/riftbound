import { AllyDef } from '../models';

// ------------------------- Verbündete -------------------------

export const ALLIES: Record<string, AllyDef> = {
  risswaechter: {
    id: 'risswaechter',
    name: 'Risswächter',
    emoji: '🛡️',
    maxHp: 15,
    text: 'Provokation: Fängt gezielte gegnerische Treffer ab, bis seine 15 Leben aufgebraucht sind. Gruppenschaden trifft ihn wie jeden Verbündeten.',
    costKerne: 4,
    taunt: true,
    commandDamage: 4,
  },
  funkengeist: {
    id: 'funkengeist',
    name: 'Funkengeist',
    emoji: '🔥',
    maxHp: 10,
    text: 'Funkenangriff: Verursacht an deinen nächsten 3 Zuganfängen je 5 Schaden an einem zufälligen Gegner. Gruppenschaden kann seine 10 Leben vorher aufbrauchen.',
    costKerne: 3,
    startTurnDamage: 5,
    commandDamage: 5,
    duration: 3,
  },
};

export const MAX_ALLIES = 3;
