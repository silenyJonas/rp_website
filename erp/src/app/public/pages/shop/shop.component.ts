// src/app/public/pages/shop/shop.component.ts

import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ProductCardListComponent } from '../../components/product-card-list/product-card-list.component';
import { Product } from '../../../shared/interfaces/product';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProductCardListComponent
  ],
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent implements OnInit, AfterViewInit {
  priceRangeValue: number = 0;
  selectedSortOrder: string = '';
  searchQuery: string = '';
  search_icon: string = 'assets/images/icons/search.png';

  @ViewChild('currencySliderTrack') currencySliderTrack!: ElementRef;
  @ViewChild('currencySlider') currencySlider!: ElementRef;
  @ViewChild('prodWrp') prodWrp!: ElementRef;

  currentCurrency: 'czk' | 'eur' = 'czk';

  shopProducts: Product[] = [];
  allFilteredAndSortedProducts: Product[] = [];
  paginatedProducts: Product[] = [];

  currentPage: number = 1;
  itemsPerPage: number = 8;
  totalPages: number = 0;
  pagesToShow: number[] = [];

  private exchangeRates = {
    'czk': { toEUR: 0.040, symbol: ' Kč' },
    'eur': { toCZK: 24.5, symbol: ' €' }
  };

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.shopProducts = [
      { id: 'prod-001', name: 'Předpřipravený E-Shop', shortDescription: 'Spuštění do 24 hodin na vlastní doméně.', priceCZK: 8099, priceEUR: 329.99, imageUrl: 'assets/images/product_images/eshop_default.png', popupType: 'eshop-app', details: { longDescription: 'Naše e-shop řešení "Obchodník" je navrženo pro maximální flexibilitu a snadné použití. Zahrnuje správu produktů, objednávek, uživatelů, platebních bran a robustní analytiku. Plně responzivní design zajišťuje perfektní zobrazení na všech zařízeních.', features: ['Intuitivní správa produktů', 'Bezpečné platební brány (Stripe, PayPal, GoPay)', 'Automatizovaná správa objednávek', 'Uživatelské účty a historie nákupů', 'SEO optimalizace pro lepší viditelnost', 'Integrace s dopravními službami'], technologyStack: 'Angular, Laravel, PostgreSQL', screenshotUrl: 'https://placehold.co/600x400/8a5acd/FFFFFF?text=E-shop+Detail', supportInfo: '24/7 technická podpora a pravidelné aktualizace.' }, price: '' },
      { id: 'prod-002', name: 'Dotazníkový software', shortDescription: 'Profesionální software pro tvorbu vlastních dotazníků.', priceCZK: 7999, priceEUR: 325.99, imageUrl: 'assets/images/product_images/survey_engine.png', popupType: 'task-manager', details: { category: 'Produktivita a řízení', version: '2.1.0', platforms: 'Windows, macOS, Linux', notes: 'Offline funkcionalita s možností synchronizace po připojení k internetu. Podporuje týmovou spolupráci.', functions: ['Vytváření a přiřazování úkolů', 'Sledování pokroku projektu', 'Ganttovy diagramy a kalendář', 'Připojování souborů k úkolům', 'Generování reportů', 'Notifikace a připomenutí'] }, price: '' },
      { id: 'prod-003', name: 'Dotazníkový analyzátor', shortDescription: 'Rychlá analýza a prezentace vložených dat.', priceCZK: 1499, priceEUR: 61.99, imageUrl: 'assets/images/product_images/survey_solver.png', popupType: 'ai-assistant', details: { aiCapabilities: 'Využívá pokročilé NLP pro porozumění dotazům a generování relevantních odpovědí. Schopnost učení z interakcí a integrace s vašimi databázemi.', useCases: ['Automatická odpověď na FAQ', 'Přesměrování dotazů na správné oddělení', 'Sběr informací od klientů před spojením s operátorem', 'Personalizované doporučení produktů/služeb'], customization: 'Plně přizpůsobitelný pro vaši značku a tone-of-voice. Možnost integrace do webových stránek, mobilních aplikací a sociálních sítích.' }, price: '' },
      { id: 'prod-004', name: 'Webový Portál pro Komunitu', shortDescription: 'Platforma pro online komunity s diskusemi a událostmi.', priceCZK: 12500, priceEUR: 510.50, imageUrl: 'assets/images/product_images/community_portal.png', popupType: 'web-portal', details: {}, price: '' },
      { id: 'prod-005', name: 'CRM Systém pro malé firmy', shortDescription: 'Spravujte zákazníky a prodeje efektivně.', priceCZK: 9800, priceEUR: 399.00, imageUrl: 'assets/images/product_images/crm_system.png', popupType: 'crm-system', details: {}, price: '' },
      { id: 'prod-006', name: 'Systém pro rezervace', shortDescription: 'Online rezervační systém pro služby a události.', priceCZK: 6500, priceEUR: 265.20, imageUrl: 'assets/images/product_images/reservation_system.png', popupType: 'reservation-system', details: {}, price: '' },
      { id: 'prod-007', name: 'Mobilní Aplikace (iOS/Android)', shortDescription: 'Nativní mobilní aplikace na míru.', priceCZK: 15000, priceEUR: 612.00, imageUrl: 'assets/images/product_images/mobile_app.png', popupType: 'mobile-app', details: {}, price: '' },
      { id: 'prod-008', name: 'Portfolio Web (Jednostránkový)', shortDescription: 'Prezentujte svou práci elegantně.', priceCZK: 3200, priceEUR: 130.40, imageUrl: 'assets/images/product_images/portfolio_web.png', popupType: 'portfolio-web', details: {}, price: '' },
      { id: 'prod-009', name: 'Systém pro správu obsahu (CMS)', shortDescription: 'Jednoduché a výkonné CMS pro vaše weby.', priceCZK: 5800, priceEUR: 236.70, imageUrl: 'assets/images/product_images/cms_system.png', popupType: 'cms-system', details: {}, price: '' },
      { id: 'prod-010', name: 'Online Školicí Platforma', shortDescription: 'Vytvářejte a spravujte online kurzy.', priceCZK: 11000, priceEUR: 449.00, imageUrl: 'assets/images/product_images/elearning_platform.png', popupType: 'elearning-platform', details: {}, price: '' },
      { id: 'prod-011', name: 'Analytický Dashboard', shortDescription: 'Vizualizujte a analyzujte svá data.', priceCZK: 9000, priceEUR: 367.20, imageUrl: 'assets/images/product_images/analytics_dashboard.png', popupType: 'analytics-dashboard', details: {}, price: '' },
      { id: 'prod-012', name: 'Automatizační Skripty', shortDescription: 'Ušetřete čas s automatizovanými procesy.', priceCZK: 4500, priceEUR: 183.60, imageUrl: 'assets/images/product_images/automation_scripts.png', popupType: 'automation-scripts', details: {}, price: '' }
    ];

    this.applyFilters();
  }

  ngAfterViewInit(): void {
    this.updateSliderPosition();
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
    if (!this.currencySliderTrack || !this.currencySlider) {
      console.error('updateSliderPosition: Currency switcher elements are unavailable.');
      return;
    }

    const sliderTrackElement = this.currencySliderTrack.nativeElement;
    const sliderElement = this.currencySlider.nativeElement;
    const activeLabelElement = sliderTrackElement.querySelector(`[data-currency="${this.currentCurrency}"]`) as HTMLElement;

    if (activeLabelElement) {
      const targetLeft = activeLabelElement.offsetLeft;
      const targetWidth = activeLabelElement.offsetWidth;

      sliderElement.style.left = `${targetLeft}px`;
      sliderElement.style.width = `${targetWidth}px`;

      sliderTrackElement.querySelectorAll('.currency-label').forEach((label: HTMLElement) => {
        if (label.dataset['currency'] === this.currentCurrency) {
          label.classList.add('active');
        } else {
          label.classList.remove('active');
        }
      });
      this.cdr.detectChanges();
    } else {
      console.error(`updateSliderPosition: Could not find active label element for currency: ${this.currentCurrency}`);
    }
  }

  private formatPrice(price: number, currency: 'czk' | 'eur'): string {
    const symbol = this.exchangeRates[currency].symbol;
    const options: Intl.NumberFormatOptions = {
      minimumFractionDigits: (currency === 'eur') ? 2 : 0,
      maximumFractionDigits: (currency === 'eur') ? 2 : 0,
    };

    let formattedValue: string;
    if (currency === 'czk') {
      formattedValue = price.toLocaleString('cs-CZ', options);
    } else {
      formattedValue = price.toLocaleString('en-US', options);
    }
    return `${formattedValue}${symbol}`;
  }

  applyFilters(): void {
    let tempProducts = [...this.shopProducts];

    if (this.searchQuery) {
      const lowerCaseQuery = this.searchQuery.toLowerCase();
      tempProducts = tempProducts.filter(product =>
        product.name.toLowerCase().includes(lowerCaseQuery) ||
        product.shortDescription.toLowerCase().includes(lowerCaseQuery)
      );
    }

    if (this.selectedSortOrder) {
      tempProducts.sort((a, b) => {
        const priceA = (this.currentCurrency === 'czk' ? a.priceCZK : a.priceEUR) || 0;
        const priceB = (this.currentCurrency === 'czk' ? b.priceCZK : b.priceEUR) || 0;

        switch (this.selectedSortOrder) {
          case 'az': return a.name.localeCompare(b.name);
          case 'za': return b.name.localeCompare(a.name);
          case 'price-asc': return priceA - priceB;
          case 'price-desc': return priceB - priceA;
          default: return 0;
        }
      });
    }

    this.allFilteredAndSortedProducts = tempProducts.map(product => {
      const displayPrice = (this.currentCurrency === 'czk') ? product.priceCZK : product.priceEUR;
      return {
        ...product,
        price: this.formatPrice(displayPrice, this.currentCurrency)
      };
    });

    this.totalPages = Math.ceil(this.allFilteredAndSortedProducts.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
        this.currentPage = this.totalPages;
    } else if (this.totalPages === 0) {
        this.currentPage = 1;
    }
    this.updatePaginatedProducts();
    this.generatePageNumbers();

    this.cdr.detectChanges();
  }

  private updatePaginatedProducts(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedProducts = this.allFilteredAndSortedProducts.slice(startIndex, endIndex);
  }

  private generatePageNumbers(): void {
    this.pagesToShow = [];
    for (let i = 1; i <= this.totalPages; i++) {
      this.pagesToShow.push(i);
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.updatePaginatedProducts();
      this.cdr.detectChanges();
      this.scrollToProdWrp(); // Zůstává: Scroll při změně stránky
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedProducts();
      this.cdr.detectChanges();
      this.scrollToProdWrp(); // Zůstává: Scroll při změně stránky
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedProducts();
      this.cdr.detectChanges();
      this.scrollToProdWrp(); // Zůstává: Scroll při změně stránky
    }
  }

  // UPRAVENÁ METODA PRO PODMÍNĚNÉ SCROLLOVÁNÍ
  private scrollToProdWrp(): void {
    // Scroll pouze pokud je šířka obrazovky menší než 1375px
    if (window.innerWidth < 1375 && this.prodWrp) {
      this.prodWrp.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  onSearch(event: Event): void {
    event.preventDefault();
    this.currentPage = 1;
    this.applyFilters();
  }

  onFilter(event: Event): void {
    event.preventDefault();
    this.currentPage = 1;
    this.applyFilters();
  }

  onReset(): void {
    this.searchQuery = '';
    this.selectedSortOrder = '';
    this.currentCurrency = 'czk';
    this.currentPage = 1;
    this.updateSliderPosition();
    this.applyFilters();
    console.log('Filtry a vyhledávání byly resetovány.');
  }
}