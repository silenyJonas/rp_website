import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { CartService } from '../components/services/cart.service';
import { ShopPublicService } from '../components/services/public-data.service';

interface ShippingMethod {
  id: number;
  name: string;
  base_price: number;
  description: string;
}

interface PaymentMethod {
  id: number;
  name: string;
  code: string;
  provider: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  currentStep = signal(1);
  isProcessing = signal(false);
  orderNumber = signal<string | null>(null);

  couponCode = '';
  couponStatus = signal<string | null>(null);

  shippingMethods = signal<ShippingMethod[]>([]);
  paymentMethods = signal<PaymentMethod[]>([]);

  appliedCoupon = signal<any | null>(null);

  formData = {
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    company: null as string | null,
    address: '',
    city: '',
    postalCode: '',
    country: 'Česká republika',
    shippingMethodId: null as number | null,
    paymentMethodId: null as number | null,
    notes: null as string | null
  };

  selectedShippingPrice = signal(0);

  /**
   * REVOLUČNÍ ZMĚNA: Použití computed signalu pro rekapitulaci cen.
   * Přesně kopíruje logiku z admin OrdersComponent.
   */
orderSummary = computed(() => {
    const productsTotal = Number(this.cartService.subtotal() || 0);
    const coupon = this.appliedCoupon();
    
    // Výpočet slevy s jistotou číselného formátu
    let discount = 0;
    if (coupon) {
      if (coupon.discount_type === 'percent') {
        discount = (productsTotal * Number(coupon.discount_value || 0)) / 100;
      } else {
        discount = Number(coupon.discount_value || 0);
      }
    }
    const discountAmount = Math.min(discount, productsTotal);

    // Koeficient slevy pro správný rozpad DPH položek
    const discountFactor = productsTotal > 0 
      ? (productsTotal - discountAmount) / productsTotal 
      : 1;

    let totalBaseAfterDiscount = 0;
    const vatBreakdown: { [key: number]: number } = {};

    const cartItems = this.cartService.cartItems() || [];
    
    cartItems.forEach(item => {
      const itemUnitPrice = Number(item.unit_price || 0);
      const itemQuantity = Number(item.quantity || 0);
      const itemVatRate = Number(item.vat_rate || 21);

      // Výpočet ceny řádku po slevě
      const lineTotalAfterDiscount = (itemQuantity * itemUnitPrice) * discountFactor;
      
      // Výpočet samotného DPH z částky s DPH: částka * (sazba / (100 + sazba))
      const itemVat = lineTotalAfterDiscount * (itemVatRate / (100 + itemVatRate));
      const itemBase = lineTotalAfterDiscount - itemVat;

      totalBaseAfterDiscount += itemBase;
      if (!vatBreakdown[itemVatRate]) {
        vatBreakdown[itemVatRate] = 0;
      }
      vatBreakdown[itemVatRate] += itemVat;
    });

    const shippingAmount = Number(this.selectedShippingPrice() || 0);
    
    // 🛠️ FIX: Striktní matematické sečtení (zajištěno přetypováním proměnných výše)
    const finalAmount = Math.max(0, (productsTotal - discountAmount) + shippingAmount);

    return {
      productsTotal,
      discountAmount,
      shippingAmount,
      baseAmount: totalBaseAfterDiscount,
      vatGroups: Object.keys(vatBreakdown).map(rate => ({
        rate: Number(rate),
        amount: vatBreakdown[Number(rate)]
      })),
      finalAmount
    };
  });

  constructor(
    public cartService: CartService,
    private shopPublicService: ShopPublicService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.cartService.cartCount() === 0) {
      this.router.navigate(['/cart']);
      return;
    }

