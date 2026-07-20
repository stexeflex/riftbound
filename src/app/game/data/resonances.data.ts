import { ResonanceDef } from '../models';

// ------------------------- Resonanzen -------------------------

export const RESONANCES: ResonanceDef[] = [
  {
    id: 'arkane-einsicht', name: 'Arkane Einsicht', icon: '🔮', costSplitter: 80,
    text: 'Resonanz: Ziehe 1 Karte.', effect: 'draw', draw: 1,
  },
  {
    id: 'aegis-klang', name: 'Aegis-Klang', icon: '🛡️', costSplitter: 100,
    text: 'Resonanz: Erhalte 7 Schild.', effect: 'block', block: 7,
  },
  {
    id: 'rissblitz', name: 'Rissblitz', icon: '⚡', costSplitter: 120,
    text: 'Resonanz: Füge allen Gegnern 6 Schaden zu.', effect: 'damage', damage: 6,
  },
  {
    id: 'gleichgewicht', name: 'Gleichgewicht', icon: '⚖️', costSplitter: 140,
    text: 'Resonanz: Füge allen Gegnern 3 Schaden zu und erhalte 3 Schild.',
    effect: 'balance', damage: 3, block: 3,
  },
  {
    id: 'zeitbruch', name: 'Zeitbruch', icon: '⏱️', costSplitter: 160,
    text: 'Resonanz: Erhalte 1 Energie, doch die nächste gespielte Karte beendet deinen Zug sofort.', effect: 'energy', energy: 1,
  },
  {
    id: 'aegis-echo', name: 'Aegis-Echo', icon: '🫧', costSplitter: 170,
    text: 'Resonanz: Erhalte 3 Schild. Bei 2 oder mehr Gegnern ziehst du zusätzlich 1 Karte.', effect: 'echo', block: 3, draw: 1,
  },
  {
    id: 'sturmchor', name: 'Sturmchor', icon: '🌩️', costSplitter: 190,
    text: 'Resonanz: Verursache 3-mal 3 Schaden an zufälligen Gegnern.', effect: 'storm', damage: 3, hits: 3,
  },
  {
    id: 'lebenspuls', name: 'Lebenspuls', icon: '💚', costSplitter: 220,
    text: 'Resonanz: Heile 2 Leben.', effect: 'heal', heal: 2,
  },
];



