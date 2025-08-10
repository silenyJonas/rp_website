// import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { FilterColumns } from '../../../shared/interfaces/filter-columns';

// @Component({
//   selector: 'app-generic-filter-form',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule
//   ],
//   templateUrl: './generic-filter-form.component.html',
//   styleUrl: './generic-filter-form.component.css'
// })
// export class GenericFilterFormComponent implements OnChanges {

//   @Input() filterColumns: FilterColumns[] = [];
//   @Input() filterFormTitle: string = 'Filtrovat data';

//   @Input() initialFilters: any = {};
//   @Input() initialSortBy: string = '';
//   @Input() initialSortDirection: 'asc' | 'desc' = 'asc';

//   @Output() filtersApplied = new EventEmitter<any>();
//   @Output() filtersCleared = new EventEmitter<void>();

//   public filterForm: any = {};
//   public sortBy: string = '';
//   public sortDirection: 'asc' | 'desc' = 'asc';

//   ngOnChanges(changes: SimpleChanges): void {
//     if (changes['initialFilters']) {
//       this.filterForm = { ...this.initialFilters };
//     }
//     if (changes['initialSortBy']) {
//       this.sortBy = this.initialSortBy;
//     }
//     if (changes['initialSortDirection']) {
//       this.sortDirection = this.initialSortDirection;
//     }
//     this.setFilterFormValues();
//   }

//   private setFilterFormValues(): void {
//     this.filterColumns.forEach(column => {
//       this.filterForm[column.key] = this.initialFilters[column.key] || '';
//     });
//     this.sortBy = this.initialSortBy || '';
//     this.sortDirection = this.initialSortDirection || 'asc';
//   }

//   applyFilters(): void {
//     const filters = {
//       ...this.filterForm,
//       sortBy: this.sortBy,
//       sortDirection: this.sortDirection
//     };
//     this.filtersApplied.emit(filters);
//   }

//   clearFilters(): void {
//     this.filterColumns.forEach(column => {
//       this.filterForm[column.key] = '';
//     });
//     this.sortBy = '';
//     this.sortDirection = 'asc';
//     this.filtersCleared.emit();
//   }
// }
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterColumns } from '../../../shared/interfaces/filter-columns';
export const USER_REQUEST_STATUS_OPTIONS: string[] = ['Zpracovává se', 'Nové zadané', 'Dokončeno']; // Předpokládané hodnoty
export const USER_REQUEST_PRIORITY_OPTIONS: string[] = ['Nízká', 'Neutrální', 'Vysoká']; // Předpokládané hodnoty

export const USER_REQUEST_FILTER_COLUMNS: FilterColumns[] = [
  {
    key: 'search',
    header: 'Obecné hledání',
    type: 'text', // Změněno na 'text' pro obecné vyhledávání
    placeholder: 'Hledat téma, popis, e-mail, telefon',
    canSort: false,
  },
  {
    key: 'id',
    header: 'ID',
    type: 'text',
    placeholder: 'Hledat podle ID',
    canSort: true,
  },
  {
    key: 'tema',
    header: 'Téma',
    type: 'text',
    placeholder: 'Hledat téma',
    canSort: true,
  },
  {
    key: 'contact_email',
    header: 'E-mail',
    type: 'email',
    placeholder: 'Hledat podle e-mailu',
    canSort: true,
  },
  {
    key: 'contact_phone',
    header: 'Telefon',
    type: 'text',
    placeholder: 'Hledat telefon',
    canSort: true,
  },
  {
    key: 'order_description',
    header: 'Popis objednávky',
    type: 'text',
    placeholder: 'Hledat v popisu objednávky',
    canSort: true,
  },
  {
    key: 'status',
    header: 'Stav',
    type: 'select',
    options: USER_REQUEST_STATUS_OPTIONS,
    placeholder: '-- Vybrat stav --',
    canSort: true,
  },
  {
    key: 'priority',
    header: 'Priorita',
    type: 'select',
    options: USER_REQUEST_PRIORITY_OPTIONS,
    placeholder: '-- Vybrat prioritu --',
    canSort: true,
  },
  {
    key: 'created_at',
    header: 'Datum vytvoření',
    type: 'text',
    placeholder: 'Hledat podle data vytvoření',
    canSort: true,
  },
  {
    key: 'updated_at',
    header: 'Datum aktualizace',
    type: 'text',
    placeholder: 'Hledat podle data aktualizace',
    canSort: true,
  },
];


@Component({
  selector: 'app-generic-filter-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './generic-filter-form.component.html',
  styleUrl: './generic-filter-form.component.css'
})
export class GenericFilterFormComponent implements OnChanges {

  @Input() filterColumns: FilterColumns[] = USER_REQUEST_FILTER_COLUMNS;
  @Input() filterFormTitle: string = 'Filtrovat data';

  @Input() initialFilters: any = {};
  @Input() initialSortBy: string = '';
  @Input() initialSortDirection: 'asc' | 'desc' = 'asc';

  @Output() filtersApplied = new EventEmitter<any>();
  @Output() filtersCleared = new EventEmitter<void>();

  public filterForm: any = {};
  public sortBy: string = '';
  public sortDirection: 'asc' | 'desc' = 'asc';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialFilters']) {
      this.filterForm = { ...this.initialFilters };
    }
    if (changes['initialSortBy']) {
      this.sortBy = this.initialSortBy;
    }
    if (changes['initialSortDirection']) {
      this.sortDirection = this.initialSortDirection;
    }
    this.setFilterFormValues();
  }

  private setFilterFormValues(): void {
    this.filterColumns.forEach(column => {
      this.filterForm[column.key] = this.initialFilters[column.key] || '';
    });
    this.sortBy = this.initialSortBy || '';
    this.sortDirection = this.initialSortDirection || 'asc';
  }

  applyFilters(): void {
    const filters = {
      ...this.filterForm,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection
    };
    this.filtersApplied.emit(filters);
  }

  clearFilters(): void {
    this.filterColumns.forEach(column => {
      this.filterForm[column.key] = '';
    });
    this.sortBy = '';
    this.sortDirection = 'asc';
    this.filtersCleared.emit();
  }
}
