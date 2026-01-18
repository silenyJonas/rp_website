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
import { GenericFormComponent, InputDefinition } from '../../components/generic-form/generic-form.component';
import { Observable, of, forkJoin } from 'rxjs';
import { tap, retry, finalize } from 'rxjs/operators';
import { FilterColumns } from '../../../shared/interfaces/filter-columns';
import { GenericFilterFormComponent } from '../../components/generic-filter-form/generic-filter-form.component';
import { GenericDetailsComponent } from '../../components/generic-details/generic-details.component';
import { ItemDetailsColumns } from '../../../shared/interfaces/item-details-columns';
import { HasPermissionDirective } from '../../../core/directives/has-permission.directive';

import {
  SALES_LEAD_BUTTONS,
  SALES_LEAD_FORM_FIELDS,
  SALES_LEAD_COLUMNS,
  SALES_LEAD_TRASH_COLUMNS,
  SALES_LEAD_STATUS_OPTIONS,
  SALES_LEAD_PRIORITY_OPTIONS,
  SALES_LEAD_FILTER_COLUMNS,
  SALES_LEAD_DETAILS_COLUMNS
} from './sales-leads.config';

@Component({
  selector: 'app-sales-leads',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GenericTableComponent,
    GenericTrashTableComponent,
    GenericFormComponent,
    GenericFilterFormComponent,
    GenericDetailsComponent,
    HasPermissionDirective
  ],
  templateUrl: './sales-leads.component.html',
  styleUrl: './sales-leads.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesLeadsComponent extends BaseDataComponent<any> implements OnInit {

  override apiEndpoint: string = 'sales_leads';
  override trashData: any[] = [];
  override isLoading: boolean = false;
  isTrashTableLoading: boolean = false;

  buttons: Buttons[] = SALES_LEAD_BUTTONS;
  formFields: InputDefinition[] = SALES_LEAD_FORM_FIELDS;
  salesLeadColumns: ColumnDefinition[] = SALES_LEAD_COLUMNS;
  trashSalesLeadColumns: ColumnDefinition[] = SALES_LEAD_TRASH_COLUMNS;
  statusOptions: string[] = SALES_LEAD_STATUS_OPTIONS;
  priorityOptions: string[] = SALES_LEAD_PRIORITY_OPTIONS;
  filterColumns: FilterColumns[] = SALES_LEAD_FILTER_COLUMNS;
  detailsColumns: ItemDetailsColumns[] = SALES_LEAD_DETAILS_COLUMNS;
  
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

  // Filtry odpovídající struktuře Sales Leads v DB
  filterSearch: string = '';
  filterStatus: string = '';
  filterPriority: string = '';
  filterSubjectName: string = '';
  filterSalesmanName: string = '';
  filterLocation: string = '';
  filterId: string = '';
  filterCreatedAt: string = ''; // Doplněno
  filterUpdatedAt: string = ''; // Doplněno
  filterSortBy: string = '';
  filterSortDirection: 'asc' | 'desc' = 'asc';

  private activeRequestsCache: Map<number, any[]> = new Map();
  private trashRequestsCache: Map<number, any[]> = new Map();
  private currentActiveFilters: FilterParams = {};
  private currentTrashFilters: FilterParams = {};

  selectedItemForEdit: any | null = null;

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
    return {
      search: this.filterSearch,
      status: this.filterStatus,
      priority: this.filterPriority,
      subject_name: this.filterSubjectName,
      salesman_name: this.filterSalesmanName,
      location: this.filterLocation,
      id: this.filterId,
      created_at: this.filterCreatedAt,
      updated_at: this.filterUpdatedAt,
      sort_by: this.filterSortBy,
      sort_direction: this.filterSortDirection
    };
  }

  private fetchPaginatedData(
    isTrash: boolean,
    page: number,
    itemsPerPage: number,
    cache: Map<number, any[]>,
    currentFilters: FilterParams
  ): Observable<PaginatedResponse<any>> {
    const newFilters = this.getBaseFilters();
    if (isTrash) {
      newFilters['only_trashed'] = 'true';
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
      } as PaginatedResponse<any>);
    }

    return this.genericTableService.getPaginatedData<any>(
      this.apiEndpoint,
      page,
      itemsPerPage,
      newFilters
    ).pipe(
      retry(1),
      tap((response: PaginatedResponse<any>) => {
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
    cache: Map<number, any[]>
  ): void {
    const totalPages = isTrash ? this.trashTotalPages : this.totalPages;
    if (page > totalPages || cache.has(page)) {
      return;
    }

    const filters = this.getBaseFilters();
    if (isTrash) {
      filters['only_trashed'] = 'true';
    }

    this.genericTableService.getPaginatedData<any>(
      this.apiEndpoint,
      page,
      itemsPerPage,
      filters
    ).subscribe({
      next: (response: PaginatedResponse<any>) => {
        cache.set(page, response.data);
      },
      error: () => {}
    });
  }

  loadActiveRequests(): Observable<PaginatedResponse<any>> {
    return this.fetchPaginatedData(false, this.currentPage, this.itemsPerPage, this.activeRequestsCache, this.currentActiveFilters);
  }

  loadTrashRequests(): Observable<PaginatedResponse<any>> {
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
    this.filterSubjectName = filters.subject_name || '';
    this.filterSalesmanName = filters.salesman_name || '';
    this.filterLocation = filters.location || '';
    this.filterId = filters.id || '';
    this.filterCreatedAt = filters.created_at || ''; // Doplněno
    this.filterUpdatedAt = filters.updated_at || ''; // Doplněno
    this.filterSortBy = filters.sort_by || '';
    this.filterSortDirection = filters.sort_direction || 'asc';
    this.forceFullRefresh();
  }

  clearFilters(): void {
    this.filterSearch = '';
    this.filterStatus = '';
    this.filterPriority = '';
    this.filterSubjectName = '';
    this.filterSalesmanName = '';
    this.filterLocation = '';
    this.filterId = '';
    this.filterCreatedAt = ''; // Doplněno
    this.filterUpdatedAt = ''; // Doplněno
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

  handleEditFormOpened(item: any): void {
    this.selectedItemForEdit = item;
    this.showCreateForm = true;
  }

  handleFormSubmitted(formData: any): void {
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
      error: (err) => {}
    });
  }

  onCancelForm() {
    this.showCreateForm = false;
    this.selectedItemForEdit = null;
  }

  trackById(index: number, item: any): number {
    return item.id!;
  }

  handleViewDetails(item: any): void {
    if (item.id === undefined || item.id === null) return;
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