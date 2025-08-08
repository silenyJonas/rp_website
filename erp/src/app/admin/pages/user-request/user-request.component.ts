
// import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
// import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { GenericTableComponent, Buttons } from '../../components/generic-table/generic-table.component';
// import { BaseDataComponent } from '../../components/base-data/base-data.component';
// import { DataHandler } from '../../../core/services/data-handler.service';
// import { ColumnDefinition } from '../../../shared/interfaces/generic-form-column-definiton';
// import { GenericTableService, PaginatedResponse, FilterParams } from '../../../core/services/generic-table.service';
// import { AuthService } from '../../../core/auth/auth.service';
// import { Router } from '@angular/router';
// import { GenericTrashTableComponent } from '../../components/generic-trash-table/generic-trash-table.component';
// import { RawRequestCommission } from '../../../shared/interfaces/raw-request-commission';
// import { GenericFormComponent } from '../../components/generic-form/generic-form.component';
// import { InputDefinition } from '../../components/generic-form/generic-form.component';

// // Rozšířený interface pro filtry smazaných dat
// interface TrashFilterParams extends FilterParams {
//   only_trashed?: string;
// }

// @Component({
//   selector: 'app-user-request',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     GenericTableComponent,
//     GenericTrashTableComponent,
//     GenericFormComponent,
//   ],
//   templateUrl: './user-request.component.html',
//   styleUrl: './user-request.component.css',
//   changeDetection: ChangeDetectionStrategy.OnPush
// })
// export class UserRequestComponent extends BaseDataComponent<RawRequestCommission> implements OnInit {

//   buttons: Buttons[] = [
//     { display_name: 'Detaily', isActive: true, type: 'info_button' },
//     { display_name: 'Editovat', isActive: true, type: 'neutral_button' },
//     { display_name: 'Nove button', isActive: false, type: 'neutral_button' },
//     { display_name: 'Smazat', isActive: true, type: 'delete_button' },
//   ];

//   // Pole pro definici polí dynamického formuláře (upraveno dle InputDefinition)
//   formFields: InputDefinition[] = [
//     {
//       column_name: 'thema',
//       label: 'Téma',
//       placeholder: 'Zadejte téma požadavku',
//       type: 'text',
//       required: true,
//       pattern: '^[a-zA-Z0-9ěščřžýáíéóúůďťňĚŠČŘŽÝÁÍÉÚŮĎŤŇ\\s]{3,100}$',
//       errorMessage: 'Téma musí mít 3-100 znaků.',
//     },
//     {
//       column_name: 'contact_email',
//       label: 'Kontaktní e-mail',
//       placeholder: 'Zadejte e-mail',
//       type: 'email',
//       required: true,
//       pattern: '[^@]+@[^@]+\.[^@]+',
//       errorMessage: 'Zadejte platnou e-mailovou adresu.',
//     },
//     {
//       column_name: 'contact_phone',
//       label: 'Telefon',
//       placeholder: 'Zadejte telefonní číslo (volitelné)',
//       type: 'tel',
//       required: false,
//       pattern: '^[0-9+\\s-]{9,20}$',
//       errorMessage: 'Zadejte platné telefonní číslo.',
//     },
//     {
//       column_name: 'order_description',
//       label: 'Popis objednávky',
//       placeholder: 'Popište svůj požadavek',
//       type: 'textarea',
//       required: true,
//       errorMessage: 'Popis je povinný.',
//     }
//   ];

//   userRequestColumns: ColumnDefinition[] = [
//     { key: 'id', header: 'ID', type: 'text' },
//     { key: 'thema', header: 'Téma', type: 'text' },
//     { key: 'contact_email', header: 'Email', type: 'text' },
//     { key: 'contact_phone', header: 'Telefon', type: 'text' },
//     { key: 'status', header: 'Stav', type: 'text' },
//     { key: 'priority', header: 'Priorita', type: 'text' },
//     { key: 'created_at', header: 'Vytvořeno', type: 'date', format: 'short' },
//     { key: 'order_description', header: 'Popis objednávky', type: 'text' },
//     { key: 'last_changed_at', header: 'Změněno', type: 'date', format: 'short' }
//   ];

