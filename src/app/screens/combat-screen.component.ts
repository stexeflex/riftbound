import { Component } from '@angular/core';
import { CombatScreenBase } from './combat-screen-base';

@Component({
  selector: 'app-combat-screen',
  templateUrl: './combat-screen.component.html',
  host: { style: 'display: contents' },
})
export class CombatScreenComponent extends CombatScreenBase {}

