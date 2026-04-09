import { Component, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import * as Core from '../../../shared/imports/core-providers';
import { SHARED_UI_BUILDERS } from '../../../shared/imports/shared-ui-builders';
import { TableBuilderComponent } from '../../components/builders/table-builder/table-builder.component';
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

  override apiEndpoint: string = 'web/sales_leads';
  // Endpoint pro logy je definován zde pro metodu postData, 
  // kterou využijeme v logAction
  private logEndpoint: string = 'web/logs';

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
    private router: Core.Router
  ) {
    super(dataHandler, cd, genericTableService);
  }

  get toolbarButtons(): Core.Button[] {
    return Config.SALES_LEAD_TOOLBAR_BUTTONS.map(btn => {
      let updatedBtn = { ...btn };

      if (updatedBtn.permission && !this.permissionService.hasPermission(updatedBtn.permission)) {
        updatedBtn.showIf = false;
      }

      switch (btn.action) {
        case 'toggleFilters':
          updatedBtn.label = this.isFilterVisible ? 'Skrýt' : 'Filtry';
          updatedBtn.isActive = this.isFilterVisible;
          break;
        case 'handleCreateFormOpened':
        case 'exportActiveTable':
          if (updatedBtn.showIf !== false) {
            updatedBtn.showIf = !this.showTrashTable;
          }
          break;
        case 'toggleTable':
          updatedBtn.label = this.showTrashTable ? 'Aktivní' : 'Smazané';
          break;
      }

      return updatedBtn;
    });
  }

  handleToolbarAction(action: string): void {
    const actions: { [key: string]: () => void } = {
      toggleFilters: () => this.toggleFilters(),
      handleCreateFormOpened: () => this.handleCreateFormOpened(),
      exportActiveTable: () => this.exportActiveTable(),
      toggleTable: () => this.toggleTable()
    };
    if (actions[action]) actions[action]();
  }

  override ngOnInit(): void {
    // BaseDataComponent ngOnInit inicializuje destroy$ Subject
    super.ngOnInit();
    // Automaticky zavolá refreshData() po ověření přihlášení
    this.initWithAuthCheck(this.router);
  }

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
      event_type: 'LINK_GENERATED',
      module: 'SalesLead',
      description: `Generován odkaz pro lead ID: ${item.id} (Email: ${item.contact_email || 'N/A'})`,
      affected_entity_type: 'sales_lead',
      affected_entity_id: item.id,
      user_id_plain: this.authService.getUserId()?.toString(),
      user_plain: this.authService.getUserEmail(),
      context_data: JSON.stringify({ component: 'SalesLeads' }) 
    };

    this.dataHandler.post(this.logEndpoint, logData)
      .pipe(Core.takeUntil(this.destroy$))
      .subscribe();
  }

  override refreshData(): void {
    this.forceFullRefresh(this.filters);
  }

  applyFilters(f: Core.FilterParams): void {
    this.filters = { ...this.filters, ...f };
    this.currentPage = 1;
    this.refreshData();
  }

  clearFilters(): void {
    this.filters = { ...this.defaultFilters };
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