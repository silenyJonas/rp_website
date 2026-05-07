import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-product-builder',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-builder.component.html',
  styleUrl: './product-builder.component.css',
})
export class ProductBuilderComponent {
  // Input přijímá data z ShopProductResource (Laravel)
  @Input() product: any;

  /**
   * Sestavení URL adresy obrázku
   * Předpokládá se, že backend vrací image_path (např. uuid.jpg)
   */
  getThumbnailUrl(): string {
    if (this.product?.primary_image?.image_path) {
      return `storage/products/${this.product.primary_image.image_path}`;
    }
    // Placeholder pokud produkt nemá obrázek
    return 'assets/images/placeholder-product.png';
  }

  /**
   * Formátování ceny (možno nahradit CurrencyPipe v šabloně)
   */
  getFormattedPrice(): string {
    const price = this.product?.price || 0;
    return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(price);
  }
}