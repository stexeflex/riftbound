import { Component } from '@angular/core';
import { GameScreen } from './screen-base';

@Component({
  selector: 'app-defeat-screen',
  templateUrl: './defeat-screen.component.html',
  host: { style: 'display: contents' },
})
export class DefeatScreenComponent extends GameScreen {}

