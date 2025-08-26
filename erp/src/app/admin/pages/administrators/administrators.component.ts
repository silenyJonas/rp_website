
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
import { Observable, of, forkJoin, BehaviorSubject } from 'rxjs';
import { tap, retry, finalize, filter } from 'rxjs/operators';
import { FilterColumns } from '../../../shared/interfaces/filter-columns';
import { GenericFilterFormComponent } from '../../components/generic-filter-form/generic-filter-form.component';
import { GenericDetailsComponent } from '../../components/generic-details/generic-details.component';
import { ItemDetailsColumns } from '../../../shared/interfaces/item-details-columns';
import {
  BUTTONS,
  FORM_FIELDS,
  TABLE_COLUMNS,
  TRASH_TABLE_COLUMNS,
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  FILTER_COLUMNS,
  DETAILS_COLUMNS,
  RESET_PASSWORD_FORM_FIELDS
} from './administrators.config';

type ItemType = any; // You should replace 'any' with the specific interface if needed, e.g., RawRequestCommission

@Component({
  selector: 'app-administrators',
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
  templateUrl: './administrators.component.html',
  styleUrl: './administrators.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdministratorsComponent extends BaseDataComponent<ItemType> implements OnInit {

  override apiEndpoint: string = 'user_login';
  override trashData: ItemType[] = [];
  override isLoading: boolean = false;
  isTrashTableLoading: boolean = false;
  override errorMessage: string | null = null; // Přidáno pro zobrazení chybové zprávy v HTML

  showResetPasswordForm: boolean = false;

  buttons: Buttons[] = BUTTONS;
  formFields: InputDefinition[] = FORM_FIELDS;
  resetPasswordFormFields: InputDefinition[] = RESET_PASSWORD_FORM_FIELDS;
  tableColumns: ColumnDefinition[] = TABLE_COLUMNS
  trashTableColumns: ColumnDefinition[] = TRASH_TABLE_COLUMNS
  statusOptions: string[] = STATUS_OPTIONS;
  priorityOptions: string[] = PRIORITY_OPTIONS;
  filterColumns: FilterColumns[] = FILTER_COLUMNS;
  detailsColumns: ItemDetailsColumns[] = DETAILS_COLUMNS;
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

  // Opravené filtrovací proměnné, aby odpovídaly konfigu
  filterUserLoginId: string = '';
  filterUserEmail: string = '';
  filterLastLoginAt: string = '';
  filterCreatedAt: string = '';
  filterUpdatedAt: string = '';
  filterRoleName: string = '';
  filterSortBy: string = '';
  filterSortDirection: 'asc' | 'desc' = 'asc';

  private activeRequestsCache: Map<number, ItemType[]> = new Map();
  private trashRequestsCache: Map<number, ItemType[]> = new Map();
  private currentActiveFilters: FilterParams = {};
  private currentTrashFilters: FilterParams = {};

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

  // Veřejná metoda pro znovunačtení dat, volaná z HTML
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

    // Pokud existuje filtr role_name, přidej ho pod správným klíčem pro backend
    if (this.filterRoleName) {
      filters['role_name'] = this.filterRoleName;
    }

    return filters;
  }

  private fetchPaginatedData(
    isTrash: boolean,
    page: number,
    itemsPerPage: number,
    cache: Map<number, ItemType[]>,
    currentFilters: FilterParams
  ): Observable<PaginatedResponse<ItemType>> {
    this.errorMessage = null; // Reset chybové zprávy
    const newFilters = this.getBaseFilters();
    if (isTrash) {
      newFilters['only_trashed'] = 'true';
    } else {
      newFilters['is_deleted'] = 'false';
    }

    console.log('Sending filters to backend:', newFilters);

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
    cache: Map<number, ItemType[]>
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
    return this.fetchPaginatedData(false, this.currentPage, this.itemsPerPage, this.activeRequestsCache, this.currentActiveFilters);
  }

  loadTrashRequests(): Observable<PaginatedResponse<ItemType>> {
    return this.fetchPaginatedData(true, this.trashCurrentPage, this.trashItemsPerPage, this.trashRequestsCache, this.currentTrashFilters);
  }

  toggleTable(): void {
    this.showTrashTable = !this.showTrashTable;
    this.forceFullRefresh();
  }

  applyFilters(filters: any): void {
    this.filterUserLoginId = filters.user_login_id || '';
    this.filterUserEmail = filters.user_email || '';
    this.filterLastLoginAt = filters.last_login_at || '';
    this.filterCreatedAt = filters.created_at || '';
    this.filterUpdatedAt = filters.updated_at || '';
    // Změna pro přímé mapování role_name
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

  public forceFullRefresh(): void {
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


  handleResetPasswordFormOpened(item: ItemType) {
    this.showResetPasswordForm = true;
    const itemToEdit = { ...item };
    itemToEdit.target_user_id = itemToEdit.id;
    itemToEdit.current_user_id = this.authService.getUserId();
    this.selectedItemForEdit = itemToEdit;
  }

  handleResetPasswordFormSubmitted(formData: ItemType) {

    
    if (!formData.target_user_id || !formData.current_user_id) {
      console.error('ID cílového nebo aktuálního uživatele chybí.');
      this.handleResetPasswordFormClosed();
      return;
    }

    const passwordData = {
      old_password: formData.old_password,
      new_password: formData.new_password,
      new_password_confirmation: formData.new_password_confirmation,
      current_user_id: parseInt(formData.current_user_id, 10),
      target_user_id: formData.target_user_id,
    };

    console.log('Odesílaná data pro změnu hesla:', passwordData);
    this.updatePassword(passwordData.target_user_id, passwordData)
      .pipe(
        finalize(() => {
          this.handleResetPasswordFormClosed();
        })
      )
      .subscribe({
        next: (response) => {
          console.log('Heslo bylo úspěšně změněno.', response);
          this.forceFullRefresh();
        },
        error: (err) => {
          console.error('Chyba při změně hesla:', err);
          this.errorMessage = err.message || 'Chyba při změně hesla. Zkuste to prosím znovu.';
          this.cd.markForCheck();
        }
      });
  }

  handleResetPasswordFormClosed(): void {
    this.showResetPasswordForm = false;
  }
}
