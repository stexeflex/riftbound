import { Component } from '@angular/core';
import { GameScreen } from './screen-base';

@Component({
  selector: 'app-resonances-screen',
  templateUrl: './resonances-screen.component.html',
  host: { style: 'display: contents' },
})
export class ResonancesScreenComponent extends GameScreen {}

