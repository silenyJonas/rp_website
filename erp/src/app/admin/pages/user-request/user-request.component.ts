
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
// import { GenericFormComponent, InputDefinition } from '../../components/generic-form/generic-form.component';

// interface TrashFilterParams extends FilterParams {
//   only_trashed?: string;
// }

// @Component({
//   selector: 'app-user-request',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     GenericTableComponent,
//     GenericTrashTableComponent,
//     GenericFormComponent,
//   ],
//   templateUrl: './user-request.component.html',
//   styleUrl: './user-request.component.css',
//   changeDetection: ChangeDetectionStrategy.OnPush
// })
// export class UserRequestComponent extends BaseDataComponent<RawRequestCommission> implements OnInit {

//   buttons: Buttons[] = [
//     { display_name: 'Detaily', isActive: true, type: 'info_button' },
//     { display_name: 'Editovat', isActive: true, type: 'neutral_button' },
//     { display_name: 'Nove button', isActive: false, type: 'neutral_button' },
//     { display_name: 'Smazat', isActive: true, type: 'delete_button' },
//   ];

//   formFields: InputDefinition[] = [
//     {
//       column_name: 'thema',
//       label: 'Téma',
//       placeholder: 'Zadejte téma požadavku',
//       type: 'text',
//       required: true,
//       pattern: '^[a-zA-Z0-9ěščřžýáíéóúůďťňĚŠČŘŽÝÁÍÉÚŮĎŤŇ\\s]{3,100}$',
//       errorMessage: 'Téma musí mít 3-100 znaků.',
//       editable: true,
//       show_in_edit: true,
//       show_in_create: true,
//     },
//     {
//       column_name: 'contact_email',
//       label: 'Kontaktní e-mail',
//       placeholder: 'Zadejte e-mail',
//       type: 'email',
//       required: true,
//       pattern: '[^@]+@[^@]+\.[^@]+',
//       errorMessage: 'Zadejte platnou e-mailovou adresu.',
//       editable: true,
//       show_in_edit: true,
//       show_in_create: true
//     },
//     {
//       column_name: 'contact_phone',
//       label: 'Telefon',
//       placeholder: 'Zadejte telefonní číslo (volitelné)',
//       type: 'tel',
//       required: false,
//       pattern: '^[0-9+\\s-]{9,20}$',
//       errorMessage: 'Zadejte platné telefonní číslo.',
//       editable: true,
//       show_in_edit: true,
//       show_in_create: true
//     },
//     {
//       column_name: 'order_description',
//       label: 'Popis objednávky',
//       placeholder: 'Popište svůj požadavek',
//       type: 'textarea',
//       required: true,
//       errorMessage: 'Popis je povinný.',
//       editable: true,
//       show_in_edit: true,
//       show_in_create: true
//     },
//     {
//       column_name: 'status',
//       label: 'Status',
//       placeholder: '',
//       type: 'select',
//       options: [
//         {value: 'Nově zadané', label: 'Nízká'},
//         {value: 'Zpracovává se', label: 'Zpracovává se'},
//         {value: 'Dokončeno', label: 'Dokončeno'},
//         {value: 'Zrušeno', label: 'Zrušeno'},
//       ],
//       required: true,
//       errorMessage: 'Pole je povinné.',
//       editable: true,
//       show_in_edit: true,
//       show_in_create: true
//     },
//     {
//       column_name: 'priority',
//       label: 'Priorita',
//       placeholder: '',
//       type: 'select',
//       options: [
//         {value: 'Nízká', label: 'Nízká'},
//         {value: 'Neutrální', label: 'Neutrální'},
//         {value: 'Vysoká', label: 'Vysoká'},
//       ],
//       required: true,
//       errorMessage: 'Pole je povinné.',
//       editable: true,
//       show_in_edit: true,
//       show_in_create: true
//     },
//     {
//       column_name: 'id',
//       label: 'ID záznamu',
//       type: 'text',
//       editable: false,
//       show_in_edit: false,
//       show_in_create: false
//     },
//     {
//       column_name: 'created_at',
//       label: 'Vytvořeno',
//       type: 'text',
//       editable: false,
//       show_in_edit: false,
//       show_in_create: false
//     }
//   ];

//   userRequestColumns: ColumnDefinition[] = [
//     { key: 'id', header: 'ID', type: 'text' },
//     { key: 'thema', header: 'Téma', type: 'text' },
//     { key: 'contact_email', header: 'Email', type: 'text' },
//     { key: 'contact_phone', header: 'Telefon', type: 'text' },
//     { key: 'status', header: 'Stav', type: 'text' },
//     { key: 'priority', header: 'Priorita', type: 'text' },
//     { key: 'created_at', header: 'Vytvořeno', type: 'date', format: 'short' },
//     { key: 'order_description', header: 'Popis objednávky', type: 'text' },
//     { key: 'updated_at', header: 'Změněno', type: 'date', format: 'short' }
//   ];

//   trashUserRequestColumns: ColumnDefinition[] = [
//     { key: 'id', header: 'ID', type: 'text' },
//     { key: 'thema', header: 'Téma', type: 'text' },
//     { key: 'contact_email', header: 'Email', type: 'text' },
//     { key: 'contact_phone', header: 'Telefon', type: 'text' },
//     { key: 'status', header: 'Stav', type: 'text' },
//     { key: 'priority', header: 'Priorita', type: 'text' },
//     { key: 'created_at', header: 'Vytvořeno', type: 'date', format: 'short' },
//     { key: 'order_description', header: 'Popis objednávky', type: 'text' },
//     { key: 'deleted_at', header: 'Smazáno', type: 'date', format: 'short' },
//     { key: 'updated_at', header: 'Změněno', type: 'date', format: 'short' }
//   ];

//   showTrashTable: boolean = false;
//   showCreateForm: boolean = false;
  
