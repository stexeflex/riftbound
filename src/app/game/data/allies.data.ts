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
    summonCardId: 'risswaechter',
    taunt: true,
  },
  funkengeist: {
    id: 'funkengeist',
    name: 'Funkengeist',
    emoji: '🔥',
    maxHp: 10,
    text: 'Hat 10 Leben und verursacht an deinen nächsten 3 Zuganfängen je 5 Schaden an einem zufälligen Gegner. Gruppenschaden kann ihn vorher besiegen.',
    costKerne: 3,
    summonCardId: 'funkengeist',
    startTurnDamage: 5,
    duration: 3,
  },
};

export const MAX_ALLIES = 2;
