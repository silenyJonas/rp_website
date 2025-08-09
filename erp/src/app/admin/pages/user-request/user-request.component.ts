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
import { RawRequestCommission } from '../../../shared/interfaces/raw-request-commission';
import { GenericFormComponent, InputDefinition } from '../../components/generic-form/generic-form.component';
import { Observable, of, forkJoin } from 'rxjs'; // Důležitý import 'forkJoin'
import { tap, retry } from 'rxjs/operators';
import {
  USER_REQUEST_BUTTONS,
  USER_REQUEST_FORM_FIELDS,
  USER_REQUEST_COLUMNS,
  USER_REQUEST_TRASH_COLUMNS,
  USER_REQUEST_STATUS_OPTIONS,
  USER_REQUEST_PRIORITY_OPTIONS
} from './user-request.config';

interface TrashFilterParams extends FilterParams {
  only_trashed?: string;
}

@Component({
  selector: 'app-user-request',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GenericTableComponent,
    GenericTrashTableComponent,
    GenericFormComponent,
  ],
  templateUrl: './user-request.component.html',
  styleUrl: './user-request.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserRequestComponent extends BaseDataComponent<RawRequestCommission> implements OnInit {

  override apiEndpoint: string = 'raw_request_commissions';
  override trashData: RawRequestCommission[] = [];
  override isLoading: boolean = false;

  buttons: Buttons[] = USER_REQUEST_BUTTONS;
  formFields: InputDefinition[] = USER_REQUEST_FORM_FIELDS;
  userRequestColumns: ColumnDefinition[] = USER_REQUEST_COLUMNS
  trashUserRequestColumns: ColumnDefinition[] = USER_REQUEST_TRASH_COLUMNS
  statusOptions: string[] = USER_REQUEST_STATUS_OPTIONS;
  priorityOptions: string[] = USER_REQUEST_PRIORITY_OPTIONS;

  showTrashTable: boolean = false;
  showCreateForm: boolean = false;
  isTrashTableLoading: boolean = false;

  currentPage: number = 1;
  itemsPerPage: number = 15;
  totalItems: number = 0;
  totalPages: number = 0;

  trashCurrentPage: number = 1;
  trashItemsPerPage: number = 15;
  trashTotalItems: number = 0;
  trashTotalPages: number = 0;

  filterSearch: string = '';
  filterStatus: string = '';
  filterPriority: string = '';
  filterEmail: string = '';

  private activeRequestsCache: Map<number, RawRequestCommission[]> = new Map();
  private trashRequestsCache: Map<number, RawRequestCommission[]> = new Map();
  private currentActiveFilters: FilterParams = {};
  private currentTrashFilters: FilterParams = {};

  selectedItemForEdit: RawRequestCommission | null = null;
  
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

  loadActiveRequests(): Observable<PaginatedResponse<RawRequestCommission>> {
    this.isLoading = true;
    this.cd.detectChanges();

    const currentFilters: FilterParams = {
      search: this.filterSearch,
      status: this.filterStatus,
      priority: this.filterPriority,
      email: this.filterEmail,
      is_deleted: 'false'
    };

    if (JSON.stringify(currentFilters) !== JSON.stringify(this.currentActiveFilters)) {
      this.activeRequestsCache.clear();
      this.currentPage = 1;
      this.currentActiveFilters = currentFilters;
    }

    if (this.activeRequestsCache.has(this.currentPage)) {
      this.data = this.activeRequestsCache.get(this.currentPage)!;
      this.isLoading = false;
      this.cd.detectChanges();
      this.preloadActivePage(this.currentPage + 1);
      return of({} as PaginatedResponse<RawRequestCommission>);
    }

    return this.genericTableService.getPaginatedData<RawRequestCommission>(
      this.apiEndpoint,
      this.currentPage,
      this.itemsPerPage,
      currentFilters
    ).pipe(
      retry(1),
      tap((response: PaginatedResponse<RawRequestCommission>) => {
        this.data = response.data;
        this.totalItems = response.total;
        this.totalPages = response.last_page;
        this.currentPage = response.current_page;
        this.isLoading = false;
        this.activeRequestsCache.set(this.currentPage, response.data);
        this.cd.detectChanges();
        this.preloadActivePage(this.currentPage + 1);
      })
    );
  }

  private preloadActivePage(page: number): void {
    if (page > this.totalPages || this.activeRequestsCache.has(page)) {
      return;
    }

    const currentFilters: FilterParams = {
      search: this.filterSearch,
      status: this.filterStatus,
      priority: this.filterPriority,
      email: this.filterEmail,
      is_deleted: 'false'
    };

    this.genericTableService.getPaginatedData<RawRequestCommission>(
      this.apiEndpoint,
      page,
      this.itemsPerPage,
      currentFilters
    ).subscribe({
      next: (response: PaginatedResponse<RawRequestCommission>) => {
        this.activeRequestsCache.set(page, response.data);
      },
      error: (error) => {
        console.error(`Chyba při pre-fetching aktivních dat pro stránku ${page}:`, error);
      }
    });
  }

  loadTrashRequests(): Observable<PaginatedResponse<RawRequestCommission>> {
    this.isTrashTableLoading = true;
    this.cd.detectChanges();

    const trashFilters: TrashFilterParams = {
      only_trashed: 'true',
      search: this.filterSearch,
      status: this.filterStatus,
      priority: this.filterPriority,
      email: this.filterEmail
    };

    if (JSON.stringify(trashFilters) !== JSON.stringify(this.currentTrashFilters)) {
      this.trashRequestsCache.clear();
      this.trashCurrentPage = 1;
      this.currentTrashFilters = trashFilters;
    }

    if (this.trashRequestsCache.has(this.trashCurrentPage)) {
      this.trashData = this.trashRequestsCache.get(this.trashCurrentPage)!;
      this.isTrashTableLoading = false;
      this.cd.detectChanges();
      this.preloadTrashPage(this.trashCurrentPage + 1);
      return of({} as PaginatedResponse<RawRequestCommission>);
    }

    return this.genericTableService.getPaginatedData<RawRequestCommission>(
      this.apiEndpoint,
      this.trashCurrentPage,
      this.trashItemsPerPage,
      trashFilters
    ).pipe(
      retry(1),
      tap((response: PaginatedResponse<RawRequestCommission>) => {
        this.trashData = response.data;
        this.trashTotalItems = response.total;
        this.trashTotalPages = response.last_page;
        this.trashCurrentPage = response.current_page;
        this.isTrashTableLoading = false;
        this.trashRequestsCache.set(this.trashCurrentPage, response.data);
        this.cd.detectChanges();
        this.preloadTrashPage(this.trashCurrentPage + 1);
      })
    );
  }

  private preloadTrashPage(page: number): void {
    if (page > this.trashTotalPages || this.trashRequestsCache.has(page)) {
      return;
    }

    const trashFilters: TrashFilterParams = {
      only_trashed: 'true',
      search: this.filterSearch,
      status: this.filterStatus,
      priority: this.filterPriority,
      email: this.filterEmail
    };

    this.genericTableService.getPaginatedData<RawRequestCommission>(
      this.apiEndpoint,
      page,
      this.trashItemsPerPage,
      trashFilters
    ).subscribe({
      next: (response: PaginatedResponse<RawRequestCommission>) => {
        this.trashRequestsCache.set(page, response.data);
      },
      error: (error) => {
      }
    });
  }

  toggleTable(): void {
    this.showTrashTable = !this.showTrashTable;
    this.forceFullRefresh();
  }

  applyFilters(): void {
    this.forceFullRefresh();
  }

  clearFilters(): void {
    this.filterSearch = '';
    this.filterStatus = '';
    this.filterPriority = '';
    this.filterEmail = '';
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

  get pagesArray(): number[] {
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  get trashPagesArray(): number[] {
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.trashCurrentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.trashTotalPages, startPage + maxPagesToShow - 1);
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
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

    const activeObs$ = this.loadActiveRequests();
    const trashObs$ = this.loadTrashRequests();

    forkJoin([activeObs$, trashObs$]).subscribe(() => {
        this.isLoading = false;
        this.isTrashTableLoading = false;
        this.cd.detectChanges();
    });
  }

  handleCreateFormOpened(): void {
    this.selectedItemForEdit = null;
    this.showCreateForm = !this.showCreateForm;
  }

  handleEditFormOpened(item: RawRequestCommission): void {
    this.selectedItemForEdit = item;
    this.showCreateForm = true;
  }

  handleFormSubmitted(formData: RawRequestCommission): void {
    this.showCreateForm = false;
    if (formData.id) {
      this.isLoading = true;
      this.updateData(formData.id, formData).subscribe({
        next: (response) => {
          this.forceFullRefresh();
        },
        error: (err) => {
          this.isLoading = false;
          this.cd.detectChanges();
        }
      });
    } else {
      this.isLoading = true;
      this.postData(formData).subscribe({
        next: (response) => {
          this.forceFullRefresh();
        },
        error: (err) => {
          this.isLoading = false;
          this.cd.detectChanges();
        }
      });
    }
  }

  onCancelForm() {
    this.showCreateForm = false;
    this.selectedItemForEdit = null;
  }
}