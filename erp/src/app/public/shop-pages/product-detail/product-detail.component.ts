import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ShopPublicService } from '../components/services/public-data.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
})
export class ProductDetailComponent implements OnInit {
  product = signal<any>(null);
  selectedVariant = signal<any>(null);
  isLoading = signal(true);

  constructor(
    private route: ActivatedRoute,
    private shopService: ShopPublicService
  ) {}

  ngOnInit(): void {
    // Sledování parametru v URL
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
        // Automaticky vybrat první variantu, pokud existuje
        if (data.variants && data.variants.length > 0) {
          this.selectedVariant.set(data.variants[0]);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  selectVariant(variant: any): void {
    this.selectedVariant.set(variant);
  }
}