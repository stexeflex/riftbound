import { AllyDef } from '../models';

// ------------------------- Verbündete -------------------------

export const ALLY_MAX_LEVEL = 5;
export const ALLY_UPGRADE_BASE_COST = 80;

export const ALLIES: Record<string, AllyDef> = {
  risswaechter: {
    id: 'risswaechter',
    name: 'Risswächter',
    emoji: '🛡️',
    maxHp: 15,
    text: 'Provokation: Fängt gezielte gegnerische Treffer ab, bis seine Leben aufgebraucht sind. Gruppenschaden trifft ihn wie jeden Verbündeten.',
    costKerne: 4,
    taunt: true,
    commandDamage: 4,
    growth: { maxHp: 3, commandDamage: 1 },
  },
  funkengeist: {
    id: 'funkengeist',
    name: 'Funkengeist',
    emoji: '🔥',
    maxHp: 10,
    text: 'Funkenangriff: Verursacht an deinen nächsten 3 Zuganfängen Schaden an einem zufälligen Gegner und kehrt danach in den Riss zurück.',
    costKerne: 3,
    startTurnDamage: 5,
    commandDamage: 5,
    duration: 3,
    growth: { maxHp: 2, startTurnDamage: 1, commandDamage: 1 },
  },
  risskoloss: {
    id: 'risskoloss',
    name: 'Risskoloss',
    emoji: '🗿',
    maxHp: 40,
    text: 'Lebenswall: Besitzt sehr viele Leben, aber keinen zusätzlichen passiven Effekt.',
    costKerne: 3,
    commandDamage: 3,
    growth: { maxHp: 6, commandDamage: 1 },
  },
  sturmruferin: {
    id: 'sturmruferin',
    name: 'Sturmruferin',
    emoji: '🌩️',
    maxHp: 14,
    text: 'Kettenblitz: Fügt zu Beginn deines Zuges allen lebenden Gegnern Schaden zu.',
    costKerne: 5,
    startTurnAoeDamage: 3,
    commandDamage: 4,
    growth: { maxHp: 2, startTurnAoeDamage: 1, commandDamage: 1 },
  },
  bombengolem: {
    id: 'bombengolem',
    name: 'Bombengolem',
    emoji: '💣',
    maxHp: 12,
    text: 'Explosion: Wird der Bombengolem durch Schaden besiegt, fügt er allen lebenden Gegnern hohen Schaden zu.',
    costKerne: 4,
    deathExplosionDamage: 18,
    commandDamage: 4,
    growth: { maxHp: 3, deathExplosionDamage: 4, commandDamage: 1 },
  },
  runenschmiedin: {
    id: 'runenschmiedin',
    name: 'Runenschmiedin',
    emoji: '🔨',
    maxHp: 16,
    text: 'Schutzrune: Gewährt dir zu Beginn jedes Zuges Schild.',
    costKerne: 4,
    startTurnBlock: 3,
    commandDamage: 3,
    growth: { maxHp: 3, startTurnBlock: 1, commandDamage: 1 },
  },
};

export function clampAllyLevel(level: number): number {
  return Math.min(ALLY_MAX_LEVEL, Math.max(1, Math.round(Number.isFinite(level) ? level : 1)));
}

export function allyAtLevel(ally: AllyDef, level: number): AllyDef {
  const steps = clampAllyLevel(level) - 1;
  const scaled = (value: number | undefined, growth: number | undefined) =>
    value === undefined ? undefined : value + (growth ?? 0) * steps;
  return {
    ...ally,
    maxHp: ally.maxHp + (ally.growth.maxHp ?? 0) * steps,
    startTurnDamage: scaled(ally.startTurnDamage, ally.growth.startTurnDamage),
    startTurnAoeDamage: scaled(ally.startTurnAoeDamage, ally.growth.startTurnAoeDamage),
    deathExplosionDamage: scaled(ally.deathExplosionDamage, ally.growth.deathExplosionDamage),
    startTurnBlock: scaled(ally.startTurnBlock, ally.growth.startTurnBlock),
    commandDamage: ally.commandDamage + (ally.growth.commandDamage ?? 0) * steps,
  };
}

export const MAX_ALLIES = 3;
