import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

// Služby košíku
import { CartService, CartItem } from '../components/services/cart.service';

// Přímé importy dialogových služeb
import { AlertDialogService } from '../../../core/services/alert-dialog.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent {

  constructor(
    public cartService: CartService,
    private router: Router,
    private confirmDialogService: ConfirmDialogService,
    private alertDialogService: AlertDialogService
  ) {}

  decreaseQuantity(itemId: string): void {
    const item = this.cartService.cartItems().find(i => i.id === itemId);
    if (item && Number(item.quantity) > 1) {
      this.cartService.updateItemQuantity(itemId, Number(item.quantity) - 1);
    }
  }

  increaseQuantity(itemId: string): void {
    const item = this.cartService.cartItems().find(i => i.id === itemId);
    
    if (!item) {
      console.error(`[DEBUG KOŠÍK] Položka s ID ${itemId} nebyla v košíku nalezena!`);
      return;
    }

    // Explicitní přetypování na čísla pro jistotu (obrana proti stringům z inputů/databáze)
    const aktualniMnozstvi = Number(item.quantity);
    const stropSkladu = Number(item.stock_quantity);

    // 🔍 KONTROLNÍ VÝPIS DO KONZOLE (F12)
    console.log('=== POKUS O NAVÝŠENÍ MNOŽSTVÍ ===');
    console.log(`Produkt: ${item.product_name}`);
    console.log(`Aktuální množství (jako číslo): ${aktualniMnozstvi} (Typ: ${typeof aktualniMnozstvi})`);
    console.log(`Skladový strop (jako číslo): ${stropSkladu} (Typ: ${typeof stropSkladu})`);
    console.log(`Porovnání (${aktualniMnozstvi} >= ${stropSkladu}):`, aktualniMnozstvi >= stropSkladu);

    // STRIKTNÍ STOPKA V UI
    if (aktualniMnozstvi >= stropSkladu) {
      console.warn(`[STOPKA] Limit byl dosažen! Služba CartService už nebude volána.`);
      return;
    }

    const noveMnozstvi = aktualniMnozstvi + 1;
    console.log(`[OK] Volám cartService.updateItemQuantity s hodnotou: ${noveMnozstvi}`);
    
    this.cartService.updateItemQuantity(itemId, noveMnozstvi);
  }

  // Bezpečné vyhodnocení stavu skladu pro šablonu (HTML)
  isMaxStockReached(item: CartItem): boolean {
    if (!item) return false;
    
    const aktualniMnozstvi = Number(item.quantity);
    const stropSkladu = Number(item.stock_quantity);
    
    const dosazeno = aktualniMnozstvi >= stropSkladu;

    // Pokud je dosaženo limitu, vypíšeme upozornění do konzole pro kontrolu stavu komponenty
    if (dosazeno) {
      console.log(`[UI DETEKCE MAXIMA] ${item.product_name} dosáhl stropu. Košík: ${aktualniMnozstvi}ks, Sklad: ${stropSkladu}ks.`);
    }

    return dosazeno;
  }

  removeItem(itemId: string): void {
    this.confirmDialogService.open(
      'Odstranit z košíku', 
      'Opravdu chcete odstranit tuto položku z košíku?'
    )
    .then(confirmed => {
      if (confirmed) {
        this.cartService.removeItem(itemId);
        this.alertDialogService.open(
          'Košík aktualizován', 
          'Položka byla úspěšně odstraněna.', 
          'success'
        );
      }
    })
    .catch(() => {});
  }

  proceedToCheckout(): void {
    this.router.navigate(['/shop/checkout']);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0
    }).format(price);
  }
}