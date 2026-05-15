import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

// RxJS operátory pro pokročilý debouncing a rušení asynchronních požadavků
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, switchMap, catchError } from 'rxjs/operators';

// Služby košíku a e-shopu
import { CartService, CartItem } from '../components/services/cart.service';
import { ShopPublicService } from '../components/services/public-data.service';

// Přímé importy služeb pro absolutní bezpečnost (Tree Shaking)
import { AlertDialogService } from '../../../core/services/alert-dialog.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit, OnDestroy {
  // Pomocný objekt pro zamknutí tlačítek během ověřování skladu v DB
  loadingItems: { [key: string]: boolean } = {};

  // Stream a subscription pro ošetření zběsilého klikání na "+"
  private quantityChangeSubject = new Subject<{ itemId: string, targetQuantity: number }>();
  private quantitySubscription!: Subscription;

  constructor(
    public cartService: CartService,
    private shopService: ShopPublicService,
    private router: Router,
    private confirmDialogService: ConfirmDialogService,
    private alertDialogService: AlertDialogService
  ) {}

  ngOnInit(): void {
    // ⚙️ CHYTRÁ SYNCHRONIZACE KOŠÍKU
    this.quantitySubscription = this.quantityChangeSubject.pipe(
      debounceTime(400), // Počkáme 400ms od posledního kliknutí, než pošleme dotaz na API
      switchMap(({ itemId, targetQuantity }) => {
        this.loadingItems[itemId] = true;

        // Extrakce ID produktu a varianty (např. "12_3" -> produkt 12, varianta 3)
        const [productId, variantIdStr] = itemId.split('_');
        const variantId = variantIdStr && variantIdStr !== 'novariant' ? Number(variantIdStr) : null;

        // switchMap automaticky zruší (cancelne) předchozí HTTP request, pokud uživatel mezitím kliknul znovu
        return this.shopService.checkStockAvailability(productId, variantId, targetQuantity).pipe(
          // Mapujeme výsledek, abychom v subscribe znali kontext původního itemu
          switchMap(isAvailable => of({ isAvailable, itemId, targetQuantity })),
          // Zachytíme chybu přímo uvnitř streamu, aby nám nespadla celá subscription
          catchError((err) => {
            this.alertDialogService.open('Chyba', err.message || 'Nepodařilo se ověřit stav skladu.', 'danger');
            return of({ isAvailable: true, itemId, targetQuantity }); // V případě fatální chyby sítě neblokujeme UI
          })
        );
      })
    ).subscribe({
      next: ({ isAvailable, itemId, targetQuantity }) => {
        if (!isAvailable) {
          console.warn(`[API Výsledek] Sklad už toto množství nepovolí. Vracím zpět.`);
          
          this.alertDialogService.open(
            'Nedostupné množství', 
            'Omlouváme se, ale požadované množství již není k dispozici. Košík byl upraven na maximum.', 
            'warning'
          );
          
          // Pokud sklad finální číslo nepovolí, upravíme košík na poslední bezpečné množství (targetQuantity - 1)
          const item = this.cartService.cartItems().find(i => i.id === itemId);
          if (item) {
            this.cartService.updateItemQuantity(itemId, targetQuantity - 1);
            item.stock_quantity = targetQuantity - 1; // Zafixujeme lokální maximum pro UI hlášku
          }
        }
        this.loadingItems[itemId] = false;
      }
    });
  }

  ngOnDestroy(): void {
    // Poctivý cleanup, aby nevznikal memory leak v paměti prohlížeče
    if (this.quantitySubscription) {
      this.quantitySubscription.unsubscribe();
    }
  }

  decreaseQuantity(itemId: string): void {
    const item = this.cartService.cartItems().find(i => i.id === itemId);
    if (item && item.quantity > 1) {
      // Snížení množství provádíme ihned, není potřeba zatěžovat databázi validací
      this.cartService.updateItemQuantity(itemId, item.quantity - 1);
      
      // Skryjeme případné varování "Max. dostupné množství"
      if (item.quantity < item.stock_quantity) {
        item.stock_quantity = 9999; 
      }
    }
  }

  increaseQuantity(itemId: string): void {
    const item = this.cartService.cartItems().find(i => i.id === itemId);
    if (!item || this.loadingItems[itemId]) return;

    const targetQuantity = item.quantity + 1;

    // 🚀 UX BLESKOVÁ ODEZVA: Číslo v košíku navýšíme ihned v UI, aby uživatel viděl reakci
    this.cartService.updateItemQuantity(itemId, targetQuantity);

    // Požadavek odešleme do debouncovaného streamu, který provede kontrolu s odstupem
    this.quantityChangeSubject.next({ itemId, targetQuantity });
  }

  isMaxStockReached(item: CartItem): boolean {
    return item.quantity >= item.stock_quantity;
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
    .catch(() => {
      // Zachycení zavření dialogu bez potvrzení (např. kliknutím na křížek)
    });
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