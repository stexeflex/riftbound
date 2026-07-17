import { Component, inject } from '@angular/core';
import { GameService } from './game/game.service';
import { CardInstance, CardType, StationKind } from './game/models';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly game = inject(GameService);

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

  hpPercent(hp: number, max: number): number {
    return Math.max(0, Math.round((hp / max) * 100));
  }

  intentText(e: { intent: { kind: string; value: number; hits?: number; weak?: number }; strength: number }): string {
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
}
