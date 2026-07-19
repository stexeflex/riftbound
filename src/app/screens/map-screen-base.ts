import { StationKind } from '../game/models';
import { GameScreen } from './screen-base';

/** Beschriftungen der Wegpunkte auf der Run-Karte. */
export abstract class MapScreenBase extends GameScreen {
  stationIcon(kind: StationKind): string {
    switch (kind) {
      case 'kampf': return '💀';
      case 'elite': return '😈';
      case 'rast': return '🔥';
      case 'boss': return '👹';
    }
  }

  stationLabel(kind: StationKind): string {
    switch (kind) {
      case 'kampf': return 'Kampf';
      case 'elite': return 'Elite';
      case 'rast': return 'Rastplatz';
      case 'boss': return 'Boss';
    }
  }

}