//   override trashData: RawRequestCommission[] = [];
//   override apiEndpoint: string = 'raw_request_commissions';

//   override isLoading: boolean = false;
//   isTrashTableLoading: boolean = false;

//   currentPage: number = 1;
//   itemsPerPage: number = 15;
//   totalItems: number = 0;
//   totalPages: number = 0;

//   trashCurrentPage: number = 1;
//   trashItemsPerPage: number = 15;
//   trashTotalItems: number = 0;
//   trashTotalPages: number = 0;

//   filterSearch: string = '';
//   filterStatus: string = '';
//   filterPriority: string = '';
//   filterEmail: string = '';

//   statusOptions: string[] = ['Nově zadané', 'Zpracovává se', 'Dokončeno', 'Zrušeno'];
//   priorityOptions: string[] = ['Nízká', 'Neutrální', 'Vysoká'];

//   private activeRequestsCache: Map<number, RawRequestCommission[]> = new Map();
//   private trashRequestsCache: Map<number, RawRequestCommission[]> = new Map();
//   private currentActiveFilters: FilterParams = {};
//   private currentTrashFilters: FilterParams = {};

//   selectedItemForEdit: RawRequestCommission | null = null;

//   constructor(
//     protected override dataHandler: DataHandler,
//     protected override cd: ChangeDetectorRef,
//     private genericTableService: GenericTableService,
//     private authService: AuthService,
//     private router: Router
//   ) {
//     super(dataHandler, cd);
//   }

//   override ngOnInit(): void {
//     console.log('NGONINIT: Spuštěn.');
//     super.ngOnInit();
//     this.authService.isLoggedIn$.subscribe(loggedIn => {
//       console.log(`NGONINIT: Sledování stavu přihlášení. Uživatel je přihlášen: ${loggedIn}.`);
//       if (loggedIn) {
//         this.loadActiveRequests();
//       } else {
//         console.log('NGONINIT: Uživatel není přihlášen, přesměrování na login.');
//         this.router.navigate(['/auth/login']);
//       }
//     });
//   }

//   loadActiveRequests(): void {
//     console.log('LOAD ACTIVE REQUESTS: Spouštím načítání aktivních požadavků.');
//     this.isLoading = true;
//     this.isTrashTableLoading = false;
//     this.errorMessage = null;
//     this.cd.detectChanges();
//     console.log(`LOAD ACTIVE REQUESTS: Nastaveno isLoading na true. cd.detectChanges() voláno.`);

//     const currentFilters: FilterParams = {
//       search: this.filterSearch,
//       status: this.filterStatus,
//       priority: this.filterPriority,
//       email: this.filterEmail,
//       is_deleted: 'false'
//     };

//     console.log('LOAD ACTIVE REQUESTS: Aktuální filtry:', currentFilters);
//     console.log('LOAD ACTIVE REQUESTS: Minulé aktivní filtry:', this.currentActiveFilters);

//     if (JSON.stringify(currentFilters) !== JSON.stringify(this.currentActiveFilters)) {
//       console.log('LOAD ACTIVE REQUESTS: Filtry se změnily, vyprázdňuji cache a resetuji stránku.');
//       this.activeRequestsCache.clear();
//       this.currentPage = 1;
//       this.currentActiveFilters = currentFilters;
//     }

//     if (this.activeRequestsCache.has(this.currentPage)) {
//       console.log(`LOAD ACTIVE REQUESTS: Data pro stránku ${this.currentPage} nalezena v keši.`);
//       this.data = this.activeRequestsCache.get(this.currentPage)!;
//       this.isLoading = false;
//       this.cd.detectChanges();
//       console.log('LOAD ACTIVE REQUESTS: Data z keše načtena, isLoading je false.');
//       this.preloadActivePage(this.currentPage + 1);
//       return;
//     }

//     console.log(`LOAD ACTIVE REQUESTS: Data pro stránku ${this.currentPage} nejsou v keši, načítám z API.`);
//     this.genericTableService.getPaginatedData<RawRequestCommission>(
//       this.apiEndpoint,
//       this.currentPage,
//       this.itemsPerPage,
//       currentFilters
//     ).subscribe({
//       next: (response: PaginatedResponse<RawRequestCommission>) => {
//         console.log('LOAD ACTIVE REQUESTS: Načtení z API bylo úspěšné. Odpověď:', response);
//         this.data = response.data;
//         this.totalItems = response.total;
//         this.totalPages = response.last_page;
//         this.currentPage = response.current_page;
//         this.isLoading = false;
//         this.activeRequestsCache.set(this.currentPage, response.data);
//         this.cd.detectChanges();
//         console.log('LOAD ACTIVE REQUESTS: Data z API uložena do keše, isLoading je false, cd.detectChanges() voláno.');
//         this.preloadActivePage(this.currentPage + 1);
//       },
//       error: (error) => {
//         console.error('LOAD ACTIVE REQUESTS: Chyba při načítání aktivních požadavků z API:', error);
//         this.errorMessage = 'Nepodařilo se načíst aktivní data požadavků.';
//         this.isLoading = false;
//         this.cd.detectChanges();
//         console.log('LOAD ACTIVE REQUESTS: Načítání selhalo, isLoading je false, cd.detectChanges() voláno.');
//       }
//     });
//   }

//   private preloadActivePage(page: number): void {
//     console.log(`PRELOAD ACTIVE PAGE: Pokouším se pre-fetchovat stránku ${page}.`);
//     if (page > this.totalPages || this.activeRequestsCache.has(page)) {
//       console.log(`PRELOAD ACTIVE PAGE: Stránka ${page} je buď mimo rozsah, nebo již v keši. Pre-fetch zrušen.`);
//       return;
//     }

