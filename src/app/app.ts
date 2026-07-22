import { Component, HostListener, effect, inject, signal } from '@angular/core';
import { AudioService } from './audio.service';
import { GameService } from './game/game.service';
import { SPECIAL_EFFECT_GLOSSARY } from './game/effect-text';
import { TitleScreenComponent } from './screens/title-screen.component';
import { DungeonsScreenComponent } from './screens/dungeons-screen.component';
import { CampaignScreenComponent } from './screens/campaign-screen.component';
import { MapScreenComponent } from './screens/map-screen.component';
import { DeckScreenComponent } from './screens/deck-screen.component';
import { CardsScreenComponent } from './screens/cards-screen.component';
import { ArtifactsScreenComponent } from './screens/artifacts-screen.component';
import { AlliesScreenComponent } from './screens/allies-screen.component';
import { ResonancesScreenComponent } from './screens/resonances-screen.component';
import { CombatScreenComponent } from './screens/combat-screen.component';
import { RewardScreenComponent } from './screens/reward-screen.component';
import { RestScreenComponent } from './screens/rest-screen.component';
import { VictoryScreenComponent } from './screens/victory-screen.component';
import { DefeatScreenComponent } from './screens/defeat-screen.component';
import { MetaScreenComponent } from './screens/meta-screen.component';

@Component({
  selector: 'app-root',
  imports: [TitleScreenComponent, DungeonsScreenComponent, CampaignScreenComponent, MapScreenComponent, DeckScreenComponent, CardsScreenComponent, ArtifactsScreenComponent, AlliesScreenComponent, ResonancesScreenComponent, CombatScreenComponent, RewardScreenComponent, RestScreenComponent, VictoryScreenComponent, DefeatScreenComponent, MetaScreenComponent],
  templateUrl: './app.html',
})
export class App {
  readonly game = inject(GameService);
  readonly audio = inject(AudioService);
  readonly helpOpen = signal(false);
  readonly specialEffectGlossary = SPECIAL_EFFECT_GLOSSARY;

  constructor() {
    effect(() => this.audio.syncScreen(
      this.game.screen(),
      this.game.currentArea()?.theme,
    ));
  }

  @HostListener('document:pointerdown')
  unlockAudio() {
    this.audio.unlock();
  }

  @HostListener('document:keydown', ['$event'])
  unlockAudioWithKeyboard(event: KeyboardEvent) {
    this.audio.unlock();
    if (event.key !== 'Escape') return;
    if (this.game.purchaseConfirmation()) this.game.cancelPurchase();
    else if (this.game.giveUpConfirmationOpen()) this.game.giveUpConfirmationOpen.set(false);
    else if (this.game.newRunConfirmationOpen()) this.game.cancelNewRun();
    else if (this.helpOpen()) this.helpOpen.set(false);
  }

  confirmGiveUp() {
    this.game.giveUpRun();
    this.game.giveUpConfirmationOpen.set(false);
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
