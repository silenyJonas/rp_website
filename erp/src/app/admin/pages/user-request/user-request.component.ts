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

  override apiEndpoint: string = 'raw_request_commissions';

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

  // Nové proměnné pro kešování stránek. Klíčem je číslo stránky, hodnotou pole dat
  private activeRequestsCache: Map<number, RawRequestCommission[]> = new Map();
  private trashRequestsCache: Map<number, RawRequestCommission[]> = new Map();
  // Ukládáme si aktuálně aplikované filtry pro keš, abychom poznali změnu
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
    console.log('UserRequestComponent inicializována. Data se načítají...');

    this.authService.isLoggedIn$.subscribe(loggedIn => {
      if (loggedIn) {
        // Načteme první stránku po přihlášení
        this.loadActiveRequests();
      } else {
        this.router.navigate(['/auth/login']);
      }
    });
  }

  // Načítá aktivní požadavky s kešováním a pre-fetchingem
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

    // Pokud se změnily filtry, vyčistíme keš
    if (JSON.stringify(currentFilters) !== JSON.stringify(this.currentActiveFilters)) {
      this.activeRequestsCache.clear();
      this.currentPage = 1;
      this.currentActiveFilters = currentFilters;
    }

    // Zkusíme načíst data z keše
    if (this.activeRequestsCache.has(this.currentPage)) {
      this.data = this.activeRequestsCache.get(this.currentPage)!;
      this.isLoading = false;
      this.cd.detectChanges();
      console.log('Aktivní data načtena z keše pro stránku', this.currentPage);
      // Pre-fetch další stránky
      this.preloadActivePage(this.currentPage + 1);
      return;
    }

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
        // Uložíme načtená data do keše
        this.activeRequestsCache.set(this.currentPage, response.data);
        this.cd.detectChanges();
        console.log('Aktivní data načtena z API a uložena do keše.');
        // Pre-fetch další stránky
        this.preloadActivePage(this.currentPage + 1);
      },
      error: (error) => {
        console.error('Chyba při načítání aktivních požadavků uživatelů:', error);
        this.errorMessage = 'Nepodařilo se načíst aktivní data požadavků.';
        this.isLoading = false;
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

    console.log(`Pre-fetch aktivních dat pro stránku: ${page}`);
    this.genericTableService.getPaginatedData<RawRequestCommission>(
      this.apiEndpoint,
      page,
      this.itemsPerPage,
      currentFilters
    ).subscribe({
      next: (response: PaginatedResponse<RawRequestCommission>) => {
        this.activeRequestsCache.set(page, response.data);
        console.log(`Pre-fetch pro stránku ${page} dokončen.`);
      },
      error: (error) => {
        console.error(`Chyba při pre-fetching aktivních dat pro stránku ${page}:`, error);
      }
    });
  }

  // Načítá smazané požadavky s kešováním a pre-fetchingem
  loadTrashRequests(): void {
    this.isLoading = true;
    this.errorMessage = null;

    const trashFilters: TrashFilterParams = {
      only_trashed: 'true',
      search: this.filterSearch,
      status: this.filterStatus,
      priority: this.filterPriority,
      email: this.filterEmail
    };

    // Pokud se změnily filtry, vyčistíme keš
    if (JSON.stringify(trashFilters) !== JSON.stringify(this.currentTrashFilters)) {
      this.trashRequestsCache.clear();
      this.trashCurrentPage = 1;
      this.currentTrashFilters = trashFilters;
    }

    // Zkusíme načíst data z keše
    if (this.trashRequestsCache.has(this.trashCurrentPage)) {
      this.trashData = this.trashRequestsCache.get(this.trashCurrentPage)!;
      this.isLoading = false;
      this.cd.detectChanges();
      console.log('Smazaná data načtena z keše pro stránku', this.trashCurrentPage);
      // Pre-fetch další stránky
      this.preloadTrashPage(this.trashCurrentPage + 1);
      return;
    }
    
    console.log(`Požaduji smazaná data pro stránku: ${this.trashCurrentPage}, položek na stránku: ${this.trashItemsPerPage}, filtry:`, trashFilters);

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
        this.isLoading = false;
        // Uložíme načtená data do keše
        this.trashRequestsCache.set(this.trashCurrentPage, response.data);
        this.cd.detectChanges();
        console.log('Smazaná data načtena z API a uložena do keše.');
        // Pre-fetch další stránky
        this.preloadTrashPage(this.trashCurrentPage + 1);
      },
      error: (error) => {
        console.error('Chyba při načítání smazaných požadavků uživatelů:', error);
        this.errorMessage = 'Nepodařilo se načíst smazaná data požadavků.';
        this.isLoading = false;
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

    console.log(`Pre-fetch smazaných dat pro stránku: ${page}`);
    this.genericTableService.getPaginatedData<RawRequestCommission>(
      this.apiEndpoint,
      page,
      this.trashItemsPerPage,
      trashFilters
    ).subscribe({
      next: (response: PaginatedResponse<RawRequestCommission>) => {
        this.trashRequestsCache.set(page, response.data);
        console.log(`Pre-fetch pro stránku ${page} dokončen.`);
      },
      error: (error) => {
        console.error(`Chyba při pre-fetching smazaných dat pro stránku ${page}:`, error);
      }
    });
  }

  // Přepíná mezi aktivní a smazanou tabulkou
  toggleTable(): void {
    this.showTrashTable = !this.showTrashTable;
    this.isLoading = true;
    this.errorMessage = null;

    if (this.showTrashTable) {
      this.loadTrashRequests();
    } else {
      this.loadActiveRequests();
    }
  }

  // Aplikuje filtry a načítá data z API. Vyčistí keš, aby se načetla nová data.
  applyFilters(): void {
    if (this.showTrashTable) {
      console.log('Aplikuji filtry na smazanou tabulku, čistím keš a volám API.');
      this.trashRequestsCache.clear();
      this.trashCurrentPage = 1;
      this.loadTrashRequests();
    } else {
      console.log('Aplikuji filtry na aktivní tabulku, čistím keš a volám API.');
      this.activeRequestsCache.clear();
      this.currentPage = 1;
      this.loadActiveRequests();
    }
  }

  // Čistí filtry a načítá data z API. Vyčistí keš.
  clearFilters(): void {
    console.log('Čistím filtry, čistím keš a volám API.');
    this.filterSearch = '';
    this.filterStatus = '';
    this.filterPriority = '';
    this.filterEmail = '';
    if (this.showTrashTable) {
      this.trashRequestsCache.clear();
      this.trashCurrentPage = 1;
      this.loadTrashRequests();
    } else {
      this.activeRequestsCache.clear();
      this.currentPage = 1;
      this.loadActiveRequests();
    }
  }

  // Přejde na danou stránku v aktivní tabulce
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadActiveRequests();
    }
  }

  // Přejde na danou stránku ve smazané tabulce
  goToTrashPage(page: number): void {
    if (page >= 1 && page <= this.trashTotalPages && page !== this.trashCurrentPage) {
      this.trashCurrentPage = page;
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
      // Změna počtu položek na stránku vyžaduje nové API volání, takže vyčistíme keš
      this.activeRequestsCache.clear();
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
      // Změna počtu položek na stránku vyžaduje nové API volání, takže vyčistíme keš
      this.trashRequestsCache.clear();
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

}
