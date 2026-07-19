import { Component } from '@angular/core';
import { GameScreen } from './screen-base';

@Component({
  selector: 'app-victory-screen',
  templateUrl: './victory-screen.component.html',
  host: { style: 'display: contents' },
})
export class VictoryScreenComponent extends GameScreen {}

