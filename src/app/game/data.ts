import {
  ArtifactDef, CampaignStage, CardDef, DungeonArea, EnemyDef, MetaUpgradeDef, ResonanceDef,
} from './models';

// ------------------------- Karten -------------------------

export const CARDS: Record<string, CardDef> = {
  hiebschlag: {
    id: 'hiebschlag', name: 'Hiebschlag', cost: 1, type: 'Angriff', category: 'Kraft', price: 40,
    text: 'Füge 8 Schaden zu.', damage: 8,
  },
  schildstoss: {
    id: 'schildstoss', name: 'Schildstoß', cost: 1, type: 'Verteidigung', category: 'Schutz', price: 40,
    text: 'Erhalte 8 Schild.', block: 8,
  },
  konzentration: {
    id: 'konzentration', name: 'Konzentration', cost: 1, type: 'Technik', category: 'Kontrolle', price: 60,
    text: 'Ziehe 2 Karten.', draw: 2,
  },
  schattenklinge: {
    id: 'schattenklinge', name: 'Schattenklinge', cost: 1, type: 'Angriff', category: 'Chaos', price: 80,
    text: 'Füge 12 Schaden zu. Erhalte 1 Schwäche.', damage: 12, selfWeak: 1,
  },
  chaoswoge: {
    id: 'chaoswoge', name: 'Chaoswoge', cost: 2, type: 'Angriff', category: 'Chaos', price: 80,
    text: 'Füge 6 Schaden zu. Zufälliger Zusatzeffekt.', damage: 6, randomBonus: true,
  },
  defensiveHaltung: {
    id: 'defensiveHaltung', name: 'Defensive Haltung', cost: 2, type: 'Verteidigung', category: 'Schutz', price: 70,
    text: 'Erhalte 13 Schild.', block: 13,
  },
  klingenwirbel: {
    id: 'klingenwirbel', name: 'Klingenwirbel', cost: 2, type: 'Angriff', category: 'Kraft', price: 80,
    text: 'Füge 2-mal 7 Schaden zu.', damage: 7, hits: 2,
  },
  gezielterSchlag: {
    id: 'gezielterSchlag', name: 'Gezielter Schlag', cost: 1, type: 'Angriff', category: 'Kraft', price: 60,
    text: 'Füge 6 Schaden zu. Verursache 2 Verwundbarkeit.', damage: 6, vulnerableEnemy: 2,
  },
  zerreissen: {
    id: 'zerreissen', name: 'Zerreißen', cost: 1, type: 'Angriff', category: 'Kontrolle', price: 60,
    text: 'Füge 5 Schaden zu. Verursache 2 Schwäche.', damage: 5, weakEnemy: 2,
  },
  magischeBarriere: {
    id: 'magischeBarriere', name: 'Magische Barriere', cost: 1, type: 'Verteidigung', category: 'Schutz', price: 70,
    text: 'Erhalte 6 Schild. Ziehe 1 Karte.', block: 6, draw: 1,
  },
  praezision: {
    id: 'praezision', name: 'Präzision', cost: 1, type: 'Macht', category: 'Kraft', price: 90,
    text: 'Deine Angriffe verursachen diesen Kampf +2 Schaden.', strength: 2,
  },
  eiserneHaut: {
    id: 'eiserneHaut', name: 'Eiserne Haut', cost: 2, type: 'Macht', category: 'Schutz', price: 90,
    text: 'Erhalte am Ende jedes Zuges 3 Schild.', endTurnBlock: 3,
  },
  nachladen: {
    id: 'nachladen', name: 'Nachladen', cost: 0, type: 'Technik', category: 'Kontrolle', price: 50,
    text: 'Ziehe 1 Karte.', draw: 1,
  },
  instabilerSchlag: {
    id: 'instabilerSchlag', name: 'Instabiler Schlag', cost: 0, type: 'Angriff', category: 'Chaos', price: 40,
    text: 'Füge 4 Schaden zu.', damage: 4,
  },
  brecher: {
    id: 'brecher', name: 'Rüstungsbrecher', cost: 2, type: 'Angriff', category: 'Kraft', price: 100,
    text: 'Füge 15 Schaden zu. Verursache 1 Verwundbarkeit.', damage: 15, vulnerableEnemy: 1,
  },
  doppelklinge: {
    id: 'doppelklinge', name: 'Doppelklinge', cost: 1, type: 'Angriff', category: 'Kraft', price: 80,
    text: 'Füge 2-mal 4 Schaden zu.', damage: 4, hits: 2,
  },
  hinrichtung: {
    id: 'hinrichtung', name: 'Hinrichtung', cost: 3, type: 'Angriff', category: 'Kraft', price: 130,
    text: 'Füge 28 Schaden zu.', damage: 28,
  },
  blutrausch: {
    id: 'blutrausch', name: 'Blutrausch', cost: 1, type: 'Macht', category: 'Kraft', price: 120,
    text: 'Erhalte +3 Stärke. Erhalte 1 Schwäche.', strength: 3, selfWeak: 1,
  },
  bollwerk: {
    id: 'bollwerk', name: 'Bollwerk', cost: 2, type: 'Verteidigung', category: 'Schutz', price: 90,
    text: 'Erhalte 18 Schild.', block: 18,
  },
  wachsamkeit: {
    id: 'wachsamkeit', name: 'Wachsamkeit', cost: 1, type: 'Verteidigung', category: 'Schutz', price: 80,
    text: 'Erhalte 7 Schild. Ziehe 1 Karte.', block: 7, draw: 1,
  },
  festungsritual: {
    id: 'festungsritual', name: 'Festungsritual', cost: 3, type: 'Macht', category: 'Schutz', price: 140,
    text: 'Erhalte am Ende jedes Zuges 6 Schild.', endTurnBlock: 6,
  },
  schutzkreis: {
    id: 'schutzkreis', name: 'Schutzkreis', cost: 1, type: 'Verteidigung', category: 'Schutz', price: 100,
    text: 'Erhalte 5 Schild pro lebendem Gegner.', blockPerEnemy: 5,
  },
  einschuechtern: {
    id: 'einschuechtern', name: 'Einschüchtern', cost: 1, type: 'Technik', category: 'Kontrolle', price: 90,
    text: 'Verursache bei allen Gegnern 2 Schwäche.', weakEnemy: 2, target: 'all',
  },
  markieren: {
    id: 'markieren', name: 'Kettenmarkierung', cost: 1, type: 'Technik', category: 'Kontrolle', price: 110,
    text: 'Verursache bei allen Gegnern 1 Verwundbarkeit. Ziehe 1 Karte.', vulnerableEnemy: 1, draw: 1, target: 'all',
  },
  zeitfenster: {
    id: 'zeitfenster', name: 'Zeitfenster', cost: 1, type: 'Technik', category: 'Kontrolle', price: 120,
    text: 'Erhalte 1 Energie. Ziehe 2 Karten.', energy: 1, draw: 2,
  },
  umleitung: {
    id: 'umleitung', name: 'Umleitung', cost: 1, type: 'Verteidigung', category: 'Kontrolle', price: 90,
    text: 'Erhalte 8 Schild. Verursache 1 Schwäche.', block: 8, weakEnemy: 1,
  },
  risssalve: {
    id: 'risssalve', name: 'Risssalve', cost: 2, type: 'Angriff', category: 'Chaos', price: 110,
    text: 'Füge allen Gegnern 7 Schaden zu.', damage: 7, target: 'all',
  },
  funkenflug: {
    id: 'funkenflug', name: 'Funkenflug', cost: 1, type: 'Angriff', category: 'Chaos', price: 100,
    text: 'Füge allen Gegnern 3 Schaden zu. Ziehe 1 Karte.', damage: 3, draw: 1, target: 'all',
  },
  gluecksspiel: {
    id: 'gluecksspiel', name: 'Glücksspiel', cost: 0, type: 'Technik', category: 'Chaos', price: 80,
    text: 'Löse einen zufälligen Zusatzeffekt aus.', randomBonus: true,
  },
  ueberladung: {
    id: 'ueberladung', name: 'Überladung', cost: 2, type: 'Angriff', category: 'Chaos', price: 100,
    text: 'Füge 19 Schaden zu. Erhalte 2 Schwäche.', damage: 19, selfWeak: 2,
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
  'eiserneHaut', 'nachladen', 'instabilerSchlag', 'brecher', 'doppelklinge',
  'hinrichtung', 'blutrausch', 'bollwerk', 'wachsamkeit', 'festungsritual',
  'schutzkreis', 'einschuechtern', 'markieren', 'zeitfenster', 'umleitung',
  'risssalve', 'funkenflug', 'gluecksspiel', 'ueberladung',
];

export const STARTER_DECK: string[] = [
  'hiebschlag', 'hiebschlag', 'hiebschlag', 'hiebschlag',
  'schildstoss', 'schildstoss', 'schildstoss', 'schildstoss',
  'konzentration', 'konzentration',
];

// Startsammlung: diese Karten besitzt jeder Spieler von Anfang an
export const STARTER_COLLECTION: Record<string, number> = {
  hiebschlag: 4,
  schildstoss: 4,
  konzentration: 2,
};

// Maximale Kopien einer Karte in der Sammlung
export const MAX_CARD_COPIES = 4;

// Regeln fürs Startdeck
export const DECK_MIN = 10;
export const DECK_MAX = 10;

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
  sporenkobold: {
    id: 'sporenkobold', name: 'Sporenkobold', maxHp: 25, emoji: '🍄',
    moves: [
      { name: 'Sporenwurf', kind: 'attack_debuff', value: 4, weak: 1 },
      { name: 'Pilzschild', kind: 'block', value: 5 },
      { name: 'Wurzelhieb', kind: 'attack', value: 7 },
    ],
  },
  nebelhexe: {
    id: 'nebelhexe', name: 'Nebelhexe', maxHp: 38, emoji: '🧙‍♀️',
    moves: [
      { name: 'Nebelblitz', kind: 'attack', value: 8 },
      { name: 'Trugbild', kind: 'block', value: 8 },
      { name: 'Flüsterfluch', kind: 'attack_debuff', value: 5, weak: 2 },
    ],
  },
  dornenhueter: {
    id: 'dornenhueter', name: 'Dornenhüter', maxHp: 72, emoji: '🌿',
    passive: 'Elite: Seine Dornen werden mit jedem Stärkebuff gefährlicher.',
    moves: [
      { name: 'Rankenpeitsche', kind: 'attack', value: 6, hits: 2 },
      { name: 'Verwurzeln', kind: 'block', value: 13 },
      { name: 'Wildwuchs', kind: 'buff', value: 2 },
    ],
  },
  waldkoloss: {
    id: 'waldkoloss', name: 'Der faulende Waldkoloss', maxHp: 155, emoji: '🌳', boss: true,
    passive: 'Boss: Erhält nach jedem 3. Zug +2 Stärke.',
    moves: [
      { name: 'Stammhieb', kind: 'attack', value: 17 },
      { name: 'Rindenwall', kind: 'block', value: 16 },
      { name: 'Sporensturm', kind: 'attack_debuff', value: 7, weak: 2 },
      { name: 'Wurzelbeben', kind: 'attack', value: 6, hits: 3 },
    ],
  },
  kristallkaefer: {
    id: 'kristallkaefer', name: 'Kristallkäfer', maxHp: 28, emoji: '🪲',
    moves: [
      { name: 'Splitterbiss', kind: 'attack', value: 7 },
      { name: 'Kristallpanzer', kind: 'block', value: 7 },
      { name: 'Prismenstoß', kind: 'attack', value: 4, hits: 2 },
    ],
  },
  geodenpriester: {
    id: 'geodenpriester', name: 'Geodenpriester', maxHp: 42, emoji: '🔮',
    moves: [
      { name: 'Lichtstrahl', kind: 'attack', value: 9 },
      { name: 'Fokussieren', kind: 'buff', value: 2 },
      { name: 'Brechung', kind: 'block', value: 10 },
    ],
  },
  splittergolem: {
    id: 'splittergolem', name: 'Splittergolem', maxHp: 80, emoji: '💎',
    passive: 'Elite: Wechselt zwischen massiver Deckung und schweren Treffern.',
    moves: [
      { name: 'Geodenfaust', kind: 'attack', value: 15 },
      { name: 'Facettenwall', kind: 'block', value: 18 },
      { name: 'Splitterregen', kind: 'attack', value: 5, hits: 3 },
    ],
  },
  prismatyrann: {
    id: 'prismatyrann', name: 'Prismatyrann', maxHp: 178, emoji: '🔷', boss: true,
    passive: 'Boss: Erhält nach jedem 3. Zug +2 Stärke.',
    moves: [
      { name: 'Spektralschnitt', kind: 'attack', value: 8, hits: 2 },
      { name: 'Vollspektrum', kind: 'buff', value: 3 },
      { name: 'Diamantmantel', kind: 'block', value: 20 },
      { name: 'Lichtbruch', kind: 'attack_debuff', value: 11, weak: 2 },
    ],
  },
  sturmspaeher: {
    id: 'sturmspaeher', name: 'Sturmspäher', maxHp: 31, emoji: '🦅',
    moves: [
      { name: 'Sturzflug', kind: 'attack', value: 9 },
      { name: 'Aufwind', kind: 'block', value: 6 },
      { name: 'Krallenserie', kind: 'attack', value: 4, hits: 2 },
    ],
  },
  funkenkonstrukt: {
    id: 'funkenkonstrukt', name: 'Funkenkonstrukt', maxHp: 45, emoji: '⚙️',
    moves: [
      { name: 'Entladung', kind: 'attack', value: 10 },
      { name: 'Übertakten', kind: 'buff', value: 2 },
      { name: 'Magnetfeld', kind: 'block', value: 9 },
    ],
  },
  donnerwaechter: {
    id: 'donnerwaechter', name: 'Donnerwächter', maxHp: 86, emoji: '⚡',
    passive: 'Elite: Lädt sich für Mehrfachtreffer auf.',
    moves: [
      { name: 'Donnerspeer', kind: 'attack', value: 14 },
      { name: 'Sturmwall', kind: 'block', value: 16 },
      { name: 'Kettenblitz', kind: 'attack', value: 6, hits: 3 },
    ],
  },
  tempestarchon: {
    id: 'tempestarchon', name: 'Tempest, Sturmarchon', maxHp: 195, emoji: '🌩️', boss: true,
    passive: 'Boss: Erhält nach jedem 3. Zug +2 Stärke.',
    moves: [
      { name: 'Himmelslanze', kind: 'attack', value: 19 },
      { name: 'Wolkenzitadelle', kind: 'block', value: 21 },
      { name: 'Gewitterfront', kind: 'attack', value: 7, hits: 3 },
      { name: 'Druckabfall', kind: 'attack_debuff', value: 9, weak: 2 },
    ],
  },
  leerenauge: {
    id: 'leerenauge', name: 'Leerenauge', maxHp: 30, emoji: '👁️',
    moves: [
      { name: 'Blick ins Nichts', kind: 'attack_debuff', value: 5, weak: 1 },
      { name: 'Lidschlag', kind: 'block', value: 7 },
      { name: 'Nullstrahl', kind: 'attack', value: 9 },
    ],
  },
  rissassassine: {
    id: 'rissassassine', name: 'Rissassassine', maxHp: 47, emoji: '🥷',
    moves: [
      { name: 'Phasenklinge', kind: 'attack', value: 6, hits: 2 },
      { name: 'Verschwinden', kind: 'block', value: 10 },
      { name: 'Todesmarke', kind: 'buff', value: 3 },
    ],
  },
  nullherold: {
    id: 'nullherold', name: 'Nullherold', maxHp: 92, emoji: '🕳️',
    passive: 'Elite: Kombiniert Schwächeflüche mit schweren Angriffen.',
    moves: [
      { name: 'Auslöschung', kind: 'attack', value: 17 },
      { name: 'Nullfluch', kind: 'attack_debuff', value: 8, weak: 2 },
      { name: 'Ereignishorizont', kind: 'block', value: 18 },
    ],
  },
  nyxara: {
    id: 'nyxara', name: 'Nyxara, Königin der Leere', maxHp: 220, emoji: '🌌', boss: true,
    passive: 'Finalboss: Erhält nach jedem 3. Zug +2 Stärke.',
    moves: [
      { name: 'Sternenfall', kind: 'attack', value: 21 },
      { name: 'Schwarzer Spiegel', kind: 'block', value: 24 },
      { name: 'Gravitationswelle', kind: 'attack', value: 8, hits: 3 },
      { name: 'Stille des Alls', kind: 'attack_debuff', value: 12, weak: 2 },
    ],
  },
  duenenskarabaeus: {
    id: 'duenenskarabaeus', name: 'Dünenskarabäus', maxHp: 34, emoji: '🪲',
    moves: [
      { name: 'Sandbiss', kind: 'attack', value: 7 },
      { name: 'Chitinpanzer', kind: 'block', value: 8 },
      { name: 'Scherenschlag', kind: 'attack', value: 4, hits: 2 },
    ],
  },
  sandlaeufer: {
    id: 'sandlaeufer', name: 'Sandläufer', maxHp: 42, emoji: '🥷',
    moves: [
      { name: 'Sichelschnitt', kind: 'attack', value: 9 },
      { name: 'Fata Morgana', kind: 'block', value: 7 },
      { name: 'Blendstaub', kind: 'attack_debuff', value: 5, weak: 1 },
    ],
  },
  glutfalke: {
    id: 'glutfalke', name: 'Glutfalke', maxHp: 30, emoji: '🦅',
    moves: [
      { name: 'Sturzflug', kind: 'attack', value: 8 },
      { name: 'Thermik', kind: 'buff', value: 2 },
      { name: 'Krallenhagel', kind: 'attack', value: 3, hits: 3 },
    ],
  },
  obsidiandjinn: {
    id: 'obsidiandjinn', name: 'Obsidian-Dschinn', maxHp: 82, emoji: '🧞',
    passive: 'Elite: Wechselt zwischen Hitzedruck, Schutz und schweren Schlägen.',
    moves: [
      { name: 'Glutfaust', kind: 'attack', value: 14 },
      { name: 'Schwarzer Sand', kind: 'attack_debuff', value: 7, weak: 2 },
      { name: 'Obsidianhaut', kind: 'block', value: 16 },
    ],
  },
  sahrazar: {
    id: 'sahrazar', name: 'Sahrazar, der Dünenwurm', maxHp: 178, emoji: '🐉', boss: true,
    passive: 'Boss: Erhält nach jedem 3. Zug +2 Stärke.',
    moves: [
      { name: 'Verschlingen', kind: 'attack', value: 18 },
      { name: 'Untertauchen', kind: 'block', value: 17 },
      { name: 'Sandsturm', kind: 'attack_debuff', value: 8, weak: 2 },
      { name: 'Glutschuppen', kind: 'attack', value: 6, hits: 3 },
    ],
  },
  frostwolf: {
    id: 'frostwolf', name: 'Frostwolf', maxHp: 37, emoji: '🐺',
    moves: [
      { name: 'Eisbiss', kind: 'attack', value: 8 },
      { name: 'Rudelruf', kind: 'buff', value: 2 },
      { name: 'Doppelklaue', kind: 'attack', value: 4, hits: 2 },
    ],
  },
  schneekobold: {
    id: 'schneekobold', name: 'Schneekobold', maxHp: 28, emoji: '☃️',
    moves: [
      { name: 'Schneeblende', kind: 'attack_debuff', value: 4, weak: 1 },
      { name: 'Eisscholle', kind: 'block', value: 7 },
      { name: 'Eiszapfen', kind: 'attack', value: 7 },
    ],
  },
  eisrufer: {
    id: 'eisrufer', name: 'Eisrufer', maxHp: 44, emoji: '🧙‍♂️',
    moves: [
      { name: 'Froststrahl', kind: 'attack', value: 9 },
      { name: 'Permafrost', kind: 'block', value: 11 },
      { name: 'Nordwind', kind: 'attack_debuff', value: 6, weak: 1 },
    ],
  },
  aurorawaechter: {
    id: 'aurorawaechter', name: 'Aurorawächter', maxHp: 84, emoji: '🧊',
    passive: 'Elite: Baut starke Eiswälle auf und greift in Serien an.',
    moves: [
      { name: 'Polarhieb', kind: 'attack', value: 7, hits: 2 },
      { name: 'Aurorawall', kind: 'block', value: 18 },
      { name: 'Weißer Sturm', kind: 'attack_debuff', value: 8, weak: 2 },
    ],
  },
  frostkoenigin: {
    id: 'frostkoenigin', name: 'Ysra, Königin des Frosts', maxHp: 176, emoji: '👸', boss: true,
    passive: 'Boss: Erhält nach jedem 3. Zug +2 Stärke.',
    moves: [
      { name: 'Frostzepter', kind: 'attack', value: 17 },
      { name: 'Eisthron', kind: 'block', value: 20 },
      { name: 'Winteratem', kind: 'attack_debuff', value: 9, weak: 2 },
      { name: 'Hagelkrone', kind: 'attack', value: 6, hits: 3 },
    ],
  },
  prismamotte: {
    id: 'prismamotte', name: 'Prismamotte', maxHp: 30, emoji: '🦋',
    moves: [
      { name: 'Lichtstaub', kind: 'attack_debuff', value: 4, weak: 1 },
      { name: 'Flügelschimmer', kind: 'block', value: 7 },
      { name: 'Spektralflug', kind: 'attack', value: 4, hits: 2 },
    ],
  },
  tiefenorakel: {
    id: 'tiefenorakel', name: 'Tiefenorakel', maxHp: 43, emoji: '🔮',
    moves: [
      { name: 'Rubinstrahl', kind: 'attack', value: 10 },
      { name: 'Vorhersehung', kind: 'block', value: 10 },
      { name: 'Resonanz', kind: 'buff', value: 2 },
    ],
  },
  facettenchimaere: {
    id: 'facettenchimaere', name: 'Facettenchimäre', maxHp: 86, emoji: '🦁',
    passive: 'Elite: Bricht Angriffe in wechselnde Mehrfachtreffer.',
    moves: [
      { name: 'Prismenklaue', kind: 'attack', value: 7, hits: 2 },
      { name: 'Kristallfell', kind: 'block', value: 17 },
      { name: 'Farbsplitter', kind: 'attack', value: 5, hits: 3 },
    ],
  },
  wolkenrochen: {
    id: 'wolkenrochen', name: 'Wolkenrochen', maxHp: 35, emoji: '🪽',
    moves: [
      { name: 'Windstoß', kind: 'attack', value: 8 },
      { name: 'Wolkenhaut', kind: 'block', value: 7 },
      { name: 'Böenfolge', kind: 'attack', value: 4, hits: 2 },
    ],
  },
  himmelskorsar: {
    id: 'himmelskorsar', name: 'Himmelskorsar', maxHp: 44, emoji: '🏴‍☠️',
    moves: [
      { name: 'Hakenklinge', kind: 'attack', value: 10 },
      { name: 'Rückenwind', kind: 'buff', value: 2 },
      { name: 'Blendblitz', kind: 'attack_debuff', value: 5, weak: 1 },
    ],
  },
  blitzdrache: {
    id: 'blitzdrache', name: 'Blitzdrache', maxHp: 88, emoji: '🐲',
    passive: 'Elite: Lädt Kettenblitze auf und schützt sich im Sturm.',
    moves: [
      { name: 'Gewitterbiss', kind: 'attack', value: 14 },
      { name: 'Sturmhaut', kind: 'block', value: 16 },
      { name: 'Kettenblitz', kind: 'attack', value: 6, hits: 3 },
    ],
  },
  aeralis: {
    id: 'aeralis', name: 'Aeralis, Herrin der Stürme', maxHp: 180, emoji: '🌩️', boss: true,
    passive: 'Boss: Erhält nach jedem 3. Zug +2 Stärke.',
    moves: [
      { name: 'Himmelslanze', kind: 'attack', value: 18 },
      { name: 'Wolkenpalast', kind: 'block', value: 19 },
      { name: 'Drucksturz', kind: 'attack_debuff', value: 8, weak: 2 },
      { name: 'Gewitterkrone', kind: 'attack', value: 6, hits: 3 },
    ],
  },
  echogeist: {
    id: 'echogeist', name: 'Echogeist', maxHp: 32, emoji: '👻',
    moves: [
      { name: 'Nachhall', kind: 'attack', value: 4, hits: 2 },
      { name: 'Entgleiten', kind: 'block', value: 8 },
      { name: 'Stille', kind: 'attack_debuff', value: 5, weak: 1 },
    ],
  },
  sternenfresser: {
    id: 'sternenfresser', name: 'Sternenfresser', maxHp: 47, emoji: '🕷️',
    moves: [
      { name: 'Nullbiss', kind: 'attack', value: 11 },
      { name: 'Schwerkraftpanzer', kind: 'block', value: 11 },
      { name: 'Dunkle Häutung', kind: 'buff', value: 2 },
    ],
  },
  gravitationsritter: {
    id: 'gravitationsritter', name: 'Gravitationsritter', maxHp: 90, emoji: '🛡️',
    passive: 'Elite: Verbindet schwere Einzelhiebe mit lähmender Leerenmagie.',
    moves: [
      { name: 'Masseschlag', kind: 'attack', value: 16 },
      { name: 'Singularität', kind: 'block', value: 18 },
      { name: 'Zeitbruch', kind: 'attack_debuff', value: 8, weak: 2 },
    ],
  },
  veyla: {
    id: 'veyla', name: 'Veyla, Weberin des Nichts', maxHp: 182, emoji: '🌌', boss: true,
    passive: 'Boss: Erhält nach jedem 3. Zug +2 Stärke.',
    moves: [
      { name: 'Horizontschnitt', kind: 'attack', value: 18 },
      { name: 'Dunkle Linse', kind: 'block', value: 20 },
      { name: 'Raumfaltung', kind: 'attack_debuff', value: 9, weak: 2 },
      { name: 'Sternenecho', kind: 'attack', value: 6, hits: 3 },
    ],
  },
};

