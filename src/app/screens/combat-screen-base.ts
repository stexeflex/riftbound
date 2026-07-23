import { AllyState, CardInstance, EnemyState } from '../game/models';
import { CardScreenBase } from './card-screen-base';

/** Kampfbezogene Interaktionen und Vorschauwerte. */
export abstract class CombatScreenBase extends CardScreenBase {
  play(card: CardInstance) {
    this.game.playCard(card);
  }

  hoverCard(card: CardInstance | null) {
    this.game.hoveredCard.set(card);
  }


  /** Vorschau: tatsächlicher Schaden der gehoverten Karte gegen diesen Gegner. */
  damagePreview(e: EnemyState): { total: number; afterBlock: number } | null {
    const card = this.game.hoveredCard();
    if (!card || !this.game.cardHasDamage(card.def) || e.hp <= 0) return null;
    if (!this.game.cardTargetsEnemy(card, e)) return null;
    return this.game.previewDamage(card, e);
  }

  hoveredDamageBreakdown(): string {
    const card = this.game.hoveredCard();
    const target = this.game.currentTarget();
    return card && this.game.cardHasDamage(card.def) && target
      ? this.game.damageBreakdown(card, target)
      : '';
  }

  /** Vorschau: Schild, das die gehoverte Karte gibt. */
  blockPreview(): number {
    const card = this.game.hoveredCard();
    if (!card) return 0;
    return this.game.previewBlock(card)
      + (card.def.blockPerEnemy ?? 0) * this.game.aliveEnemies().length;
  }

  redirectionPreview(): number {
    return this.game.hoveredCard()?.def.damageRedirection ?? 0;
  }

  barPercent(value: number, max: number): number {
    return max > 0 ? (Math.max(0, value) / max) * 100 : 0;
  }

  /** Stellt die gespeicherte Formation relativ zum Spieler dar. */
  allyCombatOrder(ally: AllyState): number {
    const index = this.game.livingAllies().findIndex(current => current.uid === ally.uid);
    return ally.position === 'back' ? -100 + index : 100 + index;
  }

  /** Skaliert Leben und Schild gemeinsam, damit alle Segmente in die Leiste passen. */
  playerHpBarMax(): number {
    return Math.max(
      this.game.playerMaxHp(),
      this.game.playerHp() + this.game.block() + this.blockPreview(),
    );
  }

  enemyHpBarMax(e: EnemyState): number {
    return Math.max(e.maxHp, e.hp + e.block);
  }

  intentText(e: EnemyState): string {
    const i = e.intent;
    const value = this.game.enemyIntentValue(e);
    const dmg = this.game.enemyAttackPerHit(e);
    const damageLabel = i.target === 'all' ? 'Gruppenschaden' : 'Schaden';
    let text: string;
    switch (i.kind) {
      case 'attack':
        text = i.hits ? `⚔️ ${dmg} × ${i.hits} ${damageLabel}` : `⚔️ ${dmg} ${damageLabel}`;
        break;
      case 'attack_debuff':
        text = `⚔️ ${dmg} ${damageLabel}`;
        if (i.weak) text += ` + 😵 ${i.weak} Schwäche`;
        break;
      case 'block':
        text = `🛡️ ${value} Schild`;
        break;
      case 'buff':
        text = `💪 +${value} Stärke`;
        break;
      default:
        return '❓';
    }
    if (i.vulnerable) text += ` + 💔 ${i.vulnerable} Verwundbarkeit`;
    if (i.veil) text += ` + 🌫️ ${i.veil} Verschleierung`;
    if (i.cleanse) text += ` + ✨ ${i.cleanse} Effektbann`;
    return text;
  }

  /** Wie viel Leben der Spieler vom angezeigten Gegnerzug wirklich verlieren würde. */
  incomingDamage(e: EnemyState): number {
    return this.simulateIncomingDamage(this.game.aliveEnemies()).byEnemy[e.uid] ?? 0;
  }

  /** Tatsächlicher Lebensverlust des gesamten bevorstehenden Gegnerzugs. */
  totalIncomingDamage(): number {

    return this.simulateIncomingDamage(this.game.aliveEnemies()).total;
  }

