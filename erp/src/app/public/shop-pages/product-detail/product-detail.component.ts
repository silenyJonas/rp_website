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
  product = signal<any>(null);
  selectedVariant = signal<any>(null);
  isLoading = signal(true);
  activeImage = signal<string | null>(null);

  // Computed: Obrázky specifické pro variantu
  variantImages = computed(() => this.selectedVariant()?.images || []);

  // Computed: Obecné obrázky produktu, které NEJSOU přiřazeny k žádné variantě
  // To zabrání duplicitám, pokud bys měl stejnou fotku u produktu i u varianty
  generalImages = computed(() => {
    const allImgs = this.product()?.images || [];
    return allImgs.filter((img: any) => !img.variant_id);
  });

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
        
        // Defaultní start: První varianta
        if (data.variants && data.variants.length > 0) {
          this.selectVariant(data.variants[0]);
        } else {
          // Pokud nejsou varianty, vezmeme primární foto produktu
          const primary = data.images?.find((img: any) => img.is_primary);
          this.activeImage.set(primary?.url || data.images?.[0]?.url || 'assets/images/placeholder-product.png');
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
    // UX ROZHODNUTÍ: Při výběru varianty okamžitě nastavíme její první fotku
    if (variant.images && variant.images.length > 0) {
      this.activeImage.set(variant.images[0].url);
    } else {
      // Pokud varianta nemá fotky, vrátíme se k hlavní fotce produktu
      const primary = this.product().images?.find((img: any) => img.is_primary);
      this.activeImage.set(primary?.url || this.product().images?.[0]?.url);
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