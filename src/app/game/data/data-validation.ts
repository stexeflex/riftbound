import { cardDetails } from '../effect-text';
import { ALLIES } from './allies.data';
import { CARDS } from './cards.data';
import { CAMPAIGN_STAGES } from './campaign.data';
import { DUNGEON_AREAS } from './dungeon-areas.data';
import { ENEMIES } from './enemies.data';

/**
 * Bricht mit einer klaren Meldung ab, wenn Karten, Verbündete, Shopdaten und
 * Hover-Erklärungen auseinanderlaufen. Dadurch fällt insbesondere sofort auf,
 * wenn ein neuer Karteneffekt keinen benannten Tooltip-Eintrag besitzt.
 */
export function assertGameDataIntegrity(): true {
  const errors: string[] = [];

  for (const card of Object.values(CARDS)) {
    const details = cardDetails(card);
    if (!details.trim()) {
      errors.push(`Karte ${card.id} benötigt mindestens einen Hover-Effekt.`);
    }
    for (const line of details.split('\n').filter(Boolean)) {
      if (!/^[^:]+:\s+\S/.test(line)) {
        errors.push(`Hovertext von ${card.id} beginnt nicht mit „Effektname:“: ${line}`);
      }
    }
    const requiredEffectNames: [unknown, string][] = [
      [card.veil, 'Verschleierung:'],
      [card.reflection, 'Reflektion:'],
      [card.damageRedirection, 'Schadensumleitung:'],
      [card.retainEnergy, 'Energieübertrag:'],
      [card.purgeEnemyBuffs, 'Effektbann:'],
      [card.retainBlock, 'Schildtransfer:'],
      [card.damagePerAlly, 'Verbundbonus:'],
      [card.damageFromBlock, 'Schildschaden:'],
      [card.healAllies, 'Verbündetenheilung:'],
      [card.healLowestAlly, 'Gezielte Verbündetenheilung:'],
      [card.allyStrength, 'Verbündetenstärke:'],
      [card.commandAlly, 'Verbündetenbefehl:'],
      [card.commandAllAllies, 'Gruppenbefehl:'],
      [card.playerTaunt, 'Provokation:'],
      [card.weakEnemy, 'Schwäche:'],
      [card.vulnerableEnemy, 'Verwundbarkeit:'],
      [card.selfWeak, 'Schwäche:'],
      [card.summonAlly, 'Beschwörung:'],
      [card.randomBonus, 'Zufallseffekt'],
    ];
    for (const [active, effectName] of requiredEffectNames) {
      if (active && !details.includes(effectName)) {
        errors.push(`Im Hovertext von ${card.id} fehlt „${effectName}“.`);
      }
    }
    if (card.summonAlly && !ALLIES[card.summonAlly]) {
      errors.push(`Karte ${card.id} verweist auf unbekannten Verbündeten ${card.summonAlly}.`);
    } else if (card.summonAlly && !details.includes(ALLIES[card.summonAlly].name)) {
      errors.push(`Im Hovertext von ${card.id} fehlt der Name des beschworenen Verbündeten.`);
    }
  }

  if (CAMPAIGN_STAGES.length !== 20) {
    errors.push(`Die Kampagne benötigt genau 20 Stages, vorhanden sind ${CAMPAIGN_STAGES.length}.`);
  }
  const campaignIds = new Set<string>();
  for (const stage of CAMPAIGN_STAGES) {
    if (campaignIds.has(stage.id)) errors.push(`Doppelte Kampagnen-ID: ${stage.id}.`);
    campaignIds.add(stage.id);
    if (!DUNGEON_AREAS.some(area => area.id === stage.areaId)) {
      errors.push(`Kampagnen-Stage ${stage.id} verweist auf unbekanntes Gebiet ${stage.areaId}.`);
    }
    if (!Number.isInteger(stage.kerne) || (stage.kerne ?? 0) < 1) {
      errors.push(`Kampagnen-Stage ${stage.id} benötigt mindestens 1 Kern.`);
    }
    for (const enemyId of stage.bossEncounter ?? []) {
      if (!ENEMIES[enemyId]) {
        errors.push(`Kampagnen-Stage ${stage.id} verweist auf unbekannten Boss ${enemyId}.`);
      }
    }
  }

  for (const ally of Object.values(ALLIES)) {
    if (!Number.isInteger(ally.costKerne) || ally.costKerne < 1 || ally.costKerne > 5) {
      errors.push(`Verbündeter ${ally.id} benötigt Kernkosten zwischen 1 und 5.`);
    }
    if (!Number.isFinite(ally.maxHp) || ally.maxHp <= 0) {
      errors.push(`Verbündeter ${ally.id} benötigt positive maximale Leben.`);
    }
    if (!Number.isFinite(ally.commandDamage) || ally.commandDamage <= 0) {
      errors.push(`Verbündeter ${ally.id} benötigt positiven Befehlsschaden.`);
    }
    for (const [label, value] of Object.entries(ally.growth ?? {})) {
      if (!Number.isFinite(value) || value < 0) {
        errors.push(`Verbündeter ${ally.id} benötigt einen nichtnegativen Stufenbonus für ${label}.`);
      }
    }
    if (!ally.text.trim()) {
      errors.push(`Verbündeter ${ally.id} benötigt einen Nachschlagewerk-Text.`);
    }
    if (!/^[^:]+:\s+\S/.test(ally.text)) {
      errors.push(`Verbündeten-Text von ${ally.id} beginnt nicht mit „Effektname:“.`);
    }
  }

  for (const enemy of Object.values(ENEMIES)) {
    for (const move of enemy.moves) {
      for (const [label, value] of [
        ['Verwundbarkeit', move.vulnerable],
        ['Verschleierung', move.veil],
        ['Effektbann', move.cleanse],
      ] as const) {
        if (value !== undefined && (!Number.isInteger(value) || value <= 0)) {
          errors.push(`${enemy.id}/${move.name}: ${label} benötigt einen positiven ganzzahligen Wert.`);
        }
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Ungültige Riftbound-Spieldaten:\n${errors.join('\n')}`);
  }
  return true;
}