//   trashUserRequestColumns: ColumnDefinition[] = [
//     { key: 'id', header: 'ID', type: 'text' },
//     { key: 'thema', header: 'Téma', type: 'text' },
//     { key: 'contact_email', header: 'Email', type: 'text' },
//     { key: 'contact_phone', header: 'Telefon', type: 'text' },
//     { key: 'status', header: 'Stav', type: 'text' },
//     { key: 'priority', header: 'Priorita', type: 'text' },
//     { key: 'created_at', header: 'Vytvořeno', type: 'date', format: 'short' },
//     { key: 'order_description', header: 'Popis objednávky', type: 'text' },
//     { key: 'deleted_at', header: 'Smazáno', type: 'date', format: 'short' },
//     { key: 'last_changed_at', header: 'Změněno', type: 'date', format: 'short' }
//   ];

//   showTrashTable: boolean = false;
//   showCreateForm: boolean = false;
//   
//   override trashData: RawRequestCommission[] = [];
//   override apiEndpoint: string = 'raw_request_commissions';

//   // 🆕 Lokální stav pro načítání dat
//   isDataLoading: boolean = false;
//   isTrashDataLoading: boolean = false;

//   // Proměnné pro stránkování aktivních dat
//   currentPage: number = 1;
//   itemsPerPage: number = 15;
//   totalItems: number = 0;
//   totalPages: number = 0;

//   // Proměnné pro stránkování smazaných dat
//   trashCurrentPage: number = 1;
//   trashItemsPerPage: number = 15;
//   trashTotalItems: number = 0;
//   trashTotalPages: number = 0;

//   // Proměnné pro filtry
//   filterSearch: string = '';
//   filterStatus: string = '';
//   filterPriority: string = '';
//   filterEmail: string = '';

//   statusOptions: string[] = ['Nově zadané', 'Zpracovává se', 'Dokončeno', 'Zrušeno'];
//   priorityOptions: string[] = ['Nízká', 'Neutrální', 'Vysoká'];

//   // Kešování stránek
//   private activeRequestsCache: Map<number, RawRequestCommission[]> = new Map();
//   private trashRequestsCache: Map<number, RawRequestCommission[]> = new Map();
//   private currentActiveFilters: FilterParams = {};
//   private currentTrashFilters: FilterParams = {};

//   constructor(
//     protected override dataHandler: DataHandler,
//     protected override cd: ChangeDetectorRef,
//     private genericTableService: GenericTableService,
//     private authService: AuthService,
//     private router: Router
//   ) {
//     super(dataHandler, cd);
//   }

//   override ngOnInit(): void {
//     super.ngOnInit();
//     this.authService.isLoggedIn$.subscribe(loggedIn => {
//       if (loggedIn) {
//         this.loadActiveRequests();
//         if (this.showTrashTable) {
//           this.loadTrashRequests();
//         }
//       } else {
//         this.router.navigate(['/auth/login']);
//       }
//     });
//   }

//   // Načítá aktivní požadavky s kešováním a pre-fetchingem
//   loadActiveRequests(): void {
//     console.log('user-request: Spouštím načítání aktivních požadavků. isLoading je true.');
//     this.isDataLoading = true;
//     this.errorMessage = null;

//     const currentFilters: FilterParams = {
//       search: this.filterSearch,
//       status: this.filterStatus,
//       priority: this.filterPriority,
//       email: this.filterEmail,
//       is_deleted: 'false'
//     };

//     if (JSON.stringify(currentFilters) !== JSON.stringify(this.currentActiveFilters)) {
//       this.activeRequestsCache.clear();
//       this.currentPage = 1;
//       this.currentActiveFilters = currentFilters;
//     }

//     if (this.activeRequestsCache.has(this.currentPage)) {
//       console.log('user-request: Data pro aktivní požadavky načtena z keše. isLoading je false.');
//       this.data = this.activeRequestsCache.get(this.currentPage)!;
//       this.isDataLoading = false;
//       this.cd.detectChanges();
//       this.preloadActivePage(this.currentPage + 1);
//       return;
//     }

