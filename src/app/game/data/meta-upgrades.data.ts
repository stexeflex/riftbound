import { MetaUpgradeDef } from '../models';

// ------------------------- Metafortschritt -------------------------

export const META_UPGRADES: MetaUpgradeDef[] = [
  {
    id: 'leben', name: 'Zähigkeit', icon: '❤️', maxLevel: 5, cost: 40,
    describeCurrent: l => l > 0 ? `Aktueller Bonus: +${l * 2} maximales Leben` : 'Noch kein Bonus',
    describeNext: l => `+2 maximales Leben (danach insgesamt +${(l + 1) * 2})`,
  },
  {
    id: 'erstschlag', name: 'Erstschlag', icon: '⚔️', maxLevel: 4, cost: 50,
    describeCurrent: l => l > 0
      ? `Aktueller Bonus: Der erste Angriff jedes Zuges verursacht +${l} Schaden`
      : 'Noch kein Bonus',
    describeNext: l => `+1 Schaden (danach insgesamt +${l + 1})`,
  },
  {
    id: 'klingenmeisterschaft', name: 'Klingenmeisterschaft', icon: '🗡️', maxLevel: 5, cost: 60,
    describeCurrent: l => l > 0
      ? `Aktueller Bonus: Der erste Angriff jedes Kampfes verursacht +${l * 4} Schaden`
      : 'Noch kein Bonus',
    describeNext: l => `+4 Schaden (danach insgesamt +${(l + 1) * 4})`,
  },
  {
    id: 'heilung', name: 'Rastkunde', icon: '🔥', maxLevel: 4, cost: 50,
    describeCurrent: l => l > 0 ? `Aktueller Bonus: Heilung an Rastplätzen +${l * 5} %` : 'Noch kein Bonus',
    describeNext: l => `+5 % Heilung (danach insgesamt +${(l + 1) * 5} %)`,
  },
  {
    id: 'energiekern', name: 'Energiekern', icon: '🔵', maxLevel: 2, cost: 2, currency: 'kerne',
    describeCurrent: l => l > 0 ? `Aktueller Bonus: +${l} maximale Energie pro Zug` : 'Noch kein Bonus',
    describeNext: l => `+1 maximale Energie (danach insgesamt +${l + 1})`,
  },
  {
    id: 'vorbereitung', name: 'Vorbereitung', icon: '🛡️', maxLevel: 4, cost: 60,
    describeCurrent: l => l > 0 ? `Aktueller Bonus: Beginne jeden Kampf mit ${l * 5} Schild` : 'Noch kein Bonus',
    describeNext: l => `+5 Schild (danach insgesamt ${(l + 1) * 5})`,
  },
  {
    id: 'vorausahnung', name: 'Vorausahnung', icon: '👁️', maxLevel: 2, cost: 100,
    describeCurrent: l => l > 0
      ? `Aktueller Bonus: Beginne jeden Kampf mit ${l} zusätzlichen ${l === 1 ? 'Karte' : 'Karten'} auf der Hand`
      : 'Noch kein Bonus',
    describeNext: l => `+1 Karte auf der Starthand (danach insgesamt ${l + 1})`,
  },
  {
    id: 'schildfluss', name: 'Schildfluss', icon: '💠', maxLevel: 8, cost: 70,
    describeCurrent: l => l > 0
      ? `Aktueller Bonus: Beginne jeden Zug mit ${l} zusätzlichem Schild`
      : 'Noch kein Bonus',
    describeNext: l => `+1 Schild pro Zug (danach insgesamt ${l + 1})`,
  },
  {
    id: 'nachhall', name: 'Resonanz-Nachhall', icon: '✨', maxLevel: 4, cost: 100,
    describeCurrent: l => l > 0 ? `Aktueller Bonus: Schaden und Schild von Resonanzen +${l}` : 'Noch kein Bonus',
    describeNext: l => `+1 Schaden und Schild (danach insgesamt +${l + 1})`,
  },
];
