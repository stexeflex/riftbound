import { Component } from '@angular/core';
import { GameScreen } from './screen-base';

@Component({
  selector: 'app-artifacts-screen',
  templateUrl: './artifacts-screen.component.html',
  host: { style: 'display: contents' },
})
export class ArtifactsScreenComponent extends GameScreen {}