//     this.genericTableService.getPaginatedData<RawRequestCommission>(
//       this.apiEndpoint,
//       this.currentPage,
//       this.itemsPerPage,
//       currentFilters
//     ).subscribe({
//       next: (response: PaginatedResponse<RawRequestCommission>) => {
//         console.log('user-request: Načtení aktivních požadavků z API bylo úspěšné. isLoading je false.');
//         this.data = response.data;
//         this.totalItems = response.total;
//         this.totalPages = response.last_page;
//         this.currentPage = response.current_page;
//         this.isDataLoading = false;
//         this.activeRequestsCache.set(this.currentPage, response.data);
//         this.cd.detectChanges();
//         this.preloadActivePage(this.currentPage + 1);
//       },
//       error: (error) => {
//         console.error('user-request: Chyba při načítání aktivních požadavků uživatelů:', error);
//         this.errorMessage = 'Nepodařilo se načíst aktivní data požadavků.';
//         console.log('user-request: Načítání aktivních požadavků selhalo. isLoading je false.');
//         this.isDataLoading = false;
//         this.cd.detectChanges();
//       }
//     });
//   }

//   // Pomocná metoda pro pre-fetching (načtení do keše bez změny UI)
//   private preloadActivePage(page: number): void {
//     if (page > this.totalPages || this.activeRequestsCache.has(page)) {
//       return;
//     }

//     const currentFilters: FilterParams = {
//       search: this.filterSearch,
//       status: this.filterStatus,
//       priority: this.filterPriority,
//       email: this.filterEmail,
//       is_deleted: 'false'
//     };

//     this.genericTableService.getPaginatedData<RawRequestCommission>(
//       this.apiEndpoint,
//       page,
//       this.itemsPerPage,
//       currentFilters
//     ).subscribe({
//       next: (response: PaginatedResponse<RawRequestCommission>) => {
//         this.activeRequestsCache.set(page, response.data);
//       },
//       error: (error) => {
//         console.error(`user-request: Chyba při pre-fetching aktivních dat pro stránku ${page}:`, error);
//       }
//     });
//   }

//   // Načítá smazané požadavky s kešováním a pre-fetchingem
//   loadTrashRequests(): void {
//     console.log('user-request: Spouštím načítání smazaných požadavků. isTrashDataLoading je true.');
//     this.isTrashDataLoading = true;
//     this.errorMessage = null;

//     const trashFilters: TrashFilterParams = {
//       only_trashed: 'true',
//       search: this.filterSearch,
//       status: this.filterStatus,
//       priority: this.filterPriority,
//       email: this.filterEmail
//     };

//     if (JSON.stringify(trashFilters) !== JSON.stringify(this.currentTrashFilters)) {
//       this.trashRequestsCache.clear();
//       this.trashCurrentPage = 1;
//       this.currentTrashFilters = trashFilters;
//     }

//     if (this.trashRequestsCache.has(this.trashCurrentPage)) {
//       console.log('user-request: Data pro smazané požadavky načtena z keše. isTrashDataLoading je false.');
//       this.trashData = this.trashRequestsCache.get(this.trashCurrentPage)!;
//       this.isTrashDataLoading = false;
//       this.cd.detectChanges();
//       this.preloadTrashPage(this.trashCurrentPage + 1);
//       return;
//     }

