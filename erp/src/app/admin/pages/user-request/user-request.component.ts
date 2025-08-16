// import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
// import { CommonModule } from '@angular/common';
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
// import { Observable, of, forkJoin, BehaviorSubject } from 'rxjs';
// import { tap, retry, finalize, filter } from 'rxjs/operators';
// import { FilterColumns } from '../../../shared/interfaces/filter-columns';
// import { GenericFilterFormComponent } from '../../components/generic-filter-form/generic-filter-form.component';
// import { GenericDetailsComponent } from '../../components/generic-details/generic-details.component';
// import { ItemDetailsColumns } from '../../../shared/interfaces/item-details-columns';
// import {
//   USER_REQUEST_BUTTONS,
//   USER_REQUEST_FORM_FIELDS,
//   USER_REQUEST_COLUMNS,
//   USER_REQUEST_TRASH_COLUMNS,
//   USER_REQUEST_STATUS_OPTIONS,
//   USER_REQUEST_PRIORITY_OPTIONS,
//   USER_REQUEST_FILTER_COLUMNS,
//   USER_REQUEST_DETAILS_COLUMNS
// } from './user-request.config';

// @Component({
//   selector: 'app-user-request',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     GenericTableComponent,
//     GenericTrashTableComponent,
//     GenericFormComponent,
//     GenericFilterFormComponent,
//     GenericDetailsComponent,
//     GenericDetailsComponent
// ],
//   templateUrl: './user-request.component.html',
//   styleUrl: './user-request.component.css',
//   changeDetection: ChangeDetectionStrategy.OnPush
// })
// export class UserRequestComponent extends BaseDataComponent<RawRequestCommission> implements OnInit {

//   override apiEndpoint: string = 'raw_request_commissions';
//   override trashData: RawRequestCommission[] = [];
//   override isLoading: boolean = false;
//   isTrashTableLoading: boolean = false;

//   buttons: Buttons[] = USER_REQUEST_BUTTONS;
//   formFields: InputDefinition[] = USER_REQUEST_FORM_FIELDS;
//   userRequestColumns: ColumnDefinition[] = USER_REQUEST_COLUMNS
//   trashUserRequestColumns: ColumnDefinition[] = USER_REQUEST_TRASH_COLUMNS
//   statusOptions: string[] = USER_REQUEST_STATUS_OPTIONS;
//   priorityOptions: string[] = USER_REQUEST_PRIORITY_OPTIONS;
//   filterColumns: FilterColumns[] = USER_REQUEST_FILTER_COLUMNS;
//   detailsColumns: ItemDetailsColumns[] = USER_REQUEST_DETAILS_COLUMNS;
//   filterFormFields: string[] = []
//   showTrashTable: boolean = false;
//   showCreateForm: boolean = false;
//   currentPage: number = 1;
//   itemsPerPage: number = 15;
//   totalItems: number = 0;
//   totalPages: number = 0;
//   showDetails: boolean = false; // Nová proměnná pro zobrazení/skrytí detailů
//   selectedItemForDetails: any | null = null; // Nová proměnná pro data v detailu
//   trashCurrentPage: number = 1;
//   trashItemsPerPage: number = 15;
//   trashTotalItems: number = 0;
//   trashTotalPages: number = 0;
//   filterSearch: string = '';
//   filterStatus: string = '';
//   filterPriority: string = '';
//   filterEmail: string = '';
//   filterSortBy: string = '';
//   filterPhone: string = '';
//   filterThema: string = '';
//   filterDescription: string = '';
//   filterCreatedAt: string = '';
//   filterUpdatedAt: string = '';
//   filterId: string = '';
//   filterSortDirection: 'asc' | 'desc' = 'asc';

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
//     super.ngOnInit();
//     this.authService.isLoggedIn$.subscribe(loggedIn => {
//       if (loggedIn) {
//         this.forceFullRefresh();
//       } else {
//         this.router.navigate(['/auth/login']);
//       }
//     });
//   }

