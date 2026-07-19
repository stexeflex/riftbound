import { Component } from '@angular/core';
import { GameScreen } from './screen-base';

@Component({
  selector: 'app-campaign-screen',
  templateUrl: './campaign-screen.component.html',
  host: { style: 'display: contents' },
})
export class CampaignScreenComponent extends GameScreen {}

