import { computed, inject, signal } from '@angular/core';
import { AudioService } from '../audio.service';
import {
  ArtifactDef, CampaignStage, CardDef, CardInstance, CardSort, Category, CombatSave,
  DeckLayout, DungeonArea, EnemyDef, EnemyState, GameMode, MetaState, RunSave, Screen,
  Station, StationKind, ResonanceDef,
} from './models';
import {
  ARTIFACTS, CAMPAIGN_STAGES, CARDS, DECK_MAX, DECK_MIN, DUNGEON_AREAS, ENEMIES,
  MAX_CARD_COPIES, META_UPGRADES, REWARD_POOL, STARTER_COLLECTION, STARTER_DECK,
  RESONANCES,
} from './data';
import { legacyLoad, secureLoad, secureRemove, secureSave } from './storage';
import { clampDifficulty } from './game.utils';
import {
  artifactDetails as buildArtifactDetails,
  resonanceDetails as buildResonanceDetails,
  resonanceEffectText as buildResonanceEffectText,
  resonanceUsesNachhall as hasResonanceNachhallEffect,
} from './effect-text';

const META_KEY = 'riftbound-meta-v3';
const PREVIOUS_META_KEY = 'riftbound-meta-v2';
const LEGACY_META_KEY = 'riftbound-meta-v1';
export const RUN_KEY = 'riftbound-run-v1';
export const DIFFICULTY_KEY = 'riftbound-dungeon-difficulty-v1';
export const BASE_HP = 80;
const DECK_LAYOUT_IDS = ['layout-1', 'layout-2', 'layout-3', 'layout-4', 'layout-5'];

/** Gemeinsamer Zustand sowie dauerhafter Fortschritt und Shops. */
export abstract class GameMetaService {
  protected readonly audio = inject(AudioService);
  protected nextUid = 1;
  protected nextEnemyUid = 1;

  // ---------- Meta (bleibt über Runs erhalten) ----------
  readonly meta = signal<MetaState>(this.loadMeta());
  readonly metaUpgrades = META_UPGRADES;
  readonly allArtifacts = ARTIFACTS;
  readonly allResonances = RESONANCES;
  readonly campaignStages = CAMPAIGN_STAGES;
  readonly dungeonAreas = DUNGEON_AREAS;
  readonly allCards: CardDef[] = Object.values(CARDS).filter(c => c.price !== undefined);
  readonly deckMin = DECK_MIN;
  readonly deckMax = DECK_MAX;
  readonly maxCopies = MAX_CARD_COPIES;

  // ---------- Bildschirm & Modus ----------
  readonly screen = signal<Screen>('title');
  readonly mode = signal<GameMode>('dungeon');
  readonly currentStage = signal<CampaignStage | null>(null);
  readonly currentArea = signal<DungeonArea | null>(null);
  readonly dungeonDifficulty = signal(clampDifficulty(secureLoad<number>(DIFFICULTY_KEY) ?? 1));
  readonly difficultyLevels = Array.from({ length: 10 }, (_, index) => index + 1);
  readonly hasRunSave = signal<boolean>(secureLoad<RunSave>(RUN_KEY) !== null);
  readonly dungeonBackground = computed(() => this.currentArea()?.background ?? '');
  readonly themedRunActive = computed(() =>
    Boolean(this.currentArea())
      && ['map', 'combat', 'reward', 'rest'].includes(this.screen()),
  );

  // ---------- Run ----------
  readonly artifact = signal<ArtifactDef | null>(null);
  readonly resonance = signal<ResonanceDef | null>(null);
  readonly stations = signal<Station[]>([]);
  readonly stationIndex = signal(0);
  readonly deck = signal<CardInstance[]>([]);
  readonly playerMaxHp = signal(BASE_HP);
  readonly playerHp = signal(BASE_HP);
  readonly runSplitter = signal(0);
  readonly runUpgrades = signal<Record<string, number>>({});

  // ---------- Deck-Auswahl (vor dem Run) ----------
  readonly deckSelection = signal<Record<string, number>>({});
  readonly deckEditorMode = signal<'menu' | 'run'>('run');
  readonly activeDeckLayoutId = signal(this.meta().activeDeckLayoutId);
  readonly deckSelectionSize = computed(() =>
    Object.values(this.deckSelection()).reduce((a, b) => a + b, 0),
  );
  readonly deckLayouts = computed(() => this.meta().deckLayouts);
  readonly activeDeckLayout = computed(() =>
    this.meta().deckLayouts.find(layout => layout.id === this.activeDeckLayoutId())
      ?? this.meta().deckLayouts[0],
  );

  // ---------- Kartenshop-Filter ----------
  readonly shopFilter = signal<'alle' | 'besitzt' | 'fehlt'>('alle');
  readonly shopTypeFilter = signal<string>('alle');
  readonly shopCategoryFilter = signal<string>('alle');
  readonly shopSort = signal<CardSort>('type');
  readonly shopSearch = signal('');