//   loadActiveRequests(): Observable<PaginatedResponse<RawRequestCommission>> {
//     const currentFilters: FilterParams = {
//       search: this.filterSearch,
//       status: this.filterStatus,
//       priority: this.filterPriority,
//       contact_email: this.filterEmail,
//       contact_phone: this.filterPhone,
//       id: this.filterId,
//       order_description:this.filterDescription,
//       thema: this.filterThema,
//       created_at: this.filterCreatedAt, 
//       updated_at: this.filterUpdatedAt,
//       is_deleted: 'false',
//       sort_by: this.filterSortBy,
//       sort_direction: this.filterSortDirection
//     };

//     if (JSON.stringify(currentFilters) !== JSON.stringify(this.currentActiveFilters)) {
//       this.activeRequestsCache.clear();
//       this.currentPage = 1;
//       this.currentActiveFilters = currentFilters;
//     }

//     if (this.activeRequestsCache.has(this.currentPage)) {
//       this.data = this.activeRequestsCache.get(this.currentPage)!;
//       this.cd.detectChanges();
//       this.preloadActivePage(this.currentPage + 1);
//       // Vrátíme observable s daty z cache, aby navazující operace fungovaly stejně
//       return of({
//         data: this.data,
//         current_page: this.currentPage,
//         last_page: this.totalPages,
//         total: this.totalItems
//       } as PaginatedResponse<RawRequestCommission>);
//     }

//     return this.genericTableService.getPaginatedData<RawRequestCommission>(
//       this.apiEndpoint,
//       this.currentPage,
//       this.itemsPerPage,
//       currentFilters
//     ).pipe(
//       retry(1),
//       tap((response: PaginatedResponse<RawRequestCommission>) => {
//         this.data = response.data;
//         this.totalItems = response.total;
//         this.totalPages = response.last_page;
//         this.currentPage = response.current_page;
//         this.activeRequestsCache.set(this.currentPage, response.data);
//         this.cd.detectChanges();
//         this.preloadActivePage(this.currentPage + 1);
//       })
//     );
//   }

//   private preloadActivePage(page: number): void {
//     if (page > this.totalPages || this.activeRequestsCache.has(page)) {
//       return;
//     }

//     const currentFilters: FilterParams = {
//       search: this.filterSearch,
//       status: this.filterStatus,
//       priority: this.filterPriority,
//       contact_email: this.filterEmail,
//       contact_phone: this.filterPhone,
//       id: this.filterId,
//       created_at: this.filterCreatedAt, 
//       updated_at: this.filterUpdatedAt,
//       order_description:this.filterDescription,
//       thema: this.filterThema,
//       is_deleted: 'false',
//       sort_by: this.filterSortBy,
//       sort_direction: this.filterSortDirection
//     };

//     this.genericTableService.getPaginatedData<RawRequestCommission>(
//       this.apiEndpoint,
//       page,
//       this.itemsPerPage,
//       currentFilters
//     ).subscribe({
//       next: (response: PaginatedResponse<RawRequestCommission>) => {
//         this.activeRequestsCache.set(page, response.data);
//       },
//       error: (error) => {
//       }
//     });
//   }

//   loadTrashRequests(): Observable<PaginatedResponse<RawRequestCommission>> {
//     // Vytvoříme objekt filtrů. Klíč 'only_trashed' je zde specifický pro tuto tabulku.
//     const trashFilters: FilterParams = {
//       only_trashed: 'true',
//       search: this.filterSearch,
//       status: this.filterStatus,
//       priority: this.filterPriority,
//       contact_email: this.filterEmail,
//       contact_phone: this.filterPhone,
//       id: this.filterId,
//       created_at: this.filterCreatedAt, 
//       updated_at: this.filterUpdatedAt,
//       order_description:this.filterDescription,
//       thema: this.filterThema,
//       sort_by: this.filterSortBy,
//       sort_direction: this.filterSortDirection
//     };

//     if (JSON.stringify(trashFilters) !== JSON.stringify(this.currentTrashFilters)) {
//       this.trashRequestsCache.clear();
//       this.trashCurrentPage = 1;
//       this.currentTrashFilters = trashFilters;
//     }

