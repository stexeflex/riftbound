import { ALLIES } from './data/allies.data';
import { AllyDef, ArtifactDef, CardDef, ResonanceDef } from './models';

export interface GlossaryEntry {
  term: string;
  text: string;
}

const VEIL_DETAIL = 'Jede Ladung lässt einen gegnerischen Treffer gegen dich vollständig verfehlen. Mehrere Ladungen werden nacheinander verbraucht.';
const REFLECTION_DETAIL = 'Der nächste Treffer gegen dich oder einen Verbündeten wirft den gespeicherten Schaden auf den Angreifer zurück.';

export const SPECIAL_EFFECT_GLOSSARY: readonly GlossaryEntry[] = [
  {
    term: '✨ Verbündete',
    text: 'Beschworene Verbündete bleiben im Kampf, bis ihre Leben auf 0 fallen oder ihre angegebene Dauer endet. Du kannst höchstens 2 unterschiedliche Verbündete gleichzeitig kontrollieren.',
  },
  {
    term: '🎯 Provokation',
    text: 'Ein Verbündeter mit Provokation fängt gezielte gegnerische Treffer für dich ab. Gruppenschaden trifft trotzdem dich und jeden lebenden Verbündeten.',
  },
  {
    term: '⚔️ Gruppenschaden',
    text: 'Trifft dich und jeden lebenden Verbündeten gleichzeitig. Provokation lenkt Gruppenschaden nicht um; Verschleierung schützt nur dich.',
  },
  {
    term: '🌫️ Verschleierung',
    text: VEIL_DETAIL,
  },
  {
    term: '🪞 Reflektion',
    text: REFLECTION_DETAIL,
  },
  {
    term: '⚓ Schildtransfer',
    text: 'Bis zum angegebenen Wert bleibt Restschild nach dem Gegnerzug erhalten und wird zu Beginn deines nächsten Zuges übertragen.',
  },
  {
    term: '🤝 Verbündetenstärke',
    text: 'Erhöht jeden von Verbündeten verursachten Schadenswert für den restlichen Kampf.',
  },
];

export const ALLY_GLOSSARY: readonly GlossaryEntry[] = Object.values(ALLIES).map(ally => ({
  term: `${ally.emoji} ${ally.name} (${ally.maxHp} Leben)`,
  text: ally.text,
}));

export function allyDetails(ally: AllyDef): string {
  return [
    ally.text,
    `Maximale Leben: ${ally.maxHp}. Preis: ${ally.costKerne} Kerne.`,
    `Der Kauf schaltet den Verbündeten frei und gewährt 1 Exemplar der Beschwörungskarte.`,
  ].join('\n');
}

