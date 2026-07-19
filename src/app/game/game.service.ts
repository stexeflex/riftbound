import { Injectable } from '@angular/core';
import { GameCombatService } from './game-combat.service';

/**
 * Öffentliche Spielfassade für Komponenten.
 *
 * Die Fachlogik liegt in den vererbten Modulen für Meta, Deck, Run und Kampf.
 */
@Injectable({ providedIn: 'root' })
export class GameService extends GameCombatService {}
