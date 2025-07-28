// src/app/components/product-card-list/product-card-list.component.ts

import { Component, Input, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../shared/interfaces/product';

@Component({
  selector: 'app-product-card-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card-list.component.html',
  styleUrls: ['./product-card-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductCardListComponent implements OnInit {

  @Input() products: Product[] = [];
  selectedProduct: Product | null = null;
  isPopupOpen: boolean = false;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    // Inicializační logika, pokud je potřeba
  }

  openPopup(product: Product): void {
    this.selectedProduct = product;
    this.isPopupOpen = true;
    // TOTO JE JIŽ SPRÁVNĚ - PŘIDÁVÁ TŘÍDU
    document.body.classList.add('no-scroll');
    this.cdr.detectChanges(); // Vynutí detekci změn, aby se popup zobrazil okamžitě
  }

  closePopup(): void {
    this.isPopupOpen = false;
    this.selectedProduct = null;
    // TOTO JE JIŽ SPRÁVNĚ - ODEBÍRÁ TŘÍDU
    document.body.classList.remove('no-scroll');
    this.cdr.detectChanges(); // Vynutí detekci změn, aby se popup skryl okamžitě
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('product-popup-overlay')) {
      this.closePopup();
    }
  }
}