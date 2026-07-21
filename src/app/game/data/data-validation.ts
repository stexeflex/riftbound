import { cardDetails } from '../effect-text';
import { ALLIES } from './allies.data';
import { CARDS } from './cards.data';

/**
 * Bricht mit einer klaren Meldung ab, wenn Karten, Verbündete, Shopdaten und
 * Hover-Erklärungen auseinanderlaufen. So bleiben neue Beschwörungen automatisch
 * mit Karte, Nachschlagewerk und Verbündeten-Shop verknüpft.
 */
export function assertGameDataIntegrity(): true {
  const errors: string[] = [];

  for (const card of Object.values(CARDS)) {
    if (!card.summonAlly) continue;
    const ally = ALLIES[card.summonAlly];
    if (!ally) {
      errors.push(`Karte ${card.id} verweist auf unbekannten Verbündeten ${card.summonAlly}.`);
      continue;
    }
    if (ally.summonCardId !== card.id) {
      errors.push(`Karte ${card.id} und Verbündeter ${ally.id} verweisen nicht aufeinander.`);
    }
    const details = cardDetails(card);
    if (!details.includes(ally.name)) {
      errors.push(`Im Hovertext von ${card.id} fehlt die Verbündeten-Erklärung.`);
    }
    if (ally.taunt && !details.includes('Provokation')) {
      errors.push(`Im Hovertext von ${card.id} fehlt die Erklärung für Provokation.`);
    }
  }

  for (const ally of Object.values(ALLIES)) {
    const summonCard = CARDS[ally.summonCardId];
    if (!summonCard || summonCard.summonAlly !== ally.id) {
      errors.push(`Verbündeter ${ally.id} besitzt keine passend verknüpfte Beschwörungskarte.`);
    }
    if (!Number.isInteger(ally.costKerne) || ally.costKerne < 1 || ally.costKerne > 5) {
      errors.push(`Verbündeter ${ally.id} benötigt Kernkosten zwischen 1 und 5.`);
    }
    if (!Number.isFinite(ally.maxHp) || ally.maxHp <= 0) {
      errors.push(`Verbündeter ${ally.id} benötigt positive maximale Leben.`);
    }
    if (!ally.text.trim()) {
      errors.push(`Verbündeter ${ally.id} benötigt einen Nachschlagewerk-Text.`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Ungültige Riftbound-Spieldaten:\n${errors.join('\n')}`);
  }
  return true;
}
