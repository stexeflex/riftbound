import { MetaUpgradeDef } from '../models';

// ------------------------- Metafortschritt -------------------------

export const META_UPGRADES: MetaUpgradeDef[] = [
  {
    id: 'leben', name: 'Zähigkeit', icon: '❤️', maxLevel: 10, cost: 40,
    describeCurrent: l => l > 0 ? `Aktueller Bonus: +${l * 4} maximales Leben` : 'Aktuell noch kein Bonus',
    describeNext: l => `+4 maximales Leben. Neuer Gesamtbonus: +${(l + 1) * 4} maximales Leben.`,
  },
  {
    id: 'schildfluss', name: 'Schildfluss', icon: '💠', maxLevel: 8, cost: 50,
    describeCurrent: l => l > 0
      ? `Aktueller Bonus: Beginne jeden Zug mit ${l} zusätzlichem Schild`
      : 'Aktuell noch kein Bonus',
    describeNext: l => `+1 Schild zu Beginn jedes Zuges. Neuer Gesamtbonus: ${l + 1} Schild pro Zug.`,
  },
  {
    id: 'vorbereitung', name: 'Vorbereitung', icon: '🛡️', maxLevel: 4, cost: 60,
    describeCurrent: l => l > 0 ? `Aktueller Bonus: Beginne jeden Kampf mit ${l * 7} Schild` : 'Aktuell noch kein Bonus',
    describeNext: l => `+7 Schild zu Beginn jedes Kampfes. Neuer Gesamtbonus: ${(l + 1) * 7} Startschild.`,
  },
  {
    id: 'klingenmeisterschaft', name: 'Klingenmeisterschaft', icon: '🗡️', maxLevel: 5, cost: 60,
    describeCurrent: l => l > 0
      ? `Aktueller Bonus: Der erste Angriff jedes Kampfes verursacht +${l * 3} Schaden`
      : 'Aktuell noch kein Bonus',
    describeNext: l => `+3 Schaden auf den ersten Angriff jedes Kampfes. Neuer Gesamtbonus: +${(l + 1) * 3} Schaden.`,
  },
  {
    id: 'heilung', name: 'Rastkunde', icon: '🔥', maxLevel: 4, cost: 50,
    describeCurrent: l => l > 0 ? `Aktueller Bonus: Heilung an Rastplätzen +${l * 5} %` : 'Aktuell noch kein Bonus',
    describeNext: l => `+5 % Heilung an Rastplätzen. Neuer Gesamtbonus: +${(l + 1) * 5} %.`,
  },
  {
    id: 'energiekern', name: 'Energiekern', icon: '🔵', maxLevel: 2, cost: 8, currency: 'kerne',
    describeCurrent: l => l > 0 ? `Aktueller Bonus: +${l} maximale Energie pro Zug` : 'Aktuell noch kein Bonus',
    describeNext: l => `+1 maximale Energie pro Zug. Neuer Gesamtbonus: +${l + 1} Energie.`,
  },
  {
    id: 'vorausahnung', name: 'Vorausahnung', icon: '👁️', maxLevel: 2, cost: 100,
    describeCurrent: l => l > 0
      ? `Aktueller Bonus: Beginne jeden Kampf mit ${l} zusätzlichen ${l === 1 ? 'Karte' : 'Karten'} auf der Hand`
      : 'Aktuell noch kein Bonus',
    describeNext: l => `+1 Karte auf deiner ersten Hand. Neuer Gesamtbonus: ${l + 1} zusätzliche ${l + 1 === 1 ? 'Karte' : 'Karten'}.`,
  },
  {
    id: 'nachhall', name: 'Resonanz-Nachhall', icon: '✨', maxLevel: 4, cost: 70,
    describeCurrent: l => l > 0 ? `Aktueller Bonus: Schaden und Schild von Resonanzen +${l}` : 'Aktuell noch kein Bonus',
    describeNext: l => `+1 Resonanzschaden und -schild. Neuer Gesamtbonus: +${l + 1} auf beide Werte.`,
  },
];
