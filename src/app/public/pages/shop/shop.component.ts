import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; FormsModule

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent {
  priceRangeValue: number = 0; // Pro input type="range"
  selectedSortOrder: string = ''; // Pro select seřazení
  selectedCategory: string = '';  // Pro select kategorie
  search_icon: string = 'assets/images/icons/search.png'
  constructor() { }

  ngOnInit(): void { }

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