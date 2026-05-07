import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // <--- DŮLEŽITÉ: Musí zde být pro routerLink
import { ShopPublicService } from '../components/services/public-data.service';
import { ProductBuilderComponent } from '../components/builders/product-builder/product-builder.component';
import { PaginationButtonsBuilderComponent } from '../components/builders/pagination-buttons-builder/pagination-buttons-builder.component';

/**
 * Centrální konfigurace textů a endpointů pro snadnou údržbu
 */
const CATALOG_CONFIG = {
  ENDPOINTS: {
    PRODUCT_DETAIL_BASE: '/shop/products'
  },
  TEXTS: {
    HEADER: 'Naše Produkty',
    TOTAL_FOUND: 'Celkem nalezeno',
    ITEMS_UNIT: 'položek',
    EMPTY_STATE: 'Nebyly nalezeny žádné produkty odpovídající filtrům.'
  }
};

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, // <--- Přidáno zde
    ProductBuilderComponent, 
    PaginationButtonsBuilderComponent
  ],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css',
})
export class CatalogComponent implements OnInit {
  // Zpřístupnění konfigurace pro šablonu
  readonly config = CATALOG_CONFIG;

  // State management
  products = signal<any[]>([]);
  totalItems = signal(0);
  totalPages = signal(1);
  isLoading = signal(false);

  // Výchozí parametry filtrů
  filters = {
    page: 1,
    per_page: 15,
    search: '',
    category_id: null as number | null,
    sort_by: 'created_at',
    sort_direction: 'desc'
  };

  constructor(private shopService: ShopPublicService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.shopService.getProducts(this.filters).subscribe({
      next: (response) => {
        this.products.set(response.data);
        this.totalItems.set(response.total);
        this.totalPages.set(response.last_page);
        this.isLoading.set(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err) => {
        console.error('Chyba při načítání katalogu', err);
        this.isLoading.set(false);
      }
    });
  }

  onPageChange(page: number): void {
    this.filters.page = page;
    this.loadProducts();
  }

  onItemsPerPageChange(amount: number): void {
    this.filters.per_page = amount;
    this.filters.page = 1;
    this.loadProducts();
  }

  /**
   * Helper pro sestavení URL detailu (využívá centrální config)
   */
  getProductUrl(slug: string): string {
    return `${this.config.ENDPOINTS.PRODUCT_DETAIL_BASE}/${slug}`;
  }
}