//     if (this.trashRequestsCache.has(this.trashCurrentPage)) {
//       this.trashData = this.trashRequestsCache.get(this.trashCurrentPage)!;
//       this.cd.detectChanges();
//       this.preloadTrashPage(this.trashCurrentPage + 1);
//       return of({
//         data: this.trashData,
//         current_page: this.trashCurrentPage,
//         last_page: this.trashTotalPages,
//         total: this.trashTotalItems
//       } as PaginatedResponse<RawRequestCommission>);
//     }

//     return this.genericTableService.getPaginatedData<RawRequestCommission>(
//       this.apiEndpoint,
//       this.trashCurrentPage,
//       this.trashItemsPerPage,
//       trashFilters
//     ).pipe(
//       retry(1),
//       tap((response: PaginatedResponse<RawRequestCommission>) => {
//         this.trashData = response.data;
//         this.trashTotalItems = response.total;
//         this.trashTotalPages = response.last_page;
//         this.trashCurrentPage = response.current_page;
//         this.trashRequestsCache.set(this.trashCurrentPage, response.data);
//         this.cd.detectChanges();
//         this.preloadTrashPage(this.trashCurrentPage + 1);
//       })
//     );
//   }

//   private preloadTrashPage(page: number): void {
//     if (page > this.trashTotalPages || this.trashRequestsCache.has(page)) {
//       return;
//     }

//     const trashFilters: FilterParams = {
//       only_trashed: 'true',
//       search: this.filterSearch,
//       status: this.filterStatus,
//       priority: this.filterPriority,
//       contact_email: this.filterEmail,
//       id: this.filterId,
//       created_at: this.filterCreatedAt, 
//       updated_at: this.filterUpdatedAt,
//       contact_phone: this.filterPhone,
//       order_description:this.filterDescription,
//       thema: this.filterThema,
//       sort_by: this.filterSortBy,
//       sort_direction: this.filterSortDirection
//     };

//     this.genericTableService.getPaginatedData<RawRequestCommission>(
//       this.apiEndpoint,
//       page,
//       this.trashItemsPerPage,
//       trashFilters
//     ).subscribe({
//       next: (response: PaginatedResponse<RawRequestCommission>) => {
//         this.trashRequestsCache.set(page, response.data);
//       },
//       error: (error) => {
//       }
//     });
//   }

//   toggleTable(): void {
//     this.showTrashTable = !this.showTrashTable;
//     this.forceFullRefresh();
//   }

//   // Tady se získávají filtry a sestavuje se objekt, který je pak předán dál
//   applyFilters(filters: any): void {
//     this.filterSearch = filters.search || '';
//     this.filterStatus = filters.status || '';
//     this.filterPriority = filters.priority || '';
//     this.filterEmail = filters.contact_email || '';
//     this.filterPhone = filters.contact_phone || '';
//     this.filterThema = filters.thema || '';
//     this.filterCreatedAt = filters.created_at || '';
//     this.filterUpdatedAt = filters.updated_at || '';
//     this.filterId = filters.id || '';
//     this.filterDescription = filters.order_description || '';
//     this.filterSortBy = filters.sort_by || ''; // Pozor na název, měl by odpovídat konfiguraci
//     this.filterSortDirection = filters.sort_direction || 'asc';
//     this.forceFullRefresh();
//   }

//   clearFilters(): void {
//     this.filterSearch = '';
//     this.filterStatus = '';
//     this.filterPriority = '';
//     this.filterEmail = '';
//     this.filterPhone = '';
//     this.filterThema = '';
//     this.filterId = '';
//     this.filterCreatedAt = '';
//     this.filterUpdatedAt = '';
//     this.filterDescription = '';
//     this.filterSortBy = '';
//     this.filterSortDirection = 'asc';
//     this.forceFullRefresh();
// }

//   goToPage(page: number): void {
//     if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
//       this.currentPage = page;
//       this.loadActiveRequests().subscribe();
//     }
//   }

//   goToTrashPage(page: number): void {
//     if (page >= 1 && page <= this.trashTotalPages && page !== this.trashCurrentPage) {
//       this.trashCurrentPage = page;
//       this.loadTrashRequests().subscribe();
//     }
//   }

