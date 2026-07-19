import { CardDef, CardSort, CardType, Category } from '../game/models';
import { GameScreen } from './screen-base';

/** Gemeinsame Kartendarstellung für Deck, Shop, Belohnungen und Kampf. */
export abstract class CardScreenBase extends GameScreen {
  readonly cardTypes: CardType[] = ['Angriff', 'Verteidigung', 'Technik', 'Macht'];
  readonly cardCategories: Category[] = ['Kraft', 'Schutz', 'Kontrolle', 'Chaos'];
  readonly cardSortOptions: { value: CardSort; label: string }[] = [
    { value: 'name-asc', label: 'Name A–Z' },
    { value: 'name-desc', label: 'Name Z–A' },
    { value: 'energy-asc', label: 'Energie aufsteigend' },
    { value: 'energy-desc', label: 'Energie absteigend' },
    { value: 'price-asc', label: 'Preis aufsteigend' },
    { value: 'price-desc', label: 'Preis absteigend' },
    { value: 'type', label: 'Farbe' },
    { value: 'category', label: 'Kategorie' },
  ];

  // ---------- Tooltip-Texte ----------
  readonly tips = {
    schild: 'Schild blockt eingehenden Schaden und verfällt zu Beginn deines nächsten Zuges.',
    staerke: 'Stärke: Angriffe verursachen so viel zusätzlichen Schaden.',
    schwaeche: 'Schwäche: 25 % weniger Schaden verursachen. Sinkt pro Zug um 1.',
    verwundbar: 'Verwundbarkeit: 50 % mehr Schaden erleiden. Sinkt pro Zug um 1.',
    energie: 'Energie: Wird zum Ausspielen von Karten benötigt und pro Zug erneuert.',
    zieh: 'Nachziehstapel: von hier ziehst du Karten.',
    ablage: 'Ablagestapel: Wird neu gemischt, wenn der Nachziehstapel leer ist.',
    resonanz: 'Spiele 3 verschiedene Kategorien in einem Zug, um eine Resonanz auszulösen.',
  };

  typeClass(type: CardType): string {
    switch (type) {
      case 'Angriff': return 'card-angriff';
      case 'Verteidigung': return 'card-verteidigung';
      case 'Technik': return 'card-technik';
      case 'Macht': return 'card-macht';
      case 'Fluch': return 'card-fluch';
    }
  }

  cardDetails(def: CardDef): string {
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
    if (def.endTurnBlock) {
      lines.push('Als Macht bleibt dieser Effekt nach dem Ausspielen für den gesamten Kampf aktiv.');
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


}




