import { CardDef, CardSort, CardType, Category } from '../game/models';
import { cardDetails as buildCardDetails } from '../game/effect-text';
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
    resonanz: 'Spiele 3 verschiedene Kategorien in einem Zug, um eine Resonanz auszulösen. Standardmäßig löst sie höchstens 1× pro Zug aus.',
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

  categoryClass(category: Category): string {
    switch (category) {
      case 'Kraft': return 'cat-kraft';
      case 'Schutz': return 'cat-schutz';
      case 'Kontrolle': return 'cat-kontrolle';
      case 'Chaos': return 'cat-chaos';
    }
  }

  cardDetails(def: CardDef): string {
    return buildCardDetails(def);
  }


}