export const NORMAL_POOL = ['riftling', 'schattenwolf', 'leerenmagier', 'steingolem'];
export const ELITE_POOL = ['klingenwaechter', 'riftbestie'];

// ------------------------- Dungeon-Gebiete -------------------------

export const DUNGEON_AREAS: DungeonArea[] = [
  {
    id: 'gebiet1', name: 'Die Glutdünen', icon: '🏜️', theme: 'desert',
    background: 'images/dungeons/ember-dunes.png',
    desc: 'Hitzeflimmern, Sandstürme und versunkene Ruinen prägen diesen Wüsten-Run.',
    stations: ['kampf', 'kampf', 'rast', 'elite', 'kampf', 'kampf', 'rast', 'elite', 'kampf', 'boss'],
    normalEncounters: [
      ['duenenskarabaeus', 'duenenskarabaeus'], ['sandlaeufer'], ['glutfalke', 'duenenskarabaeus'],
      ['sandlaeufer', 'glutfalke'], ['duenenskarabaeus', 'duenenskarabaeus', 'glutfalke'],
    ],
    eliteEncounters: [['obsidiandjinn'], ['obsidiandjinn', 'duenenskarabaeus']],
    bossEncounter: ['sahrazar'], reward: 140, kern: true,
  },
  {
    id: 'gebiet2', name: 'Der frostgebundene Hain', icon: '❄️', theme: 'winter',
    background: 'images/dungeons/frostbound-grove.png',
    desc: 'Eiswälle, Schwächeeffekte und Rudel machen den Winter-Run kontrolliert und taktisch.',
    stations: ['kampf', 'kampf', 'rast', 'elite', 'kampf', 'kampf', 'elite', 'rast', 'kampf', 'boss'],
    normalEncounters: [
      ['schneekobold', 'schneekobold'], ['frostwolf'], ['eisrufer'],
      ['frostwolf', 'schneekobold'], ['eisrufer', 'schneekobold'], ['frostwolf', 'frostwolf'],
    ],
    eliteEncounters: [['aurorawaechter'], ['aurorawaechter', 'schneekobold']],
    bossEncounter: ['frostkoenigin'], reward: 140, kern: true,
  },
  {
    id: 'gebiet3', name: 'Die prismatischen Tiefen', icon: '💎', theme: 'crystal',
    background: 'images/dungeons/prism-depths.png',
    desc: 'Kristallwesen brechen Licht, Raum und unvorsichtige Angriffe.',
    stations: ['kampf', 'elite', 'kampf', 'rast', 'kampf', 'kampf', 'elite', 'rast', 'kampf', 'boss'],
    normalEncounters: [
      ['kristallkaefer', 'prismamotte'], ['geodenpriester'], ['tiefenorakel'],
      ['kristallkaefer', 'geodenpriester'], ['prismamotte', 'prismamotte', 'kristallkaefer'],
    ],
    eliteEncounters: [['splittergolem'], ['facettenchimaere'], ['facettenchimaere', 'prismamotte']],
    bossEncounter: ['prismatyrann'], reward: 145, kern: true,
  },
  {
    id: 'gebiet4', name: 'Die Sturmzitadelle', icon: '🌩️', theme: 'sky',
    background: 'images/dungeons/storm-citadel.png',
    desc: 'Über den Wolken bewachen geladene Konstrukte den Weg zum Sturmarchon.',
    stations: ['kampf', 'kampf', 'elite', 'rast', 'kampf', 'kampf', 'rast', 'elite', 'kampf', 'boss'],
    normalEncounters: [
      ['sturmspaeher', 'wolkenrochen'], ['funkenkonstrukt'], ['himmelskorsar'],
      ['wolkenrochen', 'wolkenrochen'], ['sturmspaeher', 'himmelskorsar'],
    ],
    eliteEncounters: [['donnerwaechter'], ['blitzdrache'], ['blitzdrache', 'wolkenrochen']],
    bossEncounter: ['aeralis'], reward: 145, kern: true,
  },
  {
    id: 'gebiet5', name: 'Der Nullhorizont', icon: '🌌', theme: 'void',
    background: 'images/dungeons/null-horizon.png',
    desc: 'Jenseits des Risses wartet Nyxara mit ihren Herolden auf den letzten Run.',
    stations: ['kampf', 'elite', 'kampf', 'rast', 'kampf', 'kampf', 'rast', 'elite', 'kampf', 'boss'],
    normalEncounters: [
      ['leerenauge', 'echogeist'], ['rissassassine'], ['sternenfresser'],
      ['echogeist', 'echogeist', 'leerenauge'], ['sternenfresser', 'rissassassine'],
    ],
    eliteEncounters: [['nullherold'], ['gravitationsritter'], ['gravitationsritter', 'echogeist']],
    bossEncounter: ['veyla'], reward: 150, kern: true,
  },
];

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
    text: 'Nach 3 verschiedenen Kategorien: Erhalte 1 Energie.', effect: 'energy',
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

