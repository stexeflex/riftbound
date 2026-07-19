import { Component } from '@angular/core';
import { GameScreen } from './screen-base';

@Component({
  selector: 'app-dungeons-screen',
  templateUrl: './dungeons-screen.component.html',
  host: { style: 'display: contents' },
})
export class DungeonsScreenComponent extends GameScreen {}

