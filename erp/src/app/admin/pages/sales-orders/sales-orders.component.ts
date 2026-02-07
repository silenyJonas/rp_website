import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of, forkJoin } from 'rxjs';
import { tap, retry, finalize } from 'rxjs/operators';

import { BaseDataComponent } from '../../components/base-data/base-data.component';
import { GenericTableComponent, Buttons } from '../../components/generic-table/generic-table.component';
import { GenericTrashTableComponent } from '../../components/generic-trash-table/generic-trash-table.component';
import { GenericFormComponent, InputDefinition } from '../../components/generic-form/generic-form.component';
import { GenericFilterFormComponent } from '../../components/generic-filter-form/generic-filter-form.component';
import { GenericDetailsComponent } from '../../components/generic-details/generic-details.component';
import { PaginationButtonsComponent } from '../../components/pagination-buttons/pagination-buttons.component';

import { DataHandler } from '../../../core/services/data-handler.service';
import { GenericTableService, PaginatedResponse, FilterParams } from '../../../core/services/generic-table.service';
import { AuthService } from '../../../core/auth/auth.service';
import { HasPermissionDirective } from '../../../core/directives/has-permission.directive';

import {
  SALES_ORDER_BUTTONS,
  SALES_ORDER_FORM_FIELDS,
  SALES_ORDER_COLUMNS,
  SALES_ORDER_TRASH_COLUMNS,
  SALES_ORDER_FILTER_COLUMNS,
  SALES_ORDER_DETAILS_COLUMNS
} from './sales-orders.config';

