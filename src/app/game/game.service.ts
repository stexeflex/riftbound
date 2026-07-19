import { Injectable, computed, inject, signal } from '@angular/core';
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

const META_KEY = 'riftbound-meta-v2';
const LEGACY_META_KEY = 'riftbound-meta-v1';
const RUN_KEY = 'riftbound-run-v1';
const DIFFICULTY_KEY = 'riftbound-dungeon-difficulty-v1';
const BASE_HP = 80;
const DECK_LAYOUT_IDS = ['layout-1', 'layout-2', 'layout-3', 'layout-4', 'layout-5'];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function clampDifficulty(value: number): number {
  return Math.min(10, Math.max(1, Math.round(Number.isFinite(value) ? value : 1)));
}

@Injectable({ providedIn: 'root' })
export class GameService {
  private readonly audio = inject(AudioService);
  private nextUid = 1;
  private nextEnemyUid = 1;

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
  readonly shopSort = signal<CardSort>('name-asc');
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
  readonly cardsPlayedThisTurn = signal(0);
  readonly attackPlayedThisTurn = signal(false);
  readonly log = signal<string[]>([]);

  // ---------- Hover-Vorschau ----------
  readonly hoveredCard = signal<CardInstance | null>(null);

  // ---------- Belohnung / Run-Ende ----------
  readonly rewardCards = signal<CardDef[]>([]);
  readonly rewardSplitter = signal(0);
  readonly endSplitter = signal(0);
  readonly endKerne = signal(0);
  readonly endFirstClear = signal(false);

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
    const artifacts = Array.isArray(m?.artifacts) ? m.artifacts : [];
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
          : 'schildkern',
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
    // Migration vom alten, unsignierten Format
    const legacy = legacyLoad<MetaState>(LEGACY_META_KEY);
    const meta = this.normalizeMeta(legacy);
    if (legacy) {
      secureSave(META_KEY, meta);
      secureRemove(LEGACY_META_KEY);
    }
    return meta;
  }

  private saveMeta() {
    secureSave(META_KEY, this.meta());
  }

  upgradeLevel(id: string): number {
    return this.meta().upgrades[id] ?? 0;
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
    if (level >= def.maxLevel || m.splitter < def.cost) return;
    this.meta.set({
      ...m,
      splitter: m.splitter - def.cost,
      upgrades: { ...m.upgrades, [id]: level + 1 },
    });
    this.saveMeta();
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
    this.meta.set({
      ...m,
      splitter: m.splitter - (a.costSplitter ?? 0),
      kerne: m.kerne - (a.costKerne ?? 0),
      artifacts: [...m.artifacts, a.id],
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

  private filterAndSortCards(
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

  // ================= Deck-Auswahl =================

  /** Karten der Sammlung, sortiert für die Deck-Auswahl. */
  readonly collectionCards = computed(() => {
    const owned = this.meta().cards;
    return this.filterAndSortCards(
      this.allCards.filter(c => (owned[c.id] ?? 0) > 0),
      this.deckTypeFilter(),
      this.deckCategoryFilter(),
      this.deckSort(),
      this.deckSearch(),
    );
  });

  private prefillDeckSelection(layoutId = this.meta().activeDeckLayoutId) {
    const owned = this.meta().cards;
    const sel: Record<string, number> = {};
    const layout = this.meta().deckLayouts.find(item => item.id === layoutId);
    const source = layout?.cardIds ?? [];
    for (const id of source) {
      const have = owned[id] ?? 0;
      const cur = sel[id] ?? 0;
      if (cur < have && this.sumSelection(sel) < DECK_MAX) sel[id] = cur + 1;
    }
    this.deckSelection.set(sel);
  }

  /** Öffnet die dauerhaft gespeicherten Ausrüstungs-Layouts direkt aus dem Hauptmenü. */
  openEquipment() {
    this.deckEditorMode.set('menu');
    this.activeDeckLayoutId.set(this.meta().activeDeckLayoutId);
    this.prefillDeckSelection();
    this.screen.set('deck');
  }

  selectDeckLayout(id: string) {
    if (!this.meta().deckLayouts.some(layout => layout.id === id)) return;
    this.activeDeckLayoutId.set(id);
    this.meta.set({ ...this.meta(), activeDeckLayoutId: id });
    this.saveMeta();
    this.prefillDeckSelection(id);
  }

  renameDeckLayout(id: string, name: string) {
    const cleanName = name.trim().slice(0, 24);
    if (!cleanName) return;
    const m = this.meta();
    this.meta.set({
      ...m,
      deckLayouts: m.deckLayouts.map(layout =>
        layout.id === id ? { ...layout, name: cleanName } : layout,
      ),
    });
    this.saveMeta();
  }

  selectLayoutArtifact(id: string | null) {
    if (id && !this.ownsArtifact(id)) return;
    this.updateActiveLayout({ artifactId: id });
  }

  selectLayoutResonance(id: string | null) {
    if (id && !this.ownsResonance(id)) return;
    this.updateActiveLayout({ resonanceId: id });
  }

  private updateActiveLayout(change: Partial<DeckLayout>) {
    const activeId = this.activeDeckLayoutId();
    const m = this.meta();
    this.meta.set({
      ...m,
      deckLayouts: m.deckLayouts.map(layout =>
        layout.id === activeId ? { ...layout, ...change } : layout,
      ),
    });
    this.saveMeta();
  }

  layoutCardCount(layout: DeckLayout): number {
    return layout.cardIds.length;
  }

  layoutArtifact(layout: DeckLayout | undefined = this.activeDeckLayout()): ArtifactDef | null {
    return layout?.artifactId ? ARTIFACTS.find(a => a.id === layout.artifactId) ?? null : null;
  }

  layoutResonance(layout: DeckLayout | undefined = this.activeDeckLayout()): ResonanceDef | null {
    return layout?.resonanceId ? RESONANCES.find(r => r.id === layout.resonanceId) ?? null : null;
  }

  private selectionIds(): string[] {
    const ids: string[] = [];
    for (const [id, count] of Object.entries(this.deckSelection())) {
      for (let i = 0; i < count; i++) ids.push(id);
    }
    return ids;
  }

  /** Jede Änderung wird sofort im aktiven Layout gespeichert. */
  private saveDeckLayout() {
    const ids = this.selectionIds();
    const activeId = this.activeDeckLayoutId();
    const m = this.meta();
    this.meta.set({
      ...m,
      lastDeck: ids,
      activeDeckLayoutId: activeId,
      deckLayouts: m.deckLayouts.map(layout =>
        layout.id === activeId ? { ...layout, cardIds: ids } : layout,
      ),
    });
    this.saveMeta();
  }

  ownsResonance(id: string): boolean {
    return this.meta().resonances.includes(id);
  }

  canBuyResonance(r: ResonanceDef): boolean {
    return !this.ownsResonance(r.id) && this.meta().splitter >= r.costSplitter;
  }

  buyResonance(r: ResonanceDef) {
    if (!this.canBuyResonance(r)) return;
    const m = this.meta();
    this.meta.set({
      ...m,
      splitter: m.splitter - r.costSplitter,
      resonances: [...m.resonances, r.id],
    });
    this.saveMeta();
  }

  private sumSelection(sel: Record<string, number>): number {
    return Object.values(sel).reduce((a, b) => a + b, 0);
  }

  selectionCount(id: string): number {
    return this.deckSelection()[id] ?? 0;
  }

  addToSelection(id: string) {
    const sel = { ...this.deckSelection() };
    const cur = sel[id] ?? 0;
    if (cur >= this.cardCount(id)) return;
    if (this.deckSelectionSize() >= DECK_MAX) return;
    sel[id] = cur + 1;
    this.deckSelection.set(sel);
    this.saveDeckLayout();
  }

  removeFromSelection(id: string) {
    const sel = { ...this.deckSelection() };
    const cur = sel[id] ?? 0;
    if (cur <= 0) return;
    if (cur === 1) delete sel[id];
    else sel[id] = cur - 1;
    this.deckSelection.set(sel);
    this.saveDeckLayout();
  }

  canConfirmDeck(): boolean {
    const size = this.deckSelectionSize();
    return size >= DECK_MIN && size <= DECK_MAX;
  }

  confirmDeck() {
    if (!this.canConfirmDeck()) return;
    const ids = this.selectionIds();
    const layout = this.activeDeckLayout();
    this.artifact.set(
      layout?.artifactId && this.ownsArtifact(layout.artifactId)
        ? ARTIFACTS.find(a => a.id === layout.artifactId) ?? null
        : null,
    );
    this.resonance.set(
      layout?.resonanceId && this.ownsResonance(layout.resonanceId)
        ? RESONANCES.find(r => r.id === layout.resonanceId) ?? null
        : null,
    );

    const m = this.meta();
    this.meta.set({ ...m, runs: m.runs + 1, lastDeck: ids });
    this.saveMeta();

    // Upgrade-Stufen für diesen Run einfrieren
    this.runUpgrades.set({ ...this.meta().upgrades });
    this.maxEnergy.set(3 + this.runUpgradeLevel('energiekern'));

    let maxHp = BASE_HP + this.runUpgradeLevel('leben') * 2;
    if (this.artifact()?.id === 'glasherz') maxHp = Math.round(maxHp * 0.8);
    this.playerMaxHp.set(maxHp);
    this.playerHp.set(maxHp);

    this.deck.set(ids.map(id => this.makeCard(CARDS[id])));

    const kinds = this.mode() === 'campaign'
      ? this.currentStage()!.stations
      : (this.currentArea() ?? DUNGEON_AREAS[0]).stations;
    this.stations.set(kinds.map(kind => ({ kind, done: false })));
    this.stationIndex.set(0);
    this.runSplitter.set(0);

    this.saveRun();
    this.screen.set('map');
  }

  // ================= Run speichern / fortsetzen =================

  private buildCombatSave(): CombatSave | null {
    if (this.screen() !== 'combat') return null;
    return {
      enemies: this.enemies().map(e => ({
        id: e.def.id,
        hp: e.hp,
        maxHp: e.maxHp,
        block: e.block,
        strength: e.strength,
        weak: e.weak,
        vulnerable: e.vulnerable,
        moveIndex: e.moveIndex,
      })),
      handIds: this.hand().map(c => c.def.id),
      drawIds: this.drawPile().map(c => c.def.id),
      discardIds: this.discardPile().map(c => c.def.id),
      energy: this.energy(),
      block: this.block(),
      strength: this.strength(),
      playerWeak: this.playerWeak(),
      endTurnBlock: this.endTurnBlock(),
      turn: this.turn(),
      playedCategories: this.playedCategories(),
      resonanceCount: this.resonanceCount(),
      firstAttackDone: this.firstAttackDone(),
      attackPlayedThisTurn: this.attackPlayedThisTurn(),
      cardsPlayedThisTurn: this.cardsPlayedThisTurn(),
      targetIndex: Math.max(0, this.enemies().findIndex(e => e.uid === this.currentTarget()?.uid)),
    };
  }

  private saveRun() {
    const save: RunSave = {
      mode: this.mode(),
      difficulty: this.mode() === 'dungeon' ? this.dungeonDifficulty() : 1,
      stageId: this.currentStage()?.id ?? null,
      areaId: this.currentArea()?.id ?? null,
      artifactId: this.artifact()?.id ?? null,
      resonanceId: this.resonance()?.id ?? null,
      deckIds: this.deck().map(c => c.def.id),
      hp: this.playerHp(),
      maxHp: this.playerMaxHp(),
      stationIndex: this.stationIndex(),
      stations: this.stations(),
      runSplitter: this.runSplitter(),
      runUpgrades: this.runUpgrades(),
      combat: this.buildCombatSave(),
      reward: this.screen() === 'reward'
        ? { cardIds: this.rewardCards().map(c => c.id), splitter: this.rewardSplitter() }
        : null,
    };
    secureSave(RUN_KEY, save);
    this.hasRunSave.set(true);
  }

  private clearRunSave() {
    secureRemove(RUN_KEY);
    this.hasRunSave.set(false);
  }

  continueRun() {
    const save = secureLoad<RunSave>(RUN_KEY);
    if (!save) {
      this.hasRunSave.set(false);
      return;
    }
    this.mode.set(save.mode);
    this.dungeonDifficulty.set(clampDifficulty(save.difficulty ?? 1));
    this.currentStage.set(
      save.stageId ? CAMPAIGN_STAGES.find(s => s.id === save.stageId) ?? null : null,
    );
    const savedAreaId = save.areaId ?? this.currentStage()?.areaId ?? 'gebiet1';
    this.currentArea.set(DUNGEON_AREAS.find(area => area.id === savedAreaId) ?? DUNGEON_AREAS[0]);
    this.artifact.set(ARTIFACTS.find(a => a.id === save.artifactId) ?? null);
    this.resonance.set(RESONANCES.find(r => r.id === save.resonanceId) ?? null);
    this.deck.set(
      save.deckIds.filter(id => CARDS[id]).map(id => this.makeCard(CARDS[id])),
    );
    this.playerMaxHp.set(save.maxHp);
    this.playerHp.set(save.hp);
    this.stationIndex.set(save.stationIndex);
    this.stations.set(save.stations);
    this.runSplitter.set(save.runSplitter);
    this.runUpgrades.set(save.runUpgrades ?? {});
    this.maxEnergy.set(3 + this.runUpgradeLevel('energiekern'));

    if (save.combat) {
      this.restoreCombat(save.combat);
    } else if (save.reward) {
      this.rewardCards.set(save.reward.cardIds.filter(id => CARDS[id]).map(id => CARDS[id]));
      this.rewardSplitter.set(save.reward.splitter);
      this.screen.set('reward');
    } else {
      this.screen.set('map');
    }
  }

  private restoreCombat(c: CombatSave) {
    this.enemies.set(
      c.enemies
        .filter(e => ENEMIES[e.id])
        .map(e => {
          const def = ENEMIES[e.id];
          const state = this.makeEnemy(def);
          state.hp = e.hp;
          state.maxHp = e.maxHp;
          state.block = e.block;
          state.strength = e.strength;
          state.weak = e.weak;
          state.vulnerable = e.vulnerable;
          state.moveIndex = e.moveIndex;
          state.intent = def.moves[e.moveIndex % def.moves.length];
          return state;
        }),
    );
    const savedTarget = this.enemies()[c.targetIndex ?? 0];
    this.selectedEnemyUid.set(
      savedTarget?.hp > 0 ? savedTarget.uid : this.aliveEnemies()[0]?.uid ?? null,
    );
    const toCards = (ids: string[]) =>
      ids.filter(id => CARDS[id]).map(id => this.makeCard(CARDS[id]));
    this.hand.set(toCards(c.handIds));
    this.drawPile.set(toCards(c.drawIds));
    this.discardPile.set(toCards(c.discardIds));
    this.energy.set(c.energy);
    this.block.set(c.block);
    this.strength.set(c.strength);
    this.playerWeak.set(c.playerWeak);
    this.endTurnBlock.set(c.endTurnBlock);
    this.turn.set(c.turn);
    this.playedCategories.set(c.playedCategories);
    this.resonanceCount.set(c.resonanceCount);
    this.firstAttackDone.set(c.firstAttackDone);
    this.attackPlayedThisTurn.set(c.attackPlayedThisTurn);
    this.cardsPlayedThisTurn.set(c.cardsPlayedThisTurn);
    this.log.set([]);
    this.screen.set('combat');
  }

  // ================= Run-Ablauf =================

  goTo(screen: Screen) {
    this.screen.set(screen);
  }

  /** Zurück zum Titel – der Run bleibt gespeichert und kann fortgesetzt werden. */
  toMenu() {
    if (this.screen() === 'combat' || this.screen() === 'reward' ||
        this.screen() === 'map' || this.screen() === 'rest') {
      this.saveRun();
    }
    this.screen.set('title');
  }

  startNewRun() {
    this.startArea(this.currentArea() ?? DUNGEON_AREAS[0]);
  }

  openDungeons() {
    this.screen.set('dungeons');
  }

  setDungeonDifficulty(level: number) {
    const next = clampDifficulty(level);
    this.dungeonDifficulty.set(next);
    secureSave(DIFFICULTY_KEY, next);
  }

  difficultyName(level = this.dungeonDifficulty()): string {
    return [
      'Pfadfinder', 'Unruhig', 'Bedrohlich', 'Verderbt', 'Rissgehärtet',
      'Unerbittlich', 'Albtraum', 'Kataklysmisch', 'Leerengeboren', 'Riftbound',
    ][clampDifficulty(level) - 1];
  }

  difficultyHpMultiplier(level = this.dungeonDifficulty()): number {
    return 1 + (clampDifficulty(level) - 1) * 0.1;
  }

  difficultyPowerMultiplier(level = this.dungeonDifficulty()): number {
    return 1 + (clampDifficulty(level) - 1) * 0.07;
  }

  difficultyRewardMultiplier(level = this.dungeonDifficulty()): number {
    return 1 + (clampDifficulty(level) - 1) * 0.1;
  }

  difficultyHpBonus(level = this.dungeonDifficulty()): number {
    return Math.round((this.difficultyHpMultiplier(level) - 1) * 100);
  }

  difficultyPowerBonus(level = this.dungeonDifficulty()): number {
    return Math.round((this.difficultyPowerMultiplier(level) - 1) * 100);
  }

  difficultyRewardBonus(level = this.dungeonDifficulty()): number {
    return Math.round((this.difficultyRewardMultiplier(level) - 1) * 100);
  }

  scaledAreaReward(area: DungeonArea): number {
    return Math.round(area.reward * this.difficultyRewardMultiplier());
  }

  areaUnlocked(area: DungeonArea): boolean {
    const idx = DUNGEON_AREAS.indexOf(area);
    if (idx <= 0) return true;
    return this.meta().completedAreas.includes(DUNGEON_AREAS[idx - 1].id);
  }

  areaCompleted(area: DungeonArea): boolean {
    return this.meta().completedAreas.includes(area.id);
  }

  startArea(area: DungeonArea) {
    if (!this.areaUnlocked(area)) return;
    this.mode.set('dungeon');
    this.currentArea.set(area);
    this.currentStage.set(null);
    this.artifact.set(null);
    this.resonance.set(null);
    this.startConfiguredRun();
  }

  stageUnlocked(stage: CampaignStage): boolean {
    const idx = CAMPAIGN_STAGES.indexOf(stage);
    if (idx <= 0) return true;
    return this.meta().completedStages.includes(CAMPAIGN_STAGES[idx - 1].id);
  }

  stageCompleted(stage: CampaignStage): boolean {
    return this.meta().completedStages.includes(stage.id);
  }

  startStage(stage: CampaignStage) {
    if (!this.stageUnlocked(stage)) return;
    this.mode.set('campaign');
    this.currentStage.set(stage);
    this.currentArea.set(DUNGEON_AREAS.find(area => area.id === stage.areaId) ?? DUNGEON_AREAS[0]);
    this.artifact.set(null);
    this.resonance.set(null);
    this.startConfiguredRun();
  }

  private startConfiguredRun() {
    this.deckEditorMode.set('run');
    this.activeDeckLayoutId.set(this.meta().activeDeckLayoutId);
    this.prefillDeckSelection();
    if (this.canConfirmDeck()) {
      this.confirmDeck();
    } else {
      this.screen.set('deck');
    }
  }

  enterStation() {
    const station = this.currentStation();
    if (!station) return;
    if (station.kind === 'rast') {
      this.screen.set('rest');
    } else {
      this.startCombat(station.kind);
    }
  }

  restHeal() {
    const bonus = 1 + this.runUpgradeLevel('heilung') * 0.05;
    const heal = Math.round(this.playerMaxHp() * 0.3 * bonus);
    this.playerHp.set(Math.min(this.playerMaxHp(), this.playerHp() + heal));
    this.completeStation();
  }

  private completeStation() {
    const stations = [...this.stations()];
    stations[this.stationIndex()] = { ...stations[this.stationIndex()], done: true };
    this.stations.set(stations);
    if (this.stationIndex() >= stations.length - 1) {
      this.finishRun(true);
    } else {
      this.stationIndex.set(this.stationIndex() + 1);
      this.screen.set('map');
      this.saveRun();
    }
  }

  private finishRun(won: boolean) {
    this.clearRunSave();
    const m = this.meta();
    let earned = this.runSplitter();
    let kerne = 0;
    let completed = m.completedStages;
    let completedAreas = m.completedAreas;
    let firstClear = false;

    if (won) {
      if (this.mode() === 'dungeon') {
        const area = this.currentArea() ?? DUNGEON_AREAS[0];
        firstClear = !completedAreas.includes(area.id);
        // Dungeon-Belohnungen bleiben bei Wiederholungen vollständig erhalten.
        earned += this.scaledAreaReward(area);
        if (firstClear) {
          if (area.kern) kerne = 1;
          completedAreas = [...completedAreas, area.id];
        }
      } else {
        const stage = this.currentStage();
        if (stage) {
          firstClear = !completed.includes(stage.id);
          earned += firstClear ? stage.reward : Math.round(stage.reward * 0.25);
          if (firstClear) {
            if (stage.kern) kerne = 1;
            completed = [...completed, stage.id];
          }
        }
      }
    }

    this.endSplitter.set(earned);
    this.endKerne.set(kerne);
    this.endFirstClear.set(firstClear);
    this.meta.set({
      ...m,
      splitter: m.splitter + earned,
      kerne: m.kerne + kerne,
      wins: m.wins + (won ? 1 : 0),
      completedStages: completed,
      completedAreas,
    });
    this.saveMeta();
    this.screen.set(won ? 'victory' : 'defeat');
  }

  // ================= Kampf =================

  private makeCard(def: CardDef): CardInstance {
    return { uid: this.nextUid++, def };
  }

  private makeEnemy(def: EnemyDef): EnemyState {
    const hpMultiplier = this.mode() === 'dungeon' ? this.difficultyHpMultiplier() : 1;
    const maxHp = Math.round(def.maxHp * hpMultiplier);
    return {
      uid: this.nextEnemyUid++,
      def,
      hp: maxHp,
      maxHp,
      block: 0,
      strength: 0,
      weak: 0,
      vulnerable: 0,
      moveIndex: 0,
      intent: def.moves[0],
    };
  }

  enemyIntentValue(enemy: EnemyState): number {
    const move = enemy.intent;
    if (this.mode() !== 'dungeon') return move.value;
    if (move.kind === 'buff') {
      return move.value + Math.floor((this.dungeonDifficulty() - 1) / 3);
    }
    return Math.max(1, Math.round(move.value * this.difficultyPowerMultiplier()));
  }

  enemyAttackPerHit(enemy: EnemyState): number {
    let damage = this.enemyIntentValue(enemy) + enemy.strength;
    if (enemy.weak > 0) damage = Math.round(damage * 0.75);
    return damage;
  }

  private startCombat(kind: 'kampf' | 'elite' | 'boss') {
    const area = this.currentArea() ?? DUNGEON_AREAS[0];
    let encounterIds: string[];
    if (kind === 'boss') {
      encounterIds = this.mode() === 'campaign' && this.currentStage()?.bossEncounter
        ? this.currentStage()!.bossEncounter!
        : area.bossEncounter;
    } else if (kind === 'elite') {
      encounterIds = pick(area.eliteEncounters);
    } else {
      encounterIds = pick(area.normalEncounters);
    }
    const enemyDefs = encounterIds.map(id => ENEMIES[id]).filter(Boolean);
    this.enemies.set(enemyDefs.map(d => this.makeEnemy(d)));
    this.selectedEnemyUid.set(this.enemies()[0]?.uid ?? null);

    this.drawPile.set(shuffle(this.deck()));
    this.hand.set([]);
    this.discardPile.set([]);
    this.block.set(0);
    this.strength.set(0);
    this.playerWeak.set(0);
    this.endTurnBlock.set(0);
    this.turn.set(1);
    this.firstAttackDone.set(false);
    this.log.set([]);
    if (this.artifact()?.id === 'blutvertrag') {
      this.playerHp.set(Math.max(1, this.playerHp() - 6));
      this.strength.set(2);
      this.addLog('Blutvertrag: Leben geopfert, +2 Stärke für diesen Kampf.');
    }
    this.screen.set('combat');
    this.startPlayerTurn(true);
    this.saveRun();
  }

  private startPlayerTurn(first = false) {
    if (!first) this.turn.set(this.turn() + 1);
    let energy = this.maxEnergy();
    if (first && this.artifact()?.id === 'funkenreif') {
      energy += 1;
      this.addLog('Funkenreif: +1 Energie im ersten Zug.');
    }
    if (this.artifact()?.id === 'phasenanker' && this.turn() % 3 === 0) {
      energy += 1;
      this.addLog('Phasenanker: +1 Energie in diesem Zug.');
    }
    this.energy.set(energy);

    let startBlock = 0;
    if (this.artifact()?.id === 'schildkern') startBlock += 2;
    if (first) {
      startBlock += this.runUpgradeLevel('vorbereitung') * 3;
      if (this.artifact()?.id === 'runenpanzer') startBlock += 8;
    }
    if (this.artifact()?.id === 'seelenspiegel' && this.block() > 0) {
      const kept = Math.floor(this.block() / 2);
      if (kept > 0) {
        startBlock += kept;
        this.addLog(`Seelenspiegel: ${kept} Schild bleibt erhalten.`);
      }
    }
    this.block.set(startBlock);

    this.playedCategories.set([]);
    this.resonanceCount.set(0);
    this.cardsPlayedThisTurn.set(0);
    this.attackPlayedThisTurn.set(false);
    let draw = 5;
    if (first) {
      draw += this.runUpgradeLevel('vorausahnung');
      if (this.artifact()?.id === 'weise-feder') draw += 2;
    }
    this.drawCards(draw);
    if (this.playerWeak() > 0) this.playerWeak.set(this.playerWeak() - 1);
  }

  private drawCards(n: number) {
    const hand = [...this.hand()];
    let draw = [...this.drawPile()];
    let discard = [...this.discardPile()];
    for (let i = 0; i < n; i++) {
      if (draw.length === 0) {
        if (discard.length === 0) break;
        draw = shuffle(discard);
        discard = [];
      }
      hand.push(draw.shift()!);
    }
    this.hand.set(hand);
    this.drawPile.set(draw);
    this.discardPile.set(discard);
  }

  private addLog(msg: string) {
    this.log.set([msg, ...this.log()].slice(0, 6));
  }

  costOf(card: CardInstance): number {
    let cost = card.def.cost;
    if (
      this.artifact()?.id === 'sanduhr' &&
      this.cardsPlayedThisTurn() === 0 &&
      cost > 0
    ) {
      cost -= 1;
    }
    return cost;
  }

  canPlay(card: CardInstance): boolean {
    const needsEnemy = Boolean(card.def.damage || card.def.weakEnemy || card.def.vulnerableEnemy);
    return !card.def.unplayable
      && this.costOf(card) <= this.energy()
      && (!needsEnemy || this.aliveEnemies().length > 0);
  }

  selectEnemy(enemy: EnemyState) {
    if (enemy.hp <= 0) return;
    this.selectedEnemyUid.set(enemy.uid);
  }

  cardTargetsEnemy(card: CardInstance, enemy: EnemyState): boolean {
    return enemy.hp > 0 && (card.def.target === 'all' || this.currentTarget()?.uid === enemy.uid);
  }

  private ensureTarget() {
    if (!this.currentTarget()) {
      this.selectedEnemyUid.set(this.aliveEnemies()[0]?.uid ?? null);
    } else if (this.selectedEnemyUid() !== this.currentTarget()?.uid) {
      this.selectedEnemyUid.set(this.currentTarget()?.uid ?? null);
    }
  }

  // ---------- Schadens-/Schild-Vorschau (für Hover) ----------

  /**
   * Berechnet den tatsächlichen Schaden einer Karte gegen einen Gegner,
   * mit exakt derselben Rechenreihenfolge wie dealDamage.
   */
  previewDamage(card: CardInstance, enemy: EnemyState): { total: number; afterBlock: number } {
    const def = card.def;
    if (!def.damage) return { total: 0, afterBlock: 0 };
    const hits = def.hits ?? 1;
    let total = 0;
    let firstDone = this.firstAttackDone()
      || (def.target === 'all' && this.aliveEnemies()[0]?.uid !== enemy.uid);
    for (let h = 0; h < hits; h++) {
      let dmg = def.damage + this.strength();
      if (!firstDone) {
        dmg += this.runUpgradeLevel('klingenmeisterschaft') * 2;
        if (this.artifact()?.id === 'jaegerauge' && enemy.hp === enemy.maxHp) dmg += 6;
        firstDone = true;
      }
      if (this.artifact()?.id === 'glasherz') dmg = Math.round(dmg * 1.2);
      if (this.playerWeak() > 0) dmg = Math.round(dmg * 0.75);
      if (enemy.vulnerable > 0) dmg = Math.round(dmg * 1.5);
      total += dmg;
    }
    return { total, afterBlock: Math.max(0, total - enemy.block) };
  }

  /** Wie viel Schild eine Karte tatsächlich gibt. */
  previewBlock(card: CardInstance): number {
    return card.def.block ?? 0;
  }

  playCard(card: CardInstance) {
    if (!this.canPlay(card)) return;
    this.hoveredCard.set(null);
    const def = card.def;
    this.audio.playCard(def.type);
    this.energy.set(this.energy() - this.costOf(card));
    this.cardsPlayedThisTurn.set(this.cardsPlayedThisTurn() + 1);
    this.hand.set(this.hand().filter(c => c.uid !== card.uid));
    this.discardPile.set([...this.discardPile(), card]);

    const targets = def.target === 'all'
      ? [...this.aliveEnemies()]
      : this.currentTarget() ? [this.currentTarget()!] : [];

    if (def.damage && targets.length > 0) {
      if (!this.attackPlayedThisTurn() && this.artifact()?.id === 'vampirfang') {
        this.playerHp.set(Math.min(this.playerMaxHp(), this.playerHp() + 2));
        this.addLog('Vampirfang: Du heilst 2 Leben.');
      }
      this.attackPlayedThisTurn.set(true);
      for (const target of targets) {
        const hits = def.hits ?? 1;
        for (let h = 0; h < hits; h++) {
          this.dealDamage(target, def.damage);
        }
      }
    }
    if (def.block) this.gainBlock(def.block);
    if (def.blockPerEnemy) this.gainBlock(def.blockPerEnemy * this.aliveEnemies().length);
    if (def.draw) this.drawCards(def.draw);
    if (def.energy) this.energy.set(this.energy() + def.energy);
    if (def.heal) this.playerHp.set(Math.min(this.playerMaxHp(), this.playerHp() + def.heal));
    if (def.strength) {
      this.strength.set(this.strength() + def.strength);
      this.addLog(`${def.name}: +${def.strength} Schaden auf Angriffe.`);
    }
    if (def.endTurnBlock) {
      this.endTurnBlock.set(this.endTurnBlock() + def.endTurnBlock);
      this.addLog(`${def.name}: +${def.endTurnBlock} Schild am Zugende.`);
    }
    if (def.weakEnemy) {
      for (const target of targets) target.weak += def.weakEnemy;
      this.enemies.set([...this.enemies()]);
    }
    if (def.vulnerableEnemy) {
      for (const target of targets) target.vulnerable += def.vulnerableEnemy;
      this.enemies.set([...this.enemies()]);
    }
    if (def.selfWeak) this.playerWeak.set(this.playerWeak() + def.selfWeak);
    if (def.randomBonus) this.applyRandomBonus();

    this.trackResonance(def.category);
    this.checkCombatEnd();
    if (this.screen() === 'combat') {
      this.ensureTarget();
      this.saveRun();
    }
  }

  private applyRandomBonus() {
    const roll = Math.floor(Math.random() * 3);
    if (roll === 0) {
      this.drawCards(1);
      this.addLog('Chaoswoge: Du ziehst 1 Karte.');
    } else if (roll === 1) {
      this.gainBlock(5);
      this.addLog('Chaoswoge: Du erhältst 5 Schild.');
    } else {
      const target = this.currentTarget();
      if (target) this.dealDamage(target, 5);
      this.addLog('Chaoswoge: 5 zusätzlicher Schaden!');
    }
  }

  private maxResonancePerTurn(): number {
    return this.artifact()?.id === 'resonanzstein' ? 2 : 1;
  }

  private trackResonance(cat: Category) {
    const resonance = this.resonance();
    if (!resonance) return;
    const cats = this.playedCategories();
    if (!cats.includes(cat)) this.playedCategories.set([...cats, cat]);
    const set = new Set(this.playedCategories());
    if (set.size >= 3 && this.resonanceCount() < this.maxResonancePerTurn()) {
      this.resonanceCount.set(this.resonanceCount() + 1);
      this.playedCategories.set([]); // Kategorien zurücksetzen, damit ggf. eine neue Resonanz aufgebaut werden kann
      const echoBonus = this.runUpgradeLevel('nachhall');
      if (resonance.effect === 'draw') {
        this.drawCards(1);
        this.addLog(`✨ ${resonance.name}: Du ziehst 1 Karte.`);
      } else if (resonance.effect === 'block') {
        this.gainBlock(5 + echoBonus);
        this.addLog(`✨ ${resonance.name}: Du erhältst ${5 + echoBonus} Schild.`);
      } else if (resonance.effect === 'damage') {
        for (const e of this.aliveEnemies()) this.dealDamage(e, 6 + echoBonus, true);
        this.addLog(`✨ ${resonance.name}: ${6 + echoBonus} Schaden an allen Gegnern.`);
      } else if (resonance.effect === 'balance') {
        for (const e of this.aliveEnemies()) this.dealDamage(e, 3 + echoBonus, true);
        this.gainBlock(3 + echoBonus);
        this.addLog(`✨ ${resonance.name}: ${3 + echoBonus} Schaden an allen Gegnern und ${3 + echoBonus} Schild.`);
      } else if (resonance.effect === 'energy') {
        this.energy.set(this.energy() + 1);
        this.addLog(`✨ ${resonance.name}: +1 Energie.`);
      } else if (resonance.effect === 'echo') {
        this.drawCards(1);
        this.gainBlock(3 + echoBonus);
        this.addLog(`✨ ${resonance.name}: 1 Karte und ${3 + echoBonus} Schild.`);
      } else if (resonance.effect === 'storm') {
        for (let hit = 0; hit < 3 && this.aliveEnemies().length > 0; hit++) {
          this.dealDamage(pick(this.aliveEnemies()), 3 + echoBonus, true);
        }
        this.addLog(`✨ ${resonance.name}: 3 zufällige Treffer mit ${3 + echoBonus} Schaden.`);
      } else if (resonance.effect === 'heal') {
        this.playerHp.set(Math.min(this.playerMaxHp(), this.playerHp() + 2));
        this.addLog(`✨ ${resonance.name}: Du heilst 2 Leben.`);
      }
    }
  }

  private gainBlock(n: number) {
    this.block.set(this.block() + n);
  }

  private dealDamage(enemy: EnemyState, base: number, pure = false) {
    const wasAlive = enemy.hp > 0;
    let dmg = base;
    if (!pure) {
      dmg += this.strength();
      if (!this.firstAttackDone()) {
        const bonus = this.runUpgradeLevel('klingenmeisterschaft') * 2;
        if (bonus > 0) {
          dmg += bonus;
          this.addLog(`Klingenmeisterschaft: +${bonus} Schaden.`);
        }
        if (this.artifact()?.id === 'jaegerauge' && enemy.hp === enemy.maxHp) {
          dmg += 6;
          this.addLog('Jägerauge: +6 Schaden gegen ein unverletztes Ziel.');
        }
        this.firstAttackDone.set(true);
      }
      if (this.artifact()?.id === 'glasherz') dmg = Math.round(dmg * 1.2);
      if (this.playerWeak() > 0) dmg = Math.round(dmg * 0.75);
    }
    if (enemy.vulnerable > 0) dmg = Math.round(dmg * 1.5);

    const blocked = Math.min(enemy.block, dmg);
    const hpDamage = Math.min(enemy.hp, dmg - blocked);
    enemy.block -= blocked;
    enemy.hp = Math.max(0, enemy.hp - (dmg - blocked));
    if (wasAlive) this.audio.playEnemyHit(Math.max(1, hpDamage || blocked), hpDamage === 0);
    this.enemies.set([...this.enemies()]);
  }

  private checkCombatEnd() {
    if (this.aliveEnemies().length === 0) {
      this.onCombatWon();
    }
  }

  endTurn() {
    if (this.screen() !== 'combat') return;
    if (this.endTurnBlock() > 0) this.gainBlock(this.endTurnBlock());
    // Hand ablegen
    this.discardPile.set([...this.discardPile(), ...this.hand()]);
    this.hand.set([]);

    // Gegnerzug
    for (const enemy of this.aliveEnemies()) {
      this.executeEnemyMove(enemy);
      if (this.playerHp() <= 0) {
        this.finishRun(false);
        return;
      }
    }

    // Absichten & Buffs für die nächste Runde
    for (const enemy of this.aliveEnemies()) {
      if (enemy.vulnerable > 0) enemy.vulnerable--;
      if (enemy.weak > 0) enemy.weak--;
      enemy.moveIndex = (enemy.moveIndex + 1) % enemy.def.moves.length;
      enemy.intent = enemy.def.moves[enemy.moveIndex];
      // Vorax-Passiv: alle 3 Züge +2 Stärke
      if (enemy.def.boss && this.turn() % 3 === 0) {
        enemy.strength += 2;
        this.addLog(`${enemy.def.name} wird stärker! (+2 Stärke)`);
      }
    }
    this.enemies.set([...this.enemies()]);

    this.checkCombatEnd();
    if (this.screen() === 'combat') {
      this.ensureTarget();
      this.startPlayerTurn();
      this.saveRun();
    }
  }

  private executeEnemyMove(enemy: EnemyState) {
    const move = enemy.intent;
    const moveValue = this.enemyIntentValue(enemy);
    enemy.block = 0;
    if (move.kind === 'attack' || move.kind === 'attack_debuff') {
      const hits = move.hits ?? 1;
      for (let h = 0; h < hits; h++) {
        const dmg = this.enemyAttackPerHit(enemy);
        this.damagePlayer(dmg, enemy);
        if (this.playerHp() <= 0) return;
      }
      if (move.kind === 'attack_debuff' && move.weak) {
        this.playerWeak.set(this.playerWeak() + move.weak);
        this.addLog(`${enemy.def.name} schwächt dich (${move.weak} Schwäche).`);
      }
    } else if (move.kind === 'block') {
      enemy.block += moveValue;
    } else if (move.kind === 'buff') {
      enemy.strength += moveValue;
      this.addLog(`${enemy.def.name} verstärkt sich (+${moveValue} Stärke).`);
    }
    this.enemies.set([...this.enemies()]);
  }

  private damagePlayer(dmg: number, attacker: EnemyState) {
    const blocked = Math.min(this.block(), dmg);
    this.block.set(this.block() - blocked);
    let hpDmg = dmg - blocked;
    if (hpDmg > 0 && this.artifact()?.id === 'dornenkrone') {
      hpDmg += 1;
      this.dealDamage(attacker, 4, true);
      this.addLog('Dornenkrone: 4 Gegenschaden!');
    }
    if (hpDmg > 0) {
      this.playerHp.set(Math.max(0, this.playerHp() - hpDmg));
      this.audio.playPlayerHit(hpDmg);
    }
  }

  private onCombatWon() {
    const station = this.currentStation();
    let splitter = station.kind === 'boss' ? 60 : station.kind === 'elite' ? 30 : 15;
    if (this.mode() === 'dungeon') {
      splitter = Math.round(splitter * this.difficultyRewardMultiplier());
    }
    splitter = Math.round(splitter * (1 + this.runUpgradeLevel('pluenderer') * 0.1));

    // Bereits abgeschlossene Kampagnen-Stages geben nur halben Loot
    const stage = this.currentStage();
    if (this.mode() === 'campaign' && stage && this.stageCompleted(stage)) {
      splitter = Math.round(splitter * 0.5);
    }

    this.runSplitter.set(this.runSplitter() + splitter);
    this.rewardSplitter.set(splitter);

    if (this.artifact()?.id === 'risskelch') {
      this.playerHp.set(Math.min(this.playerMaxHp(), this.playerHp() + 4));
      this.addLog('Risskelch: Du heilst 4 Leben.');
    }

    // Zufällige, unterschiedliche Belohnungskarten
    const pool = shuffle(REWARD_POOL);
    const rewardCount = this.artifact()?.id === 'beutesack' ? 4 : 3;
    this.rewardCards.set(pool.slice(0, rewardCount).map(id => CARDS[id]));
    this.screen.set('reward');
    this.saveRun();
  }

  takeReward(def: CardDef | null) {
    if (def) {
      this.deck.set([...this.deck(), this.makeCard(def)]);
    }
    this.completeStation();
  }

  backToTitle() {
    this.screen.set('title');
  }
}