//     const currentFilters: FilterParams = {
//       search: this.filterSearch,
//       status: this.filterStatus,
//       priority: this.filterPriority,
//       email: this.filterEmail,
//       is_deleted: 'false'
//     };

//     this.genericTableService.getPaginatedData<RawRequestCommission>(
//       this.apiEndpoint,
//       page,
//       this.itemsPerPage,
//       currentFilters
//     ).subscribe({
//       next: (response: PaginatedResponse<RawRequestCommission>) => {
//         console.log(`PRELOAD ACTIVE PAGE: Pre-fetch stránky ${page} úspěšný, data uložena do keše.`);
//         this.activeRequestsCache.set(page, response.data);
//       },
//       error: (error) => {
//         console.error(`PRELOAD ACTIVE PAGE: Chyba při pre-fetching aktivních dat pro stránku ${page}:`, error);
//       }
//     });
//   }

//   loadTrashRequests(): void {
//     console.log('LOAD TRASH REQUESTS: Spouštím načítání smazaných požadavků.');
//     this.isTrashTableLoading = true;
//     this.isLoading = false;
//     this.errorMessage = null;
//     this.cd.detectChanges();
//     console.log('LOAD TRASH REQUESTS: Nastaveno isTrashTableLoading na true. cd.detectChanges() voláno.');

//     const trashFilters: TrashFilterParams = {
//       only_trashed: 'true',
//       search: this.filterSearch,
//       status: this.filterStatus,
//       priority: this.filterPriority,
//       email: this.filterEmail
//     };

//     console.log('LOAD TRASH REQUESTS: Aktuální filtry pro smazané:', trashFilters);
//     console.log('LOAD TRASH REQUESTS: Minulé smazané filtry:', this.currentTrashFilters);

//     if (JSON.stringify(trashFilters) !== JSON.stringify(this.currentTrashFilters)) {
//       console.log('LOAD TRASH REQUESTS: Filtry pro smazané se změnily, vyprázdňuji cache a resetuji stránku.');
//       this.trashRequestsCache.clear();
//       this.trashCurrentPage = 1;
//       this.currentTrashFilters = trashFilters;
//     }

//     if (this.trashRequestsCache.has(this.trashCurrentPage)) {
//       console.log(`LOAD TRASH REQUESTS: Data pro smazanou stránku ${this.trashCurrentPage} nalezena v keši.`);
//       this.trashData = this.trashRequestsCache.get(this.trashCurrentPage)!;
//       this.isTrashTableLoading = false;
//       this.cd.detectChanges();
//       console.log('LOAD TRASH REQUESTS: Data z keše načtena, isTrashTableLoading je false.');
//       this.preloadTrashPage(this.trashCurrentPage + 1);
//       return;
//     }

//     console.log(`LOAD TRASH REQUESTS: Data pro smazanou stránku ${this.trashCurrentPage} nejsou v keši, načítám z API.`);
//     this.genericTableService.getPaginatedData<RawRequestCommission>(
//       this.apiEndpoint,
//       this.trashCurrentPage,
//       this.trashItemsPerPage,
//       trashFilters
//     ).subscribe({
//       next: (response: PaginatedResponse<RawRequestCommission>) => {
//         console.log('LOAD TRASH REQUESTS: Načtení z API bylo úspěšné. Odpověď:', response);
//         this.trashData = response.data;
//         this.trashTotalItems = response.total;
//         this.trashTotalPages = response.last_page;
//         this.trashCurrentPage = response.current_page;
//         this.isTrashTableLoading = false;
//         this.trashRequestsCache.set(this.trashCurrentPage, response.data);
//         this.cd.detectChanges();
//         console.log('LOAD TRASH REQUESTS: Data z API uložena do keše, isTrashTableLoading je false, cd.detectChanges() voláno.');
//         this.preloadTrashPage(this.trashCurrentPage + 1);
//       },
//       error: (error) => {
//         console.error('LOAD TRASH REQUESTS: Chyba při načítání smazaných požadavků z API:', error);
//         this.errorMessage = 'Nepodařilo se načíst smazaná data požadavků.';
//         this.isTrashTableLoading = false;
//         this.cd.detectChanges();
//         console.log('LOAD TRASH REQUESTS: Načítání selhalo, isTrashTableLoading je false, cd.detectChanges() voláno.');
//       }
//     });
//   }

//   private preloadTrashPage(page: number): void {
//     console.log(`PRELOAD TRASH PAGE: Pokouším se pre-fetchovat smazanou stránku ${page}.`);
//     if (page > this.trashTotalPages || this.trashRequestsCache.has(page)) {
//       console.log(`PRELOAD TRASH PAGE: Smazaná stránka ${page} je buď mimo rozsah, nebo již v keši. Pre-fetch zrušen.`);
//       return;
//     }

//     const trashFilters: TrashFilterParams = {
//       only_trashed: 'true',
//       search: this.filterSearch,
//       status: this.filterStatus,
//       priority: this.filterPriority,
//       email: this.filterEmail
//     };

//     this.genericTableService.getPaginatedData<RawRequestCommission>(
//       this.apiEndpoint,
//       page,
//       this.trashItemsPerPage,
//       trashFilters
//     ).subscribe({
//       next: (response: PaginatedResponse<RawRequestCommission>) => {
//         console.log(`PRELOAD TRASH PAGE: Pre-fetch smazané stránky ${page} úspěšný, data uložena do keše.`);
//         this.trashRequestsCache.set(page, response.data);
//       },
//       error: (error) => {
//         console.error(`PRELOAD TRASH PAGE: Chyba při pre-fetching smazaných dat pro stránku ${page}:`, error);
//       }
//     });
//   }

//   toggleTable(): void {
//     console.log(`TOGGLE TABLE: Přepínám zobrazení tabulky. showTrashTable se mění z ${this.showTrashTable} na ${!this.showTrashTable}.`);
//     this.showTrashTable = !this.showTrashTable;
//     this.forceFullRefresh();
//   }

