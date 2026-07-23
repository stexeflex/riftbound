import { Component } from '@angular/core';
import { GameScreen } from './screen-base';

@Component({
  selector: 'app-profile-screen',
  templateUrl: './profile-screen.component.html',
  host: { style: 'display: contents' },
})
export class ProfileScreenComponent extends GameScreen {}
