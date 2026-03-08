import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ProductCardListComponent } from '../../components/product-card-list/product-card-list.component';
import { Product } from '../../../shared/interfaces/product';
import { LocalizationService } from '../../services/localization.service';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardListComponent],
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent implements OnInit, AfterViewInit, OnDestroy {
  // Jediná proměnná pro veškerý lokalizovaný obsah (texty i produkty)
  s: any = null;

  priceRangeValue: number = 0;
  selectedSortOrder: string = '';
  searchQuery: string = '';
  search_icon: string = 'assets/images/icons/search.png';

  @ViewChild('currencySliderTrack') currencySliderTrack!: ElementRef;
  @ViewChild('currencySlider') currencySlider!: ElementRef;
  @ViewChild('prodWrp') prodWrp!: ElementRef;

  currentCurrency: 'czk' | 'eur' = 'czk';
  allFilteredAndSortedProducts: Product[] = [];
  paginatedProducts: Product[] = [];

  currentPage: number = 1;
  itemsPerPage: number = 8;
  totalPages: number = 0;
  pagesToShow: number[] = [];

  private exchangeRates = {
    'czk': { symbol: ' Kč' },
    'eur': { symbol: ' €' }
  };

  private destroy$ = new Subject<void>();

  constructor(
    private cdr: ChangeDetectorRef,
    private localizationService: LocalizationService
  ) { }

  ngOnInit(): void {
    this.localizationService.currentTranslations$
      .pipe(takeUntil(this.destroy$))
      .subscribe(translations => {
        if (translations && translations.shop) {
          // Načtení celého objektu shop do proměnné 's'
          this.s = translations.shop;
          
          // Reset filtrace při změně jazyka/překladů
          this.applyFilters();
          this.cdr.detectChanges();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.updateSliderPosition(), 0);
  }

  selectCurrency(currency: 'czk' | 'eur'): void {
    if (this.currentCurrency !== currency) {
      this.currentCurrency = currency;
      this.updateSliderPosition();
      this.currentPage = 1;
      this.applyFilters();
    }
  }

  private updateSliderPosition(): void {
    if (!this.currencySliderTrack || !this.currencySlider) return;
    const track = this.currencySliderTrack.nativeElement;
    const slider = this.currencySlider.nativeElement;
    const activeLabel = track.querySelector(`[data-currency="${this.currentCurrency}"]`) as HTMLElement;

    if (activeLabel) {
      slider.style.left = `${activeLabel.offsetLeft}px`;
      slider.style.width = `${activeLabel.offsetWidth}px`;
      this.cdr.detectChanges();
    }
  }

  private formatPrice(price: number, currency: 'czk' | 'eur'): string {
    const options: Intl.NumberFormatOptions = {
      minimumFractionDigits: (currency === 'eur') ? 2 : 0,
      maximumFractionDigits: (currency === 'eur') ? 2 : 0,
    };
    const locale = (currency === 'czk') ? 'cs-CZ' : 'en-US';
    const formatted = price.toLocaleString(locale, options);
    return `${formatted}${this.exchangeRates[currency].symbol}`;
  }

  applyFilters(): void {
    if (!this.s || !this.s.products_data) return;

    let tempProducts = [...this.s.products_data];

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      tempProducts = tempProducts.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.shortDescription.toLowerCase().includes(query)
      );
    }

    if (this.selectedSortOrder) {
      tempProducts.sort((a, b) => {
        const pA = (this.currentCurrency === 'czk' ? a.priceCZK : a.priceEUR) || 0;
        const pB = (this.currentCurrency === 'czk' ? b.priceCZK : b.priceEUR) || 0;
        switch (this.selectedSortOrder) {
          case 'az': return a.name.localeCompare(b.name);
          case 'za': return b.name.localeCompare(a.name);
          case 'price-asc': return pA - pB;
          case 'price-desc': return pB - pA;
          default: return 0;
        }
      });
    }

    this.allFilteredAndSortedProducts = tempProducts.map(p => ({
      ...p,
      price: this.formatPrice((this.currentCurrency === 'czk' ? p.priceCZK : p.priceEUR), this.currentCurrency)
    }));

    this.totalPages = Math.ceil(this.allFilteredAndSortedProducts.length / this.itemsPerPage);
    this.updatePaginatedProducts();
    this.generatePageNumbers();
    this.cdr.detectChanges();
  }

  private updatePaginatedProducts(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedProducts = this.allFilteredAndSortedProducts.slice(start, start + this.itemsPerPage);
  }

  private generatePageNumbers(): void {
    this.pagesToShow = Array.from({length: this.totalPages}, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.updatePaginatedProducts();
      this.scrollToProdWrp();
    }
  }

  nextPage(): void { if (this.currentPage < this.totalPages) this.goToPage(this.currentPage + 1); }
  prevPage(): void { if (this.currentPage > 1) this.goToPage(this.currentPage - 1); }

  private scrollToProdWrp(): void {
    if (window.innerWidth < 1375 && this.prodWrp) {
      this.prodWrp.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  onSearch(event: Event): void { event.preventDefault(); this.currentPage = 1; this.applyFilters(); }
  onFilter(event: Event): void { event.preventDefault(); this.currentPage = 1; this.applyFilters(); }

  onReset(): void {
    this.searchQuery = '';
    this.selectedSortOrder = '';
    this.currentCurrency = 'czk';
    this.currentPage = 1;
    this.updateSliderPosition();
    this.applyFilters();
  }
}