  readonly deckTypeFilter = signal<string>('alle');
  readonly deckCategoryFilter = signal<string>('alle');
  readonly deckSort = signal<CardSort>('name-asc');
  readonly deckSearch = signal('');
  readonly filteredShopCards = computed(() => {
    const owned = this.meta().cards;
    const cards = this.allCards.filter(c => {
      const count = owned[c.id] ?? 0;
      if (this.shopFilter() === 'besitzt' && count === 0) return false;
      if (this.shopFilter() === 'fehlt' && count > 0) return false;
      return true;
    });
    return this.filterAndSortCards(
      cards,
      this.shopTypeFilter(),

      this.shopCategoryFilter(),
      this.shopSort(),
      this.shopSearch(),
    );
  });

  // ---------- Kampf ----------
  readonly enemies = signal<EnemyState[]>([]);
  readonly selectedEnemyUid = signal<number | null>(null);
  readonly hand = signal<CardInstance[]>([]);
  readonly drawPile = signal<CardInstance[]>([]);
  readonly discardPile = signal<CardInstance[]>([]);
  readonly energy = signal(3);
  readonly maxEnergy = signal(3);
  readonly block = signal(0);
  readonly strength = signal(0);
  readonly playerWeak = signal(0);
  readonly endTurnBlock = signal(0);
  readonly turn = signal(1);
  readonly playedCategories = signal<Category[]>([]);
  readonly resonanceCount = signal(0);
  readonly firstAttackDone = signal(false);
  readonly sanduhrUsedThisTurn = signal(false);
  readonly zeitbruchArmed = signal(false);
  readonly cardsPlayedThisTurn = signal(0);
  readonly attackPlayedThisTurn = signal(false);
  readonly log = signal<string[]>([]);

  // Rückgängig-Schnappschüsse für den laufenden Zug (leert sich bei Zugende)
  readonly combatUndoStack = signal<{ combat: CombatSave; hp: number; log: string[] }[]>([]);

  // ---------- Hover-Vorschau ----------
  readonly hoveredCard = signal<CardInstance | null>(null);
  readonly giveUpConfirmationOpen = signal(false);

  // ---------- Belohnung / Run-Ende ----------
  readonly rewardCards = signal<CardDef[]>([]);
  readonly rewardSplitter = signal(0);
  readonly endSplitter = signal(0);
  readonly endKerne = signal(0);
  readonly endFirstClear = signal(false);
  readonly endSurrendered = signal(false);

  readonly aliveEnemies = computed(() => this.enemies().filter(e => e.hp > 0));
  readonly currentTarget = computed(() =>
    this.aliveEnemies().find(e => e.uid === this.selectedEnemyUid()) ?? this.aliveEnemies()[0] ?? null,
  );
  readonly currentStation = computed(() => this.stations()[this.stationIndex()]);
  readonly ownedArtifacts = computed(() =>
    ARTIFACTS.filter(a => this.meta().artifacts.includes(a.id)),
  );
  readonly ownedResonances = computed(() =>
    RESONANCES.filter(r => this.meta().resonances.includes(r.id)),
  );

  // ================= Meta =================

  private normalizeMeta(m: Partial<MetaState> | null): MetaState {
    const artifacts = Array.isArray(m?.artifacts)
      ? [...m.artifacts.filter(id => ARTIFACTS.some(a => a.id === id))]
      : [];
    for (const a of ARTIFACTS) {
      if (a.starter && !artifacts.includes(a.id)) artifacts.push(a.id);
    }
    let cards = m?.cards;
    if (!cards || typeof cards !== 'object' || Object.keys(cards).length === 0) {
      cards = { ...STARTER_COLLECTION };
    }
    const lastDeck = Array.isArray(m?.lastDeck) ? m.lastDeck : [];
    const storedLayouts = Array.isArray(m?.deckLayouts) ? m.deckLayouts : [];
    const deckLayouts: DeckLayout[] = DECK_LAYOUT_IDS.map((id, index) => {
      const stored = storedLayouts.find(layout => layout?.id === id);
      return {
        id,
        name: typeof stored?.name === 'string' && stored.name.trim()
          ? stored.name.trim().slice(0, 24)
          : `Layout ${index + 1}`,
        cardIds: Array.isArray(stored?.cardIds)
          ? stored.cardIds.filter(cardId => typeof cardId === 'string')
          : index === 0 ? (lastDeck.length > 0 ? [...lastDeck] : [...STARTER_DECK]) : [],
        artifactId: typeof stored?.artifactId === 'string'
          && artifacts.includes(stored.artifactId)
          ? stored.artifactId
          : null,
        resonanceId: typeof stored?.resonanceId === 'string'
          && Array.isArray(m?.resonances)
          && m.resonances.includes(stored.resonanceId)
          ? stored.resonanceId
          : null,
      };
    });
    const activeDeckLayoutId = deckLayouts.some(layout => layout.id === m?.activeDeckLayoutId)

      ? m!.activeDeckLayoutId!
      : deckLayouts[0].id;
    return {
      splitter: m?.splitter ?? 0,
      kerne: m?.kerne ?? 0,
      upgrades: m?.upgrades ?? {},
      wins: m?.wins ?? 0,
      runs: m?.runs ?? 0,
      artifacts,
      resonances: Array.isArray(m?.resonances)
        ? m.resonances.filter(id => RESONANCES.some(r => r.id === id))
        : [],
      completedStages: Array.isArray(m?.completedStages) ? m.completedStages : [],
      completedAreas: Array.isArray(m?.completedAreas) ? m.completedAreas : [],

      cards,
      lastDeck,
      deckLayouts,
      activeDeckLayoutId,
    };
  }

