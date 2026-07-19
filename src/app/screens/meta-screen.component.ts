import { Component } from '@angular/core';
import { GameScreen } from './screen-base';

@Component({
  selector: 'app-meta-screen',
  templateUrl: './meta-screen.component.html',
  host: { style: 'display: contents' },
})
export class MetaScreenComponent extends GameScreen {}

