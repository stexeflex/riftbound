// Grundlegende Typen für Riftbound

export type CardType = 'Angriff' | 'Verteidigung' | 'Technik' | 'Macht' | 'Fluch';
export type Category = 'Kraft' | 'Schutz' | 'Kontrolle' | 'Chaos';
export type CardTarget = 'single' | 'all';
export type CardSort =
  | 'name-asc'
  | 'name-desc'
  | 'energy-asc'
  | 'energy-desc'
  | 'price-asc'
  | 'price-desc'
  | 'type'
  | 'category';

export interface CardDef {
  id: string;
  name: string;
  cost: number;
  type: CardType;
  category: Category;
  text: string;
  price?: number;          // Kaufpreis in Splittern (ohne Preis: nicht kaufbar)
  damage?: number;
  hits?: number;
  block?: number;
  draw?: number;
  energy?: number;
  heal?: number;
  blockPerEnemy?: number;
  target?: CardTarget;
  weakEnemy?: number;      // Schwäche auf Gegner (reduziert dessen Schaden)
  vulnerableEnemy?: number; // Verwundbarkeit auf Gegner (+50% erlittener Schaden)
  selfWeak?: number;       // Spieler erhält Schwäche
  strength?: number;       // dauerhafter Schadensbonus für diesen Kampf
  startTurnBlock?: number; // Schild am Anfang des nächsten Zuges (Macht)
  randomBonus?: boolean;   // Chaoswoge: zufälliger Zusatzeffekt
  unplayable?: boolean;
}

export interface CardInstance {
  uid: number;
  def: CardDef;
}

export interface EnemyMove {
  name: string;
  kind: 'attack' | 'block' | 'buff' | 'attack_debuff';
  value: number;
  hits?: number;
  weak?: number;
}

export interface EnemyDef {
  id: string;
  name: string;
  maxHp: number;
  emoji: string;
  moves: EnemyMove[];
  passive?: string;
  boss?: boolean;
}

export interface EnemyState {
  uid: number;
  def: EnemyDef;
  hp: number;
  maxHp: number;
  block: number;
  strength: number;
  weak: number;
  vulnerable: number;
  moveIndex: number;
  intent: EnemyMove;
}

export type StationKind = 'kampf' | 'elite' | 'rast' | 'boss';

export interface Station {
  kind: StationKind;
  done: boolean;
}

export interface ArtifactDef {
  id: string;
  name: string;
  icon: string;
  text: string;
  costSplitter?: number; // Kaufpreis im Metafortschritt
  costKerne?: number;
  starter?: boolean;     // von Anfang an freigeschaltet
}

export interface ResonanceDef {
  id: string;
  name: string;
  icon: string;
  text: string;
  costSplitter: number;
  effect: 'draw' | 'block' | 'damage' | 'balance' | 'energy' | 'echo' | 'storm' | 'heal';
  damage?: number;
  block?: number;
  hits?: number;
  draw?: number;
  energy?: number;
  heal?: number;
}

export type Screen =
  | 'title'
  | 'dungeons'
  | 'artifacts'
  | 'resonances'
  | 'deck'
  | 'campaign'
  | 'map'
  | 'combat'
  | 'reward'
  | 'rest'
  | 'victory'
  | 'defeat'
  | 'meta'
  | 'converter'
  | 'cards';

export type GameMode = 'dungeon' | 'campaign';
export type DungeonTheme = 'desert' | 'winter' | 'crystal' | 'sky' | 'void';

export interface DungeonArea {
  id: string;
  name: string;
  desc: string;
  icon: string;
  theme: DungeonTheme;
  background: string;
  stations: StationKind[];
  normalEncounters: string[][];
  eliteEncounters: string[][];
  bossEncounter: string[];
  reward: number;
  kern?: boolean;
}

export interface CampaignStage {
  id: string;
  name: string;
  desc: string;
  stations: StationKind[];
  areaId: string;
  bossEncounter?: string[];
  reward: number;   // Splitter-Bonus beim ersten Abschluss
  kern?: boolean;   // gibt beim ersten Abschluss zusätzlich 1 Kern
}

// Gespeicherter Kampfzustand (für exaktes Fortsetzen mitten im Kampf)
export interface CombatSave {
  enemies: {
    id: string;
    hp: number;
    maxHp: number;
    block: number;
    strength: number;
    weak: number;
    vulnerable: number;
    moveIndex: number;
  }[];
  handIds: string[];
  drawIds: string[];
  discardIds: string[];
  energy: number;
  block: number;
  strength: number;
  playerWeak: number;
  startTurnBlock?: number;
  endTurnBlock?: number; // Kompatibilität mit älteren gespeicherten Runs
  turn: number;
  playedCategories: Category[];
  resonanceCount: number;
  firstAttackDone: boolean;
  attackPlayedThisTurn: boolean;
  cardsPlayedThisTurn: number;
  sanduhrUsed?: boolean;
  zeitbruchArmed?: boolean;
  targetIndex?: number;
  rngState?: number;
}

// Gespeicherter Run (Fortsetzen-Funktion)
export interface RunSave {
  mode: GameMode;
  difficulty?: number;
  stageId: string | null;
  areaId?: string | null;
  artifactId: string | null;
  resonanceId?: string | null;
  deckIds: string[];
  hp: number;
  maxHp: number;
  stationIndex: number;
  stations: Station[];
  runSplitter: number;
  // Upgrade-Stufen werden beim Run-Start eingefroren (kein Nachkaufen mitten im Run)
  runUpgrades: Record<string, number>;
  combat: CombatSave | null;
  reward: { cardIds: string[]; splitter: number } | null;
}

export interface MetaUpgradeDef {
  id: string;
  name: string;
  icon: string;
  maxLevel: number;
  cost: number; // Grundpreis; steigt mit jeder gekauften Stufe
  currency?: 'splitter' | 'kerne';
  describeCurrent: (level: number) => string; // aktueller Gesamtbonus
  describeNext: (level: number) => string;    // Zugewinn der nächsten Stufe
}

export interface MetaState {
  splitter: number;
  kerne: number;
  upgrades: Record<string, number>;
  wins: number;
  runs: number;
  artifacts: string[];        // freigeschaltete Artefakte
  resonances: string[];       // freigeschaltete Resonanzen
  completedStages: string[];  // abgeschlossene Kampagnen-Stages
  completedAreas: string[];   // abgeschlossene Dungeon-Gebiete
  cards: Record<string, number>; // Kartensammlung (Karten-ID → Anzahl)
  lastDeck: string[];         // zuletzt gewähltes Startdeck
  deckLayouts: DeckLayout[];  // dauerhaft gespeicherte Startdeck-Layouts
  activeDeckLayoutId: string;
}

export interface DeckLayout {
  id: string;
  name: string;
  cardIds: string[];
  artifactId: string | null;
  resonanceId: string | null;
}
