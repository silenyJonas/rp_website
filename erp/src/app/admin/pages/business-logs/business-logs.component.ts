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

type ItemType = any;

/**
 * BusinessLogsComponent manages the display and interaction for business log data.
 * It handles fetching, filtering, and displaying log entries in a generic table.
 * It also supports opening a details view for a selected log entry.
 */
@Component({
  selector: 'app-business-logs',
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

  // API endpoint for fetching business logs
  override apiEndpoint: string = 'business_logs';

  // State flags for UI feedback
  override isLoading: boolean = false;
  override errorMessage: string | null = null;

  // Configuration data from the business-logs.config.ts file
  buttons: Buttons[] = BUTTONS;
  tableColumns: ColumnDefinition[] = TABLE_COLUMNS;
  filterColumns: FilterColumns[] = FILTER_COLUMNS;
  detailsColumns: ItemDetailsColumns[] = DETAILS_COLUMNS;

  // Component state variables
  showCreateForm: boolean = false;
  currentPage: number = 1;
  itemsPerPage: number = 15;
  totalItems: number = 0;
  totalPages: number = 0;

  // State variables for the details view
  showDetails: boolean = false;
  selectedItemForDetails: any | null = null;

  // Variables to hold filter values, adjusted to match the configuration
  filterBusinessLogId: string = '';
  filterCreatedAt: string = '';
  filterOrigin: string = '';
  filterEventType: string = '';
  filterModule: string = '';
  filterDescription: string = '';
  filterAffectedEntityType: string = '';
  filterAffectedEntityId: string = '';
  filterUserLoginId: string = '';
  filterUserEmail: string = '';
  filterContextData: string = '';

  filterSortBy: string = '';
  filterSortDirection: 'asc' | 'desc' = 'asc';

  // Cache and filter state for performance
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

  /**
   * Public method to trigger a full data refresh.
   */
  public refreshData(): void {
    this.forceFullRefresh();
  }

  /**
   * Gathers all current filter values into a single object.
   * @returns An object containing all active filters.
   */
  private getBaseFilters(): FilterParams {
    const filters: FilterParams = {
      business_log_id: this.filterBusinessLogId,
      created_at: this.filterCreatedAt,
      origin: this.filterOrigin,
      event_type: this.filterEventType,
      module: this.filterModule,
      description: this.filterDescription,
      affected_entity_type: this.filterAffectedEntityType,
      affected_entity_id: this.filterAffectedEntityId,
      user_login_id: this.filterUserLoginId,
      user_email: this.filterUserEmail,
      context_data: this.filterContextData,
      sort_by: this.filterSortBy,
      sort_direction: this.filterSortDirection
    };

    return filters;
  }

  /**
   * Fetches paginated data from the API, with caching and preloading.
   * @param page The page number to fetch.
   * @param itemsPerPage The number of items per page.
   * @param cache The cache map.
   * @param currentFilters The currently active filters.
   * @returns An Observable of the paginated response.
   */
  private fetchPaginatedData(
    page: number,
    itemsPerPage: number,
    cache: Map<number, ItemType[]>,
    currentFilters: FilterParams
  ): Observable<PaginatedResponse<ItemType>> {
    this.errorMessage = null;
    const newFilters = this.getBaseFilters();
    newFilters['is_deleted'] = 'false';

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

  /**
   * Preloads the next page of data to improve user experience.
   * @param page The page number to preload.
   * @param itemsPerPage The number of items per page.
   * @param cache The cache map.
   */
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

  /**
   * Loads the current page's data.
   * @returns An Observable of the paginated response.
   */
  loadActiveRequests(): Observable<PaginatedResponse<ItemType>> {
    return this.fetchPaginatedData(this.currentPage, this.itemsPerPage, this.activeRequestsCache, this.currentActiveFilters);
  }

  /**
   * Applies the received filters and refreshes the data.
   * @param filters The filter values from the filter form.
   */
  applyFilters(filters: any): void {
    this.filterBusinessLogId = filters['business_log_id'] || '';
    this.filterCreatedAt = filters['created_at'] || '';
    this.filterOrigin = filters['origin'] || '';
    this.filterEventType = filters['event_type'] || '';
    this.filterModule = filters['module'] || '';
    this.filterDescription = filters['description'] || '';
    this.filterAffectedEntityType = filters['affected_entity_type'] || '';
    this.filterAffectedEntityId = filters['affected_entity_id'] || '';
    this.filterUserLoginId = filters['user_login_id'] || '';
    this.filterUserEmail = filters['user.user_email'] || '';
    this.filterContextData = filters['context_data'] || '';

    this.filterSortBy = filters.sort_by || '';
    this.filterSortDirection = filters.sort_direction || 'asc';
    this.forceFullRefresh();
  }

  /**
   * Clears all filters and refreshes the data.
   */
  clearFilters(): void {
    this.filterBusinessLogId = '';
    this.filterCreatedAt = '';
    this.filterOrigin = '';
    this.filterEventType = '';
    this.filterModule = '';
    this.filterDescription = '';
    this.filterAffectedEntityType = '';
    this.filterAffectedEntityId = '';
    this.filterUserLoginId = '';
    this.filterUserEmail = '';
    this.filterContextData = '';
    this.filterSortBy = '';
    this.filterSortDirection = 'asc';
    this.forceFullRefresh();
  }

  /**
   * Navigates to a specific page.
   * @param page The page number to navigate to.
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadActiveRequests().subscribe();
    }
  }

  /**
   * Handles the change in items per page selection.
   * @param event The change event.
   */
  onItemsPerPageChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const newItemsPerPage = Number(selectElement.value);
    if (newItemsPerPage !== this.itemsPerPage) {
      this.itemsPerPage = newItemsPerPage;
      this.forceFullRefresh();
    }
  }

  /**
   * Generates an array for pagination controls.
   * @param currentPage The current active page.
   * @param totalPages The total number of pages.
   * @returns An array of page numbers to display.
   */
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

  /**
   * Handles item restoration event. Not used in this component, but required by BaseDataComponent.
   */
  handleItemRestored(): void {
    this.forceFullRefresh();
  }

  /**
   * Handles item deletion event, refreshing the data.
   */
  handleItemDeleted(): void {
    this.forceFullRefresh();
  }

  /**
   * Forces a complete refresh of the data, clearing the cache.
   */
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

  /**
   * Handles the opening of the create form.
   */
  handleCreateFormOpened(): void {
    this.selectedItemForEdit = null;
    this.showCreateForm = !this.showCreateForm;
  }

  /**
   * Handles the opening of the edit form.
   * @param item The item to be edited.
   */
  handleEditFormOpened(item: ItemType): void {
    const itemToEdit = { ...item };

    if (itemToEdit.roles && itemToEdit.roles.length > 0) {
      itemToEdit.role_id = itemToEdit.roles[0].role_id;
    }

    this.selectedItemForEdit = itemToEdit;
    this.showCreateForm = true;
  }

  /**
   * Handles the form submission for creating or updating an item.
   * @param formData The form data.
   */
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

  /**
   * Handles form cancellation.
   */
  onCancelForm() {
    this.showCreateForm = false;
    this.selectedItemForEdit = null;
  }

  /**
   * Track function for ngFor to improve rendering performance.
   * @param index The index of the item.
   * @param item The item itself.
   * @returns The item's ID.
   */
  trackById(index: number, item: ItemType): number {
    return item.id!;
  }

  /**
   * Handles the click event to view item details.
   * This method fetches the full details for the selected item and shows the details component.
   * @param item The item selected from the table.
   */
  handleViewDetails(item: ItemType): void {
    // Kontrolujeme, zda item.business_log_id existuje a má platnou hodnotu.
    if (item.business_log_id === undefined || item.business_log_id === null) {
      console.warn('Položka nemá business_log_id. Zobrazování detailů zrušeno.');
      return;
    }
    this.errorMessage = null;

    this.isLoading = true;
    this.cd.markForCheck(); // Aktualizace stavu načítání ihned

    // Používáme business_log_id pro načtení detailů
    this.getItemDetails(item.business_log_id).subscribe({
      next: (details) => {
        console.log('Detaily úspěšně načteny:', details);
        this.selectedItemForDetails = details;
        this.showDetails = true;
        this.isLoading = false;
        console.log('Stav showDetails nastaven na:', this.showDetails);
        this.cd.markForCheck();
      },
      error: (err) => {
        console.error('Chyba při načítání detailů:', err);
        this.isLoading = false;
        this.errorMessage = 'Nepodařilo se načíst detaily položky.';
        this.cd.markForCheck();
      }
    });
  }

  /**
   * Closes the details view by resetting the state variables.
   */
  handleCloseDetails(): void {
    this.selectedItemForDetails = null;
    this.showDetails = false;
    console.log('Zobrazení detailů uzavřeno. Stav showDetails:', this.showDetails);
  }
}
