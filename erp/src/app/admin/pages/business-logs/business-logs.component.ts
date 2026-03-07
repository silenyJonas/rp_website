import { Component, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import * as Core from '../../../shared/imports/core-providers';
import { SHARED_UI_BUILDERS } from '../../../shared/imports/shared-ui-builders';
import { TableBuilderComponent } from '../../components/builders/table-builder/table-builder.component';
import { BaseDataComponent } from '../../components/base-data/base-data.component';
import * as Config from './business-logs.config';

@Component({
  selector: 'app-business-logs',
  standalone: true,
  imports: [SHARED_UI_BUILDERS],
  templateUrl: './business-logs.component.html',
  styleUrl: '../default-style.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusinessLogsComponent extends BaseDataComponent<any> implements Core.OnInit {
  // Přímý import ViewChild zajistí, že Angular správně prováže referenci na tabulku
  @ViewChild('activeTable') activeTable!: TableBuilderComponent;

  override apiEndpoint: string = 'business_logs';

  // Logika ponechána: Odstranění create a edit pro logy
  buttons = Config.BUTTONS.filter(b => b.action !== 'create' && b.action !== 'edit');
  tableColumns = Config.TABLE_COLUMNS;
  filterColumns = Config.FILTER_COLUMNS;
  detailsColumns = Config.DETAILS_COLUMNS;

  selectedItemForDetails: any | null = null;

  // Logika ponechána: Defaultní řazení podle času
  filters: Core.FilterParams = {
    sort_by: 'created_at',
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
    this.currentPage = 1;
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

  // --- Handlery detailů ---

  handleViewDetails(item: any): void {
    // Zachování specifické logiky pro ID logu
    const logId = item.business_log_id || item.id;
    if (!logId) return;

    this.getItemDetails(logId).subscribe({
      next: (details) => {
        this.selectedItemForDetails = details;
        this.showDetails = true;
        this.cd.markForCheck();
      },
      complete: () => {
        this.cd.markForCheck();
      }
    });
  }

  handleCloseDetails(): void {
    this.selectedItemForDetails = null;
    this.showDetails = false;
    this.cd.markForCheck();
  }
}