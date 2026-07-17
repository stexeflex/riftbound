import { Injectable, computed, signal } from '@angular/core';
import {
  ArtifactDef, CampaignStage, CardDef, CardInstance, Category, EnemyDef,
  EnemyState, GameMode, MetaState, RunSave, Screen, Station, StationKind,
} from './models';
import {
  ARTIFACTS, CAMPAIGN_STAGES, CARDS, ELITE_POOL, ENEMIES, META_UPGRADES,
  NORMAL_POOL, REWARD_POOL, STARTER_DECK,
} from './data';
import { legacyLoad, secureLoad, secureRemove, secureSave } from './storage';

const META_KEY = 'riftbound-meta-v2';
const LEGACY_META_KEY = 'riftbound-meta-v1';
const RUN_KEY = 'riftbound-run-v1';
const BASE_HP = 80;

const DUNGEON_STATIONS: StationKind[] = [
  'kampf', 'kampf', 'elite', 'rast', 'kampf', 'kampf', 'elite', 'rast', 'boss',
];

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

@Injectable({ providedIn: 'root' })
export class GameService {
  private nextUid = 1;

  // ---------- Meta (bleibt über Runs erhalten) ----------
  readonly meta = signal<MetaState>(this.loadMeta());
  readonly metaUpgrades = META_UPGRADES;
  readonly allArtifacts = ARTIFACTS;
  readonly campaignStages = CAMPAIGN_STAGES;

  // ---------- Bildschirm & Modus ----------
  readonly screen = signal<Screen>('title');
  readonly mode = signal<GameMode>('dungeon');
  readonly currentStage = signal<CampaignStage | null>(null);
  readonly hasRunSave = signal<boolean>(secureLoad<RunSave>(RUN_KEY) !== null);

  // ---------- Run ----------
  readonly artifact = signal<ArtifactDef | null>(null);
  readonly stations = signal<Station[]>([]);
  readonly stationIndex = signal(0);
  readonly deck = signal<CardInstance[]>([]);
  readonly playerMaxHp = signal(BASE_HP);
  readonly playerHp = signal(BASE_HP);
  readonly runSplitter = signal(0);

  // ---------- Kampf ----------
  readonly enemies = signal<EnemyState[]>([]);
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

  // ---------- Belohnung / Run-Ende ----------
  readonly rewardCards = signal<CardDef[]>([]);
  readonly rewardSplitter = signal(0);
  readonly endSplitter = signal(0);
  readonly endKerne = signal(0);
  readonly endFirstClear = signal(false);

  readonly aliveEnemies = computed(() => this.enemies().filter(e => e.hp > 0));
  readonly currentStation = computed(() => this.stations()[this.stationIndex()]);
  readonly ownedArtifacts = computed(() =>
    ARTIFACTS.filter(a => this.meta().artifacts.includes(a.id)),
  );

  // ================= Meta =================

