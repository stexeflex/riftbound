import { Component, inject } from '@angular/core';
import { GameService } from './game/game.service';
import { CardInstance, CardType, EnemyState, StationKind } from './game/models';

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
    intent: 'Das plant der Gegner für seinen nächsten Zug.',
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
        return `⚔️ ${dmg} Schaden + 😵 Schwäche`;
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
    const i = e.intent;
    if (i.kind !== 'attack' && i.kind !== 'attack_debuff') return 0;
    let per = i.value + e.strength;
    if (e.weak > 0) per = Math.round(per * 0.75);
    const dornenkrone = this.game.artifact()?.id === 'dornenkrone';
    let remainingBlock = this.game.block();
    let hpDmg = 0;
    for (let h = 0; h < (i.hits ?? 1); h++) {
      const blocked = Math.min(remainingBlock, per);
      remainingBlock -= blocked;
      let through = per - blocked;
      if (through > 0 && dornenkrone) through += 1;
      hpDmg += through;
    }
    return hpDmg;
  }
}