//     this.genericTableService.getPaginatedData<RawRequestCommission>(
//       this.apiEndpoint,
//       this.trashCurrentPage,
//       this.trashItemsPerPage,
//       trashFilters
//     ).subscribe({
//       next: (response: PaginatedResponse<RawRequestCommission>) => {
//         console.log('user-request: Načtení smazaných požadavků z API bylo úspěšné. isTrashDataLoading je false.');
//         this.trashData = response.data;
//         this.trashTotalItems = response.total;
//         this.trashTotalPages = response.last_page;
//         this.trashCurrentPage = response.current_page;
//         this.isTrashDataLoading = false;
//         this.trashRequestsCache.set(this.trashCurrentPage, response.data);
//         this.cd.detectChanges();
//         this.preloadTrashPage(this.trashCurrentPage + 1);
//       },
//       error: (error) => {
//         console.error('user-request: Chyba při načítání smazaných požadavků uživatelů:', error);
//         this.errorMessage = 'Nepodařilo se načíst smazaná data požadavků.';
//         console.log('user-request: Načítání smazaných požadavků selhalo. isTrashDataLoading je false.');
//         this.isTrashDataLoading = false;
//         this.cd.detectChanges();
//       }
//     });
//   }

//   // Pomocná metoda pro pre-fetching (načtení do keše bez změny UI)
//   private preloadTrashPage(page: number): void {
//     if (page > this.trashTotalPages || this.trashRequestsCache.has(page)) {
//       return;
//     }

//     const trashFilters: TrashFilterParams = {
//       only_trashed: 'true',
//       search: this.filterSearch,
//       status: this.filterStatus,
//       priority: this.filterPriority,
//       email: this.filterEmail
//     };

//     this.genericTableService.getPaginatedData<RawRequestCommission>(
//       this.apiEndpoint,
//       page,
//       this.trashItemsPerPage,
//       trashFilters
//     ).subscribe({
//       next: (response: PaginatedResponse<RawRequestCommission>) => {
//         this.trashRequestsCache.set(page, response.data);
//       },
//       error: (error) => {
//         console.error(`user-request: Chyba při pre-fetching smazaných dat pro stránku ${page}:`, error);
//       }
//     });
//   }

//   // Přepíná mezi aktivní a smazanou tabulkou
//   toggleTable(): void {
//     this.showTrashTable = !this.showTrashTable;
//     if (this.showTrashTable) {
//       console.log('user-request: Přepnuto na smazanou tabulku. isTrashDataLoading je true.');
//       this.isTrashDataLoading = true;
//       this.isDataLoading = false;
//       this.loadTrashRequests();
//     } else {
//       console.log('user-request: Přepnuto na aktivní tabulku. isDataLoading je true.');
//       this.isDataLoading = true;
//       this.isTrashDataLoading = false;
//       this.loadActiveRequests();
//     }
//   }

//   // Aplikuje filtry a načítá data z API. Vyčistí keš, aby se načetla nová data.
//   applyFilters(): void {
//     if (this.showTrashTable) {
//       this.trashRequestsCache.clear();
//       this.trashCurrentPage = 1;
//       console.log('user-request: Aplikuji filtry na smazanou tabulku. isTrashDataLoading je true.');
//       this.isTrashDataLoading = true;
//       this.loadTrashRequests();
//     } else {
//       this.activeRequestsCache.clear();
//       this.currentPage = 1;
//       console.log('user-request: Aplikuji filtry na aktivní tabulku. isDataLoading je true.');
//       this.isDataLoading = true;
//       this.loadActiveRequests();
//     }
//   }

//   // Čistí filtry a načítá data z API. Vyčistí keš.
//   clearFilters(): void {
//     this.filterSearch = '';
//     this.filterStatus = '';
//     this.filterPriority = '';
//     this.filterEmail = '';
//     if (this.showTrashTable) {
//       this.trashRequestsCache.clear();
//       this.trashCurrentPage = 1;
//       console.log('user-request: Čistím filtry na smazané tabulce. isTrashDataLoading je true.');
//       this.isTrashDataLoading = true;
//       this.loadTrashRequests();
//     } else {
//       this.activeRequestsCache.clear();
//       this.currentPage = 1;
//       console.log('user-request: Čistím filtry na aktivní tabulce. isDataLoading je true.');
//       this.isDataLoading = true;
//       this.loadActiveRequests();
//     }
//   }

//   // Přejde na danou stránku v aktivní tabulce
//   goToPage(page: number): void {
//     if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
//       this.currentPage = page;
//       console.log(`user-request: Přejdu na aktivní stránku ${page}. isDataLoading je true.`);
//       this.isDataLoading = true;
//       this.loadActiveRequests();
//     }
//   }

