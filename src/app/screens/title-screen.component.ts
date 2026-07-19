import { Component } from '@angular/core';
import { GameScreen } from './screen-base';

@Component({
  selector: 'app-title-screen',
  templateUrl: './title-screen.component.html',
  host: { style: 'display: contents' },
})
export class TitleScreenComponent extends GameScreen {}

