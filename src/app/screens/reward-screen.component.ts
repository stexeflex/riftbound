import { Component } from '@angular/core';
import { CardScreenBase } from './card-screen-base';

@Component({
  selector: 'app-reward-screen',
  templateUrl: './reward-screen.component.html',
  host: { style: 'display: contents' },
})
export class RewardScreenComponent extends CardScreenBase {}

