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
    CommonModule, FormsModule, GenericTableComponent, GenericTrashTableComponent,
    GenericFormComponent, GenericFilterFormComponent, GenericDetailsComponent,
    HasPermissionDirective
  ],
  templateUrl: './sales-leads.component.html',
  styleUrl: '../default-style.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesLeadsComponent extends BaseDataComponent<any> implements OnInit {
  @ViewChild('activeTable') activeTable!: GenericTableComponent;

  override apiEndpoint: string = 'sales_leads';
  override trashData: any[] = [];
  override isLoading: boolean = false;
  
  // UI stavy
  isTableFullWidth: boolean = true;
  isFilterVisible: boolean = false;
  showTrashTable: boolean = false;
  showCreateForm: boolean = false;
  showDetails: boolean = false;

  buttons: Buttons[] = SALES_LEAD_BUTTONS;
  formFields: InputDefinition[] = SALES_LEAD_FORM_FIELDS;
  salesLeadColumns: ColumnDefinition[] = SALES_LEAD_COLUMNS;
  trashSalesLeadColumns: ColumnDefinition[] = SALES_LEAD_TRASH_COLUMNS;
  filterColumns: FilterColumns[] = SALES_LEAD_FILTER_COLUMNS;
  detailsColumns: ItemDetailsColumns[] = SALES_LEAD_DETAILS_COLUMNS;
  
  // Stránkování
  currentPage: number = 1;
  itemsPerPage: number = 15;
  totalItems: number = 0;
  totalPages: number = 0;
  
  trashCurrentPage: number = 1;
  trashItemsPerPage: number = 15;
  trashTotalItems: number = 0;
  trashTotalPages: number = 0;

  // Filtry
  filterSearch = ''; filterStatus = ''; filterPriority = ''; filterSubjectName = '';
  filterSalesmanName = ''; filterLocation = ''; filterId = ''; filterCreatedAt = '';
  filterUpdatedAt = ''; filterSortBy = ''; filterSortDirection: 'asc' | 'desc' = 'asc';

  private activeRequestsCache: Map<number, any[]> = new Map();
  private trashRequestsCache: Map<number, any[]> = new Map();
  private currentActiveFilters: FilterParams = {};
  private currentTrashFilters: FilterParams = {};

  selectedItemForEdit: any | null = null;
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
      subject_name: this.filterSubjectName, salesman_name: this.filterSalesmanName,
      location: this.filterLocation, id: this.filterId, created_at: this.filterCreatedAt,
      updated_at: this.filterUpdatedAt, sort_by: this.filterSortBy, sort_direction: this.filterSortDirection
    };
  }

  toggleFilters() { this.isFilterVisible = !this.isFilterVisible; }

  private fetchPaginatedData(
    isTrash: boolean, page: number, itemsPerPage: number,
    cache: Map<number, any[]>, currentFilters: FilterParams
  ): Observable<PaginatedResponse<any>> {
    const newFilters = this.getBaseFilters();
    if (isTrash) newFilters['only_trashed'] = 'true';

    if (JSON.stringify(newFilters) !== JSON.stringify(currentFilters)) {
      cache.clear();
      if (isTrash) { this.trashCurrentPage = 1; this.currentTrashFilters = newFilters; }
      else { this.currentPage = 1; this.currentActiveFilters = newFilters; }
    }

    if (cache.has(page)) {
      const cachedData = cache.get(page)!;
      isTrash ? this.trashData = cachedData : this.data = cachedData;
      this.cd.detectChanges();
      return of({ data: cachedData, current_page: page, last_page: isTrash ? this.trashTotalPages : this.totalPages, total: isTrash ? this.trashTotalItems : this.totalItems } as PaginatedResponse<any>);
    }

    return this.genericTableService.getPaginatedData<any>(this.apiEndpoint, page, itemsPerPage, newFilters).pipe(
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

  applyFilters(filters: any): void {
    this.filterSearch = filters.search || ''; this.filterStatus = filters.status || '';
    this.filterPriority = filters.priority || ''; this.filterSubjectName = filters.subject_name || '';
    this.filterSalesmanName = filters.salesman_name || ''; this.filterLocation = filters.location || '';
    this.filterId = filters.id || ''; this.filterCreatedAt = filters.created_at || '';
    this.filterUpdatedAt = filters.updated_at || ''; this.filterSortBy = filters.sort_by || '';
    this.filterSortDirection = filters.sort_direction || 'asc';
    this.forceFullRefresh();
  }

  clearFilters(): void {
    this.filterSearch = ''; this.filterStatus = ''; this.filterPriority = '';
    this.filterSubjectName = ''; this.filterSalesmanName = ''; this.filterLocation = '';
    this.filterId = ''; this.filterCreatedAt = ''; this.filterUpdatedAt = '';
    this.filterSortBy = ''; this.filterSortDirection = 'asc';
    this.forceFullRefresh();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadActiveRequests().subscribe();
    }
  }

  onItemsPerPageChange(event: Event): void {
    this.itemsPerPage = Number((event.target as HTMLSelectElement).value);
    this.forceFullRefresh();
  }

  private forceFullRefresh(): void {
    this.activeRequestsCache.clear(); this.trashRequestsCache.clear();
    this.isLoading = true;
    this.cd.detectChanges();
    forkJoin([this.loadActiveRequests(), this.loadTrashRequests()]).pipe(
      finalize(() => { this.isLoading = false; this.cd.detectChanges(); })
    ).subscribe();
  }

  handleCreateFormOpened() { this.selectedItemForEdit = null; this.showCreateForm = !this.showCreateForm; }
  handleEditFormOpened(item: any) { this.selectedItemForEdit = item; this.showCreateForm = true; }

  handleFormSubmitted(formData: any) {
    this.showCreateForm = false;
    this.isLoading = true;
    const request$ = formData.id ? this.updateData(formData.id, formData) : this.postData(formData);
    request$.pipe(finalize(() => { this.isLoading = false; this.cd.detectChanges(); }))
      .subscribe(() => this.forceFullRefresh());
  }

  onCancelForm() { this.showCreateForm = false; this.selectedItemForEdit = null; }

  handleViewDetails(item: any) {
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