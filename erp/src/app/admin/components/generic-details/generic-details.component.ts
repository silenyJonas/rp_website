import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { ItemDetailsColumns } from '../../../shared/interfaces/item-details-columns';
import { environment } from '../../../../environments/environment';
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

downloadFile(fullUrl: string): void {
  // 1. Získáme relativní cestu ze stávající URL (např. "tickets/soubor.txt")
  // fullUrl vypadá teď nejspíš takto: "http://127.0.0.1:8000/storage/tickets/abc.txt"
  const pathParts = fullUrl.split('/storage/');
  if (pathParts.length < 2) {
    window.open(fullUrl, '_blank');
    return;
  }
  
  const storagePath = pathParts[1]; // např. "tickets/abc.txt"
  
  /**
   * 2. Sestavení URL pro stahování
   * environment.base_api_url je '/api' nebo 'https://www.rpsw.cz/api'
   * Pokud base_api_url začíná lomítkem (relativní cesta), 
   * prohlížeč automaticky použije aktuální doménu.
   */
  const downloadUrl = `${environment.base_api_url}/download-file/${storagePath}`;
  
  // 3. Spuštění stahování
  window.location.href = downloadUrl;
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