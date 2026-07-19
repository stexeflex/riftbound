import { Component } from '@angular/core';
import { MapScreenBase } from './map-screen-base';

@Component({
  selector: 'app-map-screen',
  templateUrl: './map-screen.component.html',
  host: { style: 'display: contents' },
})
export class MapScreenComponent extends MapScreenBase {}

