import { CardDef, CardInstance, EnemyState } from '../game/models';
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
    if (!card || !card.def.damage || e.hp <= 0) return null;
    if (!this.game.cardTargetsEnemy(card, e)) return null;
    return this.game.previewDamage(card, e);
  }

  /** Nur Zusatzwissen zu Effekten, das nicht bereits direkt auf der Karte steht. */
  override cardDetails(def: CardDef): string {
    const lines: string[] = [];
    if (def.block) {
      lines.push('Schild blockt eingehenden Schaden und verfällt zu Beginn deines nächsten Zuges.');
    }
    if (def.draw) {
      lines.push('Ist der Nachziehstapel leer, wird der Ablagestapel gemischt und zum neuen Nachziehstapel.');
    }
    if (def.energy) {
      lines.push('Die Energie wird sofort gutgeschrieben und kann noch in diesem Zug verwendet werden.');
    }
    if (def.heal) {
      lines.push('Heilung kann dein maximales Leben nicht überschreiten.');
    }
    if (def.blockPerEnemy) {
      lines.push('Gezählt werden alle Gegner, die beim Ausspielen der Karte noch leben.');
    }
    if (def.target === 'all') {
      lines.push('Dieser Effekt trifft jeden aktuell lebenden Gegner.');
    }
    if (def.strength) {
      lines.push('Stärke erhöht jeden einzelnen Angriffstreffer und bleibt bis zum Ende des Kampfes bestehen.');
    }
    if (def.endTurnBlock) {
      lines.push('Als Macht bleibt dieser Effekt nach dem Ausspielen für den gesamten Kampf aktiv.');
    }
    if (def.weakEnemy) {
      lines.push('Schwäche: Der Gegner verursacht 25 % weniger Schaden. Sie sinkt nach jedem Gegnerzug um 1.');
    }
    if (def.vulnerableEnemy) {
      lines.push('Verwundbarkeit: Der Gegner erleidet 50 % mehr Schaden. Sie sinkt nach jedem Gegnerzug um 1.');
    }
    if (def.selfWeak) {
      lines.push('Schwäche: Du verursachst 25 % weniger Schaden. Sie sinkt pro Zug um 1.');
    }
    if (def.randomBonus) {
      lines.push('Zufallseffekt (je 1/3): Ziehe 1 Karte, erhalte 5 Schild oder verursache 5 zusätzlichen Schaden.');
    }
    return lines.join('\n');
  }

  /** Vorschau: Schild, das die gehoverte Karte gibt. */
  blockPreview(): number {
    const card = this.game.hoveredCard();
    if (!card) return 0;
    return this.game.previewBlock(card)
      + (card.def.blockPerEnemy ?? 0) * this.game.aliveEnemies().length;
  }

  barPercent(value: number, max: number): number {
    return max > 0 ? (Math.max(0, value) / max) * 100 : 0;
  }

  /** Skaliert Leben und Schild gemeinsam, damit beides vollständig in die Leiste passt. */
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
    switch (i.kind) {
      case 'attack':
        return i.hits ? `⚔️ ${dmg} × ${i.hits} Schaden` : `⚔️ ${dmg} Schaden`;
      case 'attack_debuff':
        return `⚔️ ${dmg} Schaden + 😵 ${i.weak ?? 1} Schwäche`;
      case 'block':
        return `🛡️ ${value} Schild`;
      case 'buff':

        return `💪 +${value} Stärke`;
      default:
        return '❓';
    }
  }

  /** Wie viel Leben der Spieler vom angezeigten Gegnerzug wirklich verlieren würde. */
  incomingDamage(e: EnemyState): number {
    return this.simulateIncomingDamage(this.game.aliveEnemies()).byEnemy[e.uid] ?? 0;
  }

  /** Tatsächlicher Lebensverlust des gesamten bevorstehenden Gegnerzugs. */
  totalIncomingDamage(): number {

    return this.simulateIncomingDamage(this.game.aliveEnemies()).total;
  }

  private simulateIncomingDamage(
    enemies: EnemyState[],
  ): { total: number; byEnemy: Record<number, number> } {
    let remainingBlock = this.game.block();
    let hpDmg = 0;
    const byEnemy: Record<number, number> = {};
    const dornenkrone = this.game.artifact()?.id === 'dornenkrone';
    for (const e of enemies) {
      const i = e.intent;
      if (i.kind !== 'attack' && i.kind !== 'attack_debuff') continue;
      const per = this.game.enemyAttackPerHit(e);
      for (let h = 0; h < (i.hits ?? 1); h++) {
        const blocked = Math.min(remainingBlock, per);
        remainingBlock -= blocked;
        let through = per - blocked;
        if (through > 0 && dornenkrone) through += 1;
        hpDmg += through;
        byEnemy[e.uid] = (byEnemy[e.uid] ?? 0) + through;
      }
    }
    return { total: hpDmg, byEnemy };
  }

  enemyIntentDetails(e: EnemyState): string {
    const i = e.intent;
    if (i.kind === 'block') {
      return `${i.name}: Der Gegner erhält ${this.game.enemyIntentValue(e)} Schild. Schild blockt deine Angriffe bis zum nächsten Gegnerzug.`;
    }
    if (i.kind === 'buff') {
      return `${i.name}: Der Gegner erhält +${this.game.enemyIntentValue(e)} Stärke. Jeder folgende Angriffstreffer verursacht in diesem Kampf entsprechend mehr Schaden.`;
    }

    const per = this.game.enemyAttackPerHit(e);
    const hits = i.hits ?? 1;
    const lines = [
      `${i.name}: ${hits > 1 ? `${hits} Treffer mit je ${per}` : `${per}`} Schaden vor deinem Schild.`,
      `Dein aktueller Schild: ${this.game.block()}. Tatsächlicher Lebensverlust: ${this.incomingDamage(e)}.`,
    ];
    if (e.strength > 0) lines.push(`Gegnerische Stärke: +${e.strength} Schaden pro Treffer ist bereits eingerechnet.`);
    if (e.weak > 0) lines.push('Gegnerische Schwäche: 25 % weniger Schaden ist bereits eingerechnet.');
    if (i.kind === 'attack_debuff') {
      lines.push(
        `Danach erhältst du ${i.weak ?? 1} Schwäche: Deine Angriffe verursachen 25 % weniger Schaden; der Wert sinkt pro Zug um 1.`,
      );
    }
    return lines.join('\n');
  }

  projectedPlayerHp(): number {
    return Math.max(0, this.game.playerHp() - this.totalIncomingDamage());
  }

  projectedPlayerHpPercent(): number {
    return this.barPercent(this.projectedPlayerHp(), this.playerHpBarMax());
  }

  playerIncomingPercent(): number {
    return this.barPercent(
      Math.min(this.game.playerHp(), this.totalIncomingDamage()),
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


