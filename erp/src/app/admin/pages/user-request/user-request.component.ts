
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GenericTableComponent, Buttons } from '../../components/generic-table/generic-table.component';
import { BaseDataComponent } from '../../components/base-data/base-data.component';
import { DataHandler } from '../../../core/services/data-handler.service';
import { ColumnDefinition } from '../../../shared/interfaces/generic-form-column-definiton';
import { GenericTableService, PaginatedResponse, FilterParams } from '../../../core/services/generic-table.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Router } from '@angular/router';
import { GenericTrashTableComponent } from '../../components/generic-trash-table/generic-trash-table.component';
import { RawRequestCommission } from '../../../shared/interfaces/raw-request-commission';

// Rozšířený interface pro filtry smazaných dat
interface TrashFilterParams extends FilterParams {
  only_trashed?: string;
}

@Component({
  selector: 'app-user-request',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GenericTableComponent,
    GenericTrashTableComponent
  ],
  templateUrl: './user-request.component.html',
  styleUrl: './user-request.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserRequestComponent extends BaseDataComponent<RawRequestCommission> implements OnInit {

  buttons: Buttons[] = [
    { display_name: 'Detaily', isActive: true, type: 'info_button' },
    { display_name: 'Editovat', isActive: true, type: 'neutral_button' },
    { display_name: 'Nove button', isActive: false, type: 'neutral_button' },
    { display_name: 'Smazat', isActive: true, type: 'delete_button' },
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
    { key: 'last_changed_at', header: 'Změněno', type: 'date', format: 'short' }
  ];

  trashUserRequestColumns: ColumnDefinition[] = [
    { key: 'id', header: 'ID', type: 'text' },
    { key: 'thema', header: 'Téma', type: 'text' },
    { key: 'contact_email', header: 'Email', type: 'text' },
    { key: 'contact_phone', header: 'Telefon', type: 'text' },
    { key: 'status', header: 'Stav', type: 'text' },
    { key: 'priority', header: 'Priorita', type: 'text' },
    { key: 'created_at', header: 'Vytvořeno', type: 'date', format: 'short' },
    { key: 'order_description', header: 'Popis objednávky', type: 'text' },
    { key: 'deleted_at', header: 'Smazáno', type: 'date', format: 'short' },
    { key: 'last_changed_at', header: 'Změněno', type: 'date', format: 'short' }
  ];

  showTrashTable: boolean = false;
  override trashData: RawRequestCommission[] = [];
  override apiEndpoint: string = 'raw_request_commissions';

  // 🆕 Lokální stav pro načítání dat
  isDataLoading: boolean = false;
  isTrashDataLoading: boolean = false;

  // Proměnné pro stránkování aktivních dat
  currentPage: number = 1;
  itemsPerPage: number = 15;
  totalItems: number = 0;
  totalPages: number = 0;

  // Proměnné pro stránkování smazaných dat
  trashCurrentPage: number = 1;
  trashItemsPerPage: number = 15;
  trashTotalItems: number = 0;
  trashTotalPages: number = 0;

  // Proměnné pro filtry
  filterSearch: string = '';
  filterStatus: string = '';
  filterPriority: string = '';
  filterEmail: string = '';

  statusOptions: string[] = ['Nově zadané', 'Zpracovává se', 'Dokončeno', 'Zrušeno'];
  priorityOptions: string[] = ['Nízká', 'Neutrální', 'Vysoká'];

  // Kešování stránek
  private activeRequestsCache: Map<number, RawRequestCommission[]> = new Map();
  private trashRequestsCache: Map<number, RawRequestCommission[]> = new Map();
  private currentActiveFilters: FilterParams = {};
  private currentTrashFilters: FilterParams = {};

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
    this.authService.isLoggedIn$.subscribe(loggedIn => {
      if (loggedIn) {
        // Načteme první stránku po přihlášení
        this.loadActiveRequests();
        if (this.showTrashTable) {
          this.loadTrashRequests();
        }
      } else {
        this.router.navigate(['/auth/login']);
      }
    });
  }

  // Načítá aktivní požadavky s kešováním a pre-fetchingem
  loadActiveRequests(): void {
    this.isDataLoading = true;
    this.errorMessage = null;

    const currentFilters: FilterParams = {
      search: this.filterSearch,
      status: this.filterStatus,
      priority: this.filterPriority,
      email: this.filterEmail,
      is_deleted: 'false'
    };

    if (JSON.stringify(currentFilters) !== JSON.stringify(this.currentActiveFilters)) {
      this.activeRequestsCache.clear();
      this.currentPage = 1;
      this.currentActiveFilters = currentFilters;
    }

    if (this.activeRequestsCache.has(this.currentPage)) {
      this.data = this.activeRequestsCache.get(this.currentPage)!;
      this.isDataLoading = false;
      this.cd.detectChanges();
      this.preloadActivePage(this.currentPage + 1);
      return;
    }

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
        this.isDataLoading = false;
        this.activeRequestsCache.set(this.currentPage, response.data);
        this.cd.detectChanges();
        this.preloadActivePage(this.currentPage + 1);
      },
      error: (error) => {
        console.error('Chyba při načítání aktivních požadavků uživatelů:', error);
        this.errorMessage = 'Nepodařilo se načíst aktivní data požadavků.';
        this.isDataLoading = false;
        this.cd.detectChanges();
      }
    });
  }

  // Pomocná metoda pro pre-fetching (načtení do keše bez změny UI)
  private preloadActivePage(page: number): void {
    if (page > this.totalPages || this.activeRequestsCache.has(page)) {
      return;
    }

    const currentFilters: FilterParams = {
      search: this.filterSearch,
      status: this.filterStatus,
      priority: this.filterPriority,
      email: this.filterEmail,
      is_deleted: 'false'
    };

    this.genericTableService.getPaginatedData<RawRequestCommission>(
      this.apiEndpoint,
      page,
      this.itemsPerPage,
      currentFilters
    ).subscribe({
      next: (response: PaginatedResponse<RawRequestCommission>) => {
        this.activeRequestsCache.set(page, response.data);
      },
      error: (error) => {
        console.error(`Chyba při pre-fetching aktivních dat pro stránku ${page}:`, error);
      }
    });
  }

  // Načítá smazané požadavky s kešováním a pre-fetchingem
  loadTrashRequests(): void {
    this.isTrashDataLoading = true;
    this.errorMessage = null;

    const trashFilters: TrashFilterParams = {
      only_trashed: 'true',
      search: this.filterSearch,
      status: this.filterStatus,
      priority: this.filterPriority,
      email: this.filterEmail
    };

    if (JSON.stringify(trashFilters) !== JSON.stringify(this.currentTrashFilters)) {
      this.trashRequestsCache.clear();
      this.trashCurrentPage = 1;
      this.currentTrashFilters = trashFilters;
    }

    if (this.trashRequestsCache.has(this.trashCurrentPage)) {
      this.trashData = this.trashRequestsCache.get(this.trashCurrentPage)!;
      this.isTrashDataLoading = false;
      this.cd.detectChanges();
      this.preloadTrashPage(this.trashCurrentPage + 1);
      return;
    }

    this.genericTableService.getPaginatedData<RawRequestCommission>(
      this.apiEndpoint,
      this.trashCurrentPage,
      this.trashItemsPerPage,
      trashFilters
    ).subscribe({
      next: (response: PaginatedResponse<RawRequestCommission>) => {
        this.trashData = response.data;
        this.trashTotalItems = response.total;
        this.trashTotalPages = response.last_page;
        this.trashCurrentPage = response.current_page;
        this.isTrashDataLoading = false;
        this.trashRequestsCache.set(this.trashCurrentPage, response.data);
        this.cd.detectChanges();
        this.preloadTrashPage(this.trashCurrentPage + 1);
      },
      error: (error) => {
        console.error('Chyba při načítání smazaných požadavků uživatelů:', error);
        this.errorMessage = 'Nepodařilo se načíst smazaná data požadavků.';
        this.isTrashDataLoading = false;
        this.cd.detectChanges();
      }
    });
  }

  // Pomocná metoda pro pre-fetching (načtení do keše bez změny UI)
  private preloadTrashPage(page: number): void {
    if (page > this.trashTotalPages || this.trashRequestsCache.has(page)) {
      return;
    }

    const trashFilters: TrashFilterParams = {
      only_trashed: 'true',
      search: this.filterSearch,
      status: this.filterStatus,
      priority: this.filterPriority,
      email: this.filterEmail
    };

    this.genericTableService.getPaginatedData<RawRequestCommission>(
      this.apiEndpoint,
      page,
      this.trashItemsPerPage,
      trashFilters
    ).subscribe({
      next: (response: PaginatedResponse<RawRequestCommission>) => {
        this.trashRequestsCache.set(page, response.data);
      },
      error: (error) => {
        console.error(`Chyba při pre-fetching smazaných dat pro stránku ${page}:`, error);
      }
    });
  }

  // Přepíná mezi aktivní a smazanou tabulkou
  toggleTable(): void {
    this.showTrashTable = !this.showTrashTable;
    // Nastavíme načítání jen pro tu tabulku, která se zobrazuje
    if (this.showTrashTable) {
      this.isTrashDataLoading = true;
      this.isDataLoading = false;
      this.loadTrashRequests();
    } else {
      this.isDataLoading = true;
      this.isTrashDataLoading = false;
      this.loadActiveRequests();
    }
  }

  // Aplikuje filtry a načítá data z API. Vyčistí keš, aby se načetla nová data.
  applyFilters(): void {
    if (this.showTrashTable) {
      this.trashRequestsCache.clear();
      this.trashCurrentPage = 1;
      this.isTrashDataLoading = true;
      this.loadTrashRequests();
    } else {
      this.activeRequestsCache.clear();
      this.currentPage = 1;
      this.isDataLoading = true;
      this.loadActiveRequests();
    }
  }

  // Čistí filtry a načítá data z API. Vyčistí keš.
  clearFilters(): void {
    this.filterSearch = '';
    this.filterStatus = '';
    this.filterPriority = '';
    this.filterEmail = '';
    if (this.showTrashTable) {
      this.trashRequestsCache.clear();
      this.trashCurrentPage = 1;
      this.isTrashDataLoading = true;
      this.loadTrashRequests();
    } else {
      this.activeRequestsCache.clear();
      this.currentPage = 1;
      this.isDataLoading = true;
      this.loadActiveRequests();
    }
  }

  // Přejde na danou stránku v aktivní tabulce
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.isDataLoading = true; // Spustíme načítání pro tuto tabulku
      this.loadActiveRequests();
    }
  }

  // Přejde na danou stránku ve smazané tabulce
  goToTrashPage(page: number): void {
    if (page >= 1 && page <= this.trashTotalPages && page !== this.trashCurrentPage) {
      this.trashCurrentPage = page;
      this.isTrashDataLoading = true; // Spustíme načítání pro tuto tabulku
      this.loadTrashRequests();
    }
  }

  // Změní počet položek na stránku pro aktivní tabulku
  onItemsPerPageChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const newItemsPerPage = Number(selectElement.value);
    if (newItemsPerPage !== this.itemsPerPage) {
      this.itemsPerPage = newItemsPerPage;
      this.currentPage = 1;
      this.activeRequestsCache.clear();
      this.isDataLoading = true;
      this.loadActiveRequests();
    }
  }

  // Změní počet položek na stránku pro smazanou tabulku
  onTrashItemsPerPageChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const newItemsPerPage = Number(selectElement.value);
    if (newItemsPerPage !== this.trashItemsPerPage) {
      this.trashItemsPerPage = newItemsPerPage;
      this.trashCurrentPage = 1;
      this.trashRequestsCache.clear();
      this.isTrashDataLoading = true;
      this.loadTrashRequests();
    }
  }

  // Generuje pole stránek pro aktivní tabulku
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

  // Generuje pole stránek pro smazanou tabulku
  get trashPagesArray(): number[] {
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.trashCurrentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.trashTotalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Metoda pro zachycení události obnovy dat.
  handleItemRestored(): void {
    // Spustíme načítání pro obě tabulky na pozadí
    this.isDataLoading = true;
    this.isTrashDataLoading = true;
    this.activeRequestsCache.clear();
    this.trashRequestsCache.clear();
    this.loadActiveRequests();
    this.loadTrashRequests();
  }

  // Metoda pro zachycení události smazání dat.
  handleItemDeleted(): void {
    // Spustíme načítání pro obě tabulky na pozadí
    this.isDataLoading = true;
    this.isTrashDataLoading = true;
    this.activeRequestsCache.clear();
    this.trashRequestsCache.clear();
    this.loadActiveRequests();
    this.loadTrashRequests();
  }
}