/** Zentrale Zusatzregeln für Karten-Hover in Shop, Deck, Belohnung und Kampf. */
export function cardDetails(def: CardDef): string {
  const lines: string[] = [];
  if (def.block) {
    lines.push('Schild blockt eingehenden Schaden und verfällt zu Beginn deines nächsten Zuges.');
  }
  if (def.draw) {
    lines.push('Ist der Nachziehstapel leer, wird der Ablagestapel gemischt und zum neuen Nachziehstapel.');
  }
  if (def.energy) {
    lines.push('Die Energie wird sofort gutgeschrieben und kann noch in diesem Zug verwendet werden.');
  }
  if (def.heal) {
    lines.push('Heilung kann dein maximales Leben nicht überschreiten.');
  }
  if (def.blockPerEnemy) {
    lines.push('Gezählt werden alle Gegner, die beim Ausspielen der Karte noch leben.');
  }
  if (def.target === 'all') {
    lines.push('Dieser Effekt trifft jeden aktuell lebenden Gegner.');
  }
  if (def.strength) {
    lines.push('Stärke erhöht jeden einzelnen Angriffstreffer und bleibt bis zum Ende des Kampfes bestehen.');
  }
  if (def.startTurnBlock) {
    lines.push('Als Macht bleibt dieser Effekt nach dem Ausspielen für den gesamten Kampf aktiv.');
  }
  if (def.veil) {
    lines.push(VEIL_DETAIL);
  }
  if (def.reflection) {
    lines.push(REFLECTION_DETAIL);
  }
  if (def.purgeEnemyBuffs) {
    lines.push('Positive Effektarten sind Stärke und Schild. Eine entfernte Effektart verliert ihren gesamten aktuellen Wert.');
  }
  if (def.retainBlock) {
    lines.push('Nur Schild, der nach dem Gegnerzug noch übrig ist, kann übertragen werden. Der Effekt wird danach verbraucht.');
  }
  if (def.summonAlly) {
    const ally = ALLIES[def.summonAlly];
    if (ally) lines.push(`${ally.emoji} ${ally.name}: ${ally.text}`);
    lines.push('Du kannst höchstens 2 unterschiedliche Verbündete gleichzeitig kontrollieren. Ein bereits aktiver Verbündeter kann nicht erneut beschworen werden.');
  }
  if (def.damagePerAlly) {
    lines.push('Gezählt werden deine aktuell aktiven Verbündeten, bevor der Angriff ausgeführt wird.');
  }
  if (def.healAllies) {
    lines.push('Jeder lebende Verbündete wird bis zu seinen maximalen Leben geheilt. Ohne Verbündeten wirkt nur der übrige Karteneffekt.');
  }
  if (def.allyStrength) {
    lines.push('Verbündetenstärke erhöht jeden von Verbündeten verursachten Schadenswert und bleibt bis zum Kampfende.');
  }
  if (def.weakEnemy) {
    lines.push('Schwäche: Der Gegner verursacht 25 % weniger Schaden. Sie sinkt nach jedem Gegnerzug um 1.');
  }
  if (def.vulnerableEnemy) {
    lines.push('Verwundbarkeit: Der Gegner erleidet 50 % mehr Schaden. Sie sinkt nach jedem Gegnerzug um 1.');
  }
  if (def.selfWeak) {
    lines.push('Schwäche: Du verursachst 25 % weniger Schaden. Sie sinkt pro Zug um 1.');
  }
  if (def.randomBonus) {
    lines.push('Zufallseffekt (je 1/3): Ziehe 1 Karte, erhalte 5 Schild oder verursache 5 zusätzlichen Schaden.');
  }
  return lines.join('\n');
}

export function resonanceUsesNachhall(resonance: ResonanceDef): boolean {
  return (resonance.damage ?? 0) > 0 || (resonance.block ?? 0) > 0;
}

export function resonanceEffectText(resonance: ResonanceDef, nachhall = 0): string {
  const bonus = resonanceUsesNachhall(resonance) ? Math.max(0, nachhall) : 0;
  const damage = (resonance.damage ?? 0) + bonus;
  const block = (resonance.block ?? 0) + bonus;

  switch (resonance.effect) {
    case 'draw':
      return `Resonanz: Ziehe ${resonance.draw ?? 1} Karte.`;
    case 'block':
      return `Resonanz: Erhalte ${block} Schild.`;
    case 'damage':
      return `Resonanz: Füge allen Gegnern ${damage} Schaden zu.`;
    case 'balance':
      return `Resonanz: Füge allen Gegnern ${damage} Schaden zu und erhalte ${block} Schild.`;
    case 'energy':
      return `Resonanz: Erhalte ${resonance.energy ?? 1} Energie, doch die nächste gespielte Karte beendet deinen Zug sofort.`;
    case 'echo':
      return `Resonanz: Erhalte ${block} Schild. Bei 2 oder mehr Gegnern ziehst du zusätzlich ${resonance.draw ?? 1} Karte.`;
    case 'storm':
      return `Resonanz: Verursache ${resonance.hits ?? 3}-mal ${damage} Schaden an zufälligen Gegnern.`;
    case 'heal':
      return `Resonanz: Heile ${resonance.heal ?? 2} Leben.`;
  }
}

