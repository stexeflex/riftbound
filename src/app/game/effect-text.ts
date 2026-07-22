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
    text: 'Im Ausrüstungslayout kannst du bis zu 3 freigeschaltete Verbündete wählen. Sie werden zu Beginn jedes Kampfes mit vollen Leben neu beschworen und bleiben bis zu ihrer Niederlage oder dem Ende ihrer Dauer.',
  },
  {
    term: '🎯 Provokation',
    text: 'Provokation bestimmt das Ziel gezielter Gegnerangriffe. Deine eigene Provokation hat Vorrang, danach ein provozierender Verbündeter. Gruppenschaden wird nicht umgelenkt.',
  },
  {
    term: '🎲 Gegnerische Zielwahl',
    text: 'Ohne Provokation wählt jeder gezielte Gegnerangriff zufällig dich oder einen lebenden Verbündeten. Das angekündigte Ziel steht bei der Gegnerabsicht.',
  },
  {
    term: '↔️ Verbündetenformation',
    text: 'In der Ausrüstung legst du fest, wer vor oder hinter dir steht und wer der vorderste beziehungsweise hinterste Verbündete ist. Befehlskarten verwenden diese Reihenfolge.',
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
    `Werte: ${ally.maxHp} maximale Leben und ${ally.commandDamage} Schaden bei einem befohlenen Angriff.`,
    `Freischaltung: Kostet ${ally.costKerne} Kerne, gilt dauerhaft und wird direkt im aktiven Ausrüstungslayout ausgerüstet.`,
  ].join('\n');
}

/** Zentrale Zusatzregeln für Karten-Hover in Shop, Deck, Belohnung und Kampf. */
export function cardDetails(def: CardDef): string {
  const lines: string[] = [];
  if (def.damage) {
    const target = def.target === 'all' ? 'allen lebenden Gegnern' : 'dem gewählten Gegner';
    const hits = def.hits ?? 1;
    lines.push(hits > 1
      ? `Schaden: Fügt ${target} ${hits}-mal ${def.damage} Basisschaden zu.`
      : `Schaden: Fügt ${target} ${def.damage} Basisschaden zu.`);
  }
  if (def.block) {
    lines.push(`Schild: Gewährt sofort ${def.block} Schild. Restschild verfällt grundsätzlich zu Beginn deines nächsten Zuges.`);
  }
  if (def.draw) {
    lines.push(`Nachziehen: Ziehe ${def.draw} ${def.draw === 1 ? 'Karte' : 'Karten'}. Ist der Nachziehstapel leer, wird die Ablage gemischt.`);
  }
  if (def.energy) {
    lines.push(`Energie: Gewährt sofort ${def.energy} Energie, die noch in diesem Zug verwendet werden kann.`);
  }
  if (def.heal) {
    lines.push(`Heilung: Heilt ${def.heal} Leben, aber nie über dein maximales Leben hinaus.`);
  }
  if (def.blockPerEnemy) {
    lines.push(`Schild pro Gegner: Gewährt ${def.blockPerEnemy} Schild für jeden beim Ausspielen noch lebenden Gegner.`);
  }
  if (def.target === 'all') {
    lines.push('Flächeneffekt: Trifft jeden aktuell lebenden Gegner.');
  }
  if (def.strength) {
    lines.push(`Stärke: Erhöht jeden eigenen Angriffstreffer um ${def.strength} und bleibt bis zum Kampfende.`);
  }
  if (def.startTurnBlock) {
    lines.push(`Zuganfangsschild: Gewährt ab deinem nächsten Zug am Anfang jedes Zuges ${def.startTurnBlock} Schild.`);
  }
  if (def.veil) {
    lines.push(`Verschleierung: ${VEIL_DETAIL}`);
  }
  if (def.reflection) {
    lines.push(`Reflektion: ${REFLECTION_DETAIL}`);
  }
  if (def.purgeEnemyBuffs) {
    lines.push(`Effektbann: Entfernt bis zu ${def.purgeEnemyBuffs} positive Effektarten. Stärke und Schild verlieren dabei ihren gesamten aktuellen Wert.`);
  }
  if (def.retainBlock) {
    lines.push(`Schildtransfer: Überträgt bis zu ${def.retainBlock} Schild, der nach dem Gegnerzug übrig ist, in deinen nächsten Zug.`);
  }
  if (def.summonAlly) {
    const ally = ALLIES[def.summonAlly];
    if (ally) lines.push(`${ally.name}: ${ally.text}`);
    lines.push('Beschwörung: Du kannst höchstens 3 unterschiedliche Verbündete gleichzeitig kontrollieren. Ein aktiver Verbündeter kann nicht erneut beschworen werden.');
  }
  if (def.damagePerAlly) {
    lines.push(`Verbundbonus: Gewährt ${def.damagePerAlly} zusätzlichen Schaden pro aktivem Verbündeten.`);
  }
  if (def.healAllies) {
    lines.push(`Verbündetenheilung: Heilt jeden lebenden Verbündeten um ${def.healAllies} Leben bis zu seinem Maximum.`);
  }
  if (def.allyStrength) {
    lines.push(`Verbündetenstärke: Erhöht jeden von Verbündeten verursachten Schadenswert um ${def.allyStrength} bis zum Kampfende.`);
  }
  if (def.commandAlly) {
    const position = def.commandAlly === 'front' ? 'vorderste' : 'hinterste';
    lines.push(`Verbündetenbefehl: Der ${position} lebende Verbündete greift dein gewähltes Ziel sofort mit seinem Angriffswert an.`);
  }
  if (def.playerTaunt) {
    lines.push('Provokation: Bis zu deinem nächsten Zug treffen alle gezielten Gegnerangriffe dich. Gruppenschaden bleibt unverändert.');
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
  if (def.unplayable) {
    lines.push('Nicht spielbar: Diese Karte blockiert einen Platz auf deiner Hand und kann nicht ausgespielt werden.');
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
