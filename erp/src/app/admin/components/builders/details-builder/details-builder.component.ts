import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { ItemDetailsColumns } from '../../../../shared/interfaces/item-details-columns';
import { InputDefinition } from '../../../../shared/interfaces/input-definiton';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-details-builder',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './details-builder.component.html',
  styleUrl: './details-builder.component.css',
  providers: [DatePipe, CurrencyPipe]
})
export class DetailsBuilderComponent implements OnInit, OnDestroy {
  @Input() itemData: any;
  @Input() itemDetailColumns: ItemDetailsColumns[] = [];
  @Input() inputDefinitions: InputDefinition[] = [];
  @Output() closeDetails = new EventEmitter<void>();

  constructor(
    private datePipe: DatePipe,
    private currencyPipe: CurrencyPipe
  ) {}

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
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

  /**
   * Zkusí zparsovat JSON string na objekt. Pokud selže nebo to není string, vrátí původní hodnotu.
   */
  getJsonValue(val: any): any {
    if (typeof val === 'string' && (val.trim().startsWith('{') || val.trim().startsWith('['))) {
      try {
        return JSON.parse(val);
      } catch (e) {
        return val;
      }
    }
    return val;
  }

  /**
   * Detekuje, zda je hodnota objekt nebo JSON string vhodný pro zobrazení v <pre>
   */
  isObject(val: any): boolean {
    if (val === null || val === undefined) return false;
    // Je to přímo objekt
    if (typeof val === 'object' && !(val instanceof Date)) return true;
    // Je to string, který vypadá jako JSON
    if (typeof val === 'string' && (val.trim().startsWith('{') || val.trim().startsWith('['))) return true;
    return false;
  }

  getFileName(url: string): string {
    if (!url) return 'soubor';
    const parts = url.split('/');
    return parts[parts.length - 1].split('?')[0] || 'soubor';
  }

  downloadFile(fullUrl: string): void {
    const pathParts = fullUrl.split('/storage/');
    if (pathParts.length < 2) {
      window.open(fullUrl, '_blank');
      return;
    }
    const storagePath = pathParts[1];
    const downloadUrl = `${environment.base_api_url}/download-file/${storagePath}`;
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
        return (value == true || value == 1) ? 'Ano' : 'Ne';
      default:
        const fieldDef = this.inputDefinitions.find(i => i.column_name === columnDef.key);
        if (fieldDef?.options) {
          const option = fieldDef.options.find(opt => String(opt.value) === String(value));
          return option ? option.label : value;
        }
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