@Component({
  selector: 'app-sales-orders',
  standalone: true,
  imports: [
    CommonModule, FormsModule, GenericTableComponent, GenericTrashTableComponent,
    GenericFormComponent, GenericFilterFormComponent, GenericDetailsComponent, 
    HasPermissionDirective, PaginationButtonsComponent
  ],
  templateUrl: './sales-orders.component.html',
  styleUrl: '../default-style.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesOrdersComponent extends BaseDataComponent<any> implements OnInit {
  @ViewChild('activeTable') activeTable!: GenericTableComponent;
  
  override apiEndpoint: string = 'sales_orders';
  
  buttons: Buttons[] = SALES_ORDER_BUTTONS.filter(b => b.action !== 'create');
  formFields: InputDefinition[] = SALES_ORDER_FORM_FIELDS;
  columns: any[] = SALES_ORDER_COLUMNS;
  trashColumns: any[] = SALES_ORDER_TRASH_COLUMNS;
  filterColumns = SALES_ORDER_FILTER_COLUMNS;
  detailsColumns = SALES_ORDER_DETAILS_COLUMNS;

  isTableFullWidth = true;
  showTrashTable = false;
  showCreateForm = false; 
  showDetails = false;
  isFilterVisible = false;
  
  currentPage = 1;
  itemsPerPage = 15;
  totalItems = 0;
  totalPages = 0;
  
  trashCurrentPage = 1;
  trashItemsPerPage = 15;
  trashTotalItems = 0;
  trashTotalPages = 0;

  selectedItemForEdit: any = null;
  selectedItemForDetails: any = null;

  filters: any = { search: '', client_name: '', salesman_name: '', ico: '', client_email: '', sort_by: 'id', sort_direction: 'desc' };

  private activeCache: Map<number, any[]> = new Map();
  private trashCache: Map<number, any[]> = new Map();

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

  // --- HANDLERY PRO PAGINATION COMPONENT ---
  onHandlePageChange(page: number): void {
    if (this.showTrashTable) {
      this.goToTrashPage(page);
    } else {
      this.goToPage(page);
    }
  }

  onHandleItemsPerPageChange(value: number): void {
    if (this.showTrashTable) {
      this.onTrashItemsPerPageChange({ target: { value: value } });
    } else {
      this.onItemsPerPageChange({ target: { value: value } });
    }
  }

  // --- PŮVODNÍ LOGIKA ZŮSTÁVÁ ---
  exportActiveTable(): void {
    if (this.activeTable) {
      this.activeTable.exportToCSV();
    }
  }

  public refreshData(): void { this.forceFullRefresh(); }

  private fetchPaginatedData(isTrash: boolean, page: number, perPage: number, cache: Map<number, any[]>): Observable<any> {
    const params: FilterParams = { ...this.filters };
    if (isTrash) params['only_trashed'] = 'true';

    if (cache.has(page)) {
      const cachedData = cache.get(page)!;
      isTrash ? (this.trashData = cachedData) : (this.data = cachedData);
      this.cd.detectChanges();
      return of({ data: cachedData, current_page: page });
    }

    return this.genericTableService.getPaginatedData<any>(this.apiEndpoint, page, perPage, params).pipe(
      retry(1),
      tap(res => {
        if (isTrash) {
          this.trashData = res.data; this.trashTotalItems = res.total; this.trashTotalPages = res.last_page; this.trashCurrentPage = res.current_page;
        } else {
          this.data = res.data; this.totalItems = res.total; this.totalPages = res.last_page; this.currentPage = res.current_page;
        }
        cache.set(page, res.data);
        this.cd.detectChanges();
      })
    );
  }

  forceFullRefresh(): void {
    this.activeCache.clear();
    this.trashCache.clear();
    this.isLoading = true;
    this.currentPage = 1;
    this.trashCurrentPage = 1;
    
    forkJoin([
      this.fetchPaginatedData(false, this.currentPage, this.itemsPerPage, this.activeCache),
      this.fetchPaginatedData(true, this.trashCurrentPage, this.trashItemsPerPage, this.trashCache)
    ]).pipe(
      finalize(() => { this.isLoading = false; this.cd.detectChanges(); })
    ).subscribe();
  }

  applyFilters(f: any): void { this.filters = { ...this.filters, ...f }; this.forceFullRefresh(); }
  clearFilters(): void { this.filters = { sort_direction: 'desc', sort_by: 'id' }; this.forceFullRefresh(); }
  toggleFilters(): void { this.isFilterVisible = !this.isFilterVisible; }
  toggleTable(): void { this.showTrashTable = !this.showTrashTable; this.forceFullRefresh(); }

  goToPage(p: number): void {
    if (p >= 1 && p <= this.totalPages && p !== this.currentPage) {
      this.currentPage = p;
      this.fetchPaginatedData(false, p, this.itemsPerPage, this.activeCache).subscribe();
    }
  }

  goToTrashPage(p: number): void {
    if (p >= 1 && p <= this.trashTotalPages && p !== this.trashCurrentPage) {
      this.trashCurrentPage = p;
      this.fetchPaginatedData(true, p, this.trashItemsPerPage, this.trashCache).subscribe();
    }
  }

  onItemsPerPageChange(e: any): void { this.itemsPerPage = +e.target.value; this.forceFullRefresh(); }
  onTrashItemsPerPageChange(e: any): void { this.trashItemsPerPage = +e.target.value; this.forceFullRefresh(); }

  handleEditFormOpened(item: any): void { this.selectedItemForEdit = item; this.showCreateForm = true; }
  
  handleViewDetails(item: any): void {
    this.isLoading = true;
    this.getItemDetails(item.id).subscribe({
      next: (res) => {
        this.selectedItemForDetails = res;
        this.showDetails = true;
        this.isLoading = false;
        this.cd.markForCheck();
      },
      error: () => { this.isLoading = false; this.cd.markForCheck(); }
    });
  }

  handleFormSubmitted(formData: any): void {
    this.isLoading = true;
    const req = this.updateData(formData.id, formData);
    req.pipe(finalize(() => this.isLoading = false)).subscribe(() => {
      this.showCreateForm = false;
      this.forceFullRefresh();
    });
  }
}