//   applyFilters(): void {
//     console.log('APPLY FILTERS: Spouštím aplikaci filtrů.');
//     if (this.showTrashTable) {
//       console.log('APPLY FILTERS: Aplikuji filtry na smazanou tabulku.');
//       this.trashRequestsCache.clear();
//       this.trashCurrentPage = 1;
//       this.isTrashTableLoading = true;
//       this.loadTrashRequests();
//     } else {
//       console.log('APPLY FILTERS: Aplikuji filtry na aktivní tabulku.');
//       this.activeRequestsCache.clear();
//       this.currentPage = 1;
//       this.isLoading = true;
//       this.loadActiveRequests();
//     }
//   }

//   clearFilters(): void {
//     console.log('CLEAR FILTERS: Vymazání všech filtrů.');
//     this.filterSearch = '';
//     this.filterStatus = '';
//     this.filterPriority = '';
//     this.filterEmail = '';
//     this.forceFullRefresh();
//   }

//   goToPage(page: number): void {
//     console.log(`GO TO PAGE: Požadavek na přesun na aktivní stránku ${page}. Aktuální stránka: ${this.currentPage}.`);
//     if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
//       this.currentPage = page;
//       this.isLoading = true;
//       this.loadActiveRequests();
//     } else {
//       console.log(`GO TO PAGE: Neplatný požadavek na stránku ${page}.`);
//     }
//   }

//   goToTrashPage(page: number): void {
//     console.log(`GO TO TRASH PAGE: Požadavek na přesun na smazanou stránku ${page}. Aktuální stránka: ${this.trashCurrentPage}.`);
//     if (page >= 1 && page <= this.trashTotalPages && page !== this.trashCurrentPage) {
//       this.trashCurrentPage = page;
//       this.isTrashTableLoading = true;
//       this.loadTrashRequests();
//     } else {
//       console.log(`GO TO TRASH PAGE: Neplatný požadavek na smazanou stránku ${page}.`);
//     }
//   }

//   onItemsPerPageChange(event: Event): void {
//     const selectElement = event.target as HTMLSelectElement;
//     const newItemsPerPage = Number(selectElement.value);
//     console.log(`ON ITEMS PER PAGE CHANGE: Změna počtu položek na stránce. Nová hodnota: ${newItemsPerPage}.`);
//     if (newItemsPerPage !== this.itemsPerPage) {
//       this.itemsPerPage = newItemsPerPage;
//       this.currentPage = 1;
//       this.activeRequestsCache.clear();
//       this.isLoading = true;
//       this.loadActiveRequests();
//     }
//   }

//   onTrashItemsPerPageChange(event: Event): void {
//     const selectElement = event.target as HTMLSelectElement;
//     const newItemsPerPage = Number(selectElement.value);
//     console.log(`ON TRASH ITEMS PER PAGE CHANGE: Změna počtu položek pro smazanou tabulku. Nová hodnota: ${newItemsPerPage}.`);
//     if (newItemsPerPage !== this.trashItemsPerPage) {
//       this.trashItemsPerPage = newItemsPerPage;
//       this.trashCurrentPage = 1;
//       this.trashRequestsCache.clear();
//       this.isTrashTableLoading = true;
//       this.loadTrashRequests();
//     }
//   }

//   get pagesArray(): number[] {
//     // Logika pole stránek je ponechána beze změn
//     const maxPagesToShow = 5;
//     let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
//     let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);
//     if (endPage - startPage + 1 < maxPagesToShow) {
//       startPage = Math.max(1, endPage - maxPagesToShow + 1);
//     }
//     const pages = [];
//     for (let i = startPage; i <= endPage; i++) {
//       pages.push(i);
//     }
//     return pages;
//   }

//   get trashPagesArray(): number[] {
//     // Logika pole stránek je ponechána beze změn
//     const maxPagesToShow = 5;
//     let startPage = Math.max(1, this.trashCurrentPage - Math.floor(maxPagesToShow / 2));
//     let endPage = Math.min(this.trashTotalPages, startPage + maxPagesToShow - 1);
//     if (endPage - startPage + 1 < maxPagesToShow) {
//       startPage = Math.max(1, endPage - maxPagesToShow + 1);
//     }
//     const pages = [];
//     for (let i = startPage; i <= endPage; i++) {
//       pages.push(i);
//     }
//     return pages;
//   }

//   handleItemRestored(): void {
//     console.log('HANDLE ITEM RESTORED: Událost obnovení dat zachycena. Spouštím celkovou obnovu.');
//     this.forceFullRefresh();
//   }

//   handleItemDeleted(): void {
//     console.log('HANDLE ITEM DELETED: Událost smazání dat zachycena. Spouštím celkovou obnovu.');
//     this.forceFullRefresh();
//   }
  
//   private refreshActiveTable(): void {
//     console.log('REFRESH ACTIVE TABLE: Spouštím obnovu aktivní tabulky.');
//     this.showCreateForm = false;
//     this.selectedItemForEdit = null;
//     this.activeRequestsCache.clear();
//     this.currentPage = 1;
//     this.isLoading = true;
//     this.loadActiveRequests();
//     this.cd.detectChanges();
//   }

//   private forceFullRefresh(): void {
//     console.log('FORCE FULL REFRESH: Spouštím kompletní obnovu dat.');
//     this.showCreateForm = false;
//     this.selectedItemForEdit = null;
//     this.activeRequestsCache.clear();
//     this.trashRequestsCache.clear();
//     this.currentPage = 1;
//     this.trashCurrentPage = 1;
//     this.isLoading = true;
//     this.isTrashTableLoading = true;
//     this.cd.detectChanges();
//     console.log('FORCE FULL REFRESH: Cache vyčištěna, isLoading je true, cd.detectChanges() voláno.');
//     this.loadActiveRequests();
//     this.loadTrashRequests();
//   }

