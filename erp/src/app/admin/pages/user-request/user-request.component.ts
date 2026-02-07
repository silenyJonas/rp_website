import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
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
import { Observable, of, forkJoin } from 'rxjs';
import { tap, retry, finalize } from 'rxjs/operators';
import { FilterColumns } from '../../../shared/interfaces/filter-columns';
import { GenericFilterFormComponent } from '../../components/generic-filter-form/generic-filter-form.component';
import { GenericDetailsComponent } from '../../components/generic-details/generic-details.component';
import { ItemDetailsColumns } from '../../../shared/interfaces/item-details-columns';
import { HasPermissionDirective } from '../../../core/directives/has-permission.directive';
import { PaginationButtonsComponent } from '../../components/pagination-buttons/pagination-buttons.component';
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
    CommonModule, FormsModule, GenericTableComponent, GenericTrashTableComponent,
    GenericFormComponent, GenericFilterFormComponent, GenericDetailsComponent,
    HasPermissionDirective, PaginationButtonsComponent
  ],
  templateUrl: './user-request.component.html',
  styleUrl: '../default-style.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserRequestComponent extends BaseDataComponent<RawRequestCommission> implements OnInit {
  // Reference na tabulku pro volání exportu
  @ViewChild('activeTable') activeTable!: GenericTableComponent;

  override apiEndpoint: string = 'raw_request_commissions';
  override trashData: RawRequestCommission[] = [];
  override isLoading: boolean = false;
  
  // UI stavy
  isTableFullWidth: boolean = true;
  isFilterVisible: boolean = false;
  showTrashTable: boolean = false;
  showCreateForm: boolean = false;
  showDetails: boolean = false;

  // Konfigurace z config souboru
  buttons: Buttons[] = USER_REQUEST_BUTTONS;
  formFields: InputDefinition[] = USER_REQUEST_FORM_FIELDS;
  userRequestColumns: ColumnDefinition[] = USER_REQUEST_COLUMNS;
  trashUserRequestColumns: ColumnDefinition[] = USER_REQUEST_TRASH_COLUMNS;
  filterColumns: FilterColumns[] = USER_REQUEST_FILTER_COLUMNS;
  detailsColumns: ItemDetailsColumns[] = USER_REQUEST_DETAILS_COLUMNS;

  // Stránkování - Aktivní
  currentPage: number = 1;
  itemsPerPage: number = 15;
  totalItems: number = 0;
  totalPages: number = 0;

  // Stránkování - Koš
  trashCurrentPage: number = 1;
  trashItemsPerPage: number = 15;
  trashTotalItems: number = 0;
  trashTotalPages: number = 0;

  // Filtry
  filterSearch = ''; filterStatus = ''; filterPriority = ''; filterEmail = '';
  filterPhone = ''; filterThema = ''; filterDescription = ''; filterCreatedAt = '';
  filterUpdatedAt = ''; filterId = ''; filterSortBy = '';
  filterSortDirection: 'asc' | 'desc' = 'desc';

  private activeRequestsCache: Map<number, RawRequestCommission[]> = new Map();
  private trashRequestsCache: Map<number, RawRequestCommission[]> = new Map();
  private currentActiveFilters: FilterParams = {};
  private currentTrashFilters: FilterParams = {};

  selectedItemForEdit: RawRequestCommission | null = null;
  selectedItemForDetails: any | null = null;

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
      if (loggedIn) this.forceFullRefresh();
      else this.router.navigate(['/auth/login']);
    });
  }

  public refreshData(): void {
    this.forceFullRefresh();
  }

  exportActiveTable(): void {
    if (this.activeTable) {
      this.activeTable.exportToCSV();
    }
  }

  private getBaseFilters(): FilterParams {
    return {
      search: this.filterSearch, status: this.filterStatus, priority: this.filterPriority,
      contact_email: this.filterEmail, contact_phone: this.filterPhone, id: this.filterId,
      order_description: this.filterDescription, thema: this.filterThema,
      created_at: this.filterCreatedAt, updated_at: this.filterUpdatedAt,
      sort_by: this.filterSortBy, sort_direction: this.filterSortDirection
    };
  }

  private fetchPaginatedData(
    isTrash: boolean, page: number, itemsPerPage: number,
    cache: Map<number, RawRequestCommission[]>, currentFilters: FilterParams
  ): Observable<PaginatedResponse<RawRequestCommission>> {
    const newFilters = this.getBaseFilters();
    isTrash ? newFilters['only_trashed'] = 'true' : newFilters['is_deleted'] = 'false';

    if (JSON.stringify(newFilters) !== JSON.stringify(currentFilters)) {
      cache.clear();
      if (isTrash) { this.trashCurrentPage = 1; this.currentTrashFilters = newFilters; }
      else { this.currentPage = 1; this.currentActiveFilters = newFilters; }
    }

    if (cache.has(page)) {
      const cachedData = cache.get(page)!;
      isTrash ? this.trashData = cachedData : this.data = cachedData;
      this.cd.detectChanges();
      return of({ data: cachedData, current_page: page, last_page: isTrash ? this.trashTotalPages : this.totalPages, total: isTrash ? this.trashTotalItems : this.totalItems } as PaginatedResponse<RawRequestCommission>);
    }

    return this.genericTableService.getPaginatedData<RawRequestCommission>(this.apiEndpoint, page, itemsPerPage, newFilters).pipe(
      retry(1),
      tap(response => {
        if (isTrash) {
          this.trashData = response.data; this.trashTotalItems = response.total;
          this.trashTotalPages = response.last_page; this.trashCurrentPage = response.current_page;
        } else {
          this.data = response.data; this.totalItems = response.total;
          this.totalPages = response.last_page; this.currentPage = response.current_page;
        }
        cache.set(page, response.data);
        this.cd.detectChanges();
      })
    );
  }

  loadActiveRequests() { return this.fetchPaginatedData(false, this.currentPage, this.itemsPerPage, this.activeRequestsCache, this.currentActiveFilters); }
  loadTrashRequests() { return this.fetchPaginatedData(true, this.trashCurrentPage, this.trashItemsPerPage, this.trashRequestsCache, this.currentTrashFilters); }

  toggleTable(): void {
    this.showTrashTable = !this.showTrashTable;
    this.forceFullRefresh();
  }

  toggleFilters() { this.isFilterVisible = !this.isFilterVisible; }

  applyFilters(filters: any): void {
    this.filterSearch = filters.search || ''; this.filterStatus = filters.status || '';
    this.filterPriority = filters.priority || ''; this.filterEmail = filters.contact_email || '';
    this.filterPhone = filters.contact_phone || ''; this.filterThema = filters.thema || '';
    this.filterCreatedAt = filters.created_at || ''; this.filterUpdatedAt = filters.updated_at || '';
    this.filterId = filters.id || ''; this.filterDescription = filters.order_description || '';
    this.filterSortBy = filters.sort_by || ''; this.filterSortDirection = filters.sort_direction || 'asc';
    this.forceFullRefresh();
  }

  clearFilters(): void {
    this.filterSearch = ''; this.filterStatus = ''; this.filterPriority = '';
    this.filterEmail = ''; this.filterPhone = ''; this.filterThema = '';
    this.filterId = ''; this.filterCreatedAt = ''; this.filterUpdatedAt = '';
    this.filterDescription = ''; this.filterSortBy = ''; this.filterSortDirection = 'desc';
    this.forceFullRefresh();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page; this.loadActiveRequests().subscribe();
    }
  }

  // Původní: onItemsPerPageChange(event: Event): void { ... }
  onItemsPerPageChange(value: number): void {
    this.itemsPerPage = value; // 'value' už je číslo díky EventEmitteru
    this.forceFullRefresh();
  }