//   // Přejde na danou stránku ve smazané tabulce
//   goToTrashPage(page: number): void {
//     if (page >= 1 && page <= this.trashTotalPages && page !== this.trashCurrentPage) {
//       this.trashCurrentPage = page;
//       console.log(`user-request: Přejdu na smazanou stránku ${page}. isTrashDataLoading je true.`);
//       this.isTrashDataLoading = true;
//       this.loadTrashRequests();
//     }
//   }

//   // Změní počet položek na stránku pro aktivní tabulku
//   onItemsPerPageChange(event: Event): void {
//     const selectElement = event.target as HTMLSelectElement;
//     const newItemsPerPage = Number(selectElement.value);
//     if (newItemsPerPage !== this.itemsPerPage) {
//       this.itemsPerPage = newItemsPerPage;
//       this.currentPage = 1;
//       this.activeRequestsCache.clear();
//       console.log('user-request: Změna položek na stránku. isDataLoading je true.');
//       this.isDataLoading = true;
//       this.loadActiveRequests();
//     }
//   }

//   // Změní počet položek na stránku pro smazanou tabulku
//   onTrashItemsPerPageChange(event: Event): void {
//     const selectElement = event.target as HTMLSelectElement;
//     const newItemsPerPage = Number(selectElement.value);
//     if (newItemsPerPage !== this.trashItemsPerPage) {
//       this.trashItemsPerPage = newItemsPerPage;
//       this.trashCurrentPage = 1;
//       this.trashRequestsCache.clear();
//       console.log('user-request: Změna položek na stránku pro smazanou tabulku. isTrashDataLoading je true.');
//       this.isTrashDataLoading = true;
//       this.loadTrashRequests();
//     }
//   }

//   // Generuje pole stránek pro aktivní tabulku
//   get pagesArray(): number[] {
//     const maxPagesToShow = 5;
//     let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
//     let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);
//     if (endPage - startPage + 1 < maxPagesToShow) {
//       startPage = Math.max(1, endPage - maxPagesToShow + 1);
//     }
//     const pages = [];
//     for (let i = startPage; i <= endPage; i++) {
//       pages.push(i);
//     }
//     return pages;
//   }

//   // Generuje pole stránek pro smazanou tabulku
//   get trashPagesArray(): number[] {
//     const maxPagesToShow = 5;
//     let startPage = Math.max(1, this.trashCurrentPage - Math.floor(maxPagesToShow / 2));
//     let endPage = Math.min(this.trashTotalPages, startPage + maxPagesToShow - 1);
//     if (endPage - startPage + 1 < maxPagesToShow) {
//       startPage = Math.max(1, endPage - maxPagesToShow + 1);
//     }
//     const pages = [];
//     for (let i = startPage; i <= endPage; i++) {
//       pages.push(i);
//     }
//     return pages;
//   }

//   // Metoda pro zachycení události obnovy dat.
//   handleItemRestored(): void {
//     console.log('user-request: Událost obnovení dat zachycena. isDataLoading a isTrashDataLoading jsou true.');
//     this.isDataLoading = true;
//     this.isTrashDataLoading = true;
//     this.activeRequestsCache.clear();
//     this.trashRequestsCache.clear();
//     this.loadActiveRequests();
//     this.loadTrashRequests();
//   }

//   // Metoda pro zachycení události smazání dat.
//   handleItemDeleted(): void {
//     console.log('user-request: Událost smazání dat zachycena. isDataLoading a isTrashDataLoading jsou true.');
//     this.isDataLoading = true;
//     this.isTrashDataLoading = true;
//     this.activeRequestsCache.clear();
//     this.trashRequestsCache.clear();
//     this.loadActiveRequests();
//     this.loadTrashRequests();
//   }

//   // Metoda pro vytvoření záznamu
//   handleCreateFormOpened(): void {
//     console.log('user-request: Otevření formuláře pro vytvoření záznamu.');
//     this.showCreateForm = !this.showCreateForm;
//   }


