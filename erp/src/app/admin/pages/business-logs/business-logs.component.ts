import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of, forkJoin, finalize } from 'rxjs';
import { tap, retry } from 'rxjs/operators';

import { BaseDataComponent } from '../../components/base-data/base-data.component';
import { GenericTableComponent, Buttons } from '../../components/generic-table/generic-table.component';
import { GenericFilterFormComponent } from '../../components/generic-filter-form/generic-filter-form.component';
import { GenericDetailsComponent } from '../../components/generic-details/generic-details.component';
import { PaginationButtonsComponent } from '../../components/pagination-buttons/pagination-buttons.component';

import { DataHandler } from '../../../core/services/data-handler.service';
import { GenericTableService, PaginatedResponse, FilterParams } from '../../../core/services/generic-table.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ColumnDefinition } from '../../../shared/interfaces/generic-form-column-definiton';
import { FilterColumns } from '../../../shared/interfaces/filter-columns';
import { ItemDetailsColumns } from '../../../shared/interfaces/item-details-columns';

import {
  BUTTONS,
  TABLE_COLUMNS,
  FILTER_COLUMNS,
  DETAILS_COLUMNS
} from './business-logs.config';

@Component({
  selector: 'app-business-logs',
  standalone: true,
  imports: [
    CommonModule, FormsModule, GenericTableComponent, GenericFilterFormComponent, 
    GenericDetailsComponent, PaginationButtonsComponent
  ],
  templateUrl: './business-logs.component.html',
  styleUrl: '../default-style.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusinessLogsComponent extends BaseDataComponent<any> implements OnInit {
  @ViewChild('activeTable') activeTable!: GenericTableComponent;

  override apiEndpoint: string = 'business_logs';

  buttons: Buttons[] = BUTTONS.filter(b => b.action !== 'create' && b.action !== 'edit');
  
  tableColumns: ColumnDefinition[] = TABLE_COLUMNS;
  filterColumns: FilterColumns[] = FILTER_COLUMNS;
  detailsColumns: ItemDetailsColumns[] = DETAILS_COLUMNS;

  isTableFullWidth = true;
  isFilterVisible = false;
  showDetails = false;
  selectedItemForDetails: any | null = null;

  currentPage: number = 1;
  itemsPerPage: number = 15;
  totalItems: number = 0;
  totalPages: number = 0;

  filterBusinessLogId = '';
  filterCreatedAt = '';
  filterOrigin = '';
  filterEventType = '';
  filterModule = '';
  filterDescription = '';
  filterAffectedEntityType = '';
  filterAffectedEntityId = '';
  filterUserLoginId = '';
  filterUserEmail = '';
  filterContextData = '';
  filterSortBy = 'created_at';
  filterSortDirection: 'asc' | 'desc' = 'desc';

  private activeRequestsCache: Map<number, any[]> = new Map();
  private currentActiveFilters: FilterParams = {};

  constructor(
    protected override dataHandler: DataHandler,
    protected override cd: ChangeDetectorRef,
    private genericTableService: GenericTableService,
    private authService: AuthService,
    private router: Router
  ) { super(dataHandler, cd); }

  override ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe(loggedIn => {
      loggedIn ? this.forceFullRefresh() : this.router.navigate(['/auth/login']);
    });
  }

  onHandlePageChange(page: number): void {
    this.goToPage(page);
  }

  onHandleItemsPerPageChange(value: number): void {
    this.itemsPerPage = value;
    this.forceFullRefresh();
  }

  exportActiveTable(): void {
    if (this.activeTable) this.activeTable.exportToCSV();
  }

  toggleFilters(): void { this.isFilterVisible = !this.isFilterVisible; }
  public refreshData(): void { this.forceFullRefresh(); }

  private getBaseFilters(): FilterParams {
    return {
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
  }

  private fetchPaginatedData(page: number, itemsPerPage: number, cache: Map<number, any[]>, currentFilters: FilterParams): Observable<PaginatedResponse<any>> {
    const newFilters = this.getBaseFilters();
    
    if (JSON.stringify(newFilters) !== JSON.stringify(currentFilters)) {
      cache.clear();
      this.currentPage = 1;
      this.currentActiveFilters = newFilters;
    }

    if (cache.has(page)) {
      this.data = cache.get(page)!;
      this.cd.detectChanges();
      return of({ data: this.data, current_page: page, last_page: this.totalPages, total: this.totalItems } as PaginatedResponse<any>);
    }

    return this.genericTableService.getPaginatedData<any>(this.apiEndpoint, page, itemsPerPage, newFilters).pipe(
      retry(1),
      tap(res => {
        this.data = res.data; this.totalItems = res.total; this.totalPages = res.last_page; this.currentPage = res.current_page;
        cache.set(page, res.data);
        this.cd.detectChanges();
      })
    );
  }

  forceFullRefresh(): void {
    this.activeRequestsCache.clear();
    this.isLoading = true;
    this.fetchPaginatedData(this.currentPage, this.itemsPerPage, this.activeRequestsCache, this.currentActiveFilters)
      .pipe(finalize(() => { this.isLoading = false; this.cd.detectChanges(); }))
      .subscribe();
  }

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
    this.filterSortBy = filters.sort_by || 'created_at';
    this.filterSortDirection = filters.sort_direction || 'desc';
    this.forceFullRefresh();
  }

  clearFilters(): void {
    this.filterBusinessLogId = ''; this.filterCreatedAt = ''; this.filterOrigin = ''; this.filterEventType = '';
    this.filterModule = ''; this.filterDescription = ''; this.filterAffectedEntityType = ''; this.filterAffectedEntityId = '';
    this.filterUserLoginId = ''; this.filterUserEmail = ''; this.filterContextData = '';
    this.filterSortBy = 'created_at'; this.filterSortDirection = 'desc';
    this.forceFullRefresh();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.fetchPaginatedData(this.currentPage, this.itemsPerPage, this.activeRequestsCache, this.currentActiveFilters).subscribe();
    }
  }

  onItemsPerPageChange(event: Event): void {
    this.itemsPerPage = Number((event.target as HTMLSelectElement).value);
    this.forceFullRefresh();
  }

  handleItemDeleted(): void { this.forceFullRefresh(); }
  handleItemRestored(): void { this.forceFullRefresh(); }

  handleViewDetails(item: any): void {
    if (!item.business_log_id) return;
    this.isLoading = true;
    this.getItemDetails(item.business_log_id).subscribe({
      next: (details) => {
        this.selectedItemForDetails = details;
        this.showDetails = true;
        this.isLoading = false;
        this.cd.markForCheck();
      },
      error: () => { this.isLoading = false; this.cd.markForCheck(); }
    });
  }

  handleCloseDetails(): void {
    this.selectedItemForDetails = null;
    this.showDetails = false;
  }
}