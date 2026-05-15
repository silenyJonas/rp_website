import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-shop-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './shop-header.component.html',
  styleUrls: ['./shop-header.component.css']
})
export class ShopHeaderComponent {
  isScrolled = false;
  cartCount = 0;

  // Stavy pro dropdowny
  showLang = false;
  showCurrency = false;
  selectedLang = 'CZ';
  selectedCurrency = 'CZK';

  constructor(private router: Router) {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  // Kliknutí kamkoliv jinam zavře dropdowny
  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!event.target.closest('.custom-dropdown')) {
      this.showLang = false;
      this.showCurrency = false;
    }
  }

  toggleLang() { this.showLang = !this.showLang; this.showCurrency = false; }
  toggleCurrency() { this.showCurrency = !this.showCurrency; this.showLang = false; }

  selectLang(val: string) {
    this.selectedLang = val;
    console.log('Jazyk:', val);
  }

  selectCurrency(val: string) {
    this.selectedCurrency = val;
    console.log('Měna:', val);
  }

  openCart() { 
  this.router.navigate(['/shop/cart']); 
}
}