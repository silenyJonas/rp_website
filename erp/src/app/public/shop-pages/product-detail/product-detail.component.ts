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
  // Signály pro stav a data
  product = signal<any>(null);
  selectedVariant = signal<any>(null);
  isLoading = signal(true);
  activeImage = signal<string | null>(null);

  // Computed signál pro obrázky vybrané varianty
  variantImages = computed(() => {
    return this.selectedVariant()?.images || [];
  });

  // Dynamické hodnoty podle vybrané varianty
  currentPrice = computed(() => {
    const variant = this.selectedVariant();
    return variant ? variant.price_with_vat : (this.product()?.price || 0);
  });

  currentStock = computed(() => {
    const variant = this.selectedVariant();
    return variant ? variant.stock_quantity : (this.product()?.stock_quantity || 0);
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
        this.activeImage.set(primary?.url || data.images?.[0]?.url);

        // Výběr první varianty
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
    // Při přepnutí varianty nastavíme její první obrázek jako aktivní (pokud existuje)
    if (variant.images && variant.images.length > 0) {
      this.activeImage.set(variant.images[0].url);
    }
  }

  onVariantChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const variantId = Number(selectElement.value);
    const variant = this.product().variants.find((v: any) => v.id === variantId);
    if (variant) {
      this.selectVariant(variant);
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
}