//   onItemsPerPageChange(event: Event): void {
//     const selectElement = event.target as HTMLSelectElement;
//     const newItemsPerPage = Number(selectElement.value);
//     if (newItemsPerPage !== this.itemsPerPage) {
//       this.itemsPerPage = newItemsPerPage;
//       this.forceFullRefresh();
//     }
//   }

//   onTrashItemsPerPageChange(event: Event): void {
//     const selectElement = event.target as HTMLSelectElement;
//     const newItemsPerPage = Number(selectElement.value);
//     if (newItemsPerPage !== this.trashItemsPerPage) {
//       this.trashItemsPerPage = newItemsPerPage;
//       this.forceFullRefresh();
//     }
//   }

//   private getPaginationArray(currentPage: number, totalPages: number): number[] {
//     const maxPagesToShow = 5;
//     let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
//     let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

//     if (endPage - startPage + 1 < maxPagesToShow) {
//       startPage = Math.max(1, endPage - maxPagesToShow + 1);
//     }

//     const pages = [];
//     for (let i = startPage; i <= endPage; i++) {
//       pages.push(i);
//     }
//     return pages;
//   }

//   get pagesArray(): number[] {
//     return this.getPaginationArray(this.currentPage, this.totalPages);
//   }

//   get trashPagesArray(): number[] {
//     return this.getPaginationArray(this.trashCurrentPage, this.trashTotalPages);
//   }

//   handleItemRestored(): void {
//     this.forceFullRefresh();
//   }

//   handleItemDeleted(): void {
//     this.forceFullRefresh();
//   }

//   private forceFullRefresh(): void {
//     this.activeRequestsCache.clear();
//     this.trashRequestsCache.clear();
//     this.currentPage = 1;
//     this.trashCurrentPage = 1;
//     this.isLoading = true;
//     this.isTrashTableLoading = true;
//     this.cd.detectChanges();

//     forkJoin([
//       this.loadActiveRequests(),
//       this.loadTrashRequests()
//     ]).pipe(
//       finalize(() => {
//         this.isLoading = false;
//         this.isTrashTableLoading = false;
//         this.cd.detectChanges();
//       })
//     ).subscribe();
//   }

//   handleCreateFormOpened(): void {
//     this.selectedItemForEdit = null;
//     this.showCreateForm = !this.showCreateForm;
//   }

//   handleEditFormOpened(item: RawRequestCommission): void {
//     this.selectedItemForEdit = item;
//     this.showCreateForm = true;
//   }

//   handleFormSubmitted(formData: RawRequestCommission): void {
//     this.showCreateForm = false;
//     if (formData.id) {
//       this.isLoading = true;
//       this.updateData(formData.id, formData).subscribe({
//         next: (response) => {
//           this.forceFullRefresh();
//         },
//         error: (err) => {
//           this.isLoading = false;
//           this.cd.detectChanges();
//         }
//       });
//     } else {
//       this.isLoading = true;
//       this.postData(formData).subscribe({
//         next: (response) => {
//           this.forceFullRefresh();
//         },
//         error: (err) => {
//           this.isLoading = false;
//           this.cd.detectChanges();
//         }
//       });
//     }
//   }

//   onCancelForm() {
//     this.showCreateForm = false;
//     this.selectedItemForEdit = null;
//   }

//   trackById(index: number, item: RawRequestCommission): number {
//     return item.id!;
//   }

//    handleViewDetails(item: RawRequestCommission): void {
//     if (item.id === undefined || item.id === null) {
//       return;
//     }
//     this.errorMessage = null;

