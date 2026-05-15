import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { CartService } from '../components/services/cart.service';

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

  constructor(
    public cartService: CartService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Kontrola, zda je košík prázdný
    if (this.cartService.cartCount() === 0) {
      this.router.navigate(['/cart']);
      return;
    }

    this.loadShippingMethods();
    this.loadPaymentMethods();
  }

  loadShippingMethods(): void {
    this.http.get<any>(`${environment.base_api_url}/shop/shipping-methods?no_pagination=true`)
      .subscribe({
        next: (data) => {
          this.shippingMethods.set(data.data || data);
        },
        error: (e) => console.error('Chyba při načítání dopravy:', e)
      });
  }

  loadPaymentMethods(): void {
    this.http.get<any>(`${environment.base_api_url}/shop/payment-methods?no_pagination=true`)
      .subscribe({
        next: (data) => {
          this.paymentMethods.set(data.data || data);
        },
        error: (e) => console.error('Chyba při načítání plateb:', e)
      });
  }

  goToStep(step: number): void {
    if (step === 2 && !this.validateStep1()) return;
    if (step === 3 && !this.validateStep2()) return;
    this.currentStep.set(step);
  }

  validateStep1(): boolean {
    return true;
  }

  validateStep2(): boolean {
    if (!this.formData.email || !this.formData.firstName || !this.formData.lastName) {
      alert('Vyplňte prosím všechna povinná pole!');
      return false;
    }
    if (!this.formData.shippingMethodId) {
      alert('Vyberte si způsob dopravy!');
      return false;
    }
    return true;
  }

  updateShippingPrice(): void {
    const method = this.shippingMethods().find(m => m.id === this.formData.shippingMethodId);
    this.selectedShippingPrice.set(method?.base_price || 0);
  }

  selectPaymentMethod(methodId: number): void {
    this.formData.paymentMethodId = methodId;
  }

  applyCoupon(): void {
    if (!this.couponCode.trim()) {
      this.couponStatus.set('Zadejte kód slev!');
      return;
    }

    this.http.post<any>(`${environment.base_api_url}/shop/coupons/validate`, {
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

  proceedToConfirmation(): void {
    this.goToStep(4);
  }

  couponDiscount(): number {
    if (!this.appliedCoupon()) return 0;
    const coupon = this.appliedCoupon();
    if (coupon.discount_type === 'percent') {
      return (this.cartService.subtotal() * coupon.discount_value) / 100;
    }
    return coupon.discount_value;
  }

  finalTotal(): number {
    const total = this.cartService.subtotal() + this.selectedShippingPrice() - this.couponDiscount();
    return Math.max(0, total);
  }

  simulatePayment(): void {
    this.isProcessing.set(true);

    this.cartService.createOrder(
      this.formData.email,
      this.formData.firstName,
      this.formData.lastName,
      this.formData.phone,
      this.formData.company,
      this.formData.address,
      this.formData.city,
      this.formData.postalCode,
      this.formData.country,
      this.formData.paymentMethodId!,
      this.formData.shippingMethodId!,
      this.appliedCoupon()?.code || null,
      this.formData.notes
    ).subscribe({
      next: (response) => {
        console.log('Objednávka vytvořena:', response);
        this.orderNumber.set(response.order_number);
        this.cartService.clear();
        this.currentStep.set(5);
        this.isProcessing.set(false);
      },
      error: (e) => {
        console.error('Chyba při vytváření objednávky:', e);
        alert('Chyba: ' + (e.error?.message || 'Nepodařilo se vytvořit objednávku'));
        this.isProcessing.set(false);
      }
    });
  }

  finishCheckout(): void {
    this.cartService.clear();
    this.router.navigate(['/']);
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