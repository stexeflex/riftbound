import { AllyDef } from '../models';

// ------------------------- Verbündete -------------------------

export const ALLIES: Record<string, AllyDef> = {
  risswaechter: {
    id: 'risswaechter',
    name: 'Risswächter',
    emoji: '🛡️',
    maxHp: 12,
    text: 'Provokation: Fängt gegnerische Treffer ab, bis seine 12 Leben aufgebraucht sind.',
    taunt: true,
  },
  funkengeist: {
    id: 'funkengeist',
    name: 'Funkengeist',
    emoji: '🔥',
    maxHp: 6,
    text: 'Verursacht an deinen nächsten 3 Zuganfängen je 4 Schaden an einem zufälligen Gegner.',
    startTurnDamage: 4,
    duration: 3,
  },
};

export const MAX_ALLIES = 2;
