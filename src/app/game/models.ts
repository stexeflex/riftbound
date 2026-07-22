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
  veil?: number;           // so viele gegnerische Treffer gehen vollständig daneben
  reflection?: number;     // Schaden, den der nächste gegnerische Treffer zurückwirft
  damageRedirection?: number; // Schild, der absorbierten Schaden auf den Angreifer zurückwirft
  retainEnergy?: boolean;  // verbleibende Energie wird in den nächsten Zug übertragen
  purgeEnemyBuffs?: number; // so viele positive Effektarten vom Gegner entfernen
  retainBlock?: number;    // bis zu so viel Restschild in den nächsten Zug übertragen
  summonAlly?: string;     // ID des zu beschwörenden Verbündeten
  damagePerAlly?: number;  // zusätzlicher Schaden pro aktivem Verbündeten
  healAllies?: number;     // heilt alle aktiven Verbündeten
  allyStrength?: number;   // dauerhafter Schadensbonus für Verbündete in diesem Kampf
  commandAlly?: 'front' | 'back'; // vordersten/hintersten Verbündeten sofort angreifen lassen
  playerTaunt?: boolean;   // gezielte Gegnerangriffe bis zum nächsten Zug auf den Spieler ziehen
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
  target?: 'player' | 'all'; // Gruppenschaden trifft Spieler und alle Verbündeten
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
  intentTarget: 'player' | string; // Spieler oder Verbündeten-ID für die nächste Einzelziel-Aktion
}

export type AllyPosition = 'front' | 'back';

export interface AllyFormationSlot {
  allyId: string;
  position: AllyPosition;
}

export interface AllyDef {
  id: string;
  name: string;
  emoji: string;
  maxHp: number;
  text: string;
  costKerne: number;
  taunt?: boolean;          // fängt gegnerische Treffer ab, solange der Verbündete lebt
  startTurnDamage?: number; // Schaden an einem zufälligen Gegner zu Beginn des Spielerzugs
  startTurnAoeDamage?: number; // Schaden an allen Gegnern zu Beginn des Spielerzugs
  deathExplosionDamage?: number; // Schaden an allen Gegnern, wenn der Verbündete besiegt wird
  startTurnBlock?: number;  // Schild für den Spieler zu Beginn des Spielerzugs
  commandDamage: number;    // Schaden bei einem sofortigen Angriff durch eine Befehlskarte
  duration?: number;        // Anzahl der Zuganfänge, danach verschwindet der Verbündete
  growth: AllyGrowth;       // Zugewinn pro Verbündetenstufe nach Stufe 1
}

export interface AllyGrowth {
  maxHp?: number;
  startTurnDamage?: number;
  startTurnAoeDamage?: number;
  deathExplosionDamage?: number;
  startTurnBlock?: number;
  commandDamage?: number;
}

export interface AllyState {
  uid: number;
  def: AllyDef;
  hp: number;
  turnsRemaining: number | null;
  position: AllyPosition;
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
  | 'allies'
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
  kerne?: number;   // Kerne beim ersten Abschluss
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
    intentTarget?: 'player' | string;
  }[];
  handIds: string[];
  drawIds: string[];
  discardIds: string[];
  energy: number;
  block: number;
  strength: number;
  playerWeak: number;
  playerTaunt?: boolean;
  startTurnBlock?: number;
  endTurnBlock?: number; // Kompatibilität mit älteren gespeicherten Runs
  veil?: number;
  reflection?: number;
  damageRedirection?: number;
  retainEnergy?: boolean;
  blockCarryover?: number;
  allyStrength?: number;
  allies?: {
    id: string;
    hp: number;
    turnsRemaining: number | null;
    position?: AllyPosition;
  }[];
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
  allyFormation?: AllyFormationSlot[];
  runAllyLevels?: Record<string, number>;
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
  allies: string[];           // freigeschaltete Verbündete
  allyLevels: Record<string, number>; // Verbündeten-ID → dauerhafte Stufe
  completedStages: string[];  // abgeschlossene Kampagnen-Stages
  completedAreas: string[];   // abgeschlossene Dungeon-Gebiete
  completedDungeonLevels: string[]; // Gebiet und Schwierigkeit mit bereits verdientem Kern
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
  allyFormation: AllyFormationSlot[];
}
