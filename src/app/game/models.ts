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
}

export type Screen =
  | 'title'
  | 'artifact'
  | 'map'
  | 'combat'
  | 'reward'
  | 'rest'
  | 'victory'
  | 'defeat'
  | 'meta';

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
}