// ------------------------- Kampagne -------------------------

export const CAMPAIGN_STAGES: CampaignStage[] = [
  {
    id: 'stage1', name: 'Randzone des Risses',
    desc: 'Die ersten Ausläufer der Instabilität. Ein guter Ort zum Lernen.',
    stations: ['kampf', 'kampf', 'rast', 'elite'], areaId: 'gebiet1', reward: 60,
  },
  {
    id: 'stage2', name: 'Zerbrochener Wald',
    desc: 'Zwischen gespaltenen Bäumen lauern Schattenwölfe.',
    stations: ['kampf', 'kampf', 'elite', 'rast', 'kampf'], areaId: 'gebiet2', reward: 80,
  },
  {
    id: 'stage3', name: 'Kristallhöhlen',
    desc: 'Das Licht bricht sich tausendfach – und mit ihm die Realität.',
    stations: ['kampf', 'elite', 'rast', 'kampf', 'elite'], areaId: 'gebiet3', reward: 100,
  },
  {
    id: 'stage4', name: 'Sturmfestung',
    desc: 'Eine Festung im Auge des Riss-Sturms, gehalten von Wächtern.',
    stations: ['kampf', 'kampf', 'elite', 'rast', 'kampf', 'elite'], areaId: 'gebiet4', reward: 120,
  },
  {
    id: 'stage5', name: 'Herz des Risses',
    desc: 'Hier wartet Vorax, der Verschlinger. Das Ende der Reise – vorerst.',
    stations: ['kampf', 'elite', 'rast', 'kampf', 'boss'], areaId: 'gebiet5',
    bossEncounter: ['vorax'], reward: 150, kern: true,
  },
  {
    id: 'stage6', name: 'Echos der Ebene',
    desc: 'Vorax ist gefallen, doch sein Echo ruft ein ganzes Rudel aus dem Riss.',
    stations: ['kampf', 'kampf', 'elite', 'rast', 'kampf', 'elite'], areaId: 'gebiet1', reward: 170,
  },
  {
    id: 'stage7', name: 'Sporenlabyrinth',
    desc: 'Der Nebelwald wächst in sich selbst hinein und verbirgt den faulenden Koloss.',
    stations: ['kampf', 'elite', 'kampf', 'rast', 'kampf', 'boss'], areaId: 'gebiet2', reward: 190,
  },
  {
    id: 'stage8', name: 'Prismatisches Gefängnis',
    desc: 'Im tiefsten Kristall sitzt der Prismatyrann und bricht jeden Fluchtweg.',
    stations: ['kampf', 'kampf', 'elite', 'rast', 'kampf', 'boss'], areaId: 'gebiet3', reward: 220,
  },
  {
    id: 'stage9', name: 'Auge des Orkans',
    desc: 'Die Sturmzitadelle öffnet ihr Tor nur für jene, die dem Donner standhalten.',
    stations: ['kampf', 'elite', 'kampf', 'rast', 'kampf', 'elite', 'boss'], areaId: 'gebiet4', reward: 250,
  },
  {
    id: 'stage10', name: 'Thron der Leere',
    desc: 'Nyxara versammelt ihre Herolde. Hinter ihr endet selbst das Licht.',
    stations: ['kampf', 'elite', 'kampf', 'rast', 'kampf', 'elite', 'boss'], areaId: 'gebiet5',
    bossEncounter: ['nyxara', 'leerenauge', 'leerenauge'], reward: 320, kern: true,
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
  {
    id: 'energiekern', name: 'Energiekern', icon: '🔵', maxLevel: 2, cost: 180,
    describe: l => `+${l} maximale Energie pro Zug (nächste Stufe: +${l + 1})`,
  },
  {
    id: 'vorbereitung', name: 'Vorbereitung', icon: '🛡️', maxLevel: 4, cost: 70,
    describe: l => `Beginne jeden Kampf mit ${l * 3} Schild (nächste Stufe: ${(l + 1) * 3})`,
  },
  {
    id: 'vorausahnung', name: 'Vorausahnung', icon: '👁️', maxLevel: 2, cost: 120,
    describe: l => `Ziehe im ersten Zug ${l} zusätzliche Karten (nächste Stufe: ${l + 1})`,
  },
  {
    id: 'pluenderer', name: 'Rissplünderer', icon: '💰', maxLevel: 5, cost: 80,
    describe: l => `+${l * 10} % Splitter aus Kämpfen (nächste Stufe: ${(l + 1) * 10} %)`,
  },
  {
    id: 'nachhall', name: 'Resonanz-Nachhall', icon: '✨', maxLevel: 4, cost: 100,
    describe: l => `Schaden und Schild von Resonanzen +${l} (nächste Stufe: +${l + 1})`,
  },
];
