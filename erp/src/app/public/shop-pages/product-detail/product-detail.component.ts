import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ShopPublicService } from '../components/services/public-data.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
})
export class ProductDetailComponent implements OnInit {
  // Signály pro reaktivitu
  product = signal<any>(null);
  selectedVariant = signal<any>(null);
  isLoading = signal(true);
  activeImage = signal<string | null>(null);

  // Computed signály pro odvozené hodnoty (vždy aktuální dle varianty)
  currentPrice = computed(() => {
    const variant = this.selectedVariant();
    if (variant) return variant.price_with_vat;
    return this.product()?.price || 0;
  });

  currentStock = computed(() => {
    const variant = this.selectedVariant();
    if (variant) return variant.stock_quantity;
    return this.product()?.stock_quantity || 0;
  });

  isAvailable = computed(() => this.currentStock() > 0);

  constructor(
    private route: ActivatedRoute,
    private shopService: ShopPublicService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slugOrId = params.get('slugOrId');
      if (slugOrId) {
        this.loadProduct(slugOrId);
      }
    });
  }

  loadProduct(id: string): void {
    this.isLoading.set(true);
    this.shopService.getProductDetail(id).subscribe({
      next: (data) => {
        this.product.set(data);
        
        // Nastavení hlavní fotky (priorita: primární obrázek)
        const primary = data.images?.find((img: any) => img.is_primary);
        this.activeImage.set(primary?.image_url || data.images?.[0]?.image_url);

        // Automatický výběr první dostupné varianty
        if (data.variants && data.variants.length > 0) {
          this.selectVariant(data.variants[0]);
        }
        
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Chyba při načítání produktu:', err);
        this.isLoading.set(false);
      }
    });
  }

  selectVariant(variant: any): void {
    this.selectedVariant.set(variant);
    
    // Pokud má varianta vlastní obrázek, přepneme galerii na něj
    if (variant.images && variant.images.length > 0) {
      this.activeImage.set(variant.images[0].image_url);
    }
  }

  setActiveImage(url: string): void {
    this.activeImage.set(url);
  }

  getFormattedPrice(value: number): string {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0
    }).format(value);
  }
  // Přidejte/upravte metodu v .ts
onVariantChange(event: Event): void {
  const selectElement = event.target as HTMLSelectElement;
  const variantId = Number(selectElement.value);
  const variant = this.product().variants.find((v: any) => v.id === variantId);
  if (variant) {
    this.selectVariant(variant);
  }
}
}