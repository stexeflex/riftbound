// Grundlegende Typen für Riftbound

export type CardType = 'Angriff' | 'Verteidigung' | 'Technik' | 'Macht' | 'Fluch';
export type Category = 'Kraft' | 'Schutz' | 'Kontrolle' | 'Chaos';

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
  weakEnemy?: number;      // Schwäche auf Gegner (reduziert dessen Schaden)
  vulnerableEnemy?: number; // Verwundbarkeit auf Gegner (+50% erlittener Schaden)
  selfWeak?: number;       // Spieler erhält Schwäche
  strength?: number;       // dauerhafter Schadensbonus für diesen Kampf
  endTurnBlock?: number;   // Schild am Ende jedes Zuges (Macht)
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

export type Screen =
  | 'title'
  | 'artifact'
  | 'deck'
  | 'campaign'
  | 'map'
  | 'combat'
  | 'reward'
  | 'rest'
  | 'victory'
  | 'defeat'
  | 'meta'
  | 'cards';

export type GameMode = 'dungeon' | 'campaign';

export interface CampaignStage {
  id: string;
  name: string;
  desc: string;
  stations: StationKind[];
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
  endTurnBlock: number;
  turn: number;
  playedCategories: Category[];
  resonanceCount: number;
  firstAttackDone: boolean;
  attackPlayedThisTurn: boolean;
  cardsPlayedThisTurn: number;
}

// Gespeicherter Run (Fortsetzen-Funktion)
export interface RunSave {
  mode: GameMode;
  stageId: string | null;
  artifactId: string | null;
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
  cost: number; // Splitter pro Stufe
  describe: (level: number) => string;
}

export interface MetaState {
  splitter: number;
  kerne: number;
  upgrades: Record<string, number>;
  wins: number;
  runs: number;
  artifacts: string[];        // freigeschaltete Artefakte
  completedStages: string[];  // abgeschlossene Kampagnen-Stages
  cards: Record<string, number>; // Kartensammlung (Karten-ID → Anzahl)
  lastDeck: string[];         // zuletzt gewähltes Startdeck
}
