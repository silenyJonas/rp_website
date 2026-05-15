import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CartService, CartItem } from '../components/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit, OnDestroy {
  constructor(
    public cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.cartService.isExpired()) {
      alert('Vaše rezervace vypršela, všechno zboží bylo odebráno z košíku.');
    }
  }

  ngOnDestroy(): void {}

  decreaseQuantity(itemId: string): void {
    const item = this.cartService.cartItems().find(i => i.id === itemId);
    if (item && item.quantity > 1) {
      this.cartService.updateItemQuantity(itemId, item.quantity - 1);
    }
  }

  increaseQuantity(itemId: string): void {
    const item = this.cartService.cartItems().find(i => i.id === itemId);
    if (item && item.quantity < item.stock_quantity) {
      this.cartService.updateItemQuantity(itemId, item.quantity + 1);
    }
  }

  updateQuantity(itemId: string, event: any): void {
    const item = this.cartService.cartItems().find(i => i.id === itemId);
    if (!item) return;

    let value = parseInt(event.target.value, 10);
    
    if (isNaN(value) || value <= 0) {
      value = 1;
    } else if (value > item.stock_quantity) {
      value = item.stock_quantity; // Hard-cap na maximální zásobu
    }

    event.target.value = value;
    this.cartService.updateItemQuantity(itemId, value);
  }

  isMaxStockReached(item: CartItem): boolean {
    return item.quantity >= item.stock_quantity;
  }

  removeItem(itemId: string): void {
    if (confirm('Opravdu chcete odstranit položku z košíku?')) {
      this.cartService.removeItem(itemId);
    }
  }

  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0
    }).format(price);
  }
}