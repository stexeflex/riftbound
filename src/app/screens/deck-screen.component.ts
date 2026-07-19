import { Component } from '@angular/core';
import { CardScreenBase } from './card-screen-base';

@Component({
  selector: 'app-deck-screen',
  templateUrl: './deck-screen.component.html',
  host: { style: 'display: contents' },
})
export class DeckScreenComponent extends CardScreenBase {}

