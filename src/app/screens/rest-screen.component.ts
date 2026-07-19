import { Component } from '@angular/core';
import { GameScreen } from './screen-base';

@Component({
  selector: 'app-rest-screen',
  templateUrl: './rest-screen.component.html',
  host: { style: 'display: contents' },
})
export class RestScreenComponent extends GameScreen {}

