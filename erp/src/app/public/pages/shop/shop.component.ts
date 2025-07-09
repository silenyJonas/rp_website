import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common'; // Potřebné pro Angular direktivy jako ngClass
import { FormsModule } from '@angular/forms'; // Potřebné pro obousměrnou datovou vazbu (ngModel)

@Component({
  selector: 'app-shop',
  standalone: true, // Pokud je komponenta samostatná (standalone)
  imports: [CommonModule, FormsModule], // Zajistěte, že tyto moduly jsou importovány
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent implements OnInit, AfterViewInit {
  // --- Proměnné pro vaše filtry a vyhledávání ---
  priceRangeValue: number = 0; // Pro input type="range"
  selectedSortOrder: string = ''; // Pro select seřazení
  selectedCategory: string = '';  // Pro select kategorie
  search_icon: string = 'assets/images/icons/search.png'; // Cesta k ikoně

  // --- Proměnné a reference pro přepínač měn ---
  // @ViewChild se používá k získání reference na DOM element v šabloně
  // '!' na konci označuje "non-null assertion operator" - říká Angularu,
  // že element bude k dispozici v ngAfterViewInit
  @ViewChild('currencySliderTrack') currencySliderTrack!: ElementRef;
  @ViewChild('currencySlider') currencySlider!: ElementRef;

  // Sledování aktuálně vybrané měny. Nastaveno na 'czk' jako výchozí.
  currentCurrency: string = 'czk';

  constructor() {
    // Konstruktor se volá před OnInit. Zde by neměla probíhat práce s DOM.
  }

  // ngOnInit se volá po konstruktoru a po inicializaci vstupních dat komponenty.
  ngOnInit(): void {
    // Jakákoli inicializace dat komponenty, která nezávisí na DOM.
  }

  // ngAfterViewInit se volá po plné inicializaci pohledu komponenty a jejích dětí.
  // Ideální místo pro interakci s DOM elementy, které jsou referencovány pomocí @ViewChild.
  ngAfterViewInit(): void {
    // Diagnostika: Zkontrolujte, zda jsou reference na elementy nalezeny
    console.log('ngAfterViewInit: currencySliderTrack ElementRef:', this.currencySliderTrack);
    console.log('ngAfterViewInit: currencySlider ElementRef:', this.currencySlider);

    // Pokud byly elementy nalezeny, nastavíme počáteční pozici slideru.
    if (this.currencySliderTrack && this.currencySlider) {
        this.updateSliderPosition();
    } else {
        // Chyba: Elementy nejsou nalezeny. Zkontrolujte HTML šablonu (template reference variables).
        console.error('ngAfterViewInit: Některý z elementů přepínače měn nebyl nalezen. Zkontrolujte `#currencySliderTrack` a `#currencySlider` v HTML.');
    }
  }

  // --- Logika pro přepínač měn ---
  // Tato metoda se volá z HTML, když uživatel klikne na label měny (CZK/EUR).
  selectCurrency(currency: string): void {
    console.log(`selectCurrency: Kliknuto na ${currency}`); // Diagnostika

    // Zabráníme zbytečné aktualizaci, pokud už je vybrána stejná měna
    if (this.currentCurrency !== currency) {
      this.currentCurrency = currency; // Aktualizujeme stavovou proměnnou
      this.updateSliderPosition(); // Zavoláme metodu pro přesun slideru
    }
  }

  // Privátní metoda pro aktualizaci pozice slideru a aktivní třídy CSS.
  private updateSliderPosition(): void {
    console.log('updateSliderPosition: Spuštěna, aktuální měna:', this.currentCurrency); // Diagnostika

    // Znovu kontrolujeme existence ElementRef pro robustnost
    if (!this.currencySliderTrack || !this.currencySlider) {
      console.error('updateSliderPosition: Elementy přepínače měn jsou nedostupné.');
      return;
    }

    // Získání nativních DOM elementů z ElementRef
    const sliderTrackElement = this.currencySliderTrack.nativeElement;
    const sliderElement = this.currencySlider.nativeElement;

    // Najdeme konkrétní label element odpovídající aktuálně vybrané měně
    const activeLabelElement = sliderTrackElement.querySelector(`[data-currency="${this.currentCurrency}"]`) as HTMLElement;

    if (activeLabelElement) {
      // Vypočítáme cílovou pozici `left` a `width` pro slider.
      // `offsetLeft` a `offsetWidth` jsou pozice/rozměry vzhledem k offsetParent (zde `.currency-slider-track`).
      const targetLeft = activeLabelElement.offsetLeft;
      const targetWidth = activeLabelElement.offsetWidth;

      console.log(`updateSliderPosition: Cílová pozice pro ${this.currentCurrency}: left=${targetLeft}px, width=${targetWidth}px`); // Diagnostika

      // Nastavíme styly na slideru. Díky CSS 'transition' dojde k plynulé animaci.
      sliderElement.style.left = `${targetLeft}px`;
      sliderElement.style.width = `${targetWidth}px`;

      // Projdeme všechny labely měn a přidáme/odebereme třídu 'active'
      sliderTrackElement.querySelectorAll('.currency-label').forEach((label: HTMLElement) => {
        if (label.dataset['currency'] === this.currentCurrency) {
          label.classList.add('active'); // Aktivní měně přidáme třídu 'active'
        } else {
          label.classList.remove('active'); // Ostatním měnám třídu odebereme
        }
      });
    } else {
      console.error(`updateSliderPosition: Nepodařilo se najít aktivní label element pro měnu: ${this.currentCurrency}`); // Diagnostika
    }
  }

  // --- Vaše původní metody pro filtry a vyhledávání ---
  onSearch(event: Event): void {
    event.preventDefault(); // Zabrání výchozímu odeslání formuláře
    console.log('Hledám název...');
  }

  onFilter(event: Event): void {
    event.preventDefault(); // Zabrání výchozímu odeslání formuláře
    console.log('Filtruji produkty:');
    console.log('Seřadit dle:', this.selectedSortOrder);
    console.log('Kategorie:', this.selectedCategory);
  }
}