//   handleFormSubmitted(formData: RawRequestCommission): void {
//     if (formData.id) {
//       console.log('user-request: Spouštím aktualizaci dat. isDataLoading je true.');
//       this.updateData(formData.id, formData).subscribe({
//         next: (response) => {
//           console.log('user-request: Aktualizace dat proběhla úspěšně. isDataLoading je false.');
//           this.showCreateForm = false;
//           this.activeRequestsCache.clear();
//           this.currentPage = 1;
//           console.log('user-request: Spouštím nové načítání dat po aktualizaci. isDataLoading je true.');
//           this.loadActiveRequests();
//         },
//         error: (err) => {
//           console.error('user-request: Chyba při aktualizaci dat:', err);
//           console.log('user-request: Aktualizace dat selhala. isDataLoading je false.');
//         }
//       });
//     } else {
//       console.log('user-request: Spouštím vytvoření nového záznamu. isDataLoading je true.');
//       this.postData(formData).subscribe({
//         next: (response) => {
//           console.log('user-request: Vytvoření nového záznamu proběhlo úspěšně. isDataLoading je false.');
//           this.showCreateForm = false;
//           this.activeRequestsCache.clear();
//           this.currentPage = 1;
//           console.log('user-request: Spouštím nové načítání dat po vytvoření. isDataLoading je true.');
//           this.loadActiveRequests();
//         },
//         error: (err) => {
//           console.error('user-request: Chyba při odeslání dat:', err);
//           console.log('user-request: Vytvoření nového záznamu selhalo. isDataLoading je false.');
//         }
//       });
//     }
//   }

