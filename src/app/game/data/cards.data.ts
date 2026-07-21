import { CardDef } from '../models';

// ------------------------- Karten -------------------------

export const CARDS: Record<string, CardDef> = {
  hiebschlag: {
    id: 'hiebschlag', name: 'Hiebschlag', cost: 1, type: 'Angriff', category: 'Kraft', price: 40,
    text: 'Füge 8 Schaden zu.', damage: 8,
  },
  schildstoss: {
    id: 'schildstoss', name: 'Schildstoß', cost: 1, type: 'Verteidigung', category: 'Schutz', price: 40,
    text: 'Erhalte 8 Schild.', block: 8,
  },
  konzentration: {
    id: 'konzentration', name: 'Konzentration', cost: 1, type: 'Technik', category: 'Kontrolle', price: 60,
    text: 'Ziehe 2 Karten.', draw: 2,
  },
  schattenklinge: {
    id: 'schattenklinge', name: 'Schattenklinge', cost: 1, type: 'Angriff', category: 'Chaos', price: 80,
    text: 'Füge 12 Schaden zu. Erhalte 1 Schwäche.', damage: 12, selfWeak: 1,
  },
  chaoswoge: {
    id: 'chaoswoge', name: 'Chaoswoge', cost: 2, type: 'Angriff', category: 'Chaos', price: 80,
    text: 'Füge 6 Schaden zu. Zufälliger Zusatzeffekt.', damage: 6, randomBonus: true,
  },
  defensiveHaltung: {
    id: 'defensiveHaltung', name: 'Defensive Haltung', cost: 2, type: 'Verteidigung', category: 'Schutz', price: 70,
    text: 'Erhalte 13 Schild.', block: 13,
  },
  klingenwirbel: {
    id: 'klingenwirbel', name: 'Klingenwirbel', cost: 2, type: 'Angriff', category: 'Kraft', price: 80,
    text: 'Füge 2-mal 7 Schaden zu.', damage: 7, hits: 2,
  },
  gezielterSchlag: {
    id: 'gezielterSchlag', name: 'Gezielter Schlag', cost: 1, type: 'Angriff', category: 'Kraft', price: 60,
    text: 'Füge 6 Schaden zu. Verursache 2 Verwundbarkeit.', damage: 6, vulnerableEnemy: 2,
  },
  zerreissen: {
    id: 'zerreissen', name: 'Zerreißen', cost: 1, type: 'Angriff', category: 'Kontrolle', price: 60,
    text: 'Füge 5 Schaden zu. Verursache 2 Schwäche.', damage: 5, weakEnemy: 2,
  },
  magischeBarriere: {
    id: 'magischeBarriere', name: 'Magische Barriere', cost: 1, type: 'Verteidigung', category: 'Schutz', price: 70,
    text: 'Erhalte 6 Schild. Ziehe 1 Karte.', block: 6, draw: 1,
  },
  praezision: {
    id: 'praezision', name: 'Präzision', cost: 1, type: 'Macht', category: 'Kraft', price: 90,
    text: 'Deine Angriffe verursachen diesen Kampf +2 Schaden.', strength: 2,
  },
  eiserneHaut: {
    id: 'eiserneHaut', name: 'Eiserne Haut', cost: 2, type: 'Macht', category: 'Schutz', price: 90,
    text: 'Erhalte ab deinem nächsten Zug am Anfang jedes Zuges 3 Schild.', startTurnBlock: 3,
  },
  nachladen: {
    id: 'nachladen', name: 'Nachladen', cost: 0, type: 'Technik', category: 'Kontrolle', price: 50,
    text: 'Ziehe 1 Karte.', draw: 1,
  },
  instabilerSchlag: {
    id: 'instabilerSchlag', name: 'Instabiler Schlag', cost: 0, type: 'Angriff', category: 'Chaos', price: 40,
    text: 'Füge 4 Schaden zu.', damage: 4,
  },
  brecher: {
    id: 'brecher', name: 'Rüstungsbrecher', cost: 2, type: 'Angriff', category: 'Kraft', price: 100,
    text: 'Füge 15 Schaden zu. Verursache 1 Verwundbarkeit.', damage: 15, vulnerableEnemy: 1,
  },
  doppelklinge: {
    id: 'doppelklinge', name: 'Doppelklinge', cost: 1, type: 'Angriff', category: 'Kraft', price: 80,
    text: 'Füge 2-mal 4 Schaden zu.', damage: 4, hits: 2,
  },
  hinrichtung: {
    id: 'hinrichtung', name: 'Hinrichtung', cost: 3, type: 'Angriff', category: 'Kraft', price: 130,
    text: 'Füge 28 Schaden zu.', damage: 28,
  },
  blutrausch: {
    id: 'blutrausch', name: 'Blutrausch', cost: 1, type: 'Macht', category: 'Kraft', price: 120,
    text: 'Erhalte +3 Stärke. Erhalte 1 Schwäche.', strength: 3, selfWeak: 1,
  },
  bollwerk: {
    id: 'bollwerk', name: 'Bollwerk', cost: 2, type: 'Verteidigung', category: 'Schutz', price: 90,
    text: 'Erhalte 18 Schild.', block: 18,
  },
  wachsamkeit: {
    id: 'wachsamkeit', name: 'Wachsamkeit', cost: 1, type: 'Verteidigung', category: 'Schutz', price: 80,
    text: 'Erhalte 7 Schild. Ziehe 1 Karte.', block: 7, draw: 1,
  },
  festungsritual: {
    id: 'festungsritual', name: 'Festungsritual', cost: 3, type: 'Macht', category: 'Schutz', price: 140,
    text: 'Erhalte ab deinem nächsten Zug am Anfang jedes Zuges 6 Schild.', startTurnBlock: 6,
  },
  schutzkreis: {
    id: 'schutzkreis', name: 'Schutzkreis', cost: 1, type: 'Verteidigung', category: 'Schutz', price: 100,
    text: 'Erhalte 5 Schild pro lebendem Gegner.', blockPerEnemy: 5,
  },
  einschuechtern: {
    id: 'einschuechtern', name: 'Einschüchtern', cost: 1, type: 'Technik', category: 'Kontrolle', price: 90,
    text: 'Verursache bei allen Gegnern 2 Schwäche.', weakEnemy: 2, target: 'all',
  },
  markieren: {
    id: 'markieren', name: 'Kettenmarkierung', cost: 1, type: 'Technik', category: 'Kontrolle', price: 110,
    text: 'Verursache bei allen Gegnern 1 Verwundbarkeit. Ziehe 1 Karte.', vulnerableEnemy: 1, draw: 1, target: 'all',

  },
  zeitfenster: {
    id: 'zeitfenster', name: 'Zeitfenster', cost: 1, type: 'Technik', category: 'Kontrolle', price: 120,
    text: 'Erhalte 1 Energie. Ziehe 2 Karten.', energy: 1, draw: 2,
  },
  umleitung: {
    id: 'umleitung', name: 'Umleitung', cost: 1, type: 'Verteidigung', category: 'Kontrolle', price: 90,
    text: 'Erhalte 8 Schild. Verursache 1 Schwäche.', block: 8, weakEnemy: 1,
  },
  risssalve: {
    id: 'risssalve', name: 'Risssalve', cost: 2, type: 'Angriff', category: 'Chaos', price: 110,
    text: 'Füge allen Gegnern 7 Schaden zu.', damage: 7, target: 'all',
  },
  funkenflug: {
    id: 'funkenflug', name: 'Funkenflug', cost: 1, type: 'Angriff', category: 'Chaos', price: 100,
    text: 'Füge allen Gegnern 3 Schaden zu. Ziehe 1 Karte.', damage: 3, draw: 1, target: 'all',
  },
  gluecksspiel: {
    id: 'gluecksspiel', name: 'Glücksspiel', cost: 0, type: 'Technik', category: 'Chaos', price: 80,
    text: 'Löse einen zufälligen Zusatzeffekt aus.', randomBonus: true,
  },
  ueberladung: {
    id: 'ueberladung', name: 'Überladung', cost: 2, type: 'Angriff', category: 'Chaos', price: 100,
    text: 'Füge 19 Schaden zu. Erhalte 2 Schwäche.', damage: 19, selfWeak: 2,
  },
  phasenschritt: {
    id: 'phasenschritt', name: 'Phasenschritt', cost: 2, type: 'Technik', category: 'Kontrolle', price: 130,
    text: 'Erhalte 1 Verschleierung. Ziehe 1 Karte.', veil: 1, draw: 1,
  },
  spiegelwacht: {
    id: 'spiegelwacht', name: 'Spiegelwacht', cost: 2, type: 'Verteidigung', category: 'Schutz', price: 120,
    text: 'Erhalte 8 Schild. Der nächste gegnerische Treffer reflektiert 8 Schaden.',
    block: 8, reflection: 8,
  },
  bannzeichen: {
    id: 'bannzeichen', name: 'Bannzeichen', cost: 1, type: 'Technik', category: 'Kontrolle', price: 110,
    text: 'Entferne bis zu 2 positive Effekte vom Ziel. Ziehe 1 Karte.',
    purgeEnemyBuffs: 2, draw: 1,
  },
  schildanker: {
    id: 'schildanker', name: 'Schildanker', cost: 1, type: 'Verteidigung', category: 'Schutz', price: 100,
    text: 'Erhalte 7 Schild. Übertrage bis zu 5 Restschild in deinen nächsten Zug.',
    block: 7, retainBlock: 5,
  },
  risswaechter: {
    id: 'risswaechter', name: 'Risswächter', cost: 2, type: 'Macht', category: 'Schutz', price: 150,
    text: 'Beschwöre einen Risswächter mit 12 Leben und Provokation.',
    summonAlly: 'risswaechter',
  },
  funkengeist: {
    id: 'funkengeist', name: 'Funkengeist', cost: 2, type: 'Macht', category: 'Chaos', price: 150,
    text: 'Beschwöre für 3 Zuganfänge einen Funkengeist. Er verursacht jeweils 4 Schaden.',
    summonAlly: 'funkengeist',
  },
  verbundschlag: {
    id: 'verbundschlag', name: 'Verbundschlag', cost: 1, type: 'Angriff', category: 'Kraft', price: 100,
    text: 'Füge 6 Schaden zu. +3 Schaden pro aktivem Verbündeten.',
    damage: 6, damagePerAlly: 3,
  },
  schwaeche: {
    id: 'schwaeche', name: 'Schwäche', cost: 0, type: 'Fluch', category: 'Chaos',
    text: 'Nicht spielbar. Blockiert einen Platz in deiner Hand.', unplayable: true,
  },
};

