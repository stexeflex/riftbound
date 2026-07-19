import { Component, HostListener, ViewEncapsulation, effect, inject } from '@angular/core';
import { AudioService } from './audio.service';
import { GameService } from './game/game.service';
import { TitleScreenComponent } from './screens/title-screen.component';
import { DungeonsScreenComponent } from './screens/dungeons-screen.component';
import { CampaignScreenComponent } from './screens/campaign-screen.component';
import { MapScreenComponent } from './screens/map-screen.component';
import { DeckScreenComponent } from './screens/deck-screen.component';
import { CardsScreenComponent } from './screens/cards-screen.component';
import { ArtifactsScreenComponent } from './screens/artifacts-screen.component';
import { ResonancesScreenComponent } from './screens/resonances-screen.component';
import { CombatScreenComponent } from './screens/combat-screen.component';
import { RewardScreenComponent } from './screens/reward-screen.component';
import { RestScreenComponent } from './screens/rest-screen.component';
import { VictoryScreenComponent } from './screens/victory-screen.component';
import { DefeatScreenComponent } from './screens/defeat-screen.component';
import { MetaScreenComponent } from './screens/meta-screen.component';

@Component({
  selector: 'app-root',
  imports: [TitleScreenComponent, DungeonsScreenComponent, CampaignScreenComponent, MapScreenComponent, DeckScreenComponent, CardsScreenComponent, ArtifactsScreenComponent, ResonancesScreenComponent, CombatScreenComponent, RewardScreenComponent, RestScreenComponent, VictoryScreenComponent, DefeatScreenComponent, MetaScreenComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  encapsulation: ViewEncapsulation.None,
})
export class App {
  readonly game = inject(GameService);
  readonly audio = inject(AudioService);

  constructor() {
    effect(() => this.audio.syncScreen(this.game.screen()));
  }

  @HostListener('document:pointerdown')
  unlockAudio() {
    this.audio.unlock();
  }

  @HostListener('document:keydown')
  unlockAudioWithKeyboard() {
    this.audio.unlock();
  }

  @HostListener('document:click', ['$event'])
  playButtonSound(event: MouseEvent) {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest('button');
    if (!button || button.hasAttribute('disabled') || button.hasAttribute('data-card-play')) return;
    this.audio.playButtonClick();
  }
}