    this.loadShippingMethods();
    this.loadPaymentMethods();
  }

  loadShippingMethods(): void {
    this.shopPublicService.getShippingMethods().subscribe({
      next: (response) => {
        this.shippingMethods.set(response.data || response);
      },
      error: (e) => console.error('Chyba při načítání dopravy:', e)
    });
  }

  loadPaymentMethods(): void {
    this.shopPublicService.getPaymentMethods().subscribe({
      next: (response) => {
        this.paymentMethods.set(response.data || response);
      },
      error: (e) => console.error('Chyba při načítání plateb:', e)
    });
  }

  goToStep(step: number): void {
    if (step === 2 && !this.validateStep1()) return;
    if (step === 3 && !this.validateStep2()) return;
    if (step === 4 && !this.validateStep3()) return;
    this.currentStep.set(step);
  }

  validateStep1(): boolean {
    return true;
  }

  validateStep2(): boolean {
    if (!this.formData.email || !this.formData.firstName || !this.formData.lastName || !this.formData.phone || !this.formData.address || !this.formData.city || !this.formData.postalCode) {
      alert('Vyplňte prosím všechna povinná pole s osobními a doručovacími údaji!');
      return false;
    }
    if (!this.formData.shippingMethodId) {
      alert('Vyberte si prosím způsob dopravy!');
      return false;
    }
    return true;
  }

  validateStep3(): boolean {
    if (!this.formData.paymentMethodId) {
      alert('Vyberte si prosím platební metodu!');
      return false;
    }
    return true;
  }

  updateShippingPrice(): void {
    const method = this.shippingMethods().find(m => m.id === Number(this.formData.shippingMethodId));
    this.selectedShippingPrice.set(method?.base_price || 0);
  }

  selectPaymentMethod(methodId: number): void {
    this.formData.paymentMethodId = methodId;
  }

  applyCoupon(): void {
    if (!this.couponCode.trim()) {
      this.couponStatus.set('Zadejte kód slevy!');
      return;
    }

    this.http.post<any>(`${environment.base_api_url}/shop/public/coupons/validate`, {
      code: this.couponCode,
      order_amount: this.cartService.subtotal()
    }).subscribe({
      next: (response) => {
        this.appliedCoupon.set(response.coupon);
        this.couponStatus.set(`✓ Sleva aplikována: ${response.coupon.code}`);
      },
      error: (e) => {
        this.couponStatus.set('❌ ' + (e.error?.message || 'Neplatný kód'));
        this.appliedCoupon.set(null);
      }
    });
  }

simulatePayment(): void {
  this.isProcessing.set(true);

  // Mapování položek košíku přesně pro potřeby Laravel validace
  const formattedItems = (this.cartService.cartItems() || []).map(item => ({
    // Ujistíme se, že předáváme správné ID produktu (případně item.id, pokud drží ID produktu)
    product_id: Number(item.product_id || item.id), 
    product_variant_id: item.product_variant_id ? Number(item.product_variant_id) : null,
    quantity: Number(item.quantity),
    unit_price: Number(item.unit_price),
    vat_rate: item.vat_rate ? Number(item.vat_rate) : 21 // Fallback na 21, pokud chybí
  }));

  const payload = {
    email: this.formData.email,
    first_name: this.formData.firstName,
    last_name: this.formData.lastName,
    phone: this.formData.phone,
    company: this.formData.company || null,
    address: this.formData.address,
    city: this.formData.city,
    postal_code: this.formData.postalCode,
    country: this.formData.country,
    payment_method_id: Number(this.formData.paymentMethodId),
    shipping_method_id: Number(this.formData.shippingMethodId),
    coupon_code: this.appliedCoupon()?.code || null,
    notes: this.formData.notes || null,
    items: formattedItems // <--- Přidáno správně naformátované pole položek
  };

  this.http.post<any>(`${environment.base_api_url}/shop/checkout/create-order`, payload)
    .subscribe({
      next: (response) => {
        this.orderNumber.set(response.order_number);
        this.cartService.clear();
        this.currentStep.set(5);
        this.isProcessing.set(false);
      },
      error: (e) => {
        console.error('Chyba při vytváření objednávky:', e);
        
        // VÝBORNÝ POMOCNÍK: Pokud Laravel vrátí 422, vypíšeme přesné chyby z validace do alertu
        if (e.status === 422 && e.error?.errors) {
          const validationErrors = Object.values(e.error.errors).flat().join('\n');
          alert('Chyba validace na serveru:\n' + validationErrors);
        } else {
          alert('Chyba: ' + (e.error?.message || 'Nepodařilo se vytvořit objednávku'));
        }
        
        this.isProcessing.set(false);
      }
    });
}

  finishCheckout(): void {
    this.router.navigate(['/shop']);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0
    }).format(price);
  }

  getPaymentIcon(code: string): string {
    const icons: { [key: string]: string } = {
      'card': '💳',
      'bank_transfer': '🏦',
      'paypal': '🅿️',
      'apple_pay': '🍎',
      'google_pay': '🔵'
    };
    return icons[code] || '💰';
  }
}