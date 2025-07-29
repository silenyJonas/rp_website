// import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { HttpClient } from '@angular/common/http'; // HttpClient už není přímo potřeba pro načítání produktů zde, ale necháme ho pro případné budoucí využití nebo pokud byste ho potřeboval jinde v komponentě.
// import { Subject } from 'rxjs';
// import { takeUntil } from 'rxjs/operators'; // switchMap již není potřeba, protože načítáme z jednoho streamu

// import { ProductCardListComponent } from '../../components/product-card-list/product-card-list.component';
// import { Product } from '../../../shared/interfaces/product';
// import { LocalizationService } from '../../services/localization.service';

// @Component({
//   selector: 'app-shop',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     ProductCardListComponent
//   ],
//   templateUrl: './shop.component.html',
//   styleUrls: ['./shop.component.css']
// })
// export class ShopComponent implements OnInit, AfterViewInit, OnDestroy {
//   priceRangeValue: number = 0;
//   selectedSortOrder: string = '';
//   searchQuery: string = '';
//   search_icon: string = 'assets/images/icons/search.png'; // Cesta k obrázku, zůstává pevně daná

//   @ViewChild('currencySliderTrack') currencySliderTrack!: ElementRef;
//   @ViewChild('currencySlider') currencySlider!: ElementRef;
//   @ViewChild('prodWrp') prodWrp!: ElementRef;

//   currentCurrency: 'czk' | 'eur' = 'czk';

//   shopProducts: Product[] = []; // Produkty budou načteny z JSONu
//   allFilteredAndSortedProducts: Product[] = [];
//   paginatedProducts: Product[] = [];

//   currentPage: number = 1;
//   itemsPerPage: number = 8; // Počet položek na stránku
//   totalPages: number = 0;
//   pagesToShow: number[] = [];

//   private exchangeRates = {
//     'czk': { toEUR: 0.040, symbol: ' Kč' },
//     'eur': { toCZK: 24.5, symbol: ' €' }
//   };

//   // Proměnné pro texty, které se budou plnit z LocalizationService
//   header1: string = '';
//   header02T: string = '';
//   searchPlaceholder: string = '';
//   sortByLabel: string = '';
//   sortByDefaultOption: string = '';
//   sortByAz: string = '';
//   sortByZa: string = '';
//   sortByPriceDesc: string = '';
//   sortByPriceAsc: string = '';
//   resultsCountText: string = '';
//   productsSuffix: string = '';
//   filterButtonText: string = '';
//   resetButtonText: string = '';
//   noProductsMessage: string = '';

//   private destroy$ = new Subject<void>();

//   constructor(
//     private cdr: ChangeDetectorRef,
//     private localizationService: LocalizationService, // Vstřikujeme LocalizationService
//     private http: HttpClient // Zde už se přímo nepoužívá pro načítání produktů, ale může být potřeba pro jiné HTTP requesty.
//   ) { }

//   ngOnInit(): void {
//     // Přihlásíme se k odběru CELÝCH překladů z LocalizationService
//     this.localizationService.currentTranslations$
//       .pipe(takeUntil(this.destroy$))
//       .subscribe({
//         next: (translations) => {
//           // Před načtením dat si zkontrolujeme, zda objekt 'shop' a 'products_data' existuje.
//           // To je důležité, protože `currentTranslations$` může být zpočátku `null` nebo prázdný objekt,
//           // dokud se nenačtou překlady.
//           if (translations && translations.shop) {
//             // Načteme běžné texty pro obchod z hlavního JSONu přes LocalizationService
//             this.loadLocalizedContent();

//             // Načteme produkty přímo z načteného objektu překladů
//             // Použijeme bezpečný přístup, abychom zabránili chybám, pokud products_data chybí
//             this.shopProducts = translations.shop.products_data || []; 
            
//             // Po načtení produktů aplikujeme filtry (pokud nějaké jsou nastaveny)
//             // a aktualizujeme zobrazení.
//             this.applyFilters(); 
//             this.cdr.detectChanges(); // Vynutit detekci změn, aby se UI aktualizovalo
//           } else {
//             // Pokud translations.shop nebo translations.shop.products_data neexistuje,
//             // nastavíme produkty na prázdné pole a zobrazíme zprávu "žádné produkty".
//             console.warn('Objekt "shop" nebo "products_data" nebyl nalezen v překladech.');
//             this.shopProducts = [];
//             this.applyFilters(); // Aplikovat filtry, což zobrazí zprávu o prázdném seznamu
//             this.cdr.detectChanges();
//           }
//         },
//         error: (e) => {
//           console.error('Chyba při odběru překladů v ShopComponent:', e);
//           this.shopProducts = []; // V případě chyby vyprázdníme produkty
//           this.applyFilters(); // Znovu aplikujeme filtry pro zobrazení "žádné produkty" zprávy
//           this.cdr.detectChanges();
//         }
//       });
//   }

