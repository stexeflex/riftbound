import { ArtifactDef, CardDef, EnemyDef, MetaUpgradeDef } from './models';

// ------------------------- Karten -------------------------

export const CARDS: Record<string, CardDef> = {
  hiebschlag: {
    id: 'hiebschlag', name: 'Hiebschlag', cost: 1, type: 'Angriff', category: 'Kraft',
    text: 'Füge 8 Schaden zu.', damage: 8,
  },
  schildstoss: {
    id: 'schildstoss', name: 'Schildstoß', cost: 1, type: 'Verteidigung', category: 'Schutz',
    text: 'Erhalte 8 Schild.', block: 8,
  },
  konzentration: {
    id: 'konzentration', name: 'Konzentration', cost: 1, type: 'Technik', category: 'Kontrolle',
    text: 'Ziehe 2 Karten.', draw: 2,
  },
  schattenklinge: {
    id: 'schattenklinge', name: 'Schattenklinge', cost: 1, type: 'Angriff', category: 'Chaos',
    text: 'Füge 12 Schaden zu. Erhalte 1 Schwäche.', damage: 12, selfWeak: 1,
  },
  chaoswoge: {
    id: 'chaoswoge', name: 'Chaoswoge', cost: 2, type: 'Angriff', category: 'Chaos',
    text: 'Füge 6 Schaden zu. Zufälliger Zusatzeffekt.', damage: 6, randomBonus: true,
  },
  defensiveHaltung: {
    id: 'defensiveHaltung', name: 'Defensive Haltung', cost: 2, type: 'Verteidigung', category: 'Schutz',
    text: 'Erhalte 13 Schild.', block: 13,
  },
  klingenwirbel: {
    id: 'klingenwirbel', name: 'Klingenwirbel', cost: 2, type: 'Angriff', category: 'Kraft',
    text: 'Füge 2-mal 7 Schaden zu.', damage: 7, hits: 2,
  },
  gezielterSchlag: {
    id: 'gezielterSchlag', name: 'Gezielter Schlag', cost: 1, type: 'Angriff', category: 'Kontrolle',
    text: 'Füge 6 Schaden zu. Verursache 2 Verwundbarkeit.', damage: 6, vulnerableEnemy: 2,
  },
  zerreissen: {
    id: 'zerreissen', name: 'Zerreißen', cost: 1, type: 'Angriff', category: 'Kraft',
    text: 'Füge 5 Schaden zu. Verursache 2 Schwäche.', damage: 5, weakEnemy: 2,
  },
  magischeBarriere: {
    id: 'magischeBarriere', name: 'Magische Barriere', cost: 1, type: 'Verteidigung', category: 'Kontrolle',
    text: 'Erhalte 6 Schild. Ziehe 1 Karte.', block: 6, draw: 1,
  },
  praezision: {
    id: 'praezision', name: 'Präzision', cost: 1, type: 'Macht', category: 'Kontrolle',
    text: 'Deine Angriffe verursachen diesen Kampf +2 Schaden.', strength: 2,
  },
  eiserneHaut: {
    id: 'eiserneHaut', name: 'Eiserne Haut', cost: 2, type: 'Macht', category: 'Schutz',
    text: 'Erhalte am Ende jedes Zuges 3 Schild.', endTurnBlock: 3,
  },
  nachladen: {
    id: 'nachladen', name: 'Nachladen', cost: 0, type: 'Technik', category: 'Chaos',
    text: 'Ziehe 1 Karte.', draw: 1,
  },
  instabilerSchlag: {
    id: 'instabilerSchlag', name: 'Instabiler Schlag', cost: 0, type: 'Angriff', category: 'Chaos',
    text: 'Füge 4 Schaden zu.', damage: 4,
  },
  schwaeche: {
    id: 'schwaeche', name: 'Schwäche', cost: 0, type: 'Fluch', category: 'Chaos',
    text: 'Nicht spielbar. Blockiert einen Platz in deiner Hand.', unplayable: true,
  },
};

// Karten, die als Belohnung erscheinen können
export const REWARD_POOL: string[] = [
  'schattenklinge', 'chaoswoge', 'defensiveHaltung', 'klingenwirbel',
  'gezielterSchlag', 'zerreissen', 'magischeBarriere', 'praezision',
  'eiserneHaut', 'nachladen', 'instabilerSchlag',
];

