import { Injectable, signal } from '@angular/core';
import { GameCombatService } from './game-combat.service';
import { AllyDef, ArtifactDef, CardDef, MetaUpgradeDef, ResonanceDef } from './models';
import { secureLoad, secureSave } from './storage';

const PURCHASE_CONFIRMATION_KEY = 'riftbound-purchase-confirmation-v1';

interface PurchaseConfirmation {
  itemType: 'Karte' | 'Artefakt' | 'Resonanz' | 'Upgrade' | 'Verbündeten' | 'Verbündeten-Upgrade';
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
  readonly purchaseConfirmationEnabled = signal(
    secureLoad<boolean>(PURCHASE_CONFIRMATION_KEY) ?? true,
  );

  setPurchaseConfirmationEnabled(enabled: boolean) {
    this.purchaseConfirmationEnabled.set(enabled);
    secureSave(PURCHASE_CONFIRMATION_KEY, enabled);
    if (!enabled) this.cancelPurchase();
  }

  private requestPurchase(purchase: PurchaseConfirmation) {
    if (!this.purchaseConfirmationEnabled()) {
      purchase.purchase();
      return;
    }
    this.purchaseConfirmation.set(purchase);
  }

  requestCardPurchase(card: CardDef) {
    if (!this.canBuyCard(card)) return;
    this.requestPurchase({
      itemType: 'Karte',
      itemName: card.name,
      purchase: () => this.buyCard(card),
    });
  }

  requestArtifactPurchase(artifact: ArtifactDef) {
    if (!this.canBuyArtifact(artifact)) return;
    this.requestPurchase({
      itemType: 'Artefakt',
      itemName: artifact.name,
      purchase: () => this.buyArtifact(artifact),
    });
  }

  requestResonancePurchase(resonance: ResonanceDef) {
    if (!this.canBuyResonance(resonance)) return;
    this.requestPurchase({
      itemType: 'Resonanz',
      itemName: resonance.name,
      purchase: () => this.buyResonance(resonance),
    });
  }

  requestUpgradePurchase(upgrade: MetaUpgradeDef) {
    if (!this.canBuyUpgrade(upgrade.id)) return;
    this.requestPurchase({
      itemType: 'Upgrade',
      itemName: upgrade.name,
      purchase: () => this.buyUpgrade(upgrade.id),
    });
  }

  requestAllyPurchase(ally: AllyDef) {
    if (!this.canBuyAlly(ally)) return;
    this.requestPurchase({
      itemType: 'Verbündeten',
      itemName: ally.name,
      purchase: () => this.buyAlly(ally),
    });
  }

  requestAllyUpgrade(ally: AllyDef) {
    if (!this.canUpgradeAlly(ally)) return;
    this.requestPurchase({
      itemType: 'Verbündeten-Upgrade',
      itemName: `${ally.name} auf Stufe ${this.allyLevel(ally.id) + 1}`,
      purchase: () => this.upgradeAlly(ally),
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