//     this.getItemDetails(item.id).subscribe({
//       next: (details) => {
//         this.selectedItemForDetails = details;
//         this.showDetails = true;
//         this.isLoading = false;
//         this.cd.markForCheck(); // Ujistěte se, že Angular detekuje změnu
//       },
//       error: (err) => {
//         this.isLoading = false;
//         this.errorMessage = 'Nepodařilo se načíst detaily položky.';
//         this.cd.markForCheck();
//       }
//     });
//   }
//   handleCloseDetails(): void {
//     this.selectedItemForDetails = null;
//     this.showDetails = false;
//   }
// }

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { Observable, of, forkJoin, BehaviorSubject } from 'rxjs';
import { tap, retry, finalize, filter } from 'rxjs/operators';
import { FilterColumns } from '../../../shared/interfaces/filter-columns';
import { GenericFilterFormComponent } from '../../components/generic-filter-form/generic-filter-form.component';
import { GenericDetailsComponent } from '../../components/generic-details/generic-details.component';
import { ItemDetailsColumns } from '../../../shared/interfaces/item-details-columns';
import {
  USER_REQUEST_BUTTONS,
  USER_REQUEST_FORM_FIELDS,
  USER_REQUEST_COLUMNS,
  USER_REQUEST_TRASH_COLUMNS,
  USER_REQUEST_STATUS_OPTIONS,
  USER_REQUEST_PRIORITY_OPTIONS,
  USER_REQUEST_FILTER_COLUMNS,
  USER_REQUEST_DETAILS_COLUMNS
} from './user-request.config';

