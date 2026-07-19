import { ResonanceDef } from '../models';

// ------------------------- Resonanzen -------------------------

export const RESONANCES: ResonanceDef[] = [
  {
    id: 'arkane-einsicht', name: 'Arkane Einsicht', icon: '🔮', costSplitter: 80,
    text: 'Nach 3 verschiedenen Kategorien: Ziehe 1 Karte.', effect: 'draw',
  },
  {
    id: 'aegis-klang', name: 'Aegis-Klang', icon: '🛡️', costSplitter: 100,
    text: 'Nach 3 verschiedenen Kategorien: Erhalte 7 Schild.', effect: 'block',
  },
  {
    id: 'rissblitz', name: 'Rissblitz', icon: '⚡', costSplitter: 120,
    text: 'Nach 3 verschiedenen Kategorien: Füge allen Gegnern 6 Schaden zu.', effect: 'damage',
  },
  {
    id: 'gleichgewicht', name: 'Gleichgewicht', icon: '⚖️', costSplitter: 140,
    text: 'Nach 3 verschiedenen Kategorien: Füge allen Gegnern 3 Schaden zu und erhalte 3 Schild.',
    effect: 'balance',
  },
  {
    id: 'zeitbruch', name: 'Zeitbruch', icon: '⏱️', costSplitter: 160,
    text: 'Nach 3 verschiedenen Kategorien: Erhalte 1 Energie, doch die nächste gespielte Karte beendet deinen Zug sofort.', effect: 'energy',
  },
  {
    id: 'aegis-echo', name: 'Aegis-Echo', icon: '🫧', costSplitter: 170,
    text: 'Nach 3 verschiedenen Kategorien: Erhalte 3 Schild. Bei 2 oder mehr Gegnern ziehst du zusätzlich 1 Karte.', effect: 'echo',
  },
  {
    id: 'sturmchor', name: 'Sturmchor', icon: '🌩️', costSplitter: 190,
    text: 'Nach 3 verschiedenen Kategorien: Verursache 3-mal 3 Schaden an zufälligen Gegnern.', effect: 'storm',
  },
  {
    id: 'lebenspuls', name: 'Lebenspuls', icon: '💚', costSplitter: 220,
    text: 'Nach 3 verschiedenen Kategorien: Heile 2 Leben.', effect: 'heal',
  },
];