// Obsluha změny stránky
onHandlePageChange(page: number): void {
  if (this.showTrashTable) {
    // Logika pro koš
    if (page >= 1 && page <= this.trashTotalPages && page !== this.trashCurrentPage) {
      this.trashCurrentPage = page;
      this.loadTrashRequests().subscribe();
    }
  } else {
    // Logika pro aktivní data
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadActiveRequests().subscribe();
    }
  }
}

// Obsluha změny počtu položek (vaše původní metoda, upravená na číslo)
onHandleItemsPerPageChange(value: number): void {
  if (this.showTrashTable) {
    this.trashItemsPerPage = value;
    this.trashCurrentPage = 1; // Reset na první stranu při změně limitu
    this.trashRequestsCache.clear(); // Vymazat cache pro koš
    this.loadTrashRequests().subscribe();
  } else {
    this.itemsPerPage = value;
    this.currentPage = 1; // Reset na první stranu
    this.activeRequestsCache.clear(); // Vymazat cache pro aktivní
    this.loadActiveRequests().subscribe();
  }
}
  private forceFullRefresh(): void {
    this.activeRequestsCache.clear(); this.trashRequestsCache.clear();
    this.isLoading = true;
    this.cd.detectChanges();
    forkJoin([this.loadActiveRequests(), this.loadTrashRequests()]).pipe(
      finalize(() => { this.isLoading = false; this.cd.detectChanges(); })
    ).subscribe();
  }

  handleCreateFormOpened(): void { this.selectedItemForEdit = null; this.showCreateForm = true; }
  handleEditFormOpened(item: RawRequestCommission): void { this.selectedItemForEdit = item; this.showCreateForm = true; }

  handleFormSubmitted(formData: RawRequestCommission): void {
    this.showCreateForm = false;
    this.isLoading = true;
    const request$ = formData.id ? this.updateData(formData.id, formData) : this.postData(formData);
    request$.pipe(finalize(() => { this.isLoading = false; this.cd.detectChanges(); })).subscribe(() => this.forceFullRefresh());
  }

  onCancelForm() { this.showCreateForm = false; this.selectedItemForEdit = null; }

  handleViewDetails(item: RawRequestCommission): void {
    if (!item.id) return;
    this.isLoading = true;
    this.getItemDetails(item.id).subscribe({
      next: (details) => { this.selectedItemForDetails = details; this.showDetails = true; this.isLoading = false; this.cd.markForCheck(); },
      error: () => { this.isLoading = false; this.cd.markForCheck(); }
    });
  }

  handleCloseDetails() { this.selectedItemForDetails = null; this.showDetails = false; }
  
  get pagesArray(): number[] {
    const max = 5;
    let start = Math.max(1, this.currentPage - Math.floor(max / 2));
    let end = Math.min(this.totalPages, start + max - 1);
    if (end - start + 1 < max) start = Math.max(1, end - max + 1);
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  handleItemRestored() { this.forceFullRefresh(); }
  handleItemDeleted() { this.forceFullRefresh(); }
}