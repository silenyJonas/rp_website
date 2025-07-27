import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core'; // Přidán ChangeDetectorRef
import { CommonModule } from '@angular/common'; // Required for Angular directives like ngClass
import { FormsModule } from '@angular/forms'; // Required for two-way data binding (ngModel)

// Import ProductCardListComponent and Product interface
import { ProductCardListComponent } from '../../components/product-card-list/product-card-list.component';
import { Product } from '../../../shared/interfaces/product';

@Component({
  selector: 'app-shop',
  standalone: true, // If the component is standalone
  imports: [
    CommonModule,
    FormsModule,
    ProductCardListComponent // Add ProductCardListComponent to imports
  ],
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent implements OnInit, AfterViewInit {
  // --- Variables for your filters and search ---
  priceRangeValue: number = 0; // For input type="range" (not used in current filtering logic, but kept)
  selectedSortOrder: string = ''; // For select sorting
  searchQuery: string = ''; // New: For search input
  search_icon: string = 'assets/images/icons/search.png'; // Path to icon

  // --- Variables and references for currency switcher ---
  @ViewChild('currencySliderTrack') currencySliderTrack!: ElementRef;
  @ViewChild('currencySlider') currencySlider!: ElementRef;
  currentCurrency: string = 'czk';

  // --- List of all products ---
  shopProducts: Product[] = [];
  // --- List of products currently displayed after filtering/sorting ---
  filteredProducts: Product[] = [];

  constructor(private cdr: ChangeDetectorRef) { // Injektování ChangeDetectorRef
    // Konstruktor se volá před OnInit. Zde by neměla probíhat práce s DOM.
  }

  // ngOnInit is called after the constructor and after component's input data initialization.
  ngOnInit(): void {
    // Initialize product data
    this.shopProducts = [
      {
        id: 'prod-001',
        name: 'Předpřipravený E-Shop',
        shortDescription: 'Spuštění do 24 hodin na vlastní doméně.',
        price: '8 099 Kč',
        imageUrl: 'assets/images/product_images/eshop_default.png',
        popupType: 'eshop-app', // Key for popup selection
        details: {
          longDescription: 'Naše e-shop řešení "Obchodník" je navrženo pro maximální flexibilitu a snadné použití. Zahrnuje správu produktů, objednávek, uživatelů, platebních bran a robustní analytiku. Plně responzivní design zajišťuje perfektní zobrazení na všech zařízeních.',
          features: [
            'Intuitivní správa produktů',
            'Bezpečné platební brány (Stripe, PayPal, GoPay)',
            'Automatizovaná správa objednávek',
            'Uživatelské účty a historie nákupů',
            'SEO optimalizace pro lepší viditelnost',
            'Integrace s dopravními službami'
          ],
          technologyStack: 'Angular, Laravel, PostgreSQL',
          screenshotUrl: 'https://placehold.co/600x400/8a5acd/FFFFFF?text=E-shop+Detail',
          supportInfo: '24/7 technická podpora a pravidelné aktualizace.'
        }
      },
      {
        id: 'prod-002',
        name: 'Dotazníkový software',
        shortDescription: 'Profesionální software pro tvorbu vlastních dotazníků.',
        price: '7 999 Kč',
        imageUrl: 'assets/images/product_images/survey_engine.png',
        popupType: 'task-manager', // Key for popup selection
        details: {
          category: 'Produktivita a řízení', // Kept for data integrity, but not used in filter
          version: '2.1.0',
          platforms: 'Windows, macOS, Linux',
          notes: 'Offline funkcionalita s možností synchronizace po připojení k internetu. Podporuje týmovou spolupráci.',
          functions: [
            'Vytváření a přiřazování úkolů',
            'Sledování pokroku projektu',
            'Ganttovy diagramy a kalendář',
            'Připojování souborů k úkolům',
            'Generování reportů',
            'Notifikace a připomenutí'
          ]
        }
      },
      {
        id: 'prod-003',
        name: 'Dotazníkový nalyzátor',
        shortDescription: 'Rychlá analýza a prezentace vložených dat.',
        price: '1 499 Kč',
        imageUrl: 'assets/images/product_images/survey_solver.png',
        popupType: 'ai-assistant', // Key for popup selection
        details: {
          aiCapabilities: 'Využívá pokročilé NLP pro porozumění dotazům a generování relevantních odpovědí. Schopnost učení z interakcí a integrace s vašimi databázemi.',
          useCases: [
            'Automatická odpověď na FAQ',
            'Přesměrování dotazů na správné oddělení',
            'Sběr informací od klientů před spojením s operátorem',
            'Personalizované doporučení produktů/služeb'
          ],
          customization: 'Plně přizpůsobitelný pro vaši značku a tone-of-voice. Možnost integrace do webových stránek, mobilních aplikací a sociálních sítí.'
        }
      }
    ];

    this.filteredProducts = this.shopProducts; // Inicializujte filteredProducts s plným seznamem
    this.applyFilters(); // Aplikujte filtry hned po načtení
  }

  // ngAfterViewInit is called after the component's view and its child views are fully initialized.
  // Ideal place for interacting with DOM elements referenced by @ViewChild.
  ngAfterViewInit(): void {
    console.log('ngAfterViewInit: currencySliderTrack ElementRef:', this.currencySliderTrack);
    console.log('ngAfterViewInit: currencySlider ElementRef:', this.currencySlider);

    if (this.currencySliderTrack && this.currencySlider) {
      this.updateSliderPosition();
    } else {
      console.error('ngAfterViewInit: Some currency switcher elements were not found. Check `#currencySliderTrack` and `#currencySlider` in HTML.');
    }
  }

  // --- Logic for currency switcher ---
  selectCurrency(currency: string): void {
    console.log(`selectCurrency: Clicked on ${currency}`);

    if (this.currentCurrency !== currency) {
      this.currentCurrency = currency;
      this.updateSliderPosition();
    }
  }

  private updateSliderPosition(): void {
    console.log('updateSliderPosition: Running, current currency:', this.currentCurrency);

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

      console.log(`updateSliderPosition: Target position for ${this.currentCurrency}: left=${targetLeft}px, width=${targetWidth}px`);

      sliderElement.style.left = `${targetLeft}px`;
      sliderElement.style.width = `${targetWidth}px`;

      sliderTrackElement.querySelectorAll('.currency-label').forEach((label: HTMLElement) => {
        if (label.dataset['currency'] === this.currentCurrency) {
          label.classList.add('active');
        } else {
          label.classList.remove('active');
        }
      });
    } else {
      console.error(`updateSliderPosition: Could not find active label element for currency: ${this.currentCurrency}`);
    }
  }

  // --- Filtering and Sorting Logic ---
  applyFilters(): void {
    let tempProducts = [...this.shopProducts]; // Start with a copy of all products

    // 1. Filter by search query (name and short description)
    if (this.searchQuery) {
      const lowerCaseQuery = this.searchQuery.toLowerCase();
      tempProducts = tempProducts.filter(product =>
        product.name.toLowerCase().includes(lowerCaseQuery) ||
        product.shortDescription.toLowerCase().includes(lowerCaseQuery)
      );
    }

    // 2. Sort products
    if (this.selectedSortOrder) {
      tempProducts.sort((a, b) => {
        switch (this.selectedSortOrder) {
          case 'az':
            return a.name.localeCompare(b.name);
          case 'za':
            return b.name.localeCompare(a.name);
          case 'price-asc':
            // Assuming price is a string like "X 000 CZK", extract number for sorting
            const priceA = parseFloat(a.price.replace(/[^\d.]/g, '')) || 0;
            const priceB = parseFloat(b.price.replace(/[^\d.]/g, '')) || 0;
            return priceA - priceB;
          case 'price-desc':
            const priceADesc = parseFloat(a.price.replace(/[^\d.]/g, '')) || 0;
            const priceBDesc = parseFloat(b.price.replace(/[^\d.]/g, '')) || 0;
            return priceBDesc - priceADesc;
          default:
            return 0;
        }
      });
    }
    this.filteredProducts = tempProducts;
    // Explicitně vynutíme detekci změn, aby se aktualizoval pohled
    this.cdr.detectChanges();
  }

  onSearch(event: Event): void {
    event.preventDefault(); // Prevent default form submission
    console.log('Searching for:', this.searchQuery);
    this.applyFilters(); // Apply filters including search
  }

  onFilter(event: Event): void {
    event.preventDefault(); // Prevent default form submission
    console.log('Filtering products:');
    console.log('Sort by:', this.selectedSortOrder);
    this.applyFilters(); // Apply filters including sort
  }

  // NOVÁ METODA PRO RESET FILTRŮ A VYHLEDÁVÁNÍ
  onReset(): void {
    this.searchQuery = ''; // Resetuje vyhledávací dotaz
    this.selectedSortOrder = ''; // Resetuje pořadí řazení
    this.applyFilters(); // Znovu aplikuje filtry, což zobrazí všechny produkty v původním pořadí
    console.log('Filtry a vyhledávání byly resetovány.');
  }
}