export function resonanceDetails(resonance: ResonanceDef, nachhall = 0): string {
  const lines = [
    resonanceEffectText(resonance, nachhall),
    'Auslösung: Spiele in einem Zug Karten aus 3 verschiedenen Kategorien. Danach werden die gesammelten Kategorien zurückgesetzt.',
  ];
  if (nachhall > 0 && resonanceUsesNachhall(resonance)) {
    lines.push(`Basis: ${resonanceEffectText(resonance, 0)}`);
    lines.push(
      `Resonanz-Nachhall Stufe ${nachhall}: +${nachhall} auf jeden angegebenen Schadens- und Schildwert.`,
    );
  }
  if (resonance.effect === 'damage' || resonance.effect === 'balance') {
    lines.push('Der Resonanzschaden trifft jeden lebenden Gegner und kostet keine Energie.');
  }
  if (resonance.effect === 'storm') {
    lines.push('Jeder Treffer wählt zufällig einen aktuell lebenden Gegner.');
  }
  if (resonance.effect === 'heal') {
    lines.push('Die Heilung kann dein maximales Leben nicht überschreiten.');
  }
  return lines.join('\n');
}

const ARTIFACT_DETAILS: Record<string, string> = {
  schildkern:
    'Zu Beginn jedes deiner Züge erhältst du 2 Schild. Wie anderer Schild schützt er vor dem nächsten eingehenden Schaden.',
  glasherz:
    'Das maximale Leben wird beim Start des Runs um 20 % verringert. Jeder von dir verursachte Kartenschaden wird um 20 % erhöht und anschließend gerundet.',
  dornenkrone:
    'Nur Schaden, der deinen Schild vollständig durchdringt, löst den Effekt aus: Du verlierst 1 zusätzliches Leben und der Angreifer erleidet 4 Schaden.',
  sanduhr:
    'In jedem Zug kostet die erste ausgespielte Karte mit aufgedruckten Kosten von mindestens 3 genau 1 Energie weniger.',
  vampirfang:
    'Die erste Angriffskarte jedes Zuges heilt 2 Leben. Mehrfachtreffer derselben Karte lösen nur eine Heilung aus.',
  phasenanker: 'In Zug 3, 6, 9 und so weiter erhältst du für diesen Zug 1 zusätzliche Energie.',
  seelenspiegel:
    'Zu Beginn deines Zuges bleibt die abgerundete Hälfte des vorhandenen Schilds erhalten. Neuer Startschild wird danach hinzugefügt.',
  resonanzstein:
    'Nach einer Resonanz werden die Kategorien zurückgesetzt. Dadurch kannst du mit 3 weiteren verschiedenen Kategorien eine zweite Resonanz im selben Zug auslösen.',
  blutvertrag:
    'Zu Beginn jedes Kampfes verlierst du bis zu 6 Leben, kannst dadurch aber nie unter 1 Leben fallen. Die +2 Stärke gelten für den gesamten Kampf.',
  funkenreif:
    'Nur im ersten Zug jedes Kampfes erhältst du 1 Energie zusätzlich zu deiner maximalen Energie.',
  'weise-feder': 'Zu Beginn jedes Kampfes ziehst du für deine erste Hand 2 zusätzliche Karten.',
  runenpanzer:
    'Zu Beginn jedes Kampfes erhältst du einmalig 8 Schild. Weitere Startschild-Effekte werden addiert.',
  jaegerauge:
    'Der erste Angriffstreffer jedes Kampfes verursacht doppelten Schaden, wenn sein Ziel noch volles Leben hat.',
  risskelch:
    'Nach jedem gewonnenen Kampf werden sofort bis zu 8 Leben geheilt. Die Heilung überschreitet dein maximales Leben nicht.',
  beutesack:
    'Nach jedem gewonnenen Kampf stehen 4 statt 3 unterschiedliche Belohnungskarten zur Auswahl.',
};

export function artifactDetails(artifact: ArtifactDef): string {
  return `${artifact.text}\n${ARTIFACT_DETAILS[artifact.id] ?? 'Dieses Artefakt ist während des gesamten Runs aktiv.'}`;
}
