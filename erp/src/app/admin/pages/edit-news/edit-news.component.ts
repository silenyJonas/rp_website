// 1. Dekorátory (Nutné pro stabilitu kompilace a eliminaci JIT chyb)
import { Component, ViewChild, ChangeDetectionStrategy } from '@angular/core';

// 2. Sjednocené jádro (Služby, Typy, RxJS operátory)
import * as Core from '../../../shared/imports/core-providers';

// 3. UI Buildery (Komponenty a Typy)
import { SHARED_UI_BUILDERS } from '../../../shared/imports/shared-ui-builders';
import { TableBuilderComponent } from '../../components/builders/table-builder/table-builder.component';

// 4. Ostatní (Báze a Konfigurace)
import { BaseDataComponent } from '../../components/base-data/base-data.component';
import * as Config from './edit-news.config';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [SHARED_UI_BUILDERS],
  templateUrl: './edit-news.component.html',
  styleUrl: '../default-style.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditNewsComponent extends BaseDataComponent<any> implements Core.OnInit {
  @ViewChild('activeTable') activeTable!: TableBuilderComponent;

  override apiEndpoint: string = 'news';

  // Konfigurace načtená přes barrel Config
  buttons = Config.NEWS_BUTTONS;
  formFields = Config.NEWS_FORM_FIELDS;
  newsColumns = Config.NEWS_COLUMNS;
  trashNewsColumns = Config.NEWS_TRASH_COLUMNS;
  filterColumns = Config.NEWS_FILTER_COLUMNS;
  detailsColumns = Config.NEWS_DETAILS_COLUMNS;

  selectedItemForEdit: any | null = null;
  selectedItemForDetails: any | null = null;

  filters: Core.FilterParams = {
    sort_by: 'id',
    sort_direction: 'desc'
  };

  constructor(
    protected override dataHandler: Core.DataHandler,
    protected override cd: Core.ChangeDetectorRef,
    protected override genericTableService: Core.GenericTableService,
    private authService: Core.AuthService,
    private router: Core.Router
  ) {
    super(dataHandler, cd, genericTableService);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.authService.isLoggedIn$.subscribe(loggedIn => {
      if (loggedIn) {
        this.refreshData();
      } else {
        this.router.navigate(['/auth/login']);
      }
    });
  }

  // --- Správa dat a filtrů ---

  public refreshData(): void {
    this.forceFullRefresh(this.filters);
  }

  applyFilters(newFilters: Core.FilterParams): void {
    this.filters = { ...this.filters, ...newFilters };
    this.currentPage = 1;
    this.refreshData();
  }

  clearFilters(): void {
    this.filters = { sort_by: 'id', sort_direction: 'desc' };
    this.refreshData();
  }

  handlePageChange(page: number): void {
    this.onHandlePageChange(page, this.filters);
  }

  handleItemsPerPageChange(value: number): void {
    this.onHandleItemsPerPageChange(value, this.filters);
  }

  exportActiveTable(): void {
    if (this.activeTable) this.activeTable.exportToCSV();
  }

  // --- Handlery formulářů a detailů ---

  handleCreateFormOpened(): void {
    this.selectedItemForEdit = null;
    this.showCreateForm = true;
  }

  handleEditFormOpened(item: any): void {
    this.selectedItemForEdit = { ...item };
    this.showCreateForm = true;
  }

  handleFormSubmitted(formData: any): void {
    this.isLoading = true;
    const request$ = formData.id 
      ? this.updateData(formData.id, formData) 
      : this.postData(formData);

    request$.pipe(
      Core.finalize(() => {
        this.isLoading = false;
        this.showCreateForm = false;
        this.cd.markForCheck();
      })
    ).subscribe(() => this.refreshData());
  }

  handleViewDetails(item: any): void {
    if (!item.id) return;
    this.isLoading = true;
    this.getItemDetails(item.id).subscribe({
      next: (details) => {
        this.selectedItemForDetails = details;
        this.showDetails = true;
        this.cd.markForCheck();
      }
    });
  }

  handleCloseDetails(): void {
    this.selectedItemForDetails = null;
    this.showDetails = false;
    this.cd.markForCheck();
  }

  onCancelForm(): void {
    this.showCreateForm = false;
    this.selectedItemForEdit = null;
    this.cd.markForCheck();
  }
}