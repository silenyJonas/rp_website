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
import { AlertDialogService } from '../../../core/services/alert-dialog.service';

import {
  BUTTONS,
  FORM_FIELDS,
  TABLE_COLUMNS,
  TRASH_TABLE_COLUMNS,
  FILTER_COLUMNS,
  DETAILS_COLUMNS,
  RESET_PASSWORD_FORM_FIELDS
} from './administrators.config';

@Component({
  selector: 'app-administrators',
  standalone: true,
  imports: [
    CommonModule, FormsModule, GenericTableComponent, GenericTrashTableComponent,
    GenericFormComponent, GenericFilterFormComponent, GenericDetailsComponent,
    HasPermissionDirective
  ],
  templateUrl: './administrators.component.html',
  styleUrl: '../default-style.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdministratorsComponent extends BaseDataComponent<any> implements OnInit {
  @ViewChild('activeTable') activeTable!: GenericTableComponent;

  override apiEndpoint: string = 'user_login';
  override trashData: any[] = [];
  override isLoading: boolean = false;
  isAdminTable: boolean = true;
  
  // UI stavy
  isTableFullWidth: boolean = true;
  isFilterVisible: boolean = false;
  showTrashTable: boolean = false;
  showCreateForm: boolean = false;
  showDetails: boolean = false;
  showResetPasswordForm: boolean = false;

  buttons: Buttons[] = BUTTONS;
  formFields: InputDefinition[] = FORM_FIELDS;
  resetPasswordFormFields: InputDefinition[] = RESET_PASSWORD_FORM_FIELDS;
  tableColumns: ColumnDefinition[] = TABLE_COLUMNS;
  trashTableColumns: ColumnDefinition[] = TRASH_TABLE_COLUMNS;
  filterColumns: FilterColumns[] = FILTER_COLUMNS;
  detailsColumns: ItemDetailsColumns[] = DETAILS_COLUMNS;

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
  filterUserLoginId = ''; filterFullName = ''; filterUserEmail = '';
  filterLastLoginAt = ''; filterCreatedAt = ''; filterUpdatedAt = '';
  filterRoleName = ''; filterSortBy = ''; filterSortDirection: 'asc' | 'desc' = 'asc';

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
    private alertDialogService: AlertDialogService,
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
    const filters: FilterParams = {
      user_login_id: this.filterUserLoginId,
      full_name: this.filterFullName,
      user_email: this.filterUserEmail,
      last_login_at: this.filterLastLoginAt,
      created_at: this.filterCreatedAt,
      updated_at: this.filterUpdatedAt,
      sort_by: this.filterSortBy,
      sort_direction: this.filterSortDirection
    };
    if (this.filterRoleName) filters['role_name'] = this.filterRoleName;
    return filters;
  }

  private fetchPaginatedData(
    isTrash: boolean, page: number, itemsPerPage: number,
    cache: Map<number, any[]>, currentFilters: FilterParams
  ): Observable<PaginatedResponse<any>> {
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

  toggleFilters() { this.isFilterVisible = !this.isFilterVisible; }

  applyFilters(filters: any): void {
    this.filterUserLoginId = filters.user_login_id || '';
    this.filterFullName = filters.full_name || '';
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
    this.filterUserLoginId = ''; this.filterFullName = ''; this.filterUserEmail = '';
    this.filterLastLoginAt = ''; this.filterCreatedAt = ''; this.filterUpdatedAt = '';
    this.filterRoleName = ''; this.filterSortBy = ''; this.filterSortDirection = 'asc';
    this.forceFullRefresh();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page; this.loadActiveRequests().subscribe();
    }
  }

  onItemsPerPageChange(event: Event): void {
    this.itemsPerPage = Number((event.target as HTMLSelectElement).value);
    this.forceFullRefresh();
  }

  public forceFullRefresh(): void {
    this.activeRequestsCache.clear(); this.trashRequestsCache.clear();
    this.isLoading = true;
    this.cd.detectChanges();
    forkJoin([this.loadActiveRequests(), this.loadTrashRequests()]).pipe(
      finalize(() => { this.isLoading = false; this.cd.detectChanges(); })
    ).subscribe();
  }

  handleCreateFormOpened() { this.selectedItemForEdit = null; this.showCreateForm = true; }
  
  handleEditFormOpened(item: any) {
    const itemToEdit = { ...item };
    if (itemToEdit.roles?.length > 0) itemToEdit.role_id = itemToEdit.roles[0].role_id;
    this.selectedItemForEdit = itemToEdit;
    this.showCreateForm = true;
  }

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

  handleResetPasswordFormOpened(item: any) {
    this.showResetPasswordForm = true;
    this.selectedItemForEdit = { ...item, target_user_id: item.id, current_user_id: this.authService.getUserId() };
  }

  handleResetPasswordFormSubmitted(formData: any) {
    const passwordData = { ...formData, current_user_id: parseInt(formData.current_user_id, 10) };
    this.updatePassword(passwordData.target_user_id, passwordData)
      .pipe(finalize(() => this.handleResetPasswordFormClosed()))
      .subscribe({
        next: () => {
          this.alertDialogService.open('Úspěch', 'Heslo bylo úspěšně změněno.', 'success');
          this.forceFullRefresh();
        },
        error: () => this.alertDialogService.open('Chyba', 'Chyba při změně hesla.', 'danger')
      });
  }

  handleResetPasswordFormClosed() { this.showResetPasswordForm = false; }
  handleCloseDetails() { this.showDetails = false; }
  handleItemRestored() { this.forceFullRefresh(); }
  handleItemDeleted() { this.forceFullRefresh(); }

  get pagesArray(): number[] {
    const max = 5;
    let start = Math.max(1, this.currentPage - Math.floor(max / 2));
    let end = Math.min(this.totalPages, start + max - 1);
    if (end - start + 1 < max) start = Math.max(1, end - max + 1);
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }
}