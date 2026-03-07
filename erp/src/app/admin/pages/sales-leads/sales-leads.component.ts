// 1. Dekorátory (Nutné pro stabilitu kompilace a eliminaci JIT chyb)
import { Component, ViewChild, ChangeDetectionStrategy } from '@angular/core';

// 2. Sjednocené jádro (Služby, Typy, RxJS operátory)
import * as Core from '../../../shared/imports/core-providers';

// 3. UI Buildery (Komponenty a Typy)
import { SHARED_UI_BUILDERS } from '../../../shared/imports/shared-ui-builders';
import { TableBuilderComponent } from '../../components/builders/table-builder/table-builder.component';

// 4. Ostatní (Báze a Konfigurace)
import { BaseDataComponent } from '../../components/base-data/base-data.component';
import * as Config from './sales-leads.config';

@Component({
  selector: 'app-sales-leads',
  standalone: true,
  imports: [SHARED_UI_BUILDERS],
  templateUrl: './sales-leads.component.html',
  styleUrl: '../default-style.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesLeadsComponent extends BaseDataComponent<any> implements Core.OnInit {
  @ViewChild('activeTable') activeTable!: TableBuilderComponent;

  override apiEndpoint: string = 'sales_leads';

  // Konfigurace načtená přes barrel Config
  buttons = Config.SALES_LEAD_BUTTONS;
  formFields = Config.SALES_LEAD_FORM_FIELDS;
  salesLeadColumns = Config.SALES_LEAD_COLUMNS;
  trashSalesLeadColumns = Config.SALES_LEAD_TRASH_COLUMNS;
  filterColumns = Config.SALES_LEAD_FILTER_COLUMNS;
  detailsColumns = Config.SALES_LEAD_DETAILS_COLUMNS;

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
    private alertDialogService: Core.AlertDialogService,
    private router: Core.Router
  ) {
    super(dataHandler, cd, genericTableService);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.refreshData();
  }

  // --- Specifická logika Sales Leads (IDENTICKÁ) ---

  handleGenerateFormLink(item: any): void {
    const url = `${window.location.origin}/order_form/lead_id=${item.id}`;

    navigator.clipboard.writeText(url).then(() => {
      this.alertDialogService.open('Odkaz zkopírován', `Odkaz pro lead ID: ${item.id} je ve schránce.`, 'success');
      this.logAction(item);
    }).catch(() => {
      this.alertDialogService.open('Chyba', 'Nepodařilo se zkopírovat odkaz.', 'danger');
    });
  }

  private logAction(item: any): void {
    const logData = {
      origin: 'SalesLeads',
      event_type: 'LINK_GENERATED',
      module: 'SalesLead',
      description: `Generován odkaz pro lead ID: ${item.id} (Email: ${item.contact_email || 'N/A'})`,
      affected_entity_type: 'sales_lead',
      affected_entity_id: item.id,
      user_id_plain: this.authService.getUserId()?.toString(),
      user_email_plain: this.authService.getUserEmail()
    };
    this.dataHandler.post('business_logs', logData).subscribe();
  }

  // --- Správa dat a filtrů ---

  public refreshData(): void { 
    this.forceFullRefresh(this.filters); 
  }

  applyFilters(f: Core.FilterParams): void { 
    this.filters = { ...this.filters, ...f }; 
    this.currentPage = 1; 
    this.refreshData(); 
  }

  clearFilters(): void { 
    this.filters = { sort_by: 'id', sort_direction: 'desc' }; 
    this.refreshData(); 
  }

  handlePageChange(p: number): void { 
    this.onHandlePageChange(p, this.filters); 
  }

  handleItemsPerPageChange(v: number): void { 
    this.onHandleItemsPerPageChange(v, this.filters); 
  }

  exportActiveTable(): void { 
    this.activeTable?.exportToCSV(); 
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
    const req = formData.id ? this.updateData(formData.id, formData) : this.postData(formData);
    req.pipe(
      Core.finalize(() => { 
        this.showCreateForm = false; 
        this.cd.markForCheck(); 
      })
    ).subscribe(() => this.refreshData());
  }

  handleViewDetails(item: any): void {
    this.getItemDetails(item.id).subscribe(d => { 
      this.selectedItemForDetails = d; 
      this.showDetails = true; 
      this.cd.markForCheck(); 
    });
  }

  onCancelForm(): void { 
    this.showCreateForm = false; 
    this.selectedItemForEdit = null;
    this.cd.markForCheck();
  }

  handleCloseDetails(): void { 
    this.showDetails = false; 
    this.selectedItemForDetails = null;
    this.cd.markForCheck();
  }
}