  /** Erwarteter Lebensverlust, nachdem der Schild der gehoverten Karte angerechnet wurde. */
  previewedIncomingDamage(): number {
    return this.simulateIncomingDamage(
      this.game.aliveEnemies(),
      this.blockPreview(),
      this.redirectionPreview(),
    ).total;
  }

  preventedDamageByBlockPreview(): number {
    return Math.max(0, this.totalIncomingDamage() - this.previewedIncomingDamage());
  }

  private simulateIncomingDamage(
    enemies: EnemyState[],
    additionalBlock = 0,
    additionalRedirection = 0,
  ): { total: number; byEnemy: Record<number, number>; byAlly: Record<number, number> } {
    let remainingBlock = this.game.block() + Math.max(0, additionalBlock);
    let remainingRedirection = this.game.damageRedirection() + Math.max(0, additionalRedirection);
    let remainingVeil = this.game.veil();
    let simulatedVulnerability = this.game.playerVulnerable();
    const simulatedAllies = this.game.livingAllies().map(ally => ({
      uid: ally.uid,
      id: ally.def.id,
      hp: ally.hp,
      taunt: Boolean(ally.def.taunt),
    }));
    let hpDmg = 0;
    const byEnemy: Record<number, number> = {};
    const byAlly: Record<number, number> = {};
    const dornenkrone = this.game.artifact()?.id === 'dornenkrone';
    for (const e of enemies) {
      const i = e.intent;
      if (i.kind !== 'attack' && i.kind !== 'attack_debuff') continue;
      const allyDamage = this.game.enemyAttackPerHit(e, 'ally');
      const playerDamage = simulatedVulnerability > 0
        ? Math.round(allyDamage * 1.5)
        : allyDamage;
      let playerWasHit = false;
      for (let h = 0; h < (i.hits ?? 1); h++) {
        if (i.target === 'all') {
          if (remainingVeil > 0) {
            remainingVeil--;
          } else {
            playerWasHit = true;
            const redirected = Math.min(remainingRedirection, remainingBlock, playerDamage);
            remainingRedirection -= redirected;
            remainingBlock -= redirected;
            const blocked = Math.min(remainingBlock, playerDamage - redirected);
            remainingBlock -= blocked;
            let through = playerDamage - redirected - blocked;
            if (through > 0 && dornenkrone) through += 1;
            hpDmg += through;
            byEnemy[e.uid] = (byEnemy[e.uid] ?? 0) + through;
          }
          for (const ally of simulatedAllies.filter(current => current.hp > 0)) {
            const actualAllyDamage = Math.min(ally.hp, allyDamage);
            ally.hp = Math.max(0, ally.hp - allyDamage);
            byAlly[ally.uid] = (byAlly[ally.uid] ?? 0) + actualAllyDamage;
          }
          continue;
        } else {
          const allyTarget = this.game.playerTaunt()
            ? null
            : simulatedAllies.find(ally => ally.taunt && ally.hp > 0)
              ?? (e.intentTarget !== 'player'
                ? simulatedAllies.find(ally => ally.id === e.intentTarget && ally.hp > 0)
                : null);
          if (allyTarget) {
            const actualAllyDamage = Math.min(allyTarget.hp, allyDamage);
            allyTarget.hp = Math.max(0, allyTarget.hp - allyDamage);
            byAlly[allyTarget.uid] = (byAlly[allyTarget.uid] ?? 0) + actualAllyDamage;
            continue;
          }
        }
        if (remainingVeil > 0) {
          remainingVeil--;
          continue;
        }
        playerWasHit = true;
        const redirected = Math.min(remainingRedirection, remainingBlock, playerDamage);
        remainingRedirection -= redirected;
        remainingBlock -= redirected;
        const blocked = Math.min(remainingBlock, playerDamage - redirected);
        remainingBlock -= blocked;
        let through = playerDamage - redirected - blocked;
        if (through > 0 && dornenkrone) through += 1;
        hpDmg += through;
        byEnemy[e.uid] = (byEnemy[e.uid] ?? 0) + through;
      }
      if (i.kind === 'attack_debuff' && i.vulnerable && playerWasHit) {
        simulatedVulnerability += i.vulnerable;
      }
    }
    return { total: hpDmg, byEnemy, byAlly };
  }