@Component({
  selector: 'app-user-request',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GenericTableComponent,
    GenericTrashTableComponent,
    GenericFormComponent,
    GenericFilterFormComponent,
    GenericDetailsComponent
  ],
  templateUrl: './user-request.component.html',
  styleUrl: './user-request.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserRequestComponent extends BaseDataComponent<RawRequestCommission> implements OnInit {

  override apiEndpoint: string = 'raw_request_commissions';
  override trashData: RawRequestCommission[] = [];
  override isLoading: boolean = false;
  isTrashTableLoading: boolean = false;

  buttons: Buttons[] = USER_REQUEST_BUTTONS;
  formFields: InputDefinition[] = USER_REQUEST_FORM_FIELDS;
  userRequestColumns: ColumnDefinition[] = USER_REQUEST_COLUMNS
  trashUserRequestColumns: ColumnDefinition[] = USER_REQUEST_TRASH_COLUMNS
  statusOptions: string[] = USER_REQUEST_STATUS_OPTIONS;
  priorityOptions: string[] = USER_REQUEST_PRIORITY_OPTIONS;
  filterColumns: FilterColumns[] = USER_REQUEST_FILTER_COLUMNS;
  detailsColumns: ItemDetailsColumns[] = USER_REQUEST_DETAILS_COLUMNS;
  filterFormFields: string[] = []
  showTrashTable: boolean = false;
  showCreateForm: boolean = false;
  currentPage: number = 1;
  itemsPerPage: number = 15;
  totalItems: number = 0;
  totalPages: number = 0;
  showDetails: boolean = false;
  selectedItemForDetails: any | null = null;
  trashCurrentPage: number = 1;
  trashItemsPerPage: number = 15;
  trashTotalItems: number = 0;
  trashTotalPages: number = 0;
  filterSearch: string = '';
  filterStatus: string = '';
  filterPriority: string = '';
  filterEmail: string = '';
  filterSortBy: string = '';
  filterPhone: string = '';
  filterThema: string = '';
  filterDescription: string = '';
  filterCreatedAt: string = '';
  filterUpdatedAt: string = '';
  filterId: string = '';
  filterSortDirection: 'asc' | 'desc' = 'asc';

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
    super.ngOnInit();
    this.authService.isLoggedIn$.subscribe(loggedIn => {
      if (loggedIn) {
        this.forceFullRefresh();
      } else {
        this.router.navigate(['/auth/login']);
      }
    });
  }

  private getBaseFilters(): FilterParams {
    return {
      search: this.filterSearch,
      status: this.filterStatus,
      priority: this.filterPriority,
      contact_email: this.filterEmail,
      contact_phone: this.filterPhone,
      id: this.filterId,
      order_description: this.filterDescription,
      thema: this.filterThema,
      created_at: this.filterCreatedAt,
      updated_at: this.filterUpdatedAt,
      sort_by: this.filterSortBy,
      sort_direction: this.filterSortDirection
    };
  }

  // Přejmenovaná metoda, která nahradila původní 'loadData'
  private fetchPaginatedData(
    isTrash: boolean,
    page: number,
    itemsPerPage: number,
    cache: Map<number, RawRequestCommission[]>,
    currentFilters: FilterParams
  ): Observable<PaginatedResponse<RawRequestCommission>> {
    const newFilters = this.getBaseFilters();
    if (isTrash) {
      newFilters['only_trashed'] = 'true';
    } else {
      newFilters['is_deleted'] = 'false';
    }

    if (JSON.stringify(newFilters) !== JSON.stringify(currentFilters)) {
      cache.clear();
      if (isTrash) {
        this.trashCurrentPage = 1;
        this.currentTrashFilters = newFilters;
      } else {
        this.currentPage = 1;
        this.currentActiveFilters = newFilters;
      }
    }

    if (cache.has(page)) {
      const cachedData = cache.get(page)!;
      if (isTrash) {
        this.trashData = cachedData;
      } else {
        this.data = cachedData;
      }
      this.cd.detectChanges();
      this.preloadPage(isTrash, page + 1, itemsPerPage, cache);
      return of({
        data: cachedData,
        current_page: page,
        last_page: isTrash ? this.trashTotalPages : this.totalPages,
        total: isTrash ? this.trashTotalItems : this.totalItems
      } as PaginatedResponse<RawRequestCommission>);
    }

    return this.genericTableService.getPaginatedData<RawRequestCommission>(
      this.apiEndpoint,
      page,
      itemsPerPage,
      newFilters
    ).pipe(
      retry(1),
      tap((response: PaginatedResponse<RawRequestCommission>) => {
        if (isTrash) {
          this.trashData = response.data;
          this.trashTotalItems = response.total;
          this.trashTotalPages = response.last_page;
          this.trashCurrentPage = response.current_page;
        } else {
          this.data = response.data;
          this.totalItems = response.total;
          this.totalPages = response.last_page;
          this.currentPage = response.current_page;
        }
        cache.set(page, response.data);
        this.cd.detectChanges();
        this.preloadPage(isTrash, page + 1, itemsPerPage, cache);
      })
    );
  }

  private preloadPage(
    isTrash: boolean,
    page: number,
    itemsPerPage: number,
    cache: Map<number, RawRequestCommission[]>
  ): void {
    const totalPages = isTrash ? this.trashTotalPages : this.totalPages;
    if (page > totalPages || cache.has(page)) {
      return;
    }

    const filters = this.getBaseFilters();
    if (isTrash) {
      filters['only_trashed'] = 'true';
    } else {
      filters['is_deleted'] = 'false';
    }

    this.genericTableService.getPaginatedData<RawRequestCommission>(
      this.apiEndpoint,
      page,
      itemsPerPage,
      filters
    ).subscribe({
      next: (response: PaginatedResponse<RawRequestCommission>) => {
        cache.set(page, response.data);
      },
      error: (error) => {
        // Handle error silently, as it's a preload
      }
    });
  }

  loadActiveRequests(): Observable<PaginatedResponse<RawRequestCommission>> {
    return this.fetchPaginatedData(false, this.currentPage, this.itemsPerPage, this.activeRequestsCache, this.currentActiveFilters);
  }

  loadTrashRequests(): Observable<PaginatedResponse<RawRequestCommission>> {
    return this.fetchPaginatedData(true, this.trashCurrentPage, this.trashItemsPerPage, this.trashRequestsCache, this.currentTrashFilters);
  }

  toggleTable(): void {
    this.showTrashTable = !this.showTrashTable;
    this.forceFullRefresh();
  }

  applyFilters(filters: any): void {
    this.filterSearch = filters.search || '';
    this.filterStatus = filters.status || '';
    this.filterPriority = filters.priority || '';
    this.filterEmail = filters.contact_email || '';
    this.filterPhone = filters.contact_phone || '';
    this.filterThema = filters.thema || '';
    this.filterCreatedAt = filters.created_at || '';
    this.filterUpdatedAt = filters.updated_at || '';
    this.filterId = filters.id || '';
    this.filterDescription = filters.order_description || '';
    this.filterSortBy = filters.sort_by || '';
    this.filterSortDirection = filters.sort_direction || 'asc';
    this.forceFullRefresh();
  }

  clearFilters(): void {
    this.filterSearch = '';
    this.filterStatus = '';
    this.filterPriority = '';
    this.filterEmail = '';
    this.filterPhone = '';
    this.filterThema = '';
    this.filterId = '';
    this.filterCreatedAt = '';
    this.filterUpdatedAt = '';
    this.filterDescription = '';
    this.filterSortBy = '';
    this.filterSortDirection = 'asc';
    this.forceFullRefresh();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadActiveRequests().subscribe();
    }
  }

  goToTrashPage(page: number): void {
    if (page >= 1 && page <= this.trashTotalPages && page !== this.trashCurrentPage) {
      this.trashCurrentPage = page;
      this.loadTrashRequests().subscribe();
    }
  }

  onItemsPerPageChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const newItemsPerPage = Number(selectElement.value);
    if (newItemsPerPage !== this.itemsPerPage) {
      this.itemsPerPage = newItemsPerPage;
      this.forceFullRefresh();
    }
  }

  onTrashItemsPerPageChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const newItemsPerPage = Number(selectElement.value);
    if (newItemsPerPage !== this.trashItemsPerPage) {
      this.trashItemsPerPage = newItemsPerPage;
      this.forceFullRefresh();
    }
  }

  private getPaginationArray(currentPage: number, totalPages: number): number[] {
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  get pagesArray(): number[] {
    return this.getPaginationArray(this.currentPage, this.totalPages);
  }

  get trashPagesArray(): number[] {
    return this.getPaginationArray(this.trashCurrentPage, this.trashTotalPages);
  }

  handleItemRestored(): void {
    this.forceFullRefresh();
  }

  handleItemDeleted(): void {
    this.forceFullRefresh();
  }

  private forceFullRefresh(): void {
    this.activeRequestsCache.clear();
    this.trashRequestsCache.clear();
    this.currentPage = 1;
    this.trashCurrentPage = 1;
    this.isLoading = true;
    this.isTrashTableLoading = true;
    this.cd.detectChanges();

    forkJoin([
      this.loadActiveRequests(),
      this.loadTrashRequests()
    ]).pipe(
      finalize(() => {
        this.isLoading = false;
        this.isTrashTableLoading = false;
        this.cd.detectChanges();
      })
    ).subscribe();
  }

  handleCreateFormOpened(): void {
    this.selectedItemForEdit = null;
    this.showCreateForm = !this.showCreateForm;
  }

  handleEditFormOpened(item: RawRequestCommission): void {
    this.selectedItemForEdit = item;
    this.showCreateForm = true;
  }

  handleFormSubmitted(formData: RawRequestCommission): void {
    this.showCreateForm = false;
    this.isLoading = true;

    let request$: Observable<any>;
    if (formData.id) {
      request$ = this.updateData(formData.id, formData);
    } else {
      request$ = this.postData(formData);
    }

    request$.pipe(
      finalize(() => {
        this.isLoading = false;
        this.cd.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.forceFullRefresh();
      },
      error: (err) => {
        // Handle error
      }
    });
  }

  onCancelForm() {
    this.showCreateForm = false;
    this.selectedItemForEdit = null;
  }

  trackById(index: number, item: RawRequestCommission): number {
    return item.id!;
  }

  handleViewDetails(item: RawRequestCommission): void {
    if (item.id === undefined || item.id === null) {
      return;
    }
    this.errorMessage = null;

    this.isLoading = true;
    this.getItemDetails(item.id).subscribe({
      next: (details) => {
        this.selectedItemForDetails = details;
        this.showDetails = true;
        this.isLoading = false;
        this.cd.markForCheck();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Nepodařilo se načíst detaily položky.';
        this.cd.markForCheck();
      }
    });
  }

  handleCloseDetails(): void {
    this.selectedItemForDetails = null;
    this.showDetails = false;
  }
}