  private normalizeMeta(m: Partial<MetaState> | null): MetaState {
    const artifacts = Array.isArray(m?.artifacts) ? m.artifacts : [];
    for (const a of ARTIFACTS) {
      if (a.starter && !artifacts.includes(a.id)) artifacts.push(a.id);
    }
    return {
      splitter: m?.splitter ?? 0,
      kerne: m?.kerne ?? 0,
      upgrades: m?.upgrades ?? {},
      wins: m?.wins ?? 0,
      runs: m?.runs ?? 0,
      artifacts,
      completedStages: Array.isArray(m?.completedStages) ? m.completedStages : [],
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

  // ================= Run speichern / fortsetzen =================

  private saveRun() {
    const save: RunSave = {
      mode: this.mode(),
      stageId: this.currentStage()?.id ?? null,
      artifactId: this.artifact()?.id ?? null,
      deckIds: this.deck().map(c => c.def.id),
      hp: this.playerHp(),
      maxHp: this.playerMaxHp(),
      stationIndex: this.stationIndex(),
      stations: this.stations(),
      runSplitter: this.runSplitter(),
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
    this.currentStage.set(
      save.stageId ? CAMPAIGN_STAGES.find(s => s.id === save.stageId) ?? null : null,
    );
    this.artifact.set(ARTIFACTS.find(a => a.id === save.artifactId) ?? null);
    this.deck.set(
      save.deckIds.filter(id => CARDS[id]).map(id => this.makeCard(CARDS[id])),
    );
    this.playerMaxHp.set(save.maxHp);
    this.playerHp.set(save.hp);
    this.stationIndex.set(save.stationIndex);
    this.stations.set(save.stations);
    this.runSplitter.set(save.runSplitter);
    this.screen.set('map');
  }

  // ================= Run-Ablauf =================

  goTo(screen: Screen) {
    this.screen.set(screen);
  }

  startNewRun() {
    this.mode.set('dungeon');
    this.currentStage.set(null);
    this.artifact.set(null);
    this.screen.set('artifact');
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
    this.artifact.set(null);
    this.screen.set('artifact');
  }

  chooseArtifact(a: ArtifactDef) {
    this.artifact.set(a);

    let maxHp = BASE_HP + this.upgradeLevel('leben') * 2;
    if (a.id === 'glasherz') maxHp = Math.round(maxHp * 0.8);
    this.playerMaxHp.set(maxHp);
    this.playerHp.set(maxHp);

    this.deck.set(STARTER_DECK.map(id => this.makeCard(CARDS[id])));

    const kinds = this.mode() === 'campaign'
      ? this.currentStage()!.stations
      : DUNGEON_STATIONS;
    this.stations.set(kinds.map(kind => ({ kind, done: false })));
    this.stationIndex.set(0);
    this.runSplitter.set(0);

    const m = this.meta();
    this.meta.set({ ...m, runs: m.runs + 1 });
    this.saveMeta();
    this.saveRun();
    this.screen.set('map');
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
    const bonus = 1 + this.upgradeLevel('heilung') * 0.05;
    const blutvertrag = this.artifact()?.id === 'blutvertrag' ? 0.7 : 1;
    const heal = Math.round(this.playerMaxHp() * 0.3 * bonus * blutvertrag);
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
    let firstClear = false;

    if (won) {
      if (this.mode() === 'dungeon') {
        earned += 100;
        kerne = 1;
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
    });
    this.saveMeta();
    this.screen.set(won ? 'victory' : 'defeat');
  }

  // ================= Kampf =================

  private makeCard(def: CardDef): CardInstance {
    return { uid: this.nextUid++, def };
  }

  private makeEnemy(def: EnemyDef): EnemyState {
    return {
      def,
      hp: def.maxHp,
      maxHp: def.maxHp,
      block: 0,
      strength: 0,
      weak: 0,
      vulnerable: 0,
      moveIndex: 0,
      intent: def.moves[0],
    };
  }

  private startCombat(kind: 'kampf' | 'elite' | 'boss') {
    let enemyDefs: EnemyDef[];
    if (kind === 'boss') {
      enemyDefs = [ENEMIES['vorax']];
    } else if (kind === 'elite') {
      enemyDefs = [ENEMIES[pick(ELITE_POOL)]];
    } else {
      enemyDefs = [ENEMIES[pick(NORMAL_POOL)]];
    }
    this.enemies.set(enemyDefs.map(d => this.makeEnemy(d)));

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
    this.screen.set('combat');
    this.startPlayerTurn(true);
  }

  private startPlayerTurn(first = false) {
    if (!first) this.turn.set(this.turn() + 1);
    let energy = this.maxEnergy();
    if (this.artifact()?.id === 'phasenanker' && this.turn() % 3 === 0) {
      energy += 1;
      this.addLog('Phasenanker: +1 Energie in diesem Zug.');
    }
    this.energy.set(energy);

    let startBlock = 0;
    if (this.artifact()?.id === 'schildkern') startBlock += 2;
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
    this.drawCards(5);
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
    return !card.def.unplayable && this.costOf(card) <= this.energy();
  }

  playCard(card: CardInstance) {
    if (!this.canPlay(card)) return;
    const def = card.def;
    this.energy.set(this.energy() - this.costOf(card));
    this.cardsPlayedThisTurn.set(this.cardsPlayedThisTurn() + 1);
    this.hand.set(this.hand().filter(c => c.uid !== card.uid));
    this.discardPile.set([...this.discardPile(), card]);

    const target = this.aliveEnemies()[0];

    if (def.damage && target) {
      if (!this.attackPlayedThisTurn() && this.artifact()?.id === 'vampirfang') {
        this.playerHp.set(Math.min(this.playerMaxHp(), this.playerHp() + 2));
        this.addLog('Vampirfang: Du heilst 2 Leben.');
      }
      this.attackPlayedThisTurn.set(true);
      const hits = def.hits ?? 1;
      for (let h = 0; h < hits; h++) {
        this.dealDamage(target, def.damage);
      }
    }
    if (def.block) this.gainBlock(def.block);
    if (def.draw) this.drawCards(def.draw);
    if (def.strength) {
      this.strength.set(this.strength() + def.strength);
      this.addLog(`Präzision: +${def.strength} Schaden auf Angriffe.`);
    }
    if (def.endTurnBlock) {
      this.endTurnBlock.set(this.endTurnBlock() + def.endTurnBlock);
      this.addLog(`Eiserne Haut: +${def.endTurnBlock} Schild am Zugende.`);
    }
    if (def.weakEnemy && target) {
      target.weak += def.weakEnemy;
      this.enemies.set([...this.enemies()]);
    }
    if (def.vulnerableEnemy && target) {
      target.vulnerable += def.vulnerableEnemy;
      this.enemies.set([...this.enemies()]);
    }
    if (def.selfWeak) this.playerWeak.set(this.playerWeak() + def.selfWeak);
    if (def.randomBonus) this.applyRandomBonus();

    this.trackResonance(def.category);
    this.checkCombatEnd();
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
      const target = this.aliveEnemies()[0];
      if (target) this.dealDamage(target, 5);
      this.addLog('Chaoswoge: 5 zusätzlicher Schaden!');
    }
  }

  private maxResonancePerTurn(): number {
    return this.artifact()?.id === 'resonanzstein' ? 2 : 1;
  }

  private trackResonance(cat: Category) {
    const cats = this.playedCategories();
    if (!cats.includes(cat)) this.playedCategories.set([...cats, cat]);
    const set = new Set(this.playedCategories());
    if (set.size >= 3 && this.resonanceCount() < this.maxResonancePerTurn()) {
      this.resonanceCount.set(this.resonanceCount() + 1);
      this.playedCategories.set([]); // Kategorien zurücksetzen, damit ggf. eine neue Resonanz aufgebaut werden kann
      // Resonanz: Effekt hängt von den gespielten Kategorien ab
      if (set.has('Kraft') && set.has('Schutz') && set.has('Kontrolle')) {
        this.drawCards(1);
        this.addLog('✨ Resonanz! Du ziehst 1 Karte.');
      } else if (set.has('Schutz') && set.has('Kontrolle') && set.has('Chaos')) {
        this.gainBlock(5);
        this.addLog('✨ Resonanz! Du erhältst 5 Schild.');
      } else if (set.has('Kraft') && set.has('Kontrolle') && set.has('Chaos')) {
        for (const e of this.aliveEnemies()) this.dealDamage(e, 6, true);
        this.addLog('✨ Resonanz! 6 Schaden an allen Gegnern.');
      } else {
        for (const e of this.aliveEnemies()) this.dealDamage(e, 3, true);
        this.gainBlock(3);
        this.addLog('✨ Resonanz! 3 Schaden und 3 Schild.');
      }
    }
  }

  private gainBlock(n: number) {
    this.block.set(this.block() + n);
  }

  private dealDamage(enemy: EnemyState, base: number, pure = false) {
    let dmg = base;
    if (!pure) {
      dmg += this.strength();
      if (!this.firstAttackDone()) {
        const bonus = this.upgradeLevel('klingenmeisterschaft') * 2;
        if (bonus > 0) {
          dmg += bonus;
          this.addLog(`Klingenmeisterschaft: +${bonus} Schaden.`);
        }
        this.firstAttackDone.set(true);
      }
      if (this.artifact()?.id === 'glasherz') dmg = Math.round(dmg * 1.2);
      if (this.playerWeak() > 0) dmg = Math.round(dmg * 0.75);
    }
    if (enemy.vulnerable > 0) dmg = Math.round(dmg * 1.5);

    const blocked = Math.min(enemy.block, dmg);
    enemy.block -= blocked;
    enemy.hp = Math.max(0, enemy.hp - (dmg - blocked));
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
    if (this.screen() === 'combat') this.startPlayerTurn();
  }

  private executeEnemyMove(enemy: EnemyState) {
    const move = enemy.intent;
    enemy.block = 0;
    if (move.kind === 'attack' || move.kind === 'attack_debuff') {
      const hits = move.hits ?? 1;
      for (let h = 0; h < hits; h++) {
        let dmg = move.value + enemy.strength;
        if (enemy.weak > 0) dmg = Math.round(dmg * 0.75);
        this.damagePlayer(dmg, enemy);
        if (this.playerHp() <= 0) return;
      }
      if (move.kind === 'attack_debuff' && move.weak) {
        this.playerWeak.set(this.playerWeak() + move.weak);
        this.addLog(`${enemy.def.name} schwächt dich (${move.weak} Schwäche).`);
      }
    } else if (move.kind === 'block') {
      enemy.block += move.value;
    } else if (move.kind === 'buff') {
      enemy.strength += move.value;
      this.addLog(`${enemy.def.name} verstärkt sich (+${move.value} Stärke).`);
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
    }
  }

  private onCombatWon() {
    const station = this.currentStation();
    let splitter = station.kind === 'boss' ? 60 : station.kind === 'elite' ? 30 : 15;

    if (station.kind === 'elite' && this.artifact()?.id === 'blutvertrag') {
      splitter *= 2;
      const newMax = this.playerMaxHp() + 5;
      this.playerMaxHp.set(newMax);
      this.playerHp.set(Math.min(newMax, this.playerHp() + 5));
    }

    // Bereits abgeschlossene Kampagnen-Stages geben nur halben Loot
    const stage = this.currentStage();
    if (this.mode() === 'campaign' && stage && this.stageCompleted(stage)) {
      splitter = Math.round(splitter * 0.5);
    }

    this.runSplitter.set(this.runSplitter() + splitter);
    this.rewardSplitter.set(splitter);

    // 3 zufällige, unterschiedliche Belohnungskarten
    const pool = shuffle(REWARD_POOL);
    this.rewardCards.set(pool.slice(0, 3).map(id => CARDS[id]));
    this.screen.set('reward');
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