//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }

//   /**
//    * Načte lokalizované texty pro komponentu Shop z LocalizationService.
//    */
//   private loadLocalizedContent(): void {
//     this.header1 = this.localizationService.getText('shop.header1');
//     this.header02T = this.localizationService.getText('shop.header02T');
//     this.searchPlaceholder = this.localizationService.getText('shop.searchPlaceholder');
//     this.sortByLabel = this.localizationService.getText('shop.sortByLabel');
//     this.sortByDefaultOption = this.localizationService.getText('shop.sortByDefaultOption');
//     this.sortByAz = this.localizationService.getText('shop.sortByAz');
//     this.sortByZa = this.localizationService.getText('shop.sortByZa');
//     this.sortByPriceDesc = this.localizationService.getText('shop.sortByPriceDesc');
//     this.sortByPriceAsc = this.localizationService.getText('shop.sortByPriceAsc');
//     this.resultsCountText = this.localizationService.getText('shop.resultsCountText');
//     this.productsSuffix = this.localizationService.getText('shop.productsSuffix');
//     this.filterButtonText = this.localizationService.getText('shop.filterButtonText');
//     this.resetButtonText = this.localizationService.getText('shop.resetButtonText');
//     this.noProductsMessage = this.localizationService.getText('shop.noProductsMessage');
//   }

//   ngAfterViewInit(): void {
//     // Initial setup of the currency slider, might need to be called after data is potentially available
//     // Pro reaktivní načítání dat, ujistěte se, že toto neběží před inicializací pohledu a dostupností dat.
//     // Nicméně, pro vizuální prvek, který nezávisí přímo na datech produktů, je zde v pořádku.
//     this.updateSliderPosition();
//   }

//   /**
//    * Změní aktuální měnu a aktualizuje zobrazení.
//    * @param currency Nová měna ('czk' nebo 'eur').
//    */
//   selectCurrency(currency: 'czk' | 'eur'): void {
//     if (this.currentCurrency !== currency) {
//       this.currentCurrency = currency;
//       this.updateSliderPosition();
//       this.currentPage = 1; // Resetovat stránku při změně měny
//       this.applyFilters();
//     }
//   }

//   /**
//    * Aktualizuje pozici posuvníku měny v UI.
//    */
//   private updateSliderPosition(): void {
//     if (!this.currencySliderTrack || !this.currencySlider) {
//       console.error('updateSliderPosition: Currency switcher elements are unavailable.');
//       return;
//     }

//     const sliderTrackElement = this.currencySliderTrack.nativeElement;
//     const sliderElement = this.currencySlider.nativeElement;
//     const activeLabelElement = sliderTrackElement.querySelector(`[data-currency="${this.currentCurrency}"]`) as HTMLElement;

//     if (activeLabelElement) {
//       const targetLeft = activeLabelElement.offsetLeft;
//       const targetWidth = activeLabelElement.offsetWidth;

//       sliderElement.style.left = `${targetLeft}px`;
//       sliderElement.style.width = `${targetWidth}px`;

//       sliderTrackElement.querySelectorAll('.currency-label').forEach((label: HTMLElement) => {
//         if (label.dataset['currency'] === this.currentCurrency) {
//           label.classList.add('active');
//         } else {
//           label.classList.remove('active');
//         }
//       });
//       this.cdr.detectChanges();
//     } else {
//       console.error(`updateSliderPosition: Could not find active label element for currency: ${this.currentCurrency}`);
//     }
//   }

//   /**
//    * Formátuje cenu podle vybrané měny.
//    * @param price Číselná hodnota ceny.
//    * @param currency Měna ('czk' nebo 'eur').
//    * @returns Formátovaný řetězec ceny.
//    */
//   private formatPrice(price: number, currency: 'czk' | 'eur'): string {
//     const symbol = this.exchangeRates[currency].symbol;
//     const options: Intl.NumberFormatOptions = {
//       minimumFractionDigits: (currency === 'eur') ? 2 : 0,
//       maximumFractionDigits: (currency === 'eur') ? 2 : 0,
//     };

