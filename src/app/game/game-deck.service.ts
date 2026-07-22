import { computed, inject, signal } from '@angular/core';
import { AudioService } from '../audio.service';
import {
  AllyDef, AllyFormationSlot, AllyPosition, ArtifactDef, CampaignStage, CardDef, CardInstance, CardSort, Category, CombatSave,
  DeckLayout, DungeonArea, EnemyDef, EnemyState, GameMode, MetaState, RunSave, Screen,
  Station, StationKind, ResonanceDef,
} from './models';
import {
  ALLIES, ARTIFACTS, CAMPAIGN_STAGES, CARDS, DECK_MAX, DECK_MIN, DUNGEON_AREAS, ENEMIES,
  MAX_ALLIES,
  MAX_CARD_COPIES, META_UPGRADES, REWARD_POOL, STARTER_COLLECTION, STARTER_DECK,
  RESONANCES,
} from './data';
import { legacyLoad, secureLoad, secureRemove, secureSave } from './storage';
import { BASE_HP, GameMetaService } from './game-meta.service';

/** Kartensammlung und dauerhaft gespeicherte Ausrüstungs-Layouts. */
export abstract class GameDeckService extends GameMetaService {
  protected abstract makeCard(def: CardDef): CardInstance;
  protected abstract saveRun(): void;

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

  protected prefillDeckSelection(layoutId = this.meta().activeDeckLayoutId) {
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

  layoutAllyFormation(layout: DeckLayout | undefined = this.activeDeckLayout()): AllyFormationSlot[] {
    return layout?.allyFormation ?? [];
  }

  layoutAllies(layout: DeckLayout | undefined = this.activeDeckLayout()): AllyDef[] {
    return this.layoutAllyFormation(layout)
      .map(slot => ALLIES[slot.allyId])
      .filter(Boolean);
  }

  allyById(id: string): AllyDef | null {
    return ALLIES[id] ?? null;
  }

  layoutAllyPosition(allyId: string): AllyPosition | null {
    return this.layoutAllyFormation().find(slot => slot.allyId === allyId)?.position ?? null;
  }

  canEquipLayoutAlly(allyId: string): boolean {
    return this.ownsAlly(allyId) && (
      this.layoutAllyPosition(allyId) !== null
      || this.layoutAllyFormation().length < MAX_ALLIES
    );
  }

  toggleLayoutAlly(allyId: string) {
    if (!this.ownsAlly(allyId)) return;
    const formation = this.layoutAllyFormation();
    const equipped = formation.some(slot => slot.allyId === allyId);
    if (!equipped && formation.length >= MAX_ALLIES) return;
    this.updateActiveLayout({
      allyFormation: equipped
        ? formation.filter(slot => slot.allyId !== allyId)
        : [...formation, { allyId, position: 'front' }],
    });
  }

  setLayoutAllyPosition(allyId: string, position: AllyPosition) {
    const formation = this.layoutAllyFormation();
    const slot = formation.find(item => item.allyId === allyId);
    if (!slot || slot.position === position) return;
    const changed = formation.map(item => item.allyId === allyId ? { ...item, position } : item);
    this.updateActiveLayout({
      allyFormation: [
        ...changed.filter(item => item.position === 'back'),
        ...changed.filter(item => item.position === 'front'),
      ],
    });
  }

  moveLayoutAlly(allyId: string, direction: 'back' | 'front') {
    const formation = [...this.layoutAllyFormation()];
    const index = formation.findIndex(slot => slot.allyId === allyId);
    if (index < 0) return;
    const neighbourIndex = direction === 'back' ? index - 1 : index + 1;
    const neighbour = formation[neighbourIndex];
    if (!neighbour || neighbour.position !== formation[index].position) return;
    [formation[index], formation[neighbourIndex]] = [formation[neighbourIndex], formation[index]];
    this.updateActiveLayout({ allyFormation: formation });
  }

  canMoveLayoutAlly(allyId: string, direction: 'back' | 'front'): boolean {
    const formation = this.layoutAllyFormation();
    const index = formation.findIndex(slot => slot.allyId === allyId);
    if (index < 0) return false;
    const neighbour = formation[direction === 'back' ? index - 1 : index + 1];
    return Boolean(neighbour && neighbour.position === formation[index].position);
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
    // Neue Käufe werden direkt im aktiven Layout ausgerüstet.
    this.meta.set({
      ...m,
      splitter: m.splitter - r.costSplitter,
      resonances: [...m.resonances, r.id],
      deckLayouts: m.deckLayouts.map(layout =>
        layout.id === m.activeDeckLayoutId ? { ...layout, resonanceId: r.id } : layout,
      ),
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
    this.runAllyFormation.set(
      (layout?.allyFormation ?? [])
        .filter(slot => this.ownsAlly(slot.allyId) && ALLIES[slot.allyId])
        .slice(0, MAX_ALLIES)
        .map(slot => ({ ...slot })),
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

}



