// 1. Dekorátory (Nutné pro stabilitu kompilace a eliminaci JIT chyb)
import { Component, ViewChild, ChangeDetectionStrategy } from '@angular/core';

// 2. Sjednocené jádro (Služby, Typy, RxJS operátory)
import * as Core from '../../../shared/imports/core-providers';

// 3. UI Buildery (Komponenty a Typy)
import { SHARED_UI_BUILDERS } from '../../../shared/imports/shared-ui-builders';
import { TableBuilderComponent } from '../../components/builders/table-builder/table-builder.component';

// 4. Ostatní (Báze a Konfigurace)
import { BaseDataComponent } from '../../components/base-data/base-data.component';
import * as Config from './job-applications.config';

@Component({
  selector: 'app-job-applications',
  standalone: true,
  imports: [SHARED_UI_BUILDERS],
  templateUrl: './job-applications.component.html',
  styleUrl: '../default-style.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobApplicationsComponent extends BaseDataComponent<any> implements Core.OnInit {
  @ViewChild('activeTable') activeTable!: TableBuilderComponent;
  
  override apiEndpoint: string = 'job_applications';
  
  // Logika zachována: Filtrace create tlačítka z konfigurace
  buttons = Config.JOB_APPLICATION_BUTTONS.filter(b => b.action !== 'create');
  formFields = Config.JOB_APPLICATION_FORM_FIELDS;
  columns = Config.JOB_APPLICATION_COLUMNS;
  trashColumns = Config.JOB_APPLICATION_TRASH_COLUMNS;
  filterColumns = Config.JOB_APPLICATION_FILTER_COLUMNS;
  detailsColumns = Config.JOB_APPLICATION_DETAILS_COLUMNS;

  selectedItemForEdit: any = null;
  selectedItemForDetails: any = null;

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

  // --- Handlery formulářů a detailů ---

  handleEditFormOpened(item: any): void { 
    // IDENTICKÁ LOGIKA: Reset formuláře s timeoutem a hlubokou kopií
    this.selectedItemForEdit = null;
    this.showCreateForm = false;
    this.cd.detectChanges();

    setTimeout(() => {
      this.selectedItemForEdit = JSON.parse(JSON.stringify(item)); 
      this.showCreateForm = true; 
      this.cd.markForCheck();
    }, 50);
  }
  
  handleViewDetails(item: any): void {
    if (!item.id) return;
    this.getItemDetails(item.id).subscribe({
      next: (res) => {
        this.selectedItemForDetails = res;
        this.showDetails = true;
        this.cd.markForCheck();
      }
    });
  }

  handleFormSubmitted(formData: any): void {
    // Logika zachována: Používá se updateData (Job Applications se většinou jen editují)
    this.updateData(formData.id, formData).pipe(
      Core.finalize(() => {
        this.showCreateForm = false;
        this.selectedItemForEdit = null;
        this.cd.markForCheck();
      })
    ).subscribe(() => this.refreshData());
  }

  onCancelForm(): void {
    this.showCreateForm = false;
    this.selectedItemForEdit = null;
    this.cd.markForCheck();
  }
}