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
import { GenericFormComponent } from '../../components/generic-form/generic-form.component';
import { Observable, of, finalize } from 'rxjs';
import { tap, retry } from 'rxjs/operators';
import { FilterColumns } from '../../../shared/interfaces/filter-columns';
import { GenericFilterFormComponent } from '../../components/generic-filter-form/generic-filter-form.component';
import { GenericDetailsComponent } from '../../components/generic-details/generic-details.component';
import { ItemDetailsColumns } from '../../../shared/interfaces/item-details-columns';
import {
  BUTTONS,
  TABLE_COLUMNS,
  FILTER_COLUMNS,
  DETAILS_COLUMNS
} from './business-logs.config';

type ItemType = any; // You should replace 'any' with the specific interface if needed, e.g., RawRequestCommission

@Component({
  selector: 'app-administrators',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GenericTableComponent,
    GenericFormComponent,
    GenericFilterFormComponent,
    GenericDetailsComponent
  ],
  templateUrl: './business-logs.component.html',
  styleUrl: './business-logs.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusinessLogsComponent extends BaseDataComponent<ItemType> implements OnInit {

  // Proměnné týkající se koše byly odstraněny, protože se v HTML nepoužívají
  override apiEndpoint: string = 'business_logs';
  override isLoading: boolean = false;
  override errorMessage: string | null = null;

  buttons: Buttons[] = BUTTONS;
  tableColumns: ColumnDefinition[] = TABLE_COLUMNS;
  filterColumns: FilterColumns[] = FILTER_COLUMNS;
  detailsColumns: ItemDetailsColumns[] = DETAILS_COLUMNS;
  showCreateForm: boolean = false;
  currentPage: number = 1;
  itemsPerPage: number = 15;
  totalItems: number = 0;
  totalPages: number = 0;
  showDetails: boolean = false;
  selectedItemForDetails: any | null = null;

  // Proměnné filtrů
  filterUserLoginId: string = '';
  filterUserEmail: string = '';
  filterLastLoginAt: string = '';
  filterCreatedAt: string = '';
  filterUpdatedAt: string = '';
  filterRoleName: string = '';
  filterSortBy: string = '';
  filterSortDirection: 'asc' | 'desc' = 'asc';

  private activeRequestsCache: Map<number, ItemType[]> = new Map();
  private currentActiveFilters: FilterParams = {};
  selectedItemForEdit: ItemType | null = null;

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

  public refreshData(): void {
    this.forceFullRefresh();
  }

  private getBaseFilters(): FilterParams {
    const filters: FilterParams = {
      user_login_id: this.filterUserLoginId,
      user_email: this.filterUserEmail,
      last_login_at: this.filterLastLoginAt,
      created_at: this.filterCreatedAt,
      updated_at: this.filterUpdatedAt,
      sort_by: this.filterSortBy,
      sort_direction: this.filterSortDirection
    };

    if (this.filterRoleName) {
      filters['role_name'] = this.filterRoleName;
    }

    return filters;
  }

  // Zjednodušená metoda, která pracuje pouze s aktivními daty
  private fetchPaginatedData(
    page: number,
    itemsPerPage: number,
    cache: Map<number, ItemType[]>,
    currentFilters: FilterParams
  ): Observable<PaginatedResponse<ItemType>> {
    this.errorMessage = null;
    const newFilters = this.getBaseFilters();
    newFilters['is_deleted'] = 'false'; // Pouze pro aktivní položky

    console.log('Sending filters to backend:', newFilters);

    if (JSON.stringify(newFilters) !== JSON.stringify(currentFilters)) {
      cache.clear();
      this.currentPage = 1;
      this.currentActiveFilters = newFilters;
    }

    if (cache.has(page)) {
      const cachedData = cache.get(page)!;
      this.data = cachedData;
      this.cd.detectChanges();
      this.preloadPage(page + 1, itemsPerPage, cache);
      return of({
        data: cachedData,
        current_page: page,
        last_page: this.totalPages,
        total: this.totalItems
      } as PaginatedResponse<ItemType>);
    }

    return this.genericTableService.getPaginatedData<ItemType>(
      this.apiEndpoint,
      page,
      itemsPerPage,
      newFilters
    ).pipe(
      retry(1),
      tap((response: PaginatedResponse<ItemType>) => {
        this.data = response.data;
        this.totalItems = response.total;
        this.totalPages = response.last_page;
        this.currentPage = response.current_page;
        cache.set(page, response.data);
        this.cd.detectChanges();
        this.preloadPage(page + 1, itemsPerPage, cache);
      })
    );
  }

  // Zjednodušená metoda preload
  private preloadPage(
    page: number,
    itemsPerPage: number,
    cache: Map<number, ItemType[]>
  ): void {
    if (page > this.totalPages || cache.has(page)) {
      return;
    }

    const filters = this.getBaseFilters();
    filters['is_deleted'] = 'false';

    this.genericTableService.getPaginatedData<ItemType>(
      this.apiEndpoint,
      page,
      itemsPerPage,
      filters
    ).subscribe({
      next: (response: PaginatedResponse<ItemType>) => {
        cache.set(page, response.data);
      },
      error: (error) => {
        // Handle error silently, as it's a preload
      }
    });
  }

  loadActiveRequests(): Observable<PaginatedResponse<ItemType>> {
    return this.fetchPaginatedData(this.currentPage, this.itemsPerPage, this.activeRequestsCache, this.currentActiveFilters);
  }

  // Odstraněna metoda loadTrashRequests

  applyFilters(filters: any): void {
    this.filterUserLoginId = filters.user_login_id || '';
    this.filterUserEmail = filters.user_email || '';
    this.filterLastLoginAt = filters.last_login_at || '';
    this.filterCreatedAt = filters.created_at || '';
    this.filterUpdatedAt = filters.updated_at || '';
    this.filterRoleName = filters.role_name || '';
    this.filterSortBy = filters.sort_by || '';
    this.filterSortDirection = filters.sort_direction || 'asc';
    this.forceFullRefresh();
  }

  clearFilters(): void {
    this.filterUserLoginId = '';
    this.filterUserEmail = '';
    this.filterLastLoginAt = '';
    this.filterCreatedAt = '';
    this.filterUpdatedAt = '';
    this.filterRoleName = '';
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

  onItemsPerPageChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const newItemsPerPage = Number(selectElement.value);
    if (newItemsPerPage !== this.itemsPerPage) {
      this.itemsPerPage = newItemsPerPage;
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

  handleItemRestored(): void {
    this.forceFullRefresh();
  }

  handleItemDeleted(): void {
    this.forceFullRefresh();
  }

  public forceFullRefresh(): void {
    this.activeRequestsCache.clear();
    this.currentPage = 1;
    this.isLoading = true;
    this.cd.detectChanges();

    this.loadActiveRequests().pipe(
      finalize(() => {
        this.isLoading = false;
        this.cd.detectChanges();
      })
    ).subscribe();
  }

  handleCreateFormOpened(): void {
    this.selectedItemForEdit = null;
    this.showCreateForm = !this.showCreateForm;
  }

  handleEditFormOpened(item: ItemType): void {
    const itemToEdit = { ...item };

    if (itemToEdit.roles && itemToEdit.roles.length > 0) {
      itemToEdit.role_id = itemToEdit.roles[0].role_id;
    }

    this.selectedItemForEdit = itemToEdit;
    this.showCreateForm = true;
  }

  handleFormSubmitted(formData: ItemType): void {
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

  trackById(index: number, item: ItemType): number {
    return item.id!;
  }

  handleViewDetails(item: ItemType): void {
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
