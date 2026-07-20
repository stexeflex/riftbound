import { ArtifactDef, ResonanceDef } from './models';

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