  allyIncomingDamage(ally: AllyState): number {
    return this.simulateIncomingDamage(
      this.game.aliveEnemies(),
      this.blockPreview(),
      this.redirectionPreview(),
    ).byAlly[ally.uid] ?? 0;
  }

  projectedAllyHp(ally: AllyState): number {
    return Math.max(0, ally.hp - this.allyIncomingDamage(ally));
  }

  enemyIntentDetails(e: EnemyState): string {
    const i = e.intent;
    const effectLines: string[] = [];
    if (i.vulnerable) {
      effectLines.push(`Wenn du getroffen wirst, erhältst du ${i.vulnerable} Verwundbarkeit. Sie erhöht den Schaden des nächsten Gegnerzuges gegen dich um 50 %.`);
    }
    if (i.veil) {
      effectLines.push(`Der Gegner erhält ${i.veil} Verschleierung. Jede Ladung lässt den nächsten Treffer gegen ihn verfehlen.`);
    }
    if (i.cleanse) {
      effectLines.push(`Der Gegner bannt bis zu ${i.cleanse} negative Effektarten von sich: zuerst Verwundbarkeit, dann Schwäche.`);
    }
    if (i.kind === 'block') {
      return [
        `${i.name}: Der Gegner erhält ${this.game.enemyIntentValue(e)} Schild. Schild blockt deine Angriffe bis zum nächsten Gegnerzug.`,
        ...effectLines,
      ].join('\n');
    }
    if (i.kind === 'buff') {
      return [
        `${i.name}: Der Gegner erhält +${this.game.enemyIntentValue(e)} Stärke. Jeder folgende Angriffstreffer verursacht in diesem Kampf entsprechend mehr Schaden.`,
        ...effectLines,
      ].join('\n');
    }

    const per = this.game.enemyAttackPerHit(e);
    const hits = i.hits ?? 1;
    const lines = [
      `${i.name}: ${hits > 1 ? `${hits} Treffer mit je ${per}` : `${per}`} Schaden vor deinem Schild.`,
      `Ziel: ${this.game.enemyIntentTargetName(e)}. Dein erwarteter Lebensverlust: ${this.incomingDamage(e)}.`,
    ];
    if (i.target === 'all') {
      lines.push('Gruppenschaden trifft dich und jeden lebenden Verbündeten; Provokation lenkt ihn nicht um.');
    }
    if (e.strength > 0) lines.push(`Gegnerische Stärke: +${e.strength} Schaden pro Treffer ist bereits eingerechnet.`);
    if (e.weak > 0) lines.push('Gegnerische Schwäche: 25 % weniger Schaden ist bereits eingerechnet.');
    if (this.game.playerVulnerable() > 0) lines.push('Deine Verwundbarkeit: 50 % mehr Schaden gegen dich ist bereits eingerechnet.');
    if (i.kind === 'attack_debuff') {
      if (i.weak) {
        lines.push(`Danach erhältst du ${i.weak} Schwäche: Deine Angriffe verursachen 25 % weniger Schaden; der Wert sinkt pro Zug um 1.`);
      }
    }
    lines.push(...effectLines);
    return lines.join('\n');
  }

  /** Angesagter Gesamtschaden aller Gegner vor Verrechnung mit dem Schild. */
  totalIncomingRaw(): number {
    let total = 0;
    for (const e of this.game.aliveEnemies()) {
      const i = e.intent;
      if (i.kind !== 'attack' && i.kind !== 'attack_debuff') continue;
      total += this.game.enemyAttackPerHit(e) * (i.hits ?? 1);
    }
    return total;
  }

