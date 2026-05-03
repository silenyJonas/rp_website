import { Component, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import * as Core from '../../../shared/imports/core-providers';
import { SHARED_UI_BUILDERS } from '../../../shared/imports/shared-ui-builders';
import { TableBuilderComponent } from '../../components/builders/table-builder/table-builder.component';
import { BaseDataComponent } from '../../components/base-data/base-data.component';
import * as Config from './customers.config';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [SHARED_UI_BUILDERS],
  templateUrl: './customers.component.html',
  styleUrl: '../default-style.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomersComponent extends BaseDataComponent<any> implements Core.OnInit {
  @ViewChild('activeTable') activeTable!: TableBuilderComponent;

  override apiEndpoint: string = 'shop/customers';

  buttons = Config.CUSTOMER_BUTTONS;
  formFields = Config.CUSTOMER_FORM_FIELDS;
  customerColumns = Config.CUSTOMER_COLUMNS;
  trashCustomerColumns = Config.CUSTOMER_TRASH_COLUMNS;
  filterColumns = Config.CUSTOMER_FILTER_COLUMNS;
  detailsColumns = Config.CUSTOMER_DETAILS_COLUMNS;

  selectedItemForEdit: any | null = null;
  selectedItemForDetails: any | null = null;

  filters: Core.FilterParams = {
    sort_by: 'created_at',
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
    return Config.CUSTOMER_TOOLBAR_BUTTONS.map(btn => {
      let updatedBtn = { ...btn };
      if (updatedBtn.permission && !this.permissionService.hasPermission(updatedBtn.permission)) {
        updatedBtn.showIf = false;
      }
      switch (btn.action) {
        case 'toggleFilters':
          updatedBtn.label = this.isFilterVisible ? 'Skrýt filtry' : 'Filtry';
          updatedBtn.isActive = this.isFilterVisible;
          break;
        case 'handleCreateFormOpened':
        case 'exportActiveTable':
          if (updatedBtn.showIf !== false) updatedBtn.showIf = !this.showTrashTable;
          break;
        case 'toggleTable':
          updatedBtn.label = this.showTrashTable ? 'Zpět na seznam' : 'Koš';
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
    super.ngOnInit();
    this.initWithAuthCheck(this.router);
  }

  override refreshData(): void { 
    this.forceFullRefresh(this.filters); 
  }

  applyFilters(newFilters: Core.FilterParams): void {
    this.filters = { ...this.filters, ...newFilters };
    this.currentPage = 1;
    this.refreshData();
  }

  clearFilters(): void {
    this.filters = { sort_by: 'created_at', sort_direction: 'desc' };
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

  handleCreateFormOpened(): void {
    this.selectedItemForEdit = null;
    this.showCreateForm = true;
  }

  handleEditFormOpened(item: any): void {
    this.selectedItemForEdit = { ...item };
    this.showCreateForm = true;
  }

  handleFormSubmitted(formData: any): void {
    const request$ = formData.id ? this.updateData(formData.id, formData) : this.postData(formData);
    request$.pipe(Core.finalize(() => { 
      this.showCreateForm = false; 
      this.cd.markForCheck(); 
    })).subscribe({
      next: () => this.refreshData(),
      error: (err: any) => this.alertDialogService.open('Chyba', err.error?.message || 'Uložení zákazníka selhalo.', 'danger')
    });
  }

  handleViewDetails(item: any): void {
    if (!item.id) return;
    this.getItemDetails(item.id).subscribe({
      next: (details) => { 
        this.selectedItemForDetails = details; 
        this.showDetails = true; 
        this.cd.markForCheck(); 
      },
      error: (err: any) => this.alertDialogService.open('Chyba', err.error?.message || 'Nepodařilo se načíst detail zákazníka.', 'danger')
    });
  }

  handleCloseDetails(): void { 
    this.selectedItemForDetails = null; 
    this.showDetails = false; 
  }

  onCancelForm(): void { 
    this.showCreateForm = false; 
    this.selectedItemForEdit = null; 
    this.cd.markForCheck(); 
  }

  handleItemRestored(): void { this.refreshData(); }
  handleItemDeleted(): void { this.refreshData(); }
}