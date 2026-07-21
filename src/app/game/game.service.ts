import { Injectable, signal } from '@angular/core';
import { GameCombatService } from './game-combat.service';
import { AllyDef, ArtifactDef, CardDef, MetaUpgradeDef, ResonanceDef } from './models';

interface PurchaseConfirmation {
  itemType: 'Karte' | 'Artefakt' | 'Resonanz' | 'Upgrade' | 'Verbündeten';
  itemName: string;
  purchase: () => void;
}

/**
 * Öffentliche Spielfassade für Komponenten.
 *
 * Die Fachlogik liegt in den vererbten Modulen für Meta, Deck, Run und Kampf.
 */
@Injectable({ providedIn: 'root' })
export class GameService extends GameCombatService {
  readonly purchaseConfirmation = signal<PurchaseConfirmation | null>(null);

  requestCardPurchase(card: CardDef) {
    if (!this.canBuyCard(card)) return;
    this.purchaseConfirmation.set({
      itemType: 'Karte',
      itemName: card.name,
      purchase: () => this.buyCard(card),
    });
  }

  requestArtifactPurchase(artifact: ArtifactDef) {
    if (!this.canBuyArtifact(artifact)) return;
    this.purchaseConfirmation.set({
      itemType: 'Artefakt',
      itemName: artifact.name,
      purchase: () => this.buyArtifact(artifact),
    });
  }

  requestResonancePurchase(resonance: ResonanceDef) {
    if (!this.canBuyResonance(resonance)) return;
    this.purchaseConfirmation.set({
      itemType: 'Resonanz',
      itemName: resonance.name,
      purchase: () => this.buyResonance(resonance),
    });
  }

  requestUpgradePurchase(upgrade: MetaUpgradeDef) {
    if (!this.canBuyUpgrade(upgrade.id)) return;
    this.purchaseConfirmation.set({
      itemType: 'Upgrade',
      itemName: upgrade.name,
      purchase: () => this.buyUpgrade(upgrade.id),
    });
  }

  requestAllyPurchase(ally: AllyDef) {
    if (!this.canBuyAlly(ally)) return;
    this.purchaseConfirmation.set({
      itemType: 'Verbündeten',
      itemName: ally.name,
      purchase: () => this.buyAlly(ally),
    });
  }

  confirmPurchase() {
    const confirmation = this.purchaseConfirmation();
    if (!confirmation) return;
    this.purchaseConfirmation.set(null);
    confirmation.purchase();
  }

  cancelPurchase() {
    this.purchaseConfirmation.set(null);
  }
}