  /** Tooltip für die Spieler-HP-Leiste: Leben, Schild und eingehender Schaden. */
  playerHpTip(): string {
    const lines = [
      `❤️ Leben: ${this.game.playerHp()}/${this.game.playerMaxHp()}`,
      `🛡️ Aktives Schild: ${this.game.block()}`,
    ];
    const raw = this.totalIncomingRaw();
    if (raw > 0) {
      const loss = this.totalIncomingDamage();
      lines.push(`⚔️ Angesagter Gegnerschaden: ${raw}`);
      lines.push(loss > 0
        ? `→ Du verlierst ${loss} Leben (übrig: ${this.projectedPlayerHp()})`
        : '→ Deine Schutz-Effekte verhindern alles: 0 Lebensverlust');
      if (this.projectedPlayerHp() <= 0) lines.push('☠️ Achtung: Dieser Zug wäre tödlich!');
    } else {
      lines.push('⚔️ Kein Angriff angesagt.');
    }
    if (this.game.veil() > 0) {
      lines.push(`🌫️ Verschleierung: ${this.game.veil()} gegnerische Treffer gehen zuerst daneben.`);
    }
    if (this.game.damageRedirection() > 0) {
      lines.push(`🔀 Schadensumleitung: ${this.game.damageRedirection()} Schild schützt nur dich und wirft dadurch absorbierten Schaden zurück.`);
    }
    if (this.game.playerTaunt()) {
      lines.push('🎯 Provokation: Alle gezielten Gegnerangriffe treffen bis zu deinem nächsten Zug dich.');
    }
    const tauntAlly = this.game.livingAllies().find(ally => ally.def.taunt);
    if (tauntAlly) {
      lines.push(`🎯 ${tauntAlly.def.name} fängt gezielte gegnerische Treffer ab, solange er lebt.`);
    }
    return lines.join('\n');
  }

  /** Tooltip für den Passiv-Text unter einem Gegner. */
  passiveDetails(e: EnemyState): string {
    const text = e.def.passive ?? '';
    const lines: string[] = [];
    if (/stärke|stärker|Buff/i.test(text)) {
      lines.push('Stärke: Jeder Angriffstreffer dieses Gegners verursacht so viel zusätzlichen Schaden.');
    }
    if (/schwäche|schwächt|Flüche|lähmend/i.test(text)) {
      lines.push('Schwäche: Deine Angriffe verursachen 25 % weniger Schaden. Sinkt pro Zug um 1.');
    }
    if (/schützt|Deckung|Eiswälle|Schutz|Schild/i.test(text)) {
      lines.push('Schild: Blockt deinen Schaden und verfällt vor dem nächsten Gegnerzug.');
    }
    if (/Mehrfachtreffer|Serien|Kettenblitze|Treffer auf/i.test(text)) {
      lines.push('Mehrfachtreffer: Jeder Treffer wird einzeln gegen dein Schild gerechnet.');
    }
    if (/Verschwinden|Sturmhaut|Wolkenpalast|Singularität|Linse/i.test(text)) {
      lines.push('Verschleierung: Jede Ladung lässt den nächsten Treffer gegen diesen Gegner verfehlen.');
    }
    if (e.strength > 0) lines.push(`Aktuelle Stärke: +${e.strength} Schaden pro Treffer.`);
    if (lines.length === 0) return 'Passiver Effekt dieses Gegners.';
    return lines.join('\n');
  }

  projectedPlayerHp(): number {
    return Math.max(0, this.game.playerHp() - this.previewedIncomingDamage());
  }

  /**
   * Rot überdeckt den Lebensanteil, der verloren geht: Es beginnt beim
   * verbleibenden Leben und endet am aktuellen Leben. Wärst du tot, ist
   * die komplette Lebensleiste rot gestreift – kein Grün bleibt sichtbar.
   */
  playerLossPreviewStartPercent(): number {
    return this.barPercent(this.projectedPlayerHp(), this.playerHpBarMax());
  }

  playerIncomingPercent(): number {
    return this.barPercent(
      Math.min(this.game.playerHp(), this.previewedIncomingDamage()),
      this.playerHpBarMax(),
    );
  }

  projectedEnemyHp(e: EnemyState): number {
    const preview = this.damagePreview(e);
    return preview ? Math.max(0, e.hp - preview.afterBlock) : e.hp;
  }

  projectedEnemyHpPercent(e: EnemyState): number {
    return this.barPercent(this.projectedEnemyHp(e), this.enemyHpBarMax(e));
  }

  enemyIncomingPercent(e: EnemyState): number {
    const preview = this.damagePreview(e);
    return preview
      ? this.barPercent(Math.min(e.hp, preview.afterBlock), this.enemyHpBarMax(e))
      : 0;
  }}


