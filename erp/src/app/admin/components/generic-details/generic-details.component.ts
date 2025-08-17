import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { ItemDetailsColumns } from '../../../shared/interfaces/item-details-columns';

@Component({
  selector: 'app-generic-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './generic-details.component.html',
  styleUrl: './generic-details.component.css',
  providers: [DatePipe, CurrencyPipe] // Poskytujeme Pipes lokálně
})
export class GenericDetailsComponent {
  @Input() itemData: any;
  @Input() itemDetailColumns: ItemDetailsColumns[] = [];
  @Output() closeDetails = new EventEmitter<void>();

  constructor(
    private datePipe: DatePipe,
    private currencyPipe: CurrencyPipe
  ) {}

  onClose(): void {
    this.closeDetails.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  /**
   * Získává hodnotu z objektu pomocí cesty s tečkami a formátuje ji.
   * @param obj Objekt, ze kterého se má hodnota získat.
   * @param path Cesta k hodnotě (např. 'roles.0.role_name').
   * @param columnDef Definice sloupce, která obsahuje typ a formát.
   */
  getFormattedValue(obj: any, path: string, columnDef: ItemDetailsColumns): any {
    const value = this.getValueByPath(obj, path);

    switch (columnDef.type) {
        case 'currency':
            return this.currencyPipe.transform(value, 'CZK', 'symbol-narrow', '1.2-2', 'cs-CZ');
        case 'date':
            if (value instanceof Date) {
              return this.datePipe.transform(value, columnDef.format || 'short', 'cs-CZ');
            } else if (typeof value === 'string') {
              const date = new Date(value);
              return this.datePipe.transform(date, columnDef.format || 'short', 'cs-CZ');
            } else {
              return value;
            }
        case 'boolean':
            return value ? 'Ano' : 'Ne';
        default:
            return value;
    }
  }

  /**
   * Získává hodnotu z objektu pomocí cesty s tečkami.
   * Např. 'roles.0.role_name'
   */
  getValueByPath(obj: any, path: string): any {
    if (!obj || !path) {
      return '';
    }

    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (current === null || current === undefined) {
        return '';
      }
      current = current[key];
    }
    return current;
  }
}
