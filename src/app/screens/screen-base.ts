import { inject } from '@angular/core';
import { GameService } from '../game/game.service';

/** Gemeinsamer Zugriff der Bildschirm-Komponenten auf die Spielfassade. */
export abstract class GameScreen {
  readonly game = inject(GameService);
}