//     let formattedValue: string;
//     if (currency === 'czk') {
//       formattedValue = price.toLocaleString('cs-CZ', options);
//     } else {
//       formattedValue = price.toLocaleString('en-US', options);
//     }
//     return `${formattedValue}${symbol}`;
//   }

//   /**
//    * Aplikuje filtry a řazení na produkty a aktualizuje paginaci.
//    */
//   applyFilters(): void {
//     // Vytvoříme kopii původních (nelokalizovaných) produktů, abychom je mohli filtrovat a řadit.
//     // `shopProducts` se aktualizuje při změně jazyka z `localizationService.currentTranslations$`.
//     let tempProducts = [...this.shopProducts];

//     // Filtrace podle vyhledávacího dotazu
//     if (this.searchQuery) {
//       const lowerCaseQuery = this.searchQuery.toLowerCase();
//       tempProducts = tempProducts.filter(product =>
//         product.name.toLowerCase().includes(lowerCaseQuery) ||
//         product.shortDescription.toLowerCase().includes(lowerCaseQuery)
//       );
//     }

//     // Řazení produktů
//     if (this.selectedSortOrder) {
//       tempProducts.sort((a, b) => {
//         const priceA = (this.currentCurrency === 'czk' ? a.priceCZK : a.priceEUR) || 0;
//         const priceB = (this.currentCurrency === 'czk' ? b.priceCZK : b.priceEUR) || 0;

//         switch (this.selectedSortOrder) {
//           case 'az': return a.name.localeCompare(b.name);
//           case 'za': return b.name.localeCompare(a.name);
//           case 'price-asc': return priceA - priceB;
//           case 'price-desc': return priceB - priceA;
//           default: return 0;
//         }
//       });
//     }

//     // Formátování ceny pro zobrazení
//     this.allFilteredAndSortedProducts = tempProducts.map(product => {
//       const displayPrice = (this.currentCurrency === 'czk') ? product.priceCZK : product.priceEUR;
//       return {
//         ...product,
//         price: this.formatPrice(displayPrice, this.currentCurrency)
//       };
//     });

//     // Aktualizace paginace
//     this.totalPages = Math.ceil(this.allFilteredAndSortedProducts.length / this.itemsPerPage);
//     if (this.currentPage > this.totalPages && this.totalPages > 0) {
//         this.currentPage = this.totalPages;
//     } else if (this.totalPages === 0) {
//         this.currentPage = 1;
//     }
//     this.updatePaginatedProducts();
//     this.generatePageNumbers();

//     this.cdr.detectChanges();
//   }

//   /**
//    * Aktualizuje produkty zobrazené na aktuální stránce.
//    */
//   private updatePaginatedProducts(): void {
//     const startIndex = (this.currentPage - 1) * this.itemsPerPage;
//     const endIndex = startIndex + this.itemsPerPage;
//     this.paginatedProducts = this.allFilteredAndSortedProducts.slice(startIndex, endIndex);
//   }

//   /**
//    * Generuje pole čísel stránek pro paginaci.
//    */
//   private generatePageNumbers(): void {
//     this.pagesToShow = [];
//     for (let i = 1; i <= this.totalPages; i++) {
//       this.pagesToShow.push(i);
//     }
//   }

//   /**
//    * Přejde na zadanou stránku.
//    * @param page Číslo stránky, na kterou se má přejít.
//    */
//   goToPage(page: number): void {
//     if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
//       this.currentPage = page;
//       this.updatePaginatedProducts();
//       this.cdr.detectChanges();
//       this.scrollToProdWrp();
//     }
//   }

//   /**
//    * Přejde na další stránku.
//    */
//   nextPage(): void {
//     if (this.currentPage < this.totalPages) {
//       this.currentPage++;
//       this.updatePaginatedProducts();
//       this.cdr.detectChanges();
//       this.scrollToProdWrp();
//     }
//   }

//   /**
//    * Přejde na předchozí stránku.
//    */
//   prevPage(): void {
//     if (this.currentPage > 1) {
//       this.currentPage--;
//       this.updatePaginatedProducts();
//       this.cdr.detectChanges();
//       this.scrollToProdWrp();
//     }
//   }

//   /**
//    * Posune zobrazení na začátek sekce produktů, pokud je šířka obrazovky menší než 1375px.
//    */
//   private scrollToProdWrp(): void {
//     if (window.innerWidth < 1375 && this.prodWrp) {
//       this.prodWrp.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
//     }
//   }

