import { Component } from '@angular/core';
import { GameScreen } from './screen-base';

@Component({
  selector: 'app-converter-screen',
  templateUrl: './converter-screen.component.html',
  host: { style: 'display: contents' },
})
export class ConverterScreenComponent extends GameScreen {}
