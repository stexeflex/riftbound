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
import { GameDeckService } from './game-deck.service';
import { DIFFICULTY_KEY, RUN_KEY } from './game-meta.service';
import { clampDifficulty } from './game.utils';

/** Run-Speicherstand, Dungeon-Karte und Kampagnenfortschritt. */
export abstract class GameRunService extends GameDeckService {
  protected abstract buildCombatSave(): CombatSave | null;
  protected abstract restoreCombat(combat: CombatSave): void;
  protected abstract startCombat(kind: 'kampf' | 'elite' | 'boss'): void;

  // ================= Run speichern / fortsetzen =================

  protected override saveRun() {
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
    return 1 + (clampDifficulty(level) - 1) * 0.45;
  }

  difficultyPowerMultiplier(level = this.dungeonDifficulty()): number {
    return 1 + (clampDifficulty(level) - 1) * 0.3;
  }

  difficultyRewardMultiplier(level = this.dungeonDifficulty()): number {
    return 1 + (clampDifficulty(level) - 1) * 0.45;
  }

  /**
   * Kampagnen-Skalierung als Dungeon-Vergleichswert.
   * Stage 1 startet bei Schwierigkeit 1, Stage 5 entspricht exakt Schwierigkeit 10.
   * Danach steigt die Kampagne kontrolliert über den höchsten Dungeon-Wert hinaus.
   */
  campaignEquivalentDifficulty(stage: CampaignStage | null = this.currentStage()): number {
    if (!stage) return 1;
    const stageNumber = Math.max(1, CAMPAIGN_STAGES.indexOf(stage) + 1);
    return stageNumber <= 5
      ? 1 + (stageNumber - 1) * 2.25
      : 10 + (stageNumber - 5) * 0.75;
  }

  campaignHpMultiplier(stage: CampaignStage | null = this.currentStage()): number {
    return 1 + (this.campaignEquivalentDifficulty(stage) - 1) * 0.45;
  }

  campaignPowerMultiplier(stage: CampaignStage | null = this.currentStage()): number {
    return 1 + (this.campaignEquivalentDifficulty(stage) - 1) * 0.3;
  }

  campaignHpBonus(stage: CampaignStage): number {
    return Math.round((this.campaignHpMultiplier(stage) - 1) * 100);
  }

  campaignPowerBonus(stage: CampaignStage): number {
    return Math.round((this.campaignPowerMultiplier(stage) - 1) * 100);
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

  // Alle Gebiete sind von Anfang an frei wählbar.
  areaUnlocked(_area: DungeonArea): boolean {
    return true;
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

  protected completeStation() {
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

  giveUpRun() {
    if (!['map', 'combat', 'reward', 'rest'].includes(this.screen())) return;
    this.giveUpConfirmationOpen.set(false);
    this.finishRun(false, true);
  }

  protected finishRun(won: boolean, surrendered = false) {
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
    this.endSurrendered.set(surrendered);
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

}