//   /**
//    * Zpracuje odeslání vyhledávacího formuláře.
//    * @param event Událost formuláře.
//    */
//   onSearch(event: Event): void {
//     event.preventDefault();
//     this.currentPage = 1;
//     this.applyFilters();
//   }

//   /**
//    * Zpracuje odeslání filtračního formuláře.
//    * @param event Událost formuláře.
//    */
//   onFilter(event: Event): void {
//     event.preventDefault();
//     this.currentPage = 1;
//     this.applyFilters();
//   }

//   /**
//    * Resetuje všechny filtry a vyhledávací dotazy.
//    */
//   onReset(): void {
//     this.searchQuery = '';
//     this.selectedSortOrder = '';
//     this.currentCurrency = 'czk';
//     this.currentPage = 1;
//     this.updateSliderPosition();
//     this.applyFilters();
//     console.log('Filtry a vyhledávání byly resetovány.');
//   }
// }
// src/app/public/pages/shop/shop.component.ts

import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http'; // HttpClient je zde ponechán, pokud ho potřebujete pro jiné účely, jinak ho můžete odebrat.
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ProductCardListComponent } from '../../components/product-card-list/product-card-list.component';
import { Product } from '../../../shared/interfaces/product';
import { LocalizationService } from '../../services/localization.service';

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
export class ShopComponent implements OnInit, AfterViewInit, OnDestroy {
  priceRangeValue: number = 0;
  selectedSortOrder: string = '';
  searchQuery: string = '';
  search_icon: string = 'assets/images/icons/search.png';

  @ViewChild('currencySliderTrack') currencySliderTrack!: ElementRef;
  @ViewChild('currencySlider') currencySlider!: ElementRef;
  @ViewChild('prodWrp') prodWrp!: ElementRef;

  currentCurrency: 'czk' | 'eur' = 'czk';

  shopProducts: Product[] = []; // Produkty budou načteny z JSONu
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

