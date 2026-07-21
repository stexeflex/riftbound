import { EnemyDef } from '../models';

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
      { name: 'Erdbeben', kind: 'attack', value: 14, target: 'all' },
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
      { name: 'Leerenschrei', kind: 'attack_debuff', value: 8, weak: 2, target: 'all' },
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
      { name: 'Wurzelbeben', kind: 'attack', value: 6, hits: 3, target: 'all' },
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
      { name: 'Lichtbruch', kind: 'attack_debuff', value: 11, weak: 2, target: 'all' },
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
      { name: 'Kettenblitz', kind: 'attack', value: 6, hits: 3, target: 'all' },
    ],
  },
  tempestarchon: {
    id: 'tempestarchon', name: 'Tempest, Sturmarchon', maxHp: 195, emoji: '🌩️', boss: true,
    passive: 'Boss: Erhält nach jedem 3. Zug +2 Stärke.',
    moves: [
      { name: 'Himmelslanze', kind: 'attack', value: 19 },
      { name: 'Wolkenzitadelle', kind: 'block', value: 21 },
      { name: 'Gewitterfront', kind: 'attack', value: 7, hits: 3, target: 'all' },
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
      { name: 'Gravitationswelle', kind: 'attack', value: 8, hits: 3, target: 'all' },
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
      { name: 'Sandsturm', kind: 'attack_debuff', value: 8, weak: 2, target: 'all' },
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
      { name: 'Weißer Sturm', kind: 'attack_debuff', value: 8, weak: 2, target: 'all' },
    ],
  },
  frostkoenigin: {
    id: 'frostkoenigin', name: 'Ysra, Königin des Frosts', maxHp: 176, emoji: '👸', boss: true,
    passive: 'Boss: Erhält nach jedem 3. Zug +2 Stärke.',
    moves: [
      { name: 'Frostzepter', kind: 'attack', value: 17 },
      { name: 'Eisthron', kind: 'block', value: 20 },
      { name: 'Winteratem', kind: 'attack_debuff', value: 9, weak: 2 },
      { name: 'Hagelkrone', kind: 'attack', value: 6, hits: 3, target: 'all' },
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
      { name: 'Farbsplitter', kind: 'attack', value: 5, hits: 3, target: 'all' },
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
      { name: 'Kettenblitz', kind: 'attack', value: 6, hits: 3, target: 'all' },
    ],
  },
  aeralis: {
    id: 'aeralis', name: 'Aeralis, Herrin der Stürme', maxHp: 180, emoji: '🌩️', boss: true,
    passive: 'Boss: Erhält nach jedem 3. Zug +2 Stärke.',
    moves: [
      { name: 'Himmelslanze', kind: 'attack', value: 18 },
      { name: 'Wolkenpalast', kind: 'block', value: 19 },
      { name: 'Drucksturz', kind: 'attack_debuff', value: 8, weak: 2 },
      { name: 'Gewitterkrone', kind: 'attack', value: 6, hits: 3, target: 'all' },
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
      { name: 'Zeitbruch', kind: 'attack_debuff', value: 8, weak: 2, target: 'all' },
    ],
  },
  veyla: {
    id: 'veyla', name: 'Veyla, Weberin des Nichts', maxHp: 182, emoji: '🌌', boss: true,
    passive: 'Boss: Erhält nach jedem 3. Zug +2 Stärke.',
    moves: [
      { name: 'Horizontschnitt', kind: 'attack', value: 18 },
      { name: 'Dunkle Linse', kind: 'block', value: 20 },
      { name: 'Raumfaltung', kind: 'attack_debuff', value: 9, weak: 2 },
      { name: 'Sternenecho', kind: 'attack', value: 6, hits: 3, target: 'all' },
    ],
  },
};

export const NORMAL_POOL = ['riftling', 'schattenwolf', 'leerenmagier', 'steingolem'];
export const ELITE_POOL = ['klingenwaechter', 'riftbestie'];



