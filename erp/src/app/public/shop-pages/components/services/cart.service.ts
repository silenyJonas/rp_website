import { Injectable, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface CartItem {
  id: string; // uuid: productId_variantId
  product_id: number;
  product_variant_id: number | null;
  product_name: string;
  variant_name: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  vat_rate: number;
  reservedAt: number; // timestamp kdy byl přidán
}

export interface Cart {
  items: CartItem[];
  expiresAt: number; // timestamp kdy vyprší rezervace
  createdAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_STORAGE_KEY = 'shop_cart';
  private readonly RESERVATION_TIME = 15 * 60 * 1000; // 15 minut v ms

  // Signály
  private cartSignal = signal<Cart>({
    items: [],
    expiresAt: 0,
    createdAt: Date.now()
  });

  private timerSignal = signal<number>(0); // sekundy zbývající do vypršení
  private isExpiredSignal = signal<boolean>(false);

  // Computed
  cartItems = computed(() => this.cartSignal().items);
  cartCount = computed(() => this.cartItems().length);
  totalQuantity = computed(() => 
    this.cartItems().reduce((sum, item) => sum + item.quantity, 0)
  );
  subtotal = computed(() => 
    this.cartItems().reduce((sum, item) => sum + item.total_price, 0)
  );
  totalTax = computed(() => {
    return this.cartItems().reduce((sum, item) => {
      const priceWithoutTax = item.total_price / (1 + (item.vat_rate / 100));
      return sum + (item.total_price - priceWithoutTax);
    }, 0);
  });
  totalPrice = computed(() => this.subtotal());
  timeRemaining = computed(() => this.timerSignal());
  isExpired = computed(() => this.isExpiredSignal());

  private timerInterval: any;

  constructor(private http: HttpClient) {
    this.loadCart();
    this.startTimer();

    // Automatické ukládání do localStorage
    effect(() => {
      const cart = this.cartSignal();
      this.saveCart(cart);
    });
  }

  /**
   * NAČTENÍ KOŠÍKU Z LOCALSTORAGE
   */
  private loadCart(): void {
    const stored = localStorage.getItem(this.CART_STORAGE_KEY);
    if (stored) {
      try {
        const cart: Cart = JSON.parse(stored);
        const now = Date.now();

        // Kontrola expiraci
        if (now > cart.expiresAt) {
          this.cartSignal.set({
            items: [],
            expiresAt: now + this.RESERVATION_TIME,
            createdAt: now
          });
          this.isExpiredSignal.set(true);
          localStorage.removeItem(this.CART_STORAGE_KEY);
        } else {
          this.cartSignal.set(cart);
        }
      } catch (e) {
        console.error('Chyba při načítání košíku:', e);
      }
    }
  }

  /**
   * ULOŽENÍ KOŠÍKU DO LOCALSTORAGE
   */
  private saveCart(cart: Cart): void {
    localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(cart));
  }

  /**
   * PŘIDÁNÍ POLOŽKY DO KOŠÍKU
   */
  addItem(product: any, variant: any | null, quantity: number = 1): void {
    const itemId = this.generateItemId(product.id, variant?.id);
    const existingItem = this.cartItems().find(i => i.id === itemId);

    const unitPrice = variant ? variant.price_with_vat : product.price;
    const variantName = variant ? variant.variant_name : null;
    const vatRate = variant?.vat_rate || product.vat_rate || 21;

    if (existingItem) {
      // Zvýšíme množství
      this.updateItemQuantity(itemId, existingItem.quantity + quantity);
    } else {
      // Nová položka
      const newItem: CartItem = {
        id: itemId,
        product_id: product.id,
        product_variant_id: variant?.id || null,
        product_name: product.name,
        variant_name: variantName,
        quantity,
        unit_price: unitPrice,
        total_price: unitPrice * quantity,
        vat_rate: vatRate,
        reservedAt: Date.now()
      };

      const cart = this.cartSignal();
      const updatedCart: Cart = {
        ...cart,
        items: [...cart.items, newItem],
        expiresAt: Date.now() + this.RESERVATION_TIME // RESET TIMERU
      };
      this.cartSignal.set(updatedCart);
    }

    this.resetTimer(); // Resetuj timer při přidání
  }

  /**
   * AKTUALIZACE MNOŽSTVÍ POLOŽKY
   */
  updateItemQuantity(itemId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(itemId);
      return;
    }

    const cart = this.cartSignal();
    const updatedItems = cart.items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity,
          total_price: item.unit_price * quantity
        };
      }
      return item;
    });

    this.cartSignal.set({
      ...cart,
      items: updatedItems,
      expiresAt: Date.now() + this.RESERVATION_TIME // RESET TIMERU
    });
  }

  /**
   * ODSTRANĚNÍ POLOŽKY Z KOŠÍKU
   */
  removeItem(itemId: string): void {
    const cart = this.cartSignal();
    this.cartSignal.set({
      ...cart,
      items: cart.items.filter(item => item.id !== itemId),
      expiresAt: Date.now() + this.RESERVATION_TIME // RESET TIMERU
    });
  }

  /**
   * VYPRÁZDNĚNÍ KOŠÍKU
   */
  clear(): void {
    this.cartSignal.set({
      items: [],
      expiresAt: 0,
      createdAt: Date.now()
    });
    localStorage.removeItem(this.CART_STORAGE_KEY);
    this.isExpiredSignal.set(false);
  }

  /**
   * TIMER - ODPOČÍTÁVÁNÍ DO VYPRŠENÍ REZERVACE
   */
  private startTimer(): void {
    this.timerInterval = setInterval(() => {
      const now = Date.now();
      const cart = this.cartSignal();
      const remaining = Math.max(0, Math.floor((cart.expiresAt - now) / 1000));

      this.timerSignal.set(remaining);

      // Pokud čas vypršel
      if (remaining <= 0) {
        this.isExpiredSignal.set(true);
        this.clear();
        clearInterval(this.timerInterval);
      }
    }, 1000); // Aktualizuj každou vteřinu
  }

  /**
   * RESET TIMERU - při přidání položky
   */
  private resetTimer(): void {
    // Resetuj čas vypršení v košíku
    const cart = this.cartSignal();
    this.cartSignal.set({
      ...cart,
      expiresAt: Date.now() + this.RESERVATION_TIME
    });
    this.isExpiredSignal.set(false);
  }

  /**
   * FORMÁTOVÁNÍ ČASU
   */
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * GENEROVÁNÍ UNIKÁTNÍHO ID POLOŽKY
   */
  private generateItemId(productId: number, variantId: number | null): string {
    return `${productId}_${variantId || 'novariant'}`;
  }

  /**
   * CHECKOUT - VYTVOŘIT OBJEDNÁVKU
   */
  createOrder(
    email: string,
    firstName: string,
    lastName: string,
    phone: string,
    company: string | null,
    address: string,
    city: string,
    postalCode: string,
    country: string,
    paymentMethodId: number,
    shippingMethodId: number,
    couponCode: string | null = null,
    notes: string | null = null
  ): Observable<any> {
    const cart = this.cartSignal();

    // Příprava dat objednávky
    const orderData = {
      email,
      first_name: firstName,
      last_name: lastName,
      phone,
      company,
      address,
      city,
      postal_code: postalCode,
      country,
      payment_method_id: paymentMethodId,
      shipping_method_id: shippingMethodId,
      coupon_code: couponCode,
      notes,
      items: cart.items.map(item => ({
        product_id: item.product_id,
        product_variant_id: item.product_variant_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        vat_rate: item.vat_rate
      }))
    };

    return this.http.post(
      `${environment.base_api_url}/shop/checkout/create-order`,
      orderData
    );
  }

  /**
   * SIMULACE PLATBY
   */
  simulatePayment(orderId: number): Observable<any> {
    return this.http.post(
      `${environment.base_api_url}/shop/checkout/simulate-payment`,
      { order_id: orderId }
    );
  }
}