import { ArtifactDef } from '../models';

// ------------------------- Artefakte -------------------------

export const ARTIFACTS: ArtifactDef[] = [
  {
    id: 'schildkern', name: 'Schildkern', icon: '🔷', starter: true,
    text: 'Beginne jeden Zug mit 2 Schild.',
  },
  {
    id: 'glasherz', name: 'Glasherz', icon: '❤️‍🔥', costSplitter: 100,
    text: '20 % weniger maximales Leben, aber 20 % mehr verursachter Schaden.',
  },
  {
    id: 'dornenkrone', name: 'Dornenkrone', icon: '👑', costSplitter: 100,
    text: 'Bei direktem Schaden erhältst du 1 zusätzlichen Schaden, fügst dem Angreifer aber 4 Schaden zu.',
  },
  {
    id: 'sanduhr', name: 'Gebrochene Sanduhr', icon: '⏳', costSplitter: 150,
    text: 'Die erste Karte jedes Zuges mit Kosten von 3 oder mehr kostet 1 Energie weniger.',
  },
  {
    id: 'vampirfang', name: 'Vampirfang', icon: '🦇', costSplitter: 150,
    text: 'Die erste Angriffskarte jedes Zuges heilt dich um 2 Leben.',
  },
  {
    id: 'phasenanker', name: 'Phasenanker', icon: '⚓', costSplitter: 150,
    text: 'Erhalte in jedem dritten Zug +1 Energie.',
  },
  {
    id: 'seelenspiegel', name: 'Seelenspiegel', icon: '🪞', costSplitter: 200,
    text: 'Behalte zu Beginn deines Zuges die Hälfte deines übrigen Schilds.',
  },
  {
    id: 'resonanzstein', name: 'Resonanzstein', icon: '💠', costSplitter: 200,
    text: 'Resonanz kann zweimal pro Zug ausgelöst werden.',
  },
  {
    id: 'blutvertrag', name: 'Blutvertrag', icon: '📜', costKerne: 1,
    text: 'Opfere zu Beginn jedes Kampfes bis zu 6 Leben (mindestens 1 bleibt) und erhalte +2 Stärke.',
  },
  {
    id: 'funkenreif', name: 'Funkenreif', icon: '⚡', costSplitter: 180,
    text: 'Erhalte im ersten Zug jedes Kampfes 1 zusätzliche Energie.',
  },
  {
    id: 'weise-feder', name: 'Feder der Voraussicht', icon: '🪶', costSplitter: 200,
    text: 'Ziehe im ersten Zug jedes Kampfes 2 zusätzliche Karten.',
  },
  {
    id: 'runenpanzer', name: 'Runenpanzer', icon: '🛡️', costSplitter: 180,
    text: 'Beginne jeden Kampf mit 8 Schild.',
  },
  {
    id: 'jaegerauge', name: 'Jägerauge', icon: '🎯', costSplitter: 220,
    text: 'Der erste Angriff jedes Kampfes verursacht gegen ein Ziel mit vollen Leben doppelten Schaden.',
  },
  {
    id: 'risskelch', name: 'Risskelch', icon: '🏺', costKerne: 1,
    text: 'Heile nach jedem gewonnenen Kampf 8 Leben.',
  },
  {
    id: 'beutesack', name: 'Dimensionsbeutel', icon: '🎒', costSplitter: 240,
    text: 'Nach Kämpfen erscheint eine zusätzliche Karte in der Belohnungsauswahl.',
  },
];



