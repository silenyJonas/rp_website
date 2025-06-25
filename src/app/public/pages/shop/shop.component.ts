import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-content">
      <h1>Our Shop</h1>
      <p>Browse our selection of high-quality products.</p>
      <div style="height:1000px" class="product-grid">
        <div class="product-item">Product A</div>
        <div class="product-item">Product B</div>
        <div class="product-item">Product C</div>
      </div>
    </div>
  `,
  styles: [`
    .page-content {
      padding: 40px;
      text-align: center;
      max-width: 900px;
      margin: 50px auto;
      background-color: #f9f9f9;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    h1 { color: #333; margin-bottom: 20px; }
    p { color: #666; line-height: 1.6; margin-bottom: 30px; }
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-top: 30px;
    }
    .product-item {
      background-color: #eef;
      border: 1px solid #ccd;
      padding: 20px;
      border-radius: 8px;
      font-weight: bold;
      color: #555;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }
  `]
})
export class ShopComponent { }