import { Component, inject } from '@angular/core';
import { GameService } from './game/game.service';
import { CardDef, CardInstance, CardType, EnemyState, StationKind } from './game/models';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly game = inject(GameService);

  readonly cardTypes: string[] = ['Angriff', 'Verteidigung', 'Technik', 'Macht'];

  // ---------- Tooltip-Texte ----------
  readonly tips = {
    schild: 'Schild blockt eingehenden Schaden und verfällt zu Beginn deines nächsten Zuges.',
    staerke: 'Stärke: Angriffe verursachen so viel zusätzlichen Schaden.',
    schwaeche: 'Schwäche: 25 % weniger Schaden verursachen. Sinkt pro Zug um 1.',
    verwundbar: 'Verwundbarkeit: 50 % mehr Schaden erleiden. Sinkt pro Zug um 1.',
    energie: 'Energie: Wird zum Ausspielen von Karten benötigt und pro Zug erneuert.',
    zieh: 'Nachziehstapel: von hier ziehst du Karten.',
    ablage: 'Ablagestapel: Wird neu gemischt, wenn der Nachziehstapel leer ist.',
    resonanz: 'Spiele 3 verschiedene Kategorien in einem Zug, um eine Resonanz auszulösen.',
  };

  typeClass(type: CardType): string {
    switch (type) {
      case 'Angriff': return 'card-angriff';
      case 'Verteidigung': return 'card-verteidigung';
      case 'Technik': return 'card-technik';
      case 'Macht': return 'card-macht';
      case 'Fluch': return 'card-fluch';
    }
  }

  stationIcon(kind: StationKind): string {
    switch (kind) {
      case 'kampf': return '💀';
      case 'elite': return '😈';
      case 'rast': return '🔥';
      case 'boss': return '👹';
    }
  }

  stationLabel(kind: StationKind): string {
    switch (kind) {
      case 'kampf': return 'Kampf';
      case 'elite': return 'Elite';
      case 'rast': return 'Rastplatz';
      case 'boss': return 'Boss';
    }
  }

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
    // Nur der erste lebende Gegner wird angegriffen
    if (this.game.aliveEnemies()[0] !== e) return null;
    return this.game.previewDamage(card, e);
  }

  /** Nur Zusatzwissen zu Effekten, das nicht bereits direkt auf der Karte steht. */
  cardDetails(def: CardDef): string {
    const lines: string[] = [];
    if (def.block) {
      lines.push('Schild blockt eingehenden Schaden und verfällt zu Beginn deines nächsten Zuges.');
    }
    if (def.draw) {
      lines.push('Ist der Nachziehstapel leer, wird der Ablagestapel gemischt und zum neuen Nachziehstapel.');
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
    return this.game.previewBlock(card);
  }

  hpPercent(hp: number, max: number): number {
    return Math.max(0, Math.round((hp / max) * 100));
  }

  intentText(e: EnemyState): string {
    const i = e.intent;
    const dmg = i.value + e.strength;
    switch (i.kind) {
      case 'attack':
        return i.hits ? `⚔️ ${dmg} × ${i.hits} Schaden` : `⚔️ ${dmg} Schaden`;
      case 'attack_debuff':
        return `⚔️ ${dmg} Schaden + 😵 ${i.weak ?? 1} Schwäche`;
      case 'block':
        return `🛡️ ${i.value} Schild`;
      case 'buff':
        return `💪 +${i.value} Stärke`;
      default:
        return '❓';
    }
  }

  /** Wie viel Leben der Spieler vom angezeigten Gegnerzug wirklich verlieren würde. */
  incomingDamage(e: EnemyState): number {
    return this.simulateIncomingDamage([e]);
  }

  /** Tatsächlicher Lebensverlust des gesamten bevorstehenden Gegnerzugs. */
  totalIncomingDamage(): number {
    return this.simulateIncomingDamage(this.game.aliveEnemies());
  }

  private simulateIncomingDamage(enemies: EnemyState[]): number {
    let remainingBlock = this.game.block();
    let hpDmg = 0;
    const dornenkrone = this.game.artifact()?.id === 'dornenkrone';
    for (const e of enemies) {
      const i = e.intent;
      if (i.kind !== 'attack' && i.kind !== 'attack_debuff') continue;
      let per = i.value + e.strength;
      if (e.weak > 0) per = Math.round(per * 0.75);
      for (let h = 0; h < (i.hits ?? 1); h++) {
        const blocked = Math.min(remainingBlock, per);
        remainingBlock -= blocked;
        let through = per - blocked;
        if (through > 0 && dornenkrone) through += 1;
        hpDmg += through;
      }
    }
    return hpDmg;
  }

  enemyIntentDetails(e: EnemyState): string {
    const i = e.intent;
    if (i.kind === 'block') {
      return `${i.name}: Der Gegner erhält ${i.value} Schild. Schild blockt deine Angriffe bis zum nächsten Gegnerzug.`;
    }
    if (i.kind === 'buff') {
      return `${i.name}: Der Gegner erhält +${i.value} Stärke. Jeder folgende Angriffstreffer verursacht in diesem Kampf entsprechend mehr Schaden.`;
    }

    let per = i.value + e.strength;
    if (e.weak > 0) per = Math.round(per * 0.75);
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
    return (this.projectedPlayerHp() / this.game.playerMaxHp()) * 100;
  }

  playerIncomingPercent(): number {
    return (Math.min(this.game.playerHp(), this.totalIncomingDamage()) / this.game.playerMaxHp()) * 100;
  }

  projectedEnemyHp(e: EnemyState): number {
    const preview = this.damagePreview(e);
    return preview ? Math.max(0, e.hp - preview.afterBlock) : e.hp;
  }

  projectedEnemyHpPercent(e: EnemyState): number {
    return (this.projectedEnemyHp(e) / e.maxHp) * 100;
  }

  enemyIncomingPercent(e: EnemyState): number {
    const preview = this.damagePreview(e);
    return preview ? (Math.min(e.hp, preview.afterBlock) / e.maxHp) * 100 : 0;
  }
}
