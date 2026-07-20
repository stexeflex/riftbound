import { MetaUpgradeDef } from '../models';

// ------------------------- Metafortschritt -------------------------

export const META_UPGRADES: MetaUpgradeDef[] = [
  {
    id: 'leben', name: 'Zähigkeit', icon: '❤️', maxLevel: 5, cost: 40,
    describe: l => `+${l * 2} maximales Leben (nächste Stufe: +${(l + 1) * 2})`,
  },
  {
    id: 'klingenmeisterschaft', name: 'Klingenmeisterschaft', icon: '🗡️', maxLevel: 5, cost: 60,
    describe: l => `Der erste Angriff jedes Kampfes verursacht +${l * 2} Schaden (nächste Stufe: +${(l + 1) * 2})`,
  },
  {
    id: 'heilung', name: 'Rastkunde', icon: '🔥', maxLevel: 4, cost: 50,
    describe: l => `Heilung an Rastplätzen um ${l * 5} % erhöht (nächste Stufe: ${(l + 1) * 5} %)`,
  },
  {
    id: 'energiekern', name: 'Energiekern', icon: '🔵', maxLevel: 2, cost: 2, currency: 'kerne',
    describe: l => `+${l} maximale Energie pro Zug (nächste Stufe: +${l + 1})`,
  },
  {
    id: 'vorbereitung', name: 'Vorbereitung', icon: '🛡️', maxLevel: 4, cost: 60,
    describe: l => `Beginne jeden Kampf mit ${l * 5} Schild (nächste Stufe: ${(l + 1) * 5})`,
  },
  {
    id: 'vorausahnung', name: 'Vorausahnung', icon: '👁️', maxLevel: 2, cost: 100,
    describe: l => `Beginne jeden Kampf mit ${l} zusätzlichen Karten auf der Hand (nächste Stufe: ${l + 1})`,
  },
  {
    id: 'schildfluss', name: 'Schildfluss', icon: '💠', maxLevel: 8, cost: 70,
    describe: l => `Beginne jeden Zug mit ${l} zusätzlichem Schild (nächste Stufe: ${l + 1})`,
  },
  {
    id: 'nachhall', name: 'Resonanz-Nachhall', icon: '✨', maxLevel: 4, cost: 100,
    describe: l => `Schaden und Schild von Resonanzen +${l} (nächste Stufe: +${l + 1})`,
  },
];