  // Proměnné pro texty, které se budou plnit z LocalizationService
  header1: string = '';
  header02T: string = '';
  searchPlaceholder: string = '';
  sortByLabel: string = '';
  sortByDefaultOption: string = '';
  sortByAz: string = '';
  sortByZa: string = '';
  sortByPriceDesc: string = '';
  sortByPriceAsc: string = '';
  resultsCountText: string = '';
  productsSuffix: string = '';
  filterButtonText: string = '';
  resetButtonText: string = '';
  noProductsMessage: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private cdr: ChangeDetectorRef,
    private localizationService: LocalizationService,
    private http: HttpClient // Zde už se přímo nepoužívá pro načítání produktů, ale může být potřeba pro jiné HTTP requesty.
  ) { }

  ngOnInit(): void {
    // Přihlásíme se k odběru CELÝCH překladů z LocalizationService
    // Stejný vzor jako v ReferencesComponent
    this.localizationService.currentTranslations$
      .pipe(takeUntil(this.destroy$)) // Automatické odhlášení při zničení komponenty
      .subscribe(translations => {
        // Zkontrolujeme, zda jsou překlady k dispozici a obsahují sekci 'shop'
        if (translations && translations.shop) {
          // Naplnění proměnných s přeloženými texty
          this.loadLocalizedContent();

          // Načtení a naplnění pole produktů s přeloženými texty
          // Produkty jsou nyní přímo v objektu translations.shop.products_data
          this.shopProducts = translations.shop.products_data || [];
          
          // Aplikujeme filtry a aktualizujeme zobrazení po načtení dat
          this.applyFilters();
          this.cdr.detectChanges(); // Vynutit detekci změn pro aktualizaci UI
        } else {
          // Pokud sekce 'shop' nebo 'products_data' chybí, nastavíme prázdné pole produktů
          console.warn('ShopComponent: Objekt "shop" nebo "products_data" nebyl nalezen v překladech.');
          this.shopProducts = [];
          this.loadLocalizedContent(); // Načteme texty, které by měly být buď klíče, nebo fallback
          this.applyFilters();
          this.cdr.detectChanges();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Načte lokalizované texty pro komponentu Shop z LocalizationService.
   * Tato metoda se volá POKAŽDÉ, když se změní jazyk a LocalizationService vydá nové překlady.
   */
  private loadLocalizedContent(): void {
    this.header1 = this.localizationService.getText('shop.header1');
    this.header02T = this.localizationService.getText('shop.header02T');
    this.searchPlaceholder = this.localizationService.getText('shop.searchPlaceholder');
    this.sortByLabel = this.localizationService.getText('shop.sortByLabel');
    this.sortByDefaultOption = this.localizationService.getText('shop.sortByDefaultOption');
    this.sortByAz = this.localizationService.getText('shop.sortByAz');
    this.sortByZa = this.localizationService.getText('shop.sortByZa');
    this.sortByPriceDesc = this.localizationService.getText('shop.sortByPriceDesc');
    this.sortByPriceAsc = this.localizationService.getText('shop.sortByPriceAsc');
    this.resultsCountText = this.localizationService.getText('shop.resultsCountText');
    this.productsSuffix = this.localizationService.getText('shop.productsSuffix');
    this.filterButtonText = this.localizationService.getText('shop.filterButtonText');
    this.resetButtonText = this.localizationService.getText('shop.resetButtonText');
    this.noProductsMessage = this.localizationService.getText('shop.noProductsMessage');
  }

  ngAfterViewInit(): void {
    this.updateSliderPosition();
  }

  /**
   * Změní aktuální měnu a aktualizuje zobrazení.
   * @param currency Nová měna ('czk' nebo 'eur').
   */
  selectCurrency(currency: 'czk' | 'eur'): void {
    if (this.currentCurrency !== currency) {
      this.currentCurrency = currency;
      this.updateSliderPosition();
      this.currentPage = 1; // Resetovat stránku při změně měny
      this.applyFilters();
    }
  }

  /**
   * Aktualizuje pozici posuvníku měny v UI.
   */
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

  /**
   * Formátuje cenu podle vybrané měny.
   * @param price Číselná hodnota ceny.
   * @param currency Měna ('czk' nebo 'eur').
   * @returns Formátovaný řetězec ceny.
   */
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

  /**
   * Aplikuje filtry a řazení na produkty a aktualizuje paginaci.
   */
  applyFilters(): void {
    let tempProducts = [...this.shopProducts];

    // Filtrace podle vyhledávacího dotazu
    if (this.searchQuery) {
      const lowerCaseQuery = this.searchQuery.toLowerCase();
      tempProducts = tempProducts.filter(product =>
        product.name.toLowerCase().includes(lowerCaseQuery) ||
        product.shortDescription.toLowerCase().includes(lowerCaseQuery)
      );
    }

    // Řazení produktů
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

    // Formátování ceny pro zobrazení
    this.allFilteredAndSortedProducts = tempProducts.map(product => {
      const displayPrice = (this.currentCurrency === 'czk') ? product.priceCZK : product.priceEUR;
      return {
        ...product,
        price: this.formatPrice(displayPrice, this.currentCurrency)
      };
    });

    // Aktualizace paginace
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

  /**
   * Aktualizuje produkty zobrazené na aktuální stránce.
   */
  private updatePaginatedProducts(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedProducts = this.allFilteredAndSortedProducts.slice(startIndex, endIndex);
  }

  /**
   * Generuje pole čísel stránek pro paginaci.
   */
  private generatePageNumbers(): void {
    this.pagesToShow = [];
    for (let i = 1; i <= this.totalPages; i++) {
      this.pagesToShow.push(i);
    }
  }

  /**
   * Přejde na zadanou stránku.
   * @param page Číslo stránky, na kterou se má přejít.
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.updatePaginatedProducts();
      this.cdr.detectChanges();
      this.scrollToProdWrp();
    }
  }

  /**
   * Přejde na další stránku.
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedProducts();
      this.cdr.detectChanges();
      this.scrollToProdWrp();
    }
  }

  /**
   * Přejde na předchozí stránku.
   */
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedProducts();
      this.cdr.detectChanges();
      this.scrollToProdWrp();
    }
  }

  /**
   * Posune zobrazení na začátek sekce produktů, pokud je šířka obrazovky menší než 1375px.
   */
  private scrollToProdWrp(): void {
    if (window.innerWidth < 1375 && this.prodWrp) {
      this.prodWrp.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /**
   * Zpracuje odeslání vyhledávacího formuláře.
   * @param event Událost formuláře.
   */
  onSearch(event: Event): void {
    event.preventDefault();
    this.currentPage = 1;
    this.applyFilters();
  }

  /**
   * Zpracuje odeslání filtračního formuláře.
   * @param event Událost formuláře.
   */
  onFilter(event: Event): void {
    event.preventDefault();
    this.currentPage = 1;
    this.applyFilters();
  }

  /**
   * Resetuje všechny filtry a vyhledávací dotazy.
   */
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