// Karten, die als Belohnung erscheinen können
export const REWARD_POOL: string[] = [
  'schattenklinge', 'chaoswoge', 'defensiveHaltung', 'klingenwirbel',
  'gezielterSchlag', 'zerreissen', 'magischeBarriere', 'praezision',
  'eiserneHaut', 'nachladen', 'instabilerSchlag', 'brecher', 'doppelklinge',
  'hinrichtung', 'blutrausch', 'bollwerk', 'wachsamkeit', 'festungsritual',
  'schutzkreis', 'einschuechtern', 'markieren', 'zeitfenster', 'umleitung',
  'risssalve', 'funkenflug', 'gluecksspiel', 'ueberladung',
  'phasenschritt', 'spiegelwacht', 'bannzeichen', 'schildanker',
  'risswaechter', 'funkengeist', 'verbundschlag',
];

export const STARTER_DECK: string[] = [
  'hiebschlag', 'hiebschlag', 'hiebschlag', 'hiebschlag',
  'schildstoss', 'schildstoss', 'schildstoss', 'schildstoss',
  'konzentration', 'konzentration',
];

// Startsammlung: diese Karten besitzt jeder Spieler von Anfang an
export const STARTER_COLLECTION: Record<string, number> = {
  hiebschlag: 4,
  schildstoss: 4,
  konzentration: 2,
};

// Maximale Kopien einer Karte in der Sammlung
export const MAX_CARD_COPIES = 4;

// Regeln fürs Startdeck
export const DECK_MIN = 10;
export const DECK_MAX = 10;



