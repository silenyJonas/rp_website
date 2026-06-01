import { Component, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import * as Core from '../../../shared/imports/core-providers';
import { SHARED_UI_BUILDERS } from '../../../shared/imports/shared-ui-builders';
import { TableBuilderComponent } from '../../components/builders/table-builder/table-builder.component';
import { BaseDataComponent } from '../../components/base-data/base-data.component';
import * as Config from './payment-methods.config';

@Component({
  selector: 'app-payment-methods',
  standalone: true,
  imports: [SHARED_UI_BUILDERS],
  templateUrl: './payment-methods.component.html',
  styleUrl: '../default-style.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentMethodsComponent extends BaseDataComponent<any> implements Core.OnInit {
  @ViewChild('activeTable') activeTable!: TableBuilderComponent;

  override apiEndpoint: string = 'shop/payment_methods';

  buttons = Config.PAYMENT_BUTTONS;
  formFields = Config.PAYMENT_FORM_FIELDS;
  columns = Config.PAYMENT_COLUMNS;
  filterColumns = Config.PAYMENT_FILTER_COLUMNS;
  detailsColumns = Config.PAYMENT_DETAILS_COLUMNS;

  selectedItemForEdit: any | null = null;
  selectedItemForDetails: any | null = null;

  filters: Core.FilterParams = {
    sort_by: 'sort_order',
    sort_direction: 'asc'
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
    return Config.PAYMENT_TOOLBAR_BUTTONS.map(btn => {
      let updatedBtn = { ...btn };
      if (updatedBtn.permission && !this.permissionService.hasPermission(updatedBtn.permission)) {
        updatedBtn.showIf = false;
      }
      switch (btn.action) {
        case 'toggleFilters':
          updatedBtn.label = this.isFilterVisible ? 'Skrýt' : 'Filtry';
          updatedBtn.isActive = this.isFilterVisible;
          break;
      }
      return updatedBtn;
    });
  }

  handleToolbarAction(action: string): void {
    const actions: { [key: string]: () => void } = {
      toggleFilters: () => this.toggleFilters(),
      exportActiveTable: () => this.exportActiveTable()
    };
    if (actions[action]) actions[action]();
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.initWithAuthCheck(this.router);
  }

  override refreshData(): void { this.forceFullRefresh(this.filters); }

  applyFilters(newFilters: Core.FilterParams): void {
    this.filters = { ...this.filters, ...newFilters };
    this.currentPage = 1;
    this.refreshData();
  }

  clearFilters(): void {
    this.filters = { sort_by: 'sort_order', sort_direction: 'asc' };
    this.currentPage = 1;
    this.refreshData();
  }

  handlePageChange(page: number): void { this.onHandlePageChange(page, this.filters); }
  handleItemsPerPageChange(value: number): void { this.onHandleItemsPerPageChange(value, this.filters); }

  exportActiveTable(): void {
    if (this.activeTable) this.activeTable.exportToCSV();
  }

  handleEditFormOpened(item: any): void {
    this.selectedItemForEdit = { ...item };
    this.showCreateForm = true;
  }

  handleFormSubmitted(formData: any): void {
    if (!formData.id) return;
    
    // Použijeme update metodu z BaseDataComponent
    this.updateData(formData.id, formData)
      .pipe(Core.finalize(() => { this.showCreateForm = false; this.cd.markForCheck(); }))
      .subscribe({
        next: () => this.refreshData(),
        error: (err: any) => this.alertDialogService.open('Chyba', err.error?.message || 'Aktualizace selhala.', 'danger')
      });
  }

  handleViewDetails(item: any): void {
    if (!item.id) return;
    this.getItemDetails(item.id).subscribe({
      next: (details) => { this.selectedItemForDetails = details; this.showDetails = true; this.cd.markForCheck(); },
      error: (err: any) => this.alertDialogService.open('Chyba', err.error?.message || 'Nepodařilo se načíst detail.', 'danger')
    });
  }

  handleCloseDetails(): void { this.selectedItemForDetails = null; this.showDetails = false; }
  onCancelForm(): void { this.showCreateForm = false; this.selectedItemForEdit = null; this.cd.markForCheck(); }
}