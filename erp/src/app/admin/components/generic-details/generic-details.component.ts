import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { ItemDetailsColumns } from '../../../shared/interfaces/item-details-columns';

@Component({
  selector: 'app-generic-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './generic-details.component.html',
  styleUrl: './generic-details.component.css',
  providers: [DatePipe, CurrencyPipe]
})
export class GenericDetailsComponent implements OnInit, OnDestroy {
  @Input() itemData: any;
  @Input() itemDetailColumns: ItemDetailsColumns[] = [];
  @Output() closeDetails = new EventEmitter<void>();

  constructor(
    private datePipe: DatePipe,
    private currencyPipe: CurrencyPipe
  ) {}

  ngOnInit(): void {
    // Zablokování scrollu pozadí
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    // Obnovení scrollu při zavření
    document.body.style.overflow = 'auto';
  }

  onClose(): void {
    this.closeDetails.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  getFileName(url: string): string {
    if (!url) return 'soubor';
    const parts = url.split('/');
    return parts[parts.length - 1].split('?')[0] || 'soubor';
  }

  getFormattedValue(obj: any, path: string, columnDef: ItemDetailsColumns): any {
    const value = this.getValueByPath(obj, path);
    if (value === null || value === undefined || value === '') return null;

    switch (columnDef.type) {
        case 'currency':
            return this.currencyPipe.transform(value, 'CZK', 'symbol-narrow', '1.0-0', 'cs-CZ');
        case 'date':
            const date = new Date(value);
            return isNaN(date.getTime()) ? value : this.datePipe.transform(date, columnDef.format || 'dd.MM.yyyy HH:mm', 'cs-CZ');
        case 'boolean':
            return value ? 'Ano' : 'Ne';
        default:
            return value;
    }
  }

  getValueByPath(obj: any, path: string): any {
    if (!obj || !path) return '';
    const keys = path.split('.');
    let current = obj;
    for (const key of keys) {
      if (current === null || current === undefined) return '';
      current = current[key];
    }
    return current;
  }
}