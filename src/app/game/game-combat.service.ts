import { computed, inject, signal } from '@angular/core';
import { AudioService } from '../audio.service';
import {
  AllyDef, AllyState, ArtifactDef, CampaignStage, CardDef, CardInstance, CardSort, Category, CombatSave,
  DeckLayout, DungeonArea, EnemyDef, EnemyState, GameMode, MetaState, RunSave, Screen,
  Station, StationKind, ResonanceDef,
} from './models';
import {
  ALLIES, ARTIFACTS, CAMPAIGN_STAGES, CARDS, DECK_MAX, DECK_MIN, DUNGEON_AREAS, ENEMIES,
  MAX_CARD_COPIES, META_UPGRADES, REWARD_POOL, STARTER_COLLECTION, STARTER_DECK,
  RESONANCES, MAX_ALLIES,
} from './data';
import { legacyLoad, secureLoad, secureRemove, secureSave } from './storage';
import { GameRunService } from './game-run.service';
import { createRandomSeed, nextSeededRandom, pick, shuffle } from './game.utils';

/** Vollständige Kampfauflösung einschließlich Karten-, Gegner- und Belohnungslogik. */
export abstract class GameCombatService extends GameRunService {
  protected override buildCombatSave(): CombatSave | null {
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
      startTurnBlock: this.startTurnBlock(),
      veil: this.veil(),
      reflection: this.reflection(),
      blockCarryover: this.blockCarryover(),
      allies: this.livingAllies().map(ally => ({
        id: ally.def.id,
        hp: ally.hp,
        turnsRemaining: ally.turnsRemaining,
      })),
      turn: this.turn(),
      playedCategories: this.playedCategories(),
      resonanceCount: this.resonanceCount(),
      firstAttackDone: this.firstAttackDone(),
      attackPlayedThisTurn: this.attackPlayedThisTurn(),
      cardsPlayedThisTurn: this.cardsPlayedThisTurn(),
      sanduhrUsed: this.sanduhrUsedThisTurn(),
      zeitbruchArmed: this.zeitbruchArmed(),
      targetIndex: Math.max(0, this.enemies().findIndex(e => e.uid === this.currentTarget()?.uid)),
      rngState: this.combatRngState,
    };
  }

  protected override restoreCombat(c: CombatSave) {
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
    this.startTurnBlock.set(c.startTurnBlock ?? c.endTurnBlock ?? 0);
    this.veil.set(c.veil ?? 0);
    this.reflection.set(c.reflection ?? 0);
    this.blockCarryover.set(c.blockCarryover ?? 0);
    this.allies.set((c.allies ?? [])
      .filter(ally => ALLIES[ally.id] && ally.hp > 0)
      .slice(0, MAX_ALLIES)
      .map(ally => this.makeAlly(
        ALLIES[ally.id],
        ally.hp,
        ally.turnsRemaining,
      )));
    this.turn.set(c.turn);
    this.playedCategories.set(c.playedCategories);
    this.resonanceCount.set(c.resonanceCount);
    this.firstAttackDone.set(c.firstAttackDone);
    this.attackPlayedThisTurn.set(c.attackPlayedThisTurn);
    this.cardsPlayedThisTurn.set(c.cardsPlayedThisTurn);
    this.sanduhrUsedThisTurn.set(c.sanduhrUsed ?? false);
    this.zeitbruchArmed.set(c.zeitbruchArmed ?? false);
    this.combatRngState = typeof c.rngState === 'number' && Number.isFinite(c.rngState)
      ? (c.rngState >>> 0)
      : createRandomSeed();
    this.log.set([]);
    this.screen.set('combat');
    this.audio.startCombatMusic(
      (this.currentArea() ?? DUNGEON_AREAS[0]).theme,
    );
  }

  // ================= Kampf =================

  protected override makeCard(def: CardDef): CardInstance {
    return { uid: this.nextUid++, def };
  }

  private makeAlly(
    def: AllyDef,
    hp = def.maxHp,
    turnsRemaining: number | null = def.duration ?? null,
  ): AllyState {
    return {
      uid: this.nextAllyUid++,
      def,
      hp: Math.min(def.maxHp, Math.max(1, hp)),
      turnsRemaining,
    };
  }


  private makeEnemy(def: EnemyDef): EnemyState {
    const hpMultiplier = this.mode() === 'dungeon'
      ? this.difficultyHpMultiplier()
      : this.campaignHpMultiplier();
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

  private nextCombatRandom(): number {
    const result = nextSeededRandom(this.combatRngState);
    this.combatRngState = result.state;
    return result.value;
  }

  private shuffleCombat<T>(values: T[]): T[] {
    return shuffle(values, () => this.nextCombatRandom());
  }

  private pickCombat<T>(values: T[]): T {
    return pick(values, () => this.nextCombatRandom());
  }

  enemyIntentValue(enemy: EnemyState): number {
    const move = enemy.intent;
    const equivalentDifficulty = this.mode() === 'dungeon'
      ? this.dungeonDifficulty()
      : this.campaignEquivalentDifficulty();
    const powerMultiplier = this.mode() === 'dungeon'
      ? this.difficultyPowerMultiplier()
      : this.campaignPowerMultiplier();
    if (move.kind === 'buff') {
      return move.value + Math.floor((equivalentDifficulty - 1) * 1.5);
    }
    return Math.max(1, Math.round(move.value * powerMultiplier));
  }

  enemyAttackPerHit(enemy: EnemyState): number {
    let damage = this.enemyIntentValue(enemy) + enemy.strength;
    if (enemy.weak > 0) damage = Math.round(damage * 0.75);
    return damage;
  }

  protected override startCombat(kind: 'kampf' | 'elite' | 'boss') {
    const area = this.currentArea() ?? DUNGEON_AREAS[0];
    this.combatRngState = createRandomSeed();
    let encounterIds: string[];
    if (kind === 'boss') {
      encounterIds = this.mode() === 'campaign' && this.currentStage()?.bossEncounter
        ? this.currentStage()!.bossEncounter!
        : area.bossEncounter;
    } else if (kind === 'elite') {
      encounterIds = this.pickCombat(area.eliteEncounters);
    } else {
      encounterIds = this.pickCombat(area.normalEncounters);
    }
    const enemyDefs = encounterIds.map(id => ENEMIES[id]).filter(Boolean);
    this.enemies.set(enemyDefs.map(d => this.makeEnemy(d)));
    this.selectedEnemyUid.set(this.enemies()[0]?.uid ?? null);

    this.drawPile.set(this.shuffleCombat(this.deck()));
    this.hand.set([]);
    this.discardPile.set([]);
    this.block.set(0);
    this.strength.set(0);
    this.playerWeak.set(0);
    this.startTurnBlock.set(0);
    this.veil.set(0);
    this.reflection.set(0);
    this.blockCarryover.set(0);
    this.allies.set([]);
    this.turn.set(1);
    this.firstAttackDone.set(false);
    this.log.set([]);
    this.combatUndoStack.set([]);
    if (this.artifact()?.id === 'blutvertrag') {
      this.playerHp.set(Math.max(1, this.playerHp() - 6));
      this.strength.set(3);
      this.addLog('Blutvertrag: Leben geopfert, +3 Stärke für diesen Kampf.');
    }
    this.screen.set('combat');
    this.audio.startCombatMusic(area.theme);
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

    const previousBlock = this.block();
    let startBlock = 0;
    if (this.artifact()?.id === 'schildkern') startBlock += 3;
    startBlock += this.runUpgradeLevel('schildfluss');
    if (first) {
      startBlock += this.runUpgradeLevel('vorbereitung') * 5;
      if (this.artifact()?.id === 'runenpanzer') startBlock += 40;
    }
    let retainedBlock = 0;
    if (!first && this.artifact()?.id === 'seelenspiegel' && previousBlock > 0) {
      const kept = Math.floor(previousBlock / 2);
      if (kept > 0) {
        retainedBlock += kept;
        this.addLog(`Seelenspiegel: ${kept} Schild bleibt erhalten.`);
      }
    }
    if (!first && this.blockCarryover() > 0 && previousBlock > retainedBlock) {
      const kept = Math.min(this.blockCarryover(), previousBlock - retainedBlock);
      retainedBlock += kept;
      this.addLog(`Schildanker: ${kept} Schild wird übertragen.`);
    }
    this.blockCarryover.set(0);
    startBlock += retainedBlock;
    if (this.startTurnBlock() > 0) {
      startBlock += this.startTurnBlock();
      this.addLog(`Macht-Effekt: +${this.startTurnBlock()} Schild am Zuganfang.`);
    }
    this.block.set(startBlock);

    this.playedCategories.set([]);
    this.resonanceCount.set(0);

    this.cardsPlayedThisTurn.set(0);
    this.sanduhrUsedThisTurn.set(false);
    this.zeitbruchArmed.set(false);
    this.attackPlayedThisTurn.set(false);
    this.triggerAlliesAtStartTurn();
    if (this.screen() !== 'combat') return;
    let draw = 5;
    if (first) {
      draw += this.runUpgradeLevel('vorausahnung');
      if (this.artifact()?.id === 'weise-feder') draw += 2;
    }
    this.drawCards(draw);
    if (this.playerWeak() > 0) this.playerWeak.set(this.playerWeak() - 1);
  }

  private triggerAlliesAtStartTurn() {
    const remaining: AllyState[] = [];
    for (const ally of this.livingAllies()) {
      if (ally.def.startTurnDamage && this.aliveEnemies().length > 0) {
        const target = this.pickCombat(this.aliveEnemies());
        this.dealDamage(target, ally.def.startTurnDamage, true);
        this.addLog(`${ally.def.name}: ${ally.def.startTurnDamage} Schaden an ${target.def.name}.`);
      }

      if (ally.turnsRemaining === null) {
        remaining.push(ally);
        continue;
      }

      ally.turnsRemaining -= 1;
      if (ally.turnsRemaining > 0) {
        remaining.push(ally);
      } else {
        this.addLog(`${ally.def.name} kehrt in den Riss zurück.`);
      }
    }
    this.allies.set(remaining);
    this.checkCombatEnd();
  }

  private drawCards(n: number) {
    const hand = [...this.hand()];
    let draw = [...this.drawPile()];
    let discard = [...this.discardPile()];

    for (let i = 0; i < n; i++) {
      if (draw.length === 0) {
        if (discard.length === 0) break;
        draw = this.shuffleCombat(discard);
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
      !this.sanduhrUsedThisTurn() &&
      cost >= 3
    ) {
      cost -= 1;
    }
    return cost;
  }

  canPlay(card: CardInstance): boolean {
    const def = card.def;
    const needsEnemy = Boolean(
      def.damage || def.weakEnemy || def.vulnerableEnemy || def.purgeEnemyBuffs,
    );
    const summonBlocked = Boolean(def.summonAlly) && (
      !ALLIES[def.summonAlly!]
      || this.livingAllies().length >= MAX_ALLIES
      || this.livingAllies().some(ally => ally.def.id === def.summonAlly)
    );
    return !card.def.unplayable
      && this.costOf(card) <= this.energy()
      && (!needsEnemy || this.aliveEnemies().length > 0)
      && !summonBlocked;
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
    const firstAttackCard = !this.firstAttackDone();
    // Klingenmeisterschaft trifft nur den ersten Treffer des ersten Ziels,
    // Jägerauge verdoppelt beim ersten Angriff gegen jedes Ziel mit vollen Leben.
    const klingenTarget = def.target !== 'all' || this.aliveEnemies()[0]?.uid === enemy.uid;
    for (let h = 0; h < hits; h++) {
      let dmg = def.damage + (def.damagePerAlly ?? 0) * this.livingAllies().length + this.strength();
      if (firstAttackCard && h === 0) {
        if (klingenTarget) dmg += this.runUpgradeLevel('klingenmeisterschaft') * 2;
        if (this.artifact()?.id === 'jaegerauge' && enemy.hp === enemy.maxHp) dmg *= 2;
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
    this.pushUndoSnapshot();
    this.hoveredCard.set(null);
    // Wurde Zeitbruch vor dieser Karte ausgelöst, beendet diese Karte den Zug.
    const zeitbruchEndsTurn = this.zeitbruchArmed();
    const def = card.def;
    this.audio.playCard(def.type);
    this.energy.set(this.energy() - this.costOf(card));
    if (this.artifact()?.id === 'sanduhr' && !this.sanduhrUsedThisTurn() && def.cost >= 3) {
      this.sanduhrUsedThisTurn.set(true);
      this.addLog('Gebrochene Sanduhr: 1 Energie gespart.');
    }
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
      const firstAttackCard = !this.firstAttackDone();
      let klingenAvailable = firstAttackCard;
      for (const target of targets) {
        const hits = def.hits ?? 1;
        for (let h = 0; h < hits; h++) {
          this.dealDamage(
            target,
            def.damage + (def.damagePerAlly ?? 0) * this.livingAllies().length,
            false,
            {
              klingen: klingenAvailable,
              jaeger: firstAttackCard && h === 0,
            },
          );
          klingenAvailable = false;
        }
      }
      if (firstAttackCard) this.firstAttackDone.set(true);
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
    if (def.startTurnBlock) {
      this.startTurnBlock.set(this.startTurnBlock() + def.startTurnBlock);
      this.addLog(`${def.name}: +${def.startTurnBlock} Schild am Anfang des nächsten Zuges.`);
    }
    if (def.veil) {
      this.veil.set(this.veil() + def.veil);
      this.addLog(`${def.name}: ${def.veil} Verschleierung.`);
    }
    if (def.reflection) {
      this.reflection.set(this.reflection() + def.reflection);
      this.addLog(`${def.name}: ${def.reflection} Schaden sind zur Reflektion bereit.`);
    }
    if (def.retainBlock) {
      this.blockCarryover.set(this.blockCarryover() + def.retainBlock);
      this.addLog(`${def.name}: Bis zu ${def.retainBlock} Restschild werden übertragen.`);
    }
    if (def.weakEnemy) {
      for (const target of targets) target.weak += def.weakEnemy;
      this.enemies.set([...this.enemies()]);
    }
    if (def.vulnerableEnemy) {
      for (const target of targets) target.vulnerable += def.vulnerableEnemy;
      this.enemies.set([...this.enemies()]);
    }
    if (def.purgeEnemyBuffs) {
      for (const target of targets) this.purgeEnemyBuffs(target, def.purgeEnemyBuffs, def.name);
    }
    if (def.summonAlly) this.summonAlly(def.summonAlly, def.name);
    if (def.selfWeak) this.playerWeak.set(this.playerWeak() + def.selfWeak);
    if (def.randomBonus) this.applyRandomBonus(def.name);

    this.trackResonance(def.category);
    this.checkCombatEnd();
    if (this.screen() === 'combat') {
      this.ensureTarget();
      if (zeitbruchEndsTurn) {
        this.zeitbruchArmed.set(false);
        this.addLog('⏱️ Zeitbruch: Dein Zug endet sofort.');
        this.endTurn();
        return;
      }
      this.saveRun();
    }
  }

  private applyRandomBonus(sourceName: string) {
    const roll = Math.floor(this.nextCombatRandom() * 3);
    if (roll === 0) {
      this.drawCards(1);
      this.addLog(`${sourceName}: Du ziehst 1 Karte.`);
    } else if (roll === 1) {
      this.gainBlock(5);
      this.addLog(`${sourceName}: Du erhältst 5 Schild.`);
    } else {
      const target = this.currentTarget();
      if (target) this.dealDamage(target, 5);
      this.addLog(`${sourceName}: 5 zusätzlicher Schaden!`);
    }
  }

  private purgeEnemyBuffs(enemy: EnemyState, limit: number, sourceName: string) {
    const removed: string[] = [];
    if (enemy.strength > 0 && removed.length < limit) {
      enemy.strength = 0;
      removed.push('Stärke');
    }
    if (enemy.block > 0 && removed.length < limit) {
      enemy.block = 0;
      removed.push('Schild');
    }
    this.enemies.set([...this.enemies()]);
    this.addLog(removed.length > 0
      ? `${sourceName}: ${enemy.def.name} verliert ${removed.join(' und ')}.`
      : `${sourceName}: ${enemy.def.name} hat keine positiven Effekte.`);
  }

  private summonAlly(allyId: string, sourceName: string) {
    const def = ALLIES[allyId];
    if (!def
      || this.livingAllies().length >= MAX_ALLIES
      || this.livingAllies().some(ally => ally.def.id === allyId)) return;
    this.allies.set([...this.livingAllies(), this.makeAlly(def)]);
    this.addLog(`${sourceName}: ${def.name} wurde beschworen.`);
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
        const draw = resonance.draw ?? 1;
        this.drawCards(draw);
        this.addLog(`✨ ${resonance.name}: Du ziehst ${draw} Karte.`);
      } else if (resonance.effect === 'block') {
        const block = (resonance.block ?? 7) + echoBonus;
        this.gainBlock(block);
        this.addLog(`✨ ${resonance.name}: Du erhältst ${block} Schild.`);
      } else if (resonance.effect === 'damage') {
        const damage = (resonance.damage ?? 6) + echoBonus;
        for (const e of this.aliveEnemies()) this.dealDamage(e, damage, true);
        this.addLog(`✨ ${resonance.name}: ${damage} Schaden an allen Gegnern.`);
      } else if (resonance.effect === 'balance') {
        const damage = (resonance.damage ?? 3) + echoBonus;
        const block = (resonance.block ?? 3) + echoBonus;
        for (const e of this.aliveEnemies()) this.dealDamage(e, damage, true);
        this.gainBlock(block);
        this.addLog(`✨ ${resonance.name}: ${damage} Schaden an allen Gegnern und ${block} Schild.`);
      } else if (resonance.effect === 'energy') {

        const energy = resonance.energy ?? 1;
        this.energy.set(this.energy() + energy);
        this.zeitbruchArmed.set(true);
        this.addLog(`✨ ${resonance.name}: +${energy} Energie – die nächste Karte beendet deinen Zug!`);
      } else if (resonance.effect === 'echo') {
        const block = (resonance.block ?? 3) + echoBonus;
        this.gainBlock(block);
        if (this.aliveEnemies().length >= 2) {
          const draw = resonance.draw ?? 1;
          this.drawCards(draw);
          this.addLog(`✨ ${resonance.name}: ${block} Schild und ${draw} Karte (2+ Gegner).`);
        } else {
          this.addLog(`✨ ${resonance.name}: ${block} Schild.`);
        }
      } else if (resonance.effect === 'storm') {
        const hits = resonance.hits ?? 3;
        const damage = (resonance.damage ?? 3) + echoBonus;
        for (let hit = 0; hit < hits && this.aliveEnemies().length > 0; hit++) {
          this.dealDamage(this.pickCombat(this.aliveEnemies()), damage, true);
        }
        this.addLog(`✨ ${resonance.name}: ${hits} zufällige Treffer mit ${damage} Schaden.`);
      } else if (resonance.effect === 'heal') {
        const heal = resonance.heal ?? 2;
        this.playerHp.set(Math.min(this.playerMaxHp(), this.playerHp() + heal));
        this.addLog(`✨ ${resonance.name}: Du heilst ${heal} Leben.`);
      }
    }
  }

  private gainBlock(n: number) {
    this.block.set(this.block() + n);
  }

  private dealDamage(
    enemy: EnemyState,
    base: number,
    pure = false,
    first?: { klingen: boolean; jaeger: boolean },
  ) {
    const wasAlive = enemy.hp > 0;
    let dmg = base;
    if (!pure) {
      dmg += this.strength();
      if (first?.klingen) {
        const bonus = this.runUpgradeLevel('klingenmeisterschaft') * 2;
        if (bonus > 0) {
          dmg += bonus;
          this.addLog(`Klingenmeisterschaft: +${bonus} Schaden.`);
        }
      }
      if (first?.jaeger && this.artifact()?.id === 'jaegerauge' && enemy.hp === enemy.maxHp) {
        dmg *= 2;
        this.addLog('Jägerauge: Doppelter Schaden gegen ein unverletztes Ziel.');
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

  // ---------- Rückgängig (nur innerhalb des eigenen Zuges) ----------

  private pushUndoSnapshot() {
    const combat = this.buildCombatSave();
    if (!combat) return;
    this.combatUndoStack.set([
      ...this.combatUndoStack().slice(-19),
      { combat, hp: this.playerHp(), log: this.log() },
    ]);
  }

  canUndoCardPlay(): boolean {
    return this.screen() === 'combat' && this.combatUndoStack().length > 0;
  }

  /** Macht die zuletzt gespielte Karte rückgängig. */
  undoCardPlay() {
    if (!this.canUndoCardPlay()) return;
    const stack = this.combatUndoStack();
    const snapshot = stack[stack.length - 1];
    this.combatUndoStack.set(stack.slice(0, -1));
    this.playerHp.set(snapshot.hp);
    this.restoreCombat(snapshot.combat);
    this.log.set(['↩️ Letzte Karte rückgängig gemacht.', ...snapshot.log].slice(0, 6));
    this.hoveredCard.set(null);
    this.saveRun();
  }

  endTurn() {
    if (this.screen() !== 'combat') return;
    // Mit dem Zugende verfallen alle Rückgängig-Schritte dieses Zuges.
    this.combatUndoStack.set([]);
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
      if (this.screen() === 'combat') this.saveRun();
    }
  }


  private executeEnemyMove(enemy: EnemyState) {
    const move = enemy.intent;
    const moveValue = this.enemyIntentValue(enemy);
    enemy.block = 0;
    if (move.kind === 'attack' || move.kind === 'attack_debuff') {
      const hits = move.hits ?? 1;
      let playerWasHit = false;
      for (let h = 0; h < hits; h++) {
        const dmg = this.enemyAttackPerHit(enemy);
        const tauntAlly = this.livingAllies().find(ally => ally.def.taunt);
        if (tauntAlly) {
          this.damageAlly(tauntAlly, dmg, enemy);
        } else {
          playerWasHit = this.damagePlayer(dmg, enemy) || playerWasHit;
        }
        if (this.playerHp() <= 0) return;
      }
      if (move.kind === 'attack_debuff' && move.weak && playerWasHit) {
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

  private damagePlayer(dmg: number, attacker: EnemyState): boolean {
    if (this.veil() > 0) {
      this.veil.set(this.veil() - 1);
      this.addLog(`Verschleierung: ${attacker.def.name} verfehlt dich.`);
      return false;
    }
    const blocked = Math.min(this.block(), dmg);
    this.block.set(this.block() - blocked);
    let hpDmg = dmg - blocked;
    if (hpDmg > 0 && this.artifact()?.id === 'dornenkrone') {
      hpDmg += 1;
      const thorns = 4 + this.strength();
      this.dealDamage(attacker, thorns, true);
      this.addLog(`Dornenkrone: ${thorns} Gegenschaden!`);
    }
    if (hpDmg > 0) {
      this.playerHp.set(Math.max(0, this.playerHp() - hpDmg));
      this.audio.playPlayerHit(hpDmg);
    }
    this.triggerReflection(attacker);
    return true;
  }

  private damageAlly(ally: AllyState, dmg: number, attacker: EnemyState) {
    const actualDamage = Math.min(ally.hp, dmg);
    ally.hp = Math.max(0, ally.hp - dmg);
    if (ally.hp > 0) {
      this.allies.set([...this.livingAllies()]);
      this.addLog(`${ally.def.name} fängt ${actualDamage} Schaden von ${attacker.def.name} ab.`);
    } else {
      this.allies.set(this.livingAllies().filter(current => current.uid !== ally.uid));
      this.addLog(`${ally.def.name} fängt den Treffer ab und wird besiegt.`);
    }
    this.triggerReflection(attacker);
  }

  private triggerReflection(attacker: EnemyState) {
    const reflectedDamage = this.reflection();
    if (reflectedDamage <= 0) return;
    this.reflection.set(0);
    this.dealDamage(attacker, reflectedDamage, true);
    this.addLog(`Reflektion: ${attacker.def.name} erleidet ${reflectedDamage} Schaden.`);
  }

  private onCombatWon() {
    this.combatUndoStack.set([]);
    const station = this.currentStation();
    let splitter = station.kind === 'boss' ? 60 : station.kind === 'elite' ? 30 : 15;
    if (this.mode() === 'dungeon') {
      splitter = Math.round(splitter * this.difficultyRewardMultiplier());
    }
    // Bereits abgeschlossene Kampagnen-Stages geben nur halben Loot
    const stage = this.currentStage();
    if (this.mode() === 'campaign' && stage && this.stageCompleted(stage)) {
      splitter = Math.round(splitter * 0.5);
    }

    this.runSplitter.set(this.runSplitter() + splitter);
    this.rewardSplitter.set(splitter);

    if (this.artifact()?.id === 'risskelch') {
      this.playerHp.set(Math.min(this.playerMaxHp(), this.playerHp() + 20));
      this.addLog('Risskelch: Du heilst 20 Leben.');
    }

    // Zufällige, unterschiedliche Belohnungskarten
    const pool = this.shuffleCombat(REWARD_POOL);
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

  }}



