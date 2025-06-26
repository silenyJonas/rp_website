import { Component } from '@angular/core';

@Component({
  selector: 'app-home', // Nebo váš selektor
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  // URL vašeho obrázku pozadí
  // Ujistěte se, že cesta je správná z pohledu nasazené aplikace (tj. z kořene dist adresáře)
  private heroBackgroundImageUrl: string = 'assets/images/backgrounds/home_background.jpg';

  constructor() { }

  /**
   * Metoda vrací CSS hodnotu pro vlastnost background-image.
   * Vrací 'url()' řetězec, který je potřeba pro CSS vlastnost.
   */
  getHeroBackground(): string {
    return `url('${this.heroBackgroundImageUrl}')`;
  }

  // Případně, pokud byste chtěl(a) nastavit i další vlastnosti dynamicky,
  // můžete použít ngStyle a vrátit objekt (viz níže)
}