import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-shop-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './shop-header.component.html',
  styleUrls: ['./shop-header.component.css']
})
export class ShopHeaderComponent {
  cartCount: number = 0; // Tady se později napojí CartService

  openCart(): void {
    console.log('Otevírám košík (drawer)...');
    // Zde později zavoláš metodu ze service pro otevření overlaye
  }
}