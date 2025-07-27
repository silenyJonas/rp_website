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
    // TOTO JE JIŽ SPRÁVNĚ
    document.body.classList.add('no-scroll');
    this.cdr.detectChanges();
  }

  closePopup(): void {
    this.isPopupOpen = false;
    this.selectedProduct = null;
    // TOTO JE JIŽ SPRÁVNĚ
    document.body.classList.remove('no-scroll');
    this.cdr.detectChanges();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('product-popup-overlay')) {
      this.closePopup();
    }
  }
}