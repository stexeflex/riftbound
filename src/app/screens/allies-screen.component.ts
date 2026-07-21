import { Component } from '@angular/core';
import { GameScreen } from './screen-base';

@Component({
  selector: 'app-allies-screen',
  templateUrl: './allies-screen.component.html',
  host: { style: 'display: contents' },
})
export class AlliesScreenComponent extends GameScreen {}
