import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { GenericTableComponent, Buttons } from '../../components/generic-table/generic-table.component';
import { BaseDataComponent } from '../../components/base-data/base-data.component';
import { DataHandler } from '../../../core/services/data-handler.service';
// Důležitý import: Importuje se ColumnDefinition
import { ColumnDefinition } from '../../../shared/interfaces/generic-form-column-definiton';
import { GenericTableService, PaginatedResponse, FilterParams } from '../../../core/services/generic-table.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Router } from '@angular/router';

export interface RawRequestCommission {
  id?: number;
  thema: string;
  contact_email: string;
  contact_phone: string;
  order_description: string;
  status: string;
  priority: string;
  created_at?: string;
  last_changed_at?: string;
  deleted_at?: string | null;
  is_deleted?: boolean;
}

@Component({
  selector: 'app-user-request',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GenericTableComponent
  ],
  templateUrl: './user-request.component.html',
  styleUrl: './user-request.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserRequestComponent extends BaseDataComponent<RawRequestCommission> implements OnInit {

  buttons: Buttons[] = [
    {display_name: 'Detaily', isActive: true, type: 'info_button'},
    {display_name: 'Editovat', isActive: true, type: 'neutral_button'},
    {display_name: 'Nove button', isActive: false, type: 'neutral_button'},
    {display_name: 'Smazat', isActive: true, type: 'delete_button'},
  ];

  userRequestColumns: ColumnDefinition[] = [
    { key: 'id', header: 'ID', type: 'text' },
    { key: 'thema', header: 'Téma', type: 'text' },
    { key: 'contact_email', header: 'Email', type: 'text' },
    { key: 'contact_phone', header: 'Telefon', type: 'text' },
    { key: 'status', header: 'Stav', type: 'text' },
    { key: 'priority', header: 'Priorita', type: 'text' },
    { key: 'created_at', header: 'Vytvořeno', type: 'date', format: 'short' },
    { key: 'order_description', header: 'Popis objednávky', type: 'text' },
    { key: 'deleted_at', header: 'Smazáno', type: 'date', format: 'short' },
    { key: 'is_deleted', header: 'Smazané?', type: 'boolean' },
    { key: 'last_changed_at', header: 'Změněno', type: 'date', format: 'short' }
  ];

  showTrashTable: boolean = false;
  
  trashColumns: ColumnDefinition[] = [
    { key: 'id', header: 'ID', type: 'text' },
    { key: 'thema', header: 'Téma', type: 'text' },
    { key: 'deleted_at', header: 'Smazáno dne', type: 'date', format: 'medium' }
  ];

  override apiEndpoint: string = 'raw_request_commissions';

  currentPage: number = 1;
  itemsPerPage: number = 15;
  totalItems: number = 0;
  totalPages: number = 0;

  filterSearch: string = '';
  filterStatus: string = '';
  filterPriority: string = '';
  filterEmail: string = '';

  statusOptions: string[] = ['Nově zadané', 'Zpracovává se', 'Dokončeno', 'Zrušeno'];
  priorityOptions: string[] = ['Nízká', 'Neutrální', 'Vysoká'];

  constructor(
    protected override dataHandler: DataHandler,
    protected override cd: ChangeDetectorRef,
    private genericTableService: GenericTableService,
    private authService: AuthService,
    private router: Router
  ) {
    super(dataHandler, cd);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    console.log('UserRequestComponent inicializována. Data se načítají...');

    this.authService.isLoggedIn$.subscribe(loggedIn => {
      if (loggedIn) {
        // Inicializační načtení dat
        this.loadActiveRequests();
      } else {
        this.router.navigate(['/auth/login']);
      }
    });
  }

  /**
   * Načítá aktivní požadavky (is_deleted = false).
   */
  loadActiveRequests(): void {
    this.isLoading = true;
    this.errorMessage = null;

    const currentFilters: FilterParams = {
      search: this.filterSearch,
      status: this.filterStatus,
      priority: this.filterPriority,
      email: this.filterEmail,
      is_deleted: 'false'
    };

    console.log(`Požaduji aktivní data pro stránku: ${this.currentPage}, položek na stránku: ${this.itemsPerPage}, filtry:`, currentFilters);

    this.genericTableService.getPaginatedData<RawRequestCommission>(
      this.apiEndpoint,
      this.currentPage,
      this.itemsPerPage,
      currentFilters
    ).subscribe({
      next: (response: PaginatedResponse<RawRequestCommission>) => {
        this.data = response.data;
        this.totalItems = response.total;
        this.totalPages = response.last_page;
        this.currentPage = response.current_page;
        this.isLoading = false;
        this.cd.detectChanges();
        console.log('Aktivní data načtena.');
      },
      error: (error) => {
        console.error('Chyba při načítání aktivních požadavků uživatelů:', error);
        this.errorMessage = 'Nepodařilo se načíst aktivní data požadavků.';
        this.isLoading = false;
        this.cd.detectChanges();
      }
    });
  }

  /**
   * Načítá smazané požadavky (is_deleted = true).
   */
  loadDeletedRequests(): void {
    this.isLoading = true;
    this.errorMessage = null;

    const currentFilters: FilterParams = {
      is_deleted: 'true'
    };

    this.genericTableService.getPaginatedData<RawRequestCommission>(
      this.apiEndpoint,
      1,
      50,
      currentFilters
    ).subscribe({
      next: (response: PaginatedResponse<RawRequestCommission>) => {
        this.data = response.data;
        this.isLoading = false;
        this.cd.detectChanges();
        console.log('Smazaná data načtena.');
      },
      error: (error) => {
        console.error('Chyba při načítání smazaných požadavků uživatelů:', error);
        this.errorMessage = 'Nepodařilo se načíst smazaná data požadavků.';
        this.isLoading = false;
        this.cd.detectChanges();
      }
    });
  }

  toggleTable(): void {
    this.showTrashTable = !this.showTrashTable;
    this.currentPage = 1;
    this.itemsPerPage = 15;
    console.log('SHOW TRASH TABLE')
  }

  goToPage(page: number): void {
    console.log(`Pokus o přechod na stránku: ${page}`);
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadActiveRequests();
    } else {
      console.warn(`Neplatný požadavek na stránku: ${page}. Aktuální stránka: ${this.currentPage}, Celkem stránek: ${this.totalPages}`);
    }
  }

  onItemsPerPageChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const newItemsPerPage = Number(selectElement.value);
    console.log(`Změna položek na stránku na: ${newItemsPerPage}`);
    if (newItemsPerPage !== this.itemsPerPage) {
      this.itemsPerPage = newItemsPerPage;
      this.currentPage = 1;
      this.loadActiveRequests();
    }
  }

  applyFilters(): void {
    console.log('Aplikuji filtry.');
    this.currentPage = 1;
    this.loadActiveRequests();
  }

  clearFilters(): void {
    console.log('Čistím filtry.');
    this.filterSearch = '';
    this.filterStatus = '';
    this.filterPriority = '';
    this.filterEmail = '';
    this.currentPage = 1;
    this.loadActiveRequests();
  }

  get pagesArray(): number[] {
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  onRestore(item: RawRequestCommission): void {
    console.log(`Požadavek na obnovení položky:`, item);
  }

  onHardDelete(item: RawRequestCommission): void {
    console.log(`Požadavek na trvalé smazání položky:`, item);
  }
}