//   handleCreateFormOpened(): void {
//     console.log('HANDLE CREATE FORM OPENED: Otevření formuláře pro vytvoření záznamu.');
//     this.selectedItemForEdit = null;
//     this.showCreateForm = !this.showCreateForm;
//   }

//   handleEditFormOpened(item: RawRequestCommission): void {
//     console.log(`HANDLE EDIT FORM OPENED: Otevření formuláře pro editaci záznamu s ID ${item.id}.`);
//     this.selectedItemForEdit = item;
//     this.showCreateForm = true;
//   }

//   handleFormSubmitted(formData: RawRequestCommission): void {
//     console.log('HANDLE FORM SUBMITTED: Formulář byl odeslán. Data:', formData);
//     if (formData.id) {
//       console.log(`HANDLE FORM SUBMITTED: Volám updateData pro ID: ${formData.id}.`);
//       this.isLoading = true;
//       this.updateData(formData.id, formData).subscribe({
//         next: (response) => {
//           console.log('HANDLE FORM SUBMITTED: Úprava záznamu proběhla úspěšně. Odpověď:', response);
//           this.forceFullRefresh();
//         },
//         error: (err) => {
//           console.error('HANDLE FORM SUBMITTED: Chyba při úpravě záznamu:', err);
//           this.isLoading = false;
//           this.cd.detectChanges();
//         }
//       });
//     } else {
//       console.log('HANDLE FORM SUBMITTED: Volám postData pro vytvoření nového záznamu.');
//       this.isLoading = true;
//       this.postData(formData).subscribe({
//         next: (response) => {
//           console.log('HANDLE FORM SUBMITTED: Vytvoření nového záznamu proběhlo úspěšně. Odpověď:', response);
//           this.forceFullRefresh();
//         },
//         error: (err) => {
//           console.error('HANDLE FORM SUBMITTED: Chyba při odeslání dat:', err);
//           this.isLoading = false;
//           this.cd.detectChanges();
//         }
//       });
//     }
//   }