export const STARTER_DECK: string[] = [
  'hiebschlag', 'hiebschlag', 'hiebschlag', 'hiebschlag',
  'schildstoss', 'schildstoss', 'schildstoss', 'schildstoss',
  'konzentration', 'konzentration',
];

// ------------------------- Gegner -------------------------

export const ENEMIES: Record<string, EnemyDef> = {
  riftling: {
    id: 'riftling', name: 'Riftling', maxHp: 32, emoji: '👾',
    moves: [
      { name: 'Kratzen', kind: 'attack', value: 7 },
      { name: 'Zischen', kind: 'block', value: 6 },
      { name: 'Beißen', kind: 'attack', value: 9 },
    ],
  },
  schattenwolf: {
    id: 'schattenwolf', name: 'Schattenwolf', maxHp: 40, emoji: '🐺',
    moves: [
      { name: 'Anspringen', kind: 'attack', value: 10 },
      { name: 'Knurren', kind: 'buff', value: 2 },
      { name: 'Doppelbiss', kind: 'attack', value: 5, hits: 2 },
    ],
  },
  leerenmagier: {
    id: 'leerenmagier', name: 'Leerenmagier', maxHp: 36, emoji: '🧙',
    moves: [
      { name: 'Leerenblitz', kind: 'attack', value: 8 },
      { name: 'Schwächefluch', kind: 'attack_debuff', value: 5, weak: 2 },
      { name: 'Barriere', kind: 'block', value: 9 },
    ],
  },
  steingolem: {
    id: 'steingolem', name: 'Steingolem', maxHp: 52, emoji: '🗿',
    moves: [
      { name: 'Steinfaust', kind: 'attack', value: 11 },
      { name: 'Verhärten', kind: 'block', value: 12 },
      { name: 'Erdbeben', kind: 'attack', value: 14 },
    ],
  },
  klingenwaechter: {
    id: 'klingenwaechter', name: 'Klingenwächter', maxHp: 70, emoji: '⚔️',
    passive: 'Elite: Wird jede Runde stärker.',
    moves: [
      { name: 'Klingensturm', kind: 'attack', value: 6, hits: 2 },
      { name: 'Schärfen', kind: 'buff', value: 3 },
      { name: 'Hinrichtung', kind: 'attack', value: 16 },
    ],
  },
  riftbestie: {
    id: 'riftbestie', name: 'Riftbestie', maxHp: 80, emoji: '🐲',
    passive: 'Elite: Trifft hart und schützt sich.',
    moves: [
      { name: 'Klauenhieb', kind: 'attack', value: 13 },
      { name: 'Panzern', kind: 'block', value: 14 },
      { name: 'Wüten', kind: 'attack', value: 9, hits: 2 },
    ],
  },
  vorax: {
    id: 'vorax', name: 'Vorax, der Verschlinger', maxHp: 160, emoji: '👹', boss: true,
    passive: 'Passiv: Vorax erhält nach jedem 3. Zug +2 Stärke.',
    moves: [
      { name: 'Verschlingung', kind: 'attack', value: 18 },
      { name: 'Ruf der Leere', kind: 'block', value: 15 },
      { name: 'Zerfetzen', kind: 'attack', value: 6, hits: 2 },
      { name: 'Leerenschrei', kind: 'attack_debuff', value: 8, weak: 2 },
    ],
  },
};

export const NORMAL_POOL = ['riftling', 'schattenwolf', 'leerenmagier', 'steingolem'];
export const ELITE_POOL = ['klingenwaechter', 'riftbestie'];

// ------------------------- Artefakte -------------------------

export const ARTIFACTS: ArtifactDef[] = [
  {
    id: 'glasherz', name: 'Glasherz', icon: '❤️‍🔥',
    text: '20 % weniger maximales Leben, aber 20 % mehr verursachter Schaden.',
  },
  {
    id: 'schildkern', name: 'Schildkern', icon: '🔷',
    text: 'Beginne jeden Zug mit 2 Schild.',
  },
  {
    id: 'dornenkrone', name: 'Dornenkrone', icon: '👑',
    text: 'Bei direktem Schaden erhältst du 1 zusätzlichen Schaden, fügst dem Angreifer aber 4 Schaden zu.',
  },
];

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
];