//   onCancelForm() {
//     console.log('user-request: Formulář pro vytvoření záznamu byl zrušen.');
//     this.showCreateForm = false;
//   }
// }
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
import { GenericFormComponent } from '../../components/generic-form/generic-form.component';
import { InputDefinition } from '../../components/generic-form/generic-form.component';

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
    GenericTrashTableComponent,
    GenericFormComponent,
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

  // Pole pro definici polí dynamického formuláře (upraveno dle InputDefinition)
  formFields: InputDefinition[] = [
    {
      column_name: 'thema',
      label: 'Téma',
      placeholder: 'Zadejte téma požadavku',
      type: 'text',
      required: true,
      pattern: '^[a-zA-Z0-9ěščřžýáíéóúůďťňĚŠČŘŽÝÁÍÉÚŮĎŤŇ\\s]{3,100}$',
      errorMessage: 'Téma musí mít 3-100 znaků.',
    },
    {
      column_name: 'contact_email',
      label: 'Kontaktní e-mail',
      placeholder: 'Zadejte e-mail',
      type: 'email',
      required: true,
      pattern: '[^@]+@[^@]+\.[^@]+',
      errorMessage: 'Zadejte platnou e-mailovou adresu.',
    },
    {
      column_name: 'contact_phone',
      label: 'Telefon',
      placeholder: 'Zadejte telefonní číslo (volitelné)',
      type: 'tel',
      required: false,
      pattern: '^[0-9+\\s-]{9,20}$',
      errorMessage: 'Zadejte platné telefonní číslo.',
    },
    {
      column_name: 'order_description',
      label: 'Popis objednávky',
      placeholder: 'Popište svůj požadavek',
      type: 'textarea',
      required: true,
      errorMessage: 'Popis je povinný.',
    }
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
  showCreateForm: boolean = false;
  
  override trashData: RawRequestCommission[] = [];
  override apiEndpoint: string = 'raw_request_commissions';

  // 🆕 Zjednodušená správa stavu načítání
  override isLoading: boolean = false;
  isTrashTableLoading: boolean = false;

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
        this.loadActiveRequests();
      } else {
        this.router.navigate(['/auth/login']);
      }
    });
  }

  // Načítá aktivní požadavky s kešováním a pre-fetchingem
  loadActiveRequests(): void {
    console.log('user-request: Spouštím načítání aktivních požadavků. isLoading je true.');
    this.isLoading = true;
    this.isTrashTableLoading = false; // Zajistíme, že druhá tabulka nenatáhne "loading" stav
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
      console.log('user-request: Data pro aktivní požadavky načtena z keše. isLoading je false.');
      this.data = this.activeRequestsCache.get(this.currentPage)!;
      this.isLoading = false;
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
        console.log('user-request: Načtení aktivních požadavků z API bylo úspěšné. isLoading je false.');
        this.data = response.data;
        this.totalItems = response.total;
        this.totalPages = response.last_page;
        this.currentPage = response.current_page;
        this.isLoading = false;
        this.activeRequestsCache.set(this.currentPage, response.data);
        this.cd.detectChanges();
        this.preloadActivePage(this.currentPage + 1);
      },
      error: (error) => {
        console.error('user-request: Chyba při načítání aktivních požadavků uživatelů:', error);
        this.errorMessage = 'Nepodařilo se načíst aktivní data požadavků.';
        console.log('user-request: Načítání aktivních požadavků selhalo. isLoading je false.');
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
        console.error(`user-request: Chyba při pre-fetching aktivních dat pro stránku ${page}:`, error);
      }
    });
  }

  // Načítá smazané požadavky s kešováním a pre-fetchingem
  loadTrashRequests(): void {
    console.log('user-request: Spouštím načítání smazaných požadavků. isTrashTableLoading je true.');
    this.isTrashTableLoading = true;
    this.isLoading = false; // Zajistíme, že první tabulka nenatáhne "loading" stav
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
      console.log('user-request: Data pro smazané požadavky načtena z keše. isTrashTableLoading je false.');
      this.trashData = this.trashRequestsCache.get(this.trashCurrentPage)!;
      this.isTrashTableLoading = false;
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
        console.log('user-request: Načtení smazaných požadavků z API bylo úspěšné. isTrashTableLoading je false.');
        this.trashData = response.data;
        this.trashTotalItems = response.total;
        this.trashTotalPages = response.last_page;
        this.trashCurrentPage = response.current_page;
        this.isTrashTableLoading = false;
        this.trashRequestsCache.set(this.trashCurrentPage, response.data);
        this.cd.detectChanges();
        this.preloadTrashPage(this.trashCurrentPage + 1);
      },
      error: (error) => {
        console.error('user-request: Chyba při načítání smazaných požadavků uživatelů:', error);
        this.errorMessage = 'Nepodařilo se načíst smazaná data požadavků.';
        console.log('user-request: Načítání smazaných požadavků selhalo. isTrashTableLoading je false.');
        this.isTrashTableLoading = false;
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
        console.error(`user-request: Chyba při pre-fetching smazaných dat pro stránku ${page}:`, error);
      }
    });
  }

  // Přepíná mezi aktivní a smazanou tabulkou
  toggleTable(): void {
    this.showTrashTable = !this.showTrashTable;
    if (this.showTrashTable) {
      console.log('user-request: Přepnuto na smazanou tabulku. isTrashTableLoading je true.');
      this.isTrashTableLoading = true;
      this.isLoading = false;
      this.loadTrashRequests();
    } else {
      console.log('user-request: Přepnuto na aktivní tabulku. isLoading je true.');
      this.isLoading = true;
      this.isTrashTableLoading = false;
      this.loadActiveRequests();
    }
  }

  // Aplikuje filtry a načítá data z API. Vyčistí keš, aby se načetla nová data.
  applyFilters(): void {
    if (this.showTrashTable) {
      this.trashRequestsCache.clear();
      this.trashCurrentPage = 1;
      console.log('user-request: Aplikuji filtry na smazanou tabulku. isTrashTableLoading je true.');
      this.isTrashTableLoading = true;
      this.loadTrashRequests();
    } else {
      this.activeRequestsCache.clear();
      this.currentPage = 1;
      console.log('user-request: Aplikuji filtry na aktivní tabulku. isLoading je true.');
      this.isLoading = true;
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
      console.log('user-request: Čistím filtry na smazané tabulce. isTrashTableLoading je true.');
      this.isTrashTableLoading = true;
      this.loadTrashRequests();
    } else {
      this.activeRequestsCache.clear();
      this.currentPage = 1;
      console.log('user-request: Čistím filtry na aktivní tabulce. isLoading je true.');
      this.isLoading = true;
      this.loadActiveRequests();
    }
  }

  // Přejde na danou stránku v aktivní tabulce
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      console.log(`user-request: Přejdu na aktivní stránku ${page}. isLoading je true.`);
      this.isLoading = true;
      this.loadActiveRequests();
    }
  }

  // Přejde na danou stránku ve smazané tabulce
  goToTrashPage(page: number): void {
    if (page >= 1 && page <= this.trashTotalPages && page !== this.trashCurrentPage) {
      this.trashCurrentPage = page;
      console.log(`user-request: Přejdu na smazanou stránku ${page}. isTrashTableLoading je true.`);
      this.isTrashTableLoading = true;
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
      console.log('user-request: Změna položek na stránku. isLoading je true.');
      this.isLoading = true;
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
      console.log('user-request: Změna položek na stránku pro smazanou tabulku. isTrashTableLoading je true.');
      this.isTrashTableLoading = true;
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
    console.log('user-request: Událost obnovení dat zachycena. isLoading a isTrashTableLoading jsou true.');
    this.isLoading = true;
    this.isTrashTableLoading = true;
    this.activeRequestsCache.clear();
    this.trashRequestsCache.clear();
    this.loadActiveRequests();
    this.loadTrashRequests();
  }

  // Metoda pro zachycení události smazání dat.
  handleItemDeleted(): void {
    console.log('user-request: Událost smazání dat zachycena. isLoading a isTrashTableLoading jsou true.');
    this.isLoading = true;
    this.isTrashTableLoading = true;
    this.activeRequestsCache.clear();
    this.trashRequestsCache.clear();
    this.loadActiveRequests();
    this.loadTrashRequests();
  }

  // Metoda pro vytvoření záznamu
  handleCreateFormOpened(): void {
    console.log('user-request: Otevření formuláře pro vytvoření záznamu.');
    this.showCreateForm = !this.showCreateForm;
  }

  handleFormSubmitted(formData: RawRequestCommission): void {
    if (formData.id) {
      console.log('user-request: Spouštím aktualizaci dat. isLoading je true.');
      this.isLoading = true;
      this.updateData(formData.id, formData).subscribe({
        next: (response) => {
          console.log('user-request: Aktualizace dat proběhla úspěšně. isLoading je false.');
          this.showCreateForm = false;
          this.activeRequestsCache.clear();
          this.currentPage = 1;
          this.isLoading = false; // Nastavíme isLoading na false po aktualizaci, aby se formulář skryl.
          console.log('user-request: Spouštím nové načítání dat po aktualizaci. isLoading je true.');
          this.loadActiveRequests();
        },
        error: (err) => {
          console.error('user-request: Chyba při aktualizaci dat:', err);
          console.log('user-request: Aktualizace dat selhala. isLoading je false.');
          this.isLoading = false;
        }
      });
    } else {
      console.log('user-request: Spouštím vytvoření nového záznamu. isLoading je true.');
      this.isLoading = true;
      this.postData(formData).subscribe({
        next: (response) => {
          console.log('user-request: Vytvoření nového záznamu proběhlo úspěšně. isLoading je false.');
          this.showCreateForm = false;
          this.activeRequestsCache.clear();
          this.currentPage = 1;
          this.isLoading = false; // Nastavíme isLoading na false po vytvoření, aby se formulář skryl.
          console.log('user-request: Spouštím nové načítání dat po vytvoření. isLoading je true.');
          this.loadActiveRequests();
        },
        error: (err) => {
          console.error('user-request: Chyba při odeslání dat:', err);
          console.log('user-request: Vytvoření nového záznamu selhalo. isLoading je false.');
          this.isLoading = false;
        }
      });
    }
  }

  onCancelForm() {
    console.log('user-request: Formulář pro vytvoření záznamu byl zrušen.');
    this.showCreateForm = false;
  }
}
