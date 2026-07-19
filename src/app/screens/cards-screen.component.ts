import { Component } from '@angular/core';
import { CardScreenBase } from './card-screen-base';

@Component({
  selector: 'app-cards-screen',
  templateUrl: './cards-screen.component.html',
  host: { style: 'display: contents' },
})
export class CardsScreenComponent extends CardScreenBase {}

