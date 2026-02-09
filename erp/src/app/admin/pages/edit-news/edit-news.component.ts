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
import { PaginationButtonsComponent } from '../../components/pagination-buttons/pagination-buttons.component';

import {
  NEWS_BUTTONS,
  NEWS_FORM_FIELDS,
  NEWS_COLUMNS,
  NEWS_TRASH_COLUMNS,
  NEWS_FILTER_COLUMNS,
  NEWS_DETAILS_COLUMNS
} from './edit-news.config';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [
    CommonModule, FormsModule, GenericTableComponent, GenericTrashTableComponent,
    GenericFormComponent, GenericFilterFormComponent, GenericDetailsComponent,
    HasPermissionDirective, PaginationButtonsComponent
  ],
  templateUrl: './edit-news.component.html',
  styleUrl: '../default-style.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditNewsComponent extends BaseDataComponent<any> implements OnInit {
  @ViewChild('activeTable') activeTable!: GenericTableComponent;

  override apiEndpoint: string = 'news';
  override trashData: any[] = [];
  override isLoading: boolean = false;
  isTrashTableLoading: boolean = false;

  isTableFullWidth: boolean = true;
  isFilterVisible: boolean = false;
  showTrashTable: boolean = false;
  showCreateForm: boolean = false;
  showDetails: boolean = false;

  buttons: Buttons[] = NEWS_BUTTONS;
  formFields: InputDefinition[] = NEWS_FORM_FIELDS;
  newsColumns: ColumnDefinition[] = NEWS_COLUMNS;
  trashNewsColumns: ColumnDefinition[] = NEWS_TRASH_COLUMNS;
  filterColumns: FilterColumns[] = NEWS_FILTER_COLUMNS;
  detailsColumns: ItemDetailsColumns[] = NEWS_DETAILS_COLUMNS;
  
  currentPage: number = 1;
  itemsPerPage: number = 15;
  totalItems: number = 0;
  totalPages: number = 0;

  trashCurrentPage: number = 1;
  trashItemsPerPage: number = 15;
  trashTotalItems: number = 0;
  trashTotalPages: number = 0;

  selectedItemForDetails: any | null = null;
  selectedItemForEdit: any | null = null;

  filterSearch = ''; filterThema = ''; filterAuthor = ''; filterId = '';
  filterSortBy = 'id'; filterSortDirection: 'asc' | 'desc' = 'desc';

  private activeNewsCache: Map<number, any[]> = new Map();
  private trashNewsCache: Map<number, any[]> = new Map();
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
      if (loggedIn) this.forceFullRefresh();
      else this.router.navigate(['/auth/login']);
    });
  }

  onHandlePageChange(page: number): void {
    if (this.showTrashTable) {
      if (page >= 1 && page <= this.trashTotalPages && page !== this.trashCurrentPage) {
        this.trashCurrentPage = page;
        this.loadTrashNews().subscribe();
      }
    } else {
      if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
        this.currentPage = page;
        this.loadActiveNews().subscribe();
      }
    }
  }

  onHandleItemsPerPageChange(value: number): void {
    if (this.showTrashTable) {
      this.trashItemsPerPage = value;
      this.trashCurrentPage = 1;
      this.trashNewsCache.clear();
      this.loadTrashNews().subscribe();
    } else {
      this.itemsPerPage = value;
      this.currentPage = 1;
      this.activeNewsCache.clear();
      this.loadActiveNews().subscribe();
    }
  }

  public refreshData(): void { this.forceFullRefresh(); }

  exportActiveTable(): void {
    if (this.activeTable) this.activeTable.exportToCSV();
  }

  private getBaseFilters(): FilterParams {
    return {
      search: this.filterSearch, thema: this.filterThema, author: this.filterAuthor,
      id: this.filterId, sort_by: this.filterSortBy, sort_direction: this.filterSortDirection
    };
  }

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
      return of({
        data: cachedData, current_page: page,
        last_page: isTrash ? this.trashTotalPages : this.totalPages,
        total: isTrash ? this.trashTotalItems : this.totalItems
      } as PaginatedResponse<any>);
    }

    return this.genericTableService.getPaginatedData<any>(this.apiEndpoint, page, itemsPerPage, newFilters).pipe(
      retry(1),
      tap((response: PaginatedResponse<any>) => {
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

  private forceFullRefresh(): void {
    this.activeNewsCache.clear(); this.trashNewsCache.clear();
    this.isLoading = true; this.isTrashTableLoading = true;
    this.cd.detectChanges();
    forkJoin([this.loadActiveNews(), this.loadTrashNews()]).pipe(
      finalize(() => { this.isLoading = false; this.isTrashTableLoading = false; this.cd.detectChanges(); })
    ).subscribe();
  }

  loadActiveNews() { return this.fetchPaginatedData(false, this.currentPage, this.itemsPerPage, this.activeNewsCache, this.currentActiveFilters); }
  loadTrashNews() { return this.fetchPaginatedData(true, this.trashCurrentPage, this.trashItemsPerPage, this.trashNewsCache, this.currentTrashFilters); }

  applyFilters(filters: any): void {
    this.filterSearch = filters.search || ''; this.filterThema = filters.thema || '';
    this.filterAuthor = filters.author || ''; this.filterId = filters.id || '';
    this.filterSortBy = filters.sort_by || 'created_at'; this.filterSortDirection = filters.sort_direction || 'desc';
    this.forceFullRefresh();
  }

  clearFilters(): void {
    this.filterSearch = ''; this.filterThema = ''; this.filterAuthor = ''; this.filterId = '';
    this.filterSortBy = 'created_at'; this.filterSortDirection = 'desc';
    this.forceFullRefresh();
  }

  toggleFilters() { this.isFilterVisible = !this.isFilterVisible; }
  toggleTable(): void { this.showTrashTable = !this.showTrashTable; this.forceFullRefresh(); }

  handleCreateFormOpened(): void { this.selectedItemForEdit = null; this.showCreateForm = true; }
  handleEditFormOpened(item: any): void { this.selectedItemForEdit = item; this.showCreateForm = true; }
  onCancelForm() { this.showCreateForm = false; this.selectedItemForEdit = null; }

  handleFormSubmitted(formData: any): void {
    this.showCreateForm = false; this.isLoading = true;
    const request$ = formData.id ? this.updateData(formData.id, formData) : this.postData(formData);
    request$.pipe(finalize(() => { this.isLoading = false; this.cd.detectChanges(); })).subscribe(() => this.forceFullRefresh());
  }

  handleViewDetails(item: any): void {
    this.isLoading = true;
    this.getItemDetails(item.id).subscribe({
      next: (details) => { this.selectedItemForDetails = details; this.showDetails = true; this.isLoading = false; this.cd.markForCheck(); },
      error: () => { this.isLoading = false; this.cd.markForCheck(); }
    });
  }

  handleCloseDetails(): void { this.selectedItemForDetails = null; this.showDetails = false; }
  handleItemRestored() { this.forceFullRefresh(); }
  handleItemDeleted() { this.forceFullRefresh(); }
}