//   onCancelForm() {
//     console.log('ON CANCEL FORM: Formulář byl zrušen.');
//     this.showCreateForm = false;
//     this.selectedItemForEdit = null;
//   }
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
import { GenericFormComponent, InputDefinition } from '../../components/generic-form/generic-form.component';
import { Observable, of } from 'rxjs'; // Import 'of'
import { switchMap, tap, retry } from 'rxjs/operators'; // Import 'retry'

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

  formFields: InputDefinition[] = [
    {
      column_name: 'thema',
      label: 'Téma',
      placeholder: 'Zadejte téma požadavku',
      type: 'text',
      required: true,
      pattern: '^[a-zA-Z0-9ěščřžýáíéóúůďťňĚŠČŘŽÝÁÍÉÚŮĎŤŇ\\s]{3,100}$',
      errorMessage: 'Téma musí mít 3-100 znaků.',
      editable: true,
      show_in_edit: true,
      show_in_create: true,
    },
    {
      column_name: 'contact_email',
      label: 'Kontaktní e-mail',
      placeholder: 'Zadejte e-mail',
      type: 'email',
      required: true,
      pattern: '[^@]+@[^@]+\.[^@]+',
      errorMessage: 'Zadejte platnou e-mailovou adresu.',
      editable: true,
      show_in_edit: true,
      show_in_create: true
    },
    {
      column_name: 'contact_phone',
      label: 'Telefon',
      placeholder: 'Zadejte telefonní číslo (volitelné)',
      type: 'tel',
      required: false,
      pattern: '^[0-9+\\s-]{9,20}$',
      errorMessage: 'Zadejte platné telefonní číslo.',
      editable: true,
      show_in_edit: true,
      show_in_create: true
    },
    {
      column_name: 'order_description',
      label: 'Popis objednávky',
      placeholder: 'Popište svůj požadavek',
      type: 'textarea',
      required: true,
      errorMessage: 'Popis je povinný.',
      editable: true,
      show_in_edit: true,
      show_in_create: true
    },
    {
      column_name: 'status',
      label: 'Status',
      placeholder: '',
      type: 'select',
      options: [
        { value: 'Nově zadané', label: 'Nízká' },
        { value: 'Zpracovává se', label: 'Zpracovává se' },
        { value: 'Dokončeno', label: 'Dokončeno' },
        { value: 'Zrušeno', label: 'Zrušeno' },
      ],
      required: true,
      errorMessage: 'Pole je povinné.',
      editable: true,
      show_in_edit: true,
      show_in_create: true
    },
    {
      column_name: 'priority',
      label: 'Priorita',
      placeholder: '',
      type: 'select',
      options: [
        { value: 'Nízká', label: 'Nízká' },
        { value: 'Neutrální', label: 'Neutrální' },
        { value: 'Vysoká', label: 'Vysoká' },
      ],
      required: true,
      errorMessage: 'Pole je povinné.',
      editable: true,
      show_in_edit: true,
      show_in_create: true
    },
    {
      column_name: 'id',
      label: 'ID záznamu',
      type: 'text',
      editable: false,
      show_in_edit: false,
      show_in_create: false
    },
    {
      column_name: 'created_at',
      label: 'Vytvořeno',
      type: 'text',
      editable: false,
      show_in_edit: false,
      show_in_create: false
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
    { key: 'updated_at', header: 'Změněno', type: 'date', format: 'short' }
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
    { key: 'updated_at', header: 'Změněno', type: 'date', format: 'short' }
  ];

  showTrashTable: boolean = false;
  showCreateForm: boolean = false;

  override trashData: RawRequestCommission[] = [];
  override apiEndpoint: string = 'raw_request_commissions';

  override isLoading: boolean = false;
  isTrashTableLoading: boolean = false;

  currentPage: number = 1;
  itemsPerPage: number = 15;
  totalItems: number = 0;
  totalPages: number = 0;

  trashCurrentPage: number = 1;
  trashItemsPerPage: number = 15;
  trashTotalItems: number = 0;
  trashTotalPages: number = 0;

  filterSearch: string = '';
  filterStatus: string = '';
  filterPriority: string = '';
  filterEmail: string = '';

  statusOptions: string[] = ['Nově zadané', 'Zpracovává se', 'Dokončeno', 'Zrušeno'];
  priorityOptions: string[] = ['Nízká', 'Neutrální', 'Vysoká'];

  private activeRequestsCache: Map<number, RawRequestCommission[]> = new Map();
  private trashRequestsCache: Map<number, RawRequestCommission[]> = new Map();
  private currentActiveFilters: FilterParams = {};
  private currentTrashFilters: FilterParams = {};

  selectedItemForEdit: RawRequestCommission | null = null;

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
    console.log('NGONINIT: Spuštěn.');
    super.ngOnInit();
    this.authService.isLoggedIn$.subscribe(loggedIn => {
      console.log(`NGONINIT: Sledování stavu přihlášení. Uživatel je přihlášen: ${loggedIn}.`);
      if (loggedIn) {
        this.loadActiveRequests().subscribe();
      } else {
        console.log('NGONINIT: Uživatel není přihlášen, přesměrování na login.');
        this.router.navigate(['/auth/login']);
      }
    });
  }
  
  // Změněno: Metoda nyní vrací Observable<PaginatedResponse<RawRequestCommission>>
  loadActiveRequests(): Observable<PaginatedResponse<RawRequestCommission>> {
    console.log('LOAD ACTIVE REQUESTS: Spouštím načítání aktivních požadavků.');
    this.isLoading = true;
    this.isTrashTableLoading = false;
    this.errorMessage = null;
    this.cd.detectChanges();
    console.log(`LOAD ACTIVE REQUESTS: Nastaveno isLoading na true. cd.detectChanges() voláno.`);

    const currentFilters: FilterParams = {
      search: this.filterSearch,
      status: this.filterStatus,
      priority: this.filterPriority,
      email: this.filterEmail,
      is_deleted: 'false'
    };

    console.log('LOAD ACTIVE REQUESTS: Aktuální filtry:', currentFilters);
    console.log('LOAD ACTIVE REQUESTS: Minulé aktivní filtry:', this.currentActiveFilters);

    if (JSON.stringify(currentFilters) !== JSON.stringify(this.currentActiveFilters)) {
      console.log('LOAD ACTIVE REQUESTS: Filtry se změnily, vyprázdňuji cache a resetuji stránku.');
      this.activeRequestsCache.clear();
      this.currentPage = 1;
      this.currentActiveFilters = currentFilters;
    }

    if (this.activeRequestsCache.has(this.currentPage)) {
      console.log(`LOAD ACTIVE REQUESTS: Data pro stránku ${this.currentPage} nalezena v keši.`);
      this.data = this.activeRequestsCache.get(this.currentPage)!;
      this.isLoading = false;
      this.cd.detectChanges();
      console.log('LOAD ACTIVE REQUESTS: Data z keše načtena, isLoading je false.');
      this.preloadActivePage(this.currentPage + 1);
      return of({} as PaginatedResponse<RawRequestCommission>);
    }

    console.log(`LOAD ACTIVE REQUESTS: Data pro stránku ${this.currentPage} nejsou v keši, načítám z API.`);
    return this.genericTableService.getPaginatedData<RawRequestCommission>(
      this.apiEndpoint,
      this.currentPage,
      this.itemsPerPage,
      currentFilters
    ).pipe(
      // Přidání retry(1) pro zopakování požadavku při chybě (např. 401)
      retry(1),
      tap((response: PaginatedResponse<RawRequestCommission>) => {
        console.log('LOAD ACTIVE REQUESTS: Načtení z API bylo úspěšné. Odpověď:', response);
        this.data = response.data;
        this.totalItems = response.total;
        this.totalPages = response.last_page;
        this.currentPage = response.current_page;
        this.isLoading = false;
        this.activeRequestsCache.set(this.currentPage, response.data);
        this.cd.detectChanges();
        console.log('LOAD ACTIVE REQUESTS: Data z API uložena do keše, isLoading je false, cd.detectChanges() voláno.');
        this.preloadActivePage(this.currentPage + 1);
      },
      (error) => {
        console.error('LOAD ACTIVE REQUESTS: Chyba při načítání aktivních požadavků z API:', error);
        this.errorMessage = 'Nepodařilo se načíst aktivní data požadavků.';
        this.isLoading = false;
        this.cd.detectChanges();
        console.log('LOAD ACTIVE REQUESTS: Načítání selhalo, isLoading je false, cd.detectChanges() voláno.');
      })
    );
  }

  private preloadActivePage(page: number): void {
    console.log(`PRELOAD ACTIVE PAGE: Pokouším se pre-fetchovat stránku ${page}.`);
    if (page > this.totalPages || this.activeRequestsCache.has(page)) {
      console.log(`PRELOAD ACTIVE PAGE: Stránka ${page} je buď mimo rozsah, nebo již v keši. Pre-fetch zrušen.`);
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
        console.log(`PRELOAD ACTIVE PAGE: Pre-fetch stránky ${page} úspěšný, data uložena do keše.`);
        this.activeRequestsCache.set(page, response.data);
      },
      error: (error) => {
        console.error(`PRELOAD ACTIVE PAGE: Chyba při pre-fetching aktivních dat pro stránku ${page}:`, error);
      }
    });
  }

  // Změněno: Metoda nyní vrací Observable<PaginatedResponse<RawRequestCommission>>
  loadTrashRequests(): Observable<PaginatedResponse<RawRequestCommission>> {
    console.log('LOAD TRASH REQUESTS: Spouštím načítání smazaných požadavků.');
    this.isTrashTableLoading = true;
    this.isLoading = false;
    this.errorMessage = null;
    this.cd.detectChanges();
    console.log('LOAD TRASH REQUESTS: Nastaveno isTrashTableLoading na true. cd.detectChanges() voláno.');

    const trashFilters: TrashFilterParams = {
      only_trashed: 'true',
      search: this.filterSearch,
      status: this.filterStatus,
      priority: this.filterPriority,
      email: this.filterEmail
    };

    console.log('LOAD TRASH REQUESTS: Aktuální filtry pro smazané:', trashFilters);
    console.log('LOAD TRASH REQUESTS: Minulé smazané filtry:', this.currentTrashFilters);

    if (JSON.stringify(trashFilters) !== JSON.stringify(this.currentTrashFilters)) {
      console.log('LOAD TRASH REQUESTS: Filtry pro smazané se změnily, vyprázdňuji cache a resetuji stránku.');
      this.trashRequestsCache.clear();
      this.trashCurrentPage = 1;
      this.currentTrashFilters = trashFilters;
    }

    if (this.trashRequestsCache.has(this.trashCurrentPage)) {
      console.log(`LOAD TRASH REQUESTS: Data pro smazanou stránku ${this.trashCurrentPage} nalezena v keši.`);
      this.trashData = this.trashRequestsCache.get(this.trashCurrentPage)!;
      this.isTrashTableLoading = false;
      this.cd.detectChanges();
      console.log('LOAD TRASH REQUESTS: Data z keše načtena, isTrashTableLoading je false.');
      this.preloadTrashPage(this.trashCurrentPage + 1);
      return of({} as PaginatedResponse<RawRequestCommission>);
    }

    console.log(`LOAD TRASH REQUESTS: Data pro smazanou stránku ${this.trashCurrentPage} nejsou v keši, načítám z API.`);
    return this.genericTableService.getPaginatedData<RawRequestCommission>(
      this.apiEndpoint,
      this.trashCurrentPage,
      this.trashItemsPerPage,
      trashFilters
    ).pipe(
      // Přidání retry(1) pro zopakování požadavku při chybě
      retry(1),
      tap((response: PaginatedResponse<RawRequestCommission>) => {
        console.log('LOAD TRASH REQUESTS: Načtení z API bylo úspěšné. Odpověď:', response);
        this.trashData = response.data;
        this.trashTotalItems = response.total;
        this.trashTotalPages = response.last_page;
        this.trashCurrentPage = response.current_page;
        this.isTrashTableLoading = false;
        this.trashRequestsCache.set(this.trashCurrentPage, response.data);
        this.cd.detectChanges();
        console.log('LOAD TRASH REQUESTS: Data z API uložena do keše, isTrashTableLoading je false, cd.detectChanges() voláno.');
        this.preloadTrashPage(this.trashCurrentPage + 1);
      },
      (error) => {
        console.error('LOAD TRASH REQUESTS: Chyba při načítání smazaných požadavků z API:', error);
        this.errorMessage = 'Nepodařilo se načíst smazaná data požadavků.';
        this.isTrashTableLoading = false;
        this.cd.detectChanges();
        console.log('LOAD TRASH REQUESTS: Načítání selhalo, isTrashTableLoading je false, cd.detectChanges() voláno.');
      })
    );
  }

  // Přidání chybějící metody
  private preloadTrashPage(page: number): void {
    console.log(`PRELOAD TRASH PAGE: Pokouším se pre-fetchovat smazanou stránku ${page}.`);
    if (page > this.trashTotalPages || this.trashRequestsCache.has(page)) {
      console.log(`PRELOAD TRASH PAGE: Smazaná stránka ${page} je buď mimo rozsah, nebo již v keši. Pre-fetch zrušen.`);
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
        console.log(`PRELOAD TRASH PAGE: Pre-fetch smazané stránky ${page} úspěšný, data uložena do keše.`);
        this.trashRequestsCache.set(page, response.data);
      },
      error: (error) => {
        console.error(`PRELOAD TRASH PAGE: Chyba při pre-fetching smazaných dat pro stránku ${page}:`, error);
      }
    });
  }

  toggleTable(): void {
    console.log(`TOGGLE TABLE: Přepínám zobrazení tabulky. showTrashTable se mění z ${this.showTrashTable} na ${!this.showTrashTable}.`);
    this.showTrashTable = !this.showTrashTable;
    this.forceFullRefresh();
  }

  applyFilters(): void {
    console.log('APPLY FILTERS: Spouštím aplikaci filtrů.');
    if (this.showTrashTable) {
      console.log('APPLY FILTERS: Aplikuji filtry na smazanou tabulku.');
      this.trashRequestsCache.clear();
      this.trashCurrentPage = 1;
      this.isTrashTableLoading = true;
      this.loadTrashRequests().subscribe();
    } else {
      console.log('APPLY FILTERS: Aplikuji filtry na aktivní tabulku.');
      this.activeRequestsCache.clear();
      this.currentPage = 1;
      this.isLoading = true;
      this.loadActiveRequests().subscribe();
    }
  }

  clearFilters(): void {
    console.log('CLEAR FILTERS: Vymazání všech filtrů.');
    this.filterSearch = '';
    this.filterStatus = '';
    this.filterPriority = '';
    this.filterEmail = '';
    this.forceFullRefresh();
  }

  goToPage(page: number): void {
    console.log(`GO TO PAGE: Požadavek na přesun na aktivní stránku ${page}. Aktuální stránka: ${this.currentPage}.`);
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.isLoading = true;
      this.loadActiveRequests().subscribe();
    } else {
      console.log(`GO TO PAGE: Neplatný požadavek na stránku ${page}.`);
    }
  }

  goToTrashPage(page: number): void {
    console.log(`GO TO TRASH PAGE: Požadavek na přesun na smazanou stránku ${page}. Aktuální stránka: ${this.trashCurrentPage}.`);
    if (page >= 1 && page <= this.trashTotalPages && page !== this.trashCurrentPage) {
      this.trashCurrentPage = page;
      this.isTrashTableLoading = true;
      this.loadTrashRequests().subscribe();
    } else {
      console.log(`GO TO TRASH PAGE: Neplatný požadavek na smazanou stránku ${page}.`);
    }
  }

  onItemsPerPageChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const newItemsPerPage = Number(selectElement.value);
    console.log(`ON ITEMS PER PAGE CHANGE: Změna počtu položek na stránce. Nová hodnota: ${newItemsPerPage}.`);
    if (newItemsPerPage !== this.itemsPerPage) {
      this.itemsPerPage = newItemsPerPage;
      this.currentPage = 1;
      this.activeRequestsCache.clear();
      this.isLoading = true;
      this.loadActiveRequests().subscribe();
    }
  }

  onTrashItemsPerPageChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const newItemsPerPage = Number(selectElement.value);
    console.log(`ON TRASH ITEMS PER PAGE CHANGE: Změna počtu položek pro smazanou tabulku. Nová hodnota: ${newItemsPerPage}.`);
    if (newItemsPerPage !== this.trashItemsPerPage) {
      this.trashItemsPerPage = newItemsPerPage;
      this.trashCurrentPage = 1;
      this.trashRequestsCache.clear();
      this.isTrashTableLoading = true;
      this.loadTrashRequests().subscribe();
    }
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

  handleItemRestored(): void {
    console.log('HANDLE ITEM RESTORED: Událost obnovení dat zachycena. Spouštím celkovou obnovu.');
    this.forceFullRefresh();
  }

  handleItemDeleted(): void {
    console.log('HANDLE ITEM DELETED: Událost smazání dat zachycena. Spouštím celkovou obnovu.');
    this.forceFullRefresh();
  }
  
  private refreshActiveTable(): void {
    console.log('REFRESH ACTIVE TABLE: Spouštím obnovu aktivní tabulky.');
    this.showCreateForm = false;
    this.selectedItemForEdit = null;
    this.activeRequestsCache.clear();
    this.currentPage = 1;
    this.isLoading = true;
    this.loadActiveRequests().subscribe();
    this.cd.detectChanges();
  }

  private forceFullRefresh(): void {
    console.log('FORCE FULL REFRESH: Spouštím kompletní obnovu dat.');
    this.showCreateForm = false;
    this.selectedItemForEdit = null;
    this.activeRequestsCache.clear();
    this.trashRequestsCache.clear();
    this.currentPage = 1;
    this.trashCurrentPage = 1;
    this.isLoading = true;
    this.isTrashTableLoading = true;
    this.cd.detectChanges();
    console.log('FORCE FULL REFRESH: Cache vyčištěna, isLoading je true, cd.detectChanges() voláno.');

    this.loadActiveRequests().pipe(
      switchMap(() => {
        console.log('FORCE FULL REFRESH: Načítání aktivních požadavků dokončeno. Pokračuji s načítáním smazaných.');
        return this.loadTrashRequests();
      })
    ).subscribe({
      next: () => {
        console.log('FORCE FULL REFRESH: Všechna data úspěšně načtena.');
        this.isLoading = false;
        this.isTrashTableLoading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('FORCE FULL REFRESH: Chyba při obnově dat.', err);
        this.isLoading = false;
        this.isTrashTableLoading = false;
        this.cd.detectChanges();
      }
    });
  }

  handleCreateFormOpened(): void {
    console.log('HANDLE CREATE FORM OPENED: Otevření formuláře pro vytvoření záznamu.');
    this.selectedItemForEdit = null;
    this.showCreateForm = !this.showCreateForm;
  }

  handleEditFormOpened(item: RawRequestCommission): void {
    console.log(`HANDLE EDIT FORM OPENED: Otevření formuláře pro editaci záznamu s ID ${item.id}.`);
    this.selectedItemForEdit = item;
    this.showCreateForm = true;
  }

  handleFormSubmitted(formData: RawRequestCommission): void {
    console.log('HANDLE FORM SUBMITTED: Formulář byl odeslán. Data:', formData);
    if (formData.id) {
      console.log(`HANDLE FORM SUBMITTED: Volám updateData pro ID: ${formData.id}.`);
      this.isLoading = true;
      this.updateData(formData.id, formData).subscribe({
        next: (response) => {
          console.log('HANDLE FORM SUBMITTED: Úprava záznamu proběhla úspěšně. Odpověď:', response);
          this.forceFullRefresh();
        },
        error: (err) => {
          console.error('HANDLE FORM SUBMITTED: Chyba při úpravě záznamu:', err);
          this.isLoading = false;
          this.cd.detectChanges();
        }
      });
    } else {
      console.log('HANDLE FORM SUBMITTED: Volám postData pro vytvoření nového záznamu.');
      this.isLoading = true;
      this.postData(formData).subscribe({
        next: (response) => {
          console.log('HANDLE FORM SUBMITTED: Vytvoření nového záznamu proběhlo úspěšně. Odpověď:', response);
          this.forceFullRefresh();
        },
        error: (err) => {
          console.error('HANDLE FORM SUBMITTED: Chyba při odeslání dat:', err);
          this.isLoading = false;
          this.cd.detectChanges();
        }
      });
    }
  }

  onCancelForm() {
    console.log('ON CANCEL FORM: Formulář byl zrušen.');
    this.showCreateForm = false;
    this.selectedItemForEdit = null;
  }
}