  private loadMeta(): MetaState {
    const signed = secureLoad<MetaState>(META_KEY);
    if (signed) return this.normalizeMeta(signed);
    const previous = secureLoad<MetaState>(PREVIOUS_META_KEY);
    if (previous) {
      // Schildkern war in v2 immer kostenlos und konnte daher nie regulär gekauft werden.
      const migrated = this.normalizeMeta({
        ...previous,
        artifacts: Array.isArray(previous.artifacts)
          ? previous.artifacts.filter(id => id !== 'schildkern')
          : [],
        deckLayouts: (Array.isArray(previous.deckLayouts) ? previous.deckLayouts : []).map(layout => ({
          ...layout,
          artifactId: layout.artifactId === 'schildkern' ? null : layout.artifactId,
        })),
      });
      secureSave(META_KEY, migrated);
      secureRemove(PREVIOUS_META_KEY);
      return migrated;
    }
    // Migration vom alten, unsignierten Format
    const legacy = legacyLoad<MetaState>(LEGACY_META_KEY);
    const meta = this.normalizeMeta(legacy ? {
      ...legacy,
      artifacts: Array.isArray(legacy.artifacts)
        ? legacy.artifacts.filter(id => id !== 'schildkern')
        : [],
      deckLayouts: (Array.isArray(legacy.deckLayouts) ? legacy.deckLayouts : []).map(layout => ({
        ...layout,
        artifactId: layout.artifactId === 'schildkern' ? null : layout.artifactId,
      })),
    } : null);
    if (legacy) {
      secureSave(META_KEY, meta);
      secureRemove(LEGACY_META_KEY);
    }
    return meta;
  }

  protected saveMeta() {
    secureSave(META_KEY, this.meta());
  }

  upgradeLevel(id: string): number {
    return this.meta().upgrades[id] ?? 0;
  }

  upgradeCost(id: string): number {
    const def = META_UPGRADES.find(upgrade => upgrade.id === id);
    if (!def) return 0;
    const level = this.upgradeLevel(id);
    return def.currency === 'kerne'
      ? def.cost * (level + 1)
      : Math.round(def.cost * (1 + level * 0.1));
  }

  canBuyUpgrade(id: string): boolean {
    const def = META_UPGRADES.find(upgrade => upgrade.id === id);
    if (!def || this.upgradeLevel(id) >= def.maxLevel) return false;
    const cost = this.upgradeCost(id);
    return def.currency === 'kerne' ? this.meta().kerne >= cost : this.meta().splitter >= cost;
  }

  /** Upgrade-Stufe für den laufenden Run (beim Start eingefroren). */
  runUpgradeLevel(id: string): number {
    return this.runUpgrades()[id] ?? 0;
  }

  buyUpgrade(id: string) {
    const def = META_UPGRADES.find(u => u.id === id);
    if (!def) return;
    const m = this.meta();
    const level = m.upgrades[id] ?? 0;
    if (!this.canBuyUpgrade(id)) return;
    const cost = this.upgradeCost(id);
    this.meta.set({
      ...m,
      splitter: m.splitter - (def.currency === 'kerne' ? 0 : cost),
      kerne: m.kerne - (def.currency === 'kerne' ? cost : 0),
      upgrades: { ...m.upgrades, [id]: level + 1 },
    });
    this.saveMeta();
  }

  artifactDetails(artifact: ArtifactDef): string {
    return buildArtifactDetails(artifact);
  }

  resonanceText(resonance: ResonanceDef, nachhall = this.upgradeLevel('nachhall')): string {
    return buildResonanceEffectText(resonance, nachhall);
  }

  resonanceRunText(resonance: ResonanceDef): string {
    return buildResonanceEffectText(resonance, this.runUpgradeLevel('nachhall'));
  }

  resonanceDetails(resonance: ResonanceDef, nachhall = this.upgradeLevel('nachhall')): string {
    return buildResonanceDetails(resonance, nachhall);
  }

  resonanceRunDetails(resonance: ResonanceDef): string {
    return buildResonanceDetails(resonance, this.runUpgradeLevel('nachhall'));
  }

  resonanceUsesNachhall(resonance: ResonanceDef): boolean {
    return hasResonanceNachhallEffect(resonance);
  }

  ownsArtifact(id: string): boolean {
    return this.meta().artifacts.includes(id);
  }

  canBuyArtifact(a: ArtifactDef): boolean {
    const m = this.meta();
    if (this.ownsArtifact(a.id)) return false;
    if (a.costKerne) return m.kerne >= a.costKerne;
    if (a.costSplitter) return m.splitter >= a.costSplitter;
    return false;
  }

  buyArtifact(a: ArtifactDef) {
    if (!this.canBuyArtifact(a)) return;
    const m = this.meta();
    // Neue Käufe werden direkt im aktiven Layout ausgerüstet.
    this.meta.set({
      ...m,
      splitter: m.splitter - (a.costSplitter ?? 0),
      kerne: m.kerne - (a.costKerne ?? 0),
      artifacts: [...m.artifacts, a.id],
      deckLayouts: m.deckLayouts.map(layout =>
        layout.id === m.activeDeckLayoutId ? { ...layout, artifactId: a.id } : layout,
      ),
    });
    this.saveMeta();
  }

  /** Ist dieses Artefakt im aktiven Layout ausgerüstet? */
  isEquippedArtifact(id: string): boolean {
    const m = this.meta();
    return m.deckLayouts.find(l => l.id === m.activeDeckLayoutId)?.artifactId === id;
  }

  /** Ist diese Resonanz im aktiven Layout ausgerüstet? */
  isEquippedResonance(id: string): boolean {
    const m = this.meta();
    return m.deckLayouts.find(l => l.id === m.activeDeckLayoutId)?.resonanceId === id;
  }

  // ================= Umwandler =================

  readonly kernConversionCost = 1000; // Splitter pro Kern

  canConvertSplitterToKern(): boolean {
    return this.meta().splitter >= this.kernConversionCost;
  }

  /** Wandelt 1000 Splitter in 1 Kern um – die Gegenrichtung gibt es bewusst nicht. */
  convertSplitterToKern() {
    if (!this.canConvertSplitterToKern()) return;
    const m = this.meta();
    this.meta.set({
      ...m,
      splitter: m.splitter - this.kernConversionCost,
      kerne: m.kerne + 1,
    });
    this.saveMeta();
  }

  // ================= Kartensammlung & Shop =================

  cardCount(id: string): number {
    return this.meta().cards[id] ?? 0;
  }

  canBuyCard(def: CardDef): boolean {
    if (def.price === undefined) return false;
    if (this.cardCount(def.id) >= MAX_CARD_COPIES) return false;
    return this.meta().splitter >= def.price;
  }

  buyCard(def: CardDef) {
    if (!this.canBuyCard(def)) return;
    const m = this.meta();

    this.meta.set({
      ...m,
      splitter: m.splitter - def.price!,
      cards: { ...m.cards, [def.id]: (m.cards[def.id] ?? 0) + 1 },
    });
    this.saveMeta();
  }

  protected filterAndSortCards(
    cards: CardDef[],
    type: string,
    category: string,
    sort: CardSort,

    search: string,
  ): CardDef[] {
    const needle = search.trim().toLocaleLowerCase('de');
    const filtered = cards.filter(card => {
      if (type !== 'alle' && card.type !== type) return false;
      if (category !== 'alle' && card.category !== category) return false;
      if (needle && !`${card.name} ${card.text}`.toLocaleLowerCase('de').includes(needle)) return false;
      return true;
    });
    return [...filtered].sort((a, b) => {
      switch (sort) {
        case 'name-desc': return b.name.localeCompare(a.name, 'de');
        case 'energy-asc': return a.cost - b.cost || a.name.localeCompare(b.name, 'de');
        case 'energy-desc': return b.cost - a.cost || a.name.localeCompare(b.name, 'de');
        case 'price-asc': return (a.price ?? Infinity) - (b.price ?? Infinity) || a.name.localeCompare(b.name, 'de');
        case 'price-desc': return (b.price ?? -1) - (a.price ?? -1) || a.name.localeCompare(b.name, 'de');
        case 'type': return a.type.localeCompare(b.type, 'de') || a.name.localeCompare(b.name, 'de');
        case 'category': return a.category.localeCompare(b.category, 'de') || a.name.localeCompare(b.name, 'de');
        case 'name-asc': return a.name.localeCompare(b.name, 'de');
      }
    });
  }

}


