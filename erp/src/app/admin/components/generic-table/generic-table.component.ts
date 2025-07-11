// src/app/components/generic-table/generic-table.component.ts

import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, CurrencyPipe, KeyValuePipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Předpoklad: ColumnDefinition je v 'src/app/shared/interfaces'
import { ColumnDefinition } from '../../../shared/interfaces/generic-form-column-definiton';
// Předpoklad: BaseDataComponent je ve stejné složce 'src/app/components'
import { BaseDataComponent } from '../base-data/base-data.component';
// Předpoklad: DataHandler je v 'src/app/core/services'

import { DataHandler } from '../../../core/services/data-handler.service';
@Component({
  selector: 'app-generic-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe,
    KeyValuePipe,
    DatePipe
  ],
  templateUrl: './generic-table.component.html',
  styleUrls: ['./generic-table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenericTableComponent extends BaseDataComponent<any> implements OnInit, OnChanges {
  @Input() override data: any[] = [];
  @Input('columns') columnDefinitions: ColumnDefinition[] = [];
  @Input() tableCaption?: string;
  @Input() override apiEndpoint: string = '';
  // Ponecháno isLoading, protože ho předáváte z HTML.
  @Input() override isLoading: boolean = false;
  // Pokud chcete používat zobrazení obrázků s uploadsBaseUrl, musíte si přidat tento input
  @Input() uploadsBaseUrl: string = ''; // Příklad: přidejte zpět, pokud ho GenericTableComponent interně používá pro obrázky

  constructor(
    protected override dataHandler: DataHandler,
    protected override cd: ChangeDetectorRef
  ) {
    super(dataHandler, cd);
  }

  override ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);
  }

  override ngOnInit(): void {
    super.ngOnInit();
  }

  getCellValue(item: any, column: ColumnDefinition): any {
    const keys = column.key.split('.');
    const value = keys.reduce((obj, key) => obj?.[key], item);

    switch (column.type) {
      case 'currency':
        return value ? (new CurrencyPipe('cs-CZ')).transform(value, 'CZK', 'symbol-narrow', '1.2-2') : '';
      case 'date':
        return value ? (new DatePipe('cs-CZ')).transform(value, column.format || 'shortDate') : '';
      case 'boolean':
        return value ? 'Ano' : 'Ne';
      case 'image': // Pokud tento case používáte, GenericTableComponent POTŘEBUJE uploadsBaseUrl input
        return value ? `${this.uploadsBaseUrl}${value}` : ''; // Používá this.uploadsBaseUrl
      case 'array':
        return Array.isArray(value) ? value.join(', ') : value;
      case 'object':
        return this.isObject(value) ? JSON.stringify(value) : value;
      default:
        return value;
    }
  }

  isObject(value: any): boolean {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}