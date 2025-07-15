// src/app/admin/pages/user-request/user-request.component.ts

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Důležité pro ngModel na inputech

import { GenericTableComponent } from '../../components/generic-table/generic-table.component';
import { BaseDataComponent } from '../../components/base-data/base-data.component';
import { DataHandler } from '../../../core/services/data-handler.service';
import { ColumnDefinition } from '../../../shared/interfaces/generic-form-column-definiton';
import { GenericTableService, PaginatedResponse, FilterParams } from '../../../core/services/generic-table.service'; // Import FilterParams
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
    FormsModule, // Důležité pro ngModel
    GenericTableComponent
  ],
  templateUrl: './user-request.component.html',
  styleUrl: './user-request.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserRequestComponent extends BaseDataComponent<RawRequestCommission> implements OnInit {
  override apiEndpoint: string = 'raw_request_commissions';

  currentPage: number = 1;
  itemsPerPage: number = 15;
  totalItems: number = 0;
  totalPages: number = 0;

  // Vlastnosti pro filtry
  filterSearch: string = '';
  filterStatus: string = ''; // Pro select box
  filterPriority: string = ''; // Pro select box
  filterEmail: string = ''; // Pro email input

  // Možnosti pro select boxy (pokud je máte pevně dané)
  statusOptions: string[] = ['Nově zadané', 'Zpracovává se', 'Dokončeno', 'Zrušeno'];
  priorityOptions: string[] = ['Nízká', 'Neutrální', 'Vysoká'];


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
        this.loadUserRequests();
      } else {
        this.router.navigate(['/auth/login']);
      }
    });
  }

  /**
   * Načte data požadavků uživatelů s aktuálními parametry stránkování a filtry.
   * Po načtení aktuální stránky přednačte sousední stránky.
   */
  loadUserRequests(): void {
    this.isLoading = true;
    this.errorMessage = null;

    // Sestavíme objekt filtrů
    const currentFilters: FilterParams = {
      search: this.filterSearch,
      status: this.filterStatus,
      priority: this.filterPriority,
      email: this.filterEmail
    };

    console.log(`Požaduji data pro stránku: ${this.currentPage}, položek na stránku: ${this.itemsPerPage}, filtry:`, currentFilters);

    this.genericTableService.getPaginatedData<RawRequestCommission>(
      this.apiEndpoint,
      this.currentPage,
      this.itemsPerPage,
      currentFilters // Předáváme filtry
    ).subscribe({
      next: (response: PaginatedResponse<RawRequestCommission>) => {
        this.data = response.data;
        this.totalItems = response.total;
        this.totalPages = response.last_page;
        this.currentPage = response.current_page;
        this.isLoading = false;
        this.cd.detectChanges(); // Vynutíme detekci změn pro aktualizaci UI

        console.log('Data načtena. Aktuální stránka:', this.currentPage);
        console.log('Celkem záznamů (total):', this.totalItems);
        console.log('Celkem stránek (last_page):', this.totalPages);
        console.log('Záznamů na stránce (per_page):', this.itemsPerPage);
        console.log('Počet záznamů v přijatém poli data:', this.data.length);
        console.log('Přijatá data:', this.data);


        // Po úspěšném načtení aktuální stránky přednačteme sousední stránky
        this.genericTableService.preloadAdjacentPages<RawRequestCommission>(
          this.apiEndpoint,
          this.currentPage,
          this.totalPages,
          this.itemsPerPage,
          2, // Přednačítáme 2 stránky před a 2 stránky po aktuální
          currentFilters // DŮLEŽITÉ: Předáváme filtry i pro preload
        );
      },
      error: (error) => {
        console.error('Chyba při načítání požadavků uživatelů:', error);
        this.errorMessage = 'Nepodařilo se načíst data požadavků.';
        this.isLoading = false;
        this.cd.detectChanges();
      }
    });
  }

  /**
   * Změní aktuální stránku a znovu načte data.
   * @param page - Nové číslo stránky.
   */
  goToPage(page: number): void {
    console.log(`Pokus o přechod na stránku: ${page}`);
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadUserRequests();
    } else {
      console.warn(`Neplatný požadavek na stránku: ${page}. Aktuální stránka: ${this.currentPage}, Celkem stránek: ${this.totalPages}`);
    }
  }

  /**
   * Změní počet položek na stránku a znovu načte data (vrátí se na první stránku).
   * @param event - Událost změny select boxu.
   */
  onItemsPerPageChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const newItemsPerPage = Number(selectElement.value);
    console.log(`Změna položek na stránku na: ${newItemsPerPage}`);
    if (newItemsPerPage !== this.itemsPerPage) {
      this.itemsPerPage = newItemsPerPage;
      this.currentPage = 1; // Vždy se vrátíme na první stránku při změně počtu položek
      this.loadUserRequests();
    }
  }

  /**
   * Aplikuje filtry a načte data od první stránky.
   * Volá se při změně jakéhokoli filtru.
   */
  applyFilters(): void {
    console.log('Aplikuji filtry:', {
      search: this.filterSearch,
      status: this.filterStatus,
      priority: this.filterPriority,
      email: this.filterEmail
    });
    this.currentPage = 1; // Při změně filtrů vždy začneme od první stránky
    this.loadUserRequests();
  }

  /**
   * Vyčistí všechny filtry a načte data od první stránky.
   */
  clearFilters(): void {
    console.log('Čistím filtry.');
    this.filterSearch = '';
    this.filterStatus = '';
    this.filterPriority = '';
    this.filterEmail = '';
    this.currentPage = 1; // Po vyčištění filtrů vždy začneme od první stránky
    this.loadUserRequests();
  }

  // Pomocná funkce pro generování pole stránek pro zobrazení v UI
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
}
