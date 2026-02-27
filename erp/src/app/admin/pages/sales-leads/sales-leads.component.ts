import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { BaseDataComponent } from '../../components/base-data/base-data.component';
import { TableBuilderComponent } from '../../components/builders/table-builder/table-builder.component';
import { TrashTableBuilderComponent } from '../../components/builders/trash-table-builder/trash-table-builder.component';
import { FormBuilderComponent } from '../../components/builders/form-builder/form-builder.component';
import { FilterFormBuilderComponent } from '../../components/builders/filter-form-builder/filter-form-builder.component';
import { DetailsbuilderComponent } from '../../components/builders/details-builder/details-builder.component';
import { PaginationButtonsBuilderComponent } from '../../components/builders/pagination-buttons-builder/pagination-buttons-builder.component';
import { DataHandler } from '../../../core/services/data-handler.service';
import { GenericTableService, FilterParams } from '../../../core/services/generic-table.service';
import { AuthService } from '../../../core/auth/auth.service';
import { AlertDialogService } from '../../../core/services/alert-dialog.service';
import { HasPermissionDirective } from '../../../core/directives/has-permission.directive';

import {
  SALES_LEAD_BUTTONS,
  SALES_LEAD_FORM_FIELDS,
  SALES_LEAD_COLUMNS,
  SALES_LEAD_TRASH_COLUMNS,
  SALES_LEAD_FILTER_COLUMNS,
  SALES_LEAD_DETAILS_COLUMNS
} from './sales-leads.config';

@Component({
  selector: 'app-sales-leads',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableBuilderComponent, TrashTableBuilderComponent,
    FormBuilderComponent, FilterFormBuilderComponent, DetailsbuilderComponent,
    HasPermissionDirective, PaginationButtonsBuilderComponent
  ],
  templateUrl: './sales-leads.component.html',
  styleUrl: '../default-style.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesLeadsComponent extends BaseDataComponent<any> implements OnInit {
  @ViewChild('activeTable') activeTable!: TableBuilderComponent;

  override apiEndpoint: string = 'sales_leads';
  buttons = SALES_LEAD_BUTTONS;
  formFields = SALES_LEAD_FORM_FIELDS;
  salesLeadColumns = SALES_LEAD_COLUMNS;
  trashSalesLeadColumns = SALES_LEAD_TRASH_COLUMNS;
  filterColumns = SALES_LEAD_FILTER_COLUMNS;
  detailsColumns = SALES_LEAD_DETAILS_COLUMNS;

  selectedItemForEdit: any | null = null;
  selectedItemForDetails: any | null = null;
  filters: FilterParams = { sort_by: 'id', sort_direction: 'desc' };

  constructor(
    protected override dataHandler: DataHandler,
    protected override cd: ChangeDetectorRef,
    protected override genericTableService: GenericTableService,
    private authService: AuthService,
    private alertDialogService: AlertDialogService,
    private router: Router
  ) {
    super(dataHandler, cd, genericTableService);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.refreshData();
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

  refreshData(): void { this.forceFullRefresh(this.filters); }
  applyFilters(f: FilterParams): void { this.filters = { ...this.filters, ...f }; this.currentPage = 1; this.refreshData(); }
  clearFilters(): void { this.filters = { sort_by: 'id', sort_direction: 'desc' }; this.refreshData(); }
  handlePageChange(p: number): void { this.onHandlePageChange(p, this.filters); }
  handleItemsPerPageChange(v: number): void { this.onHandleItemsPerPageChange(v, this.filters); }
  exportActiveTable(): void { this.activeTable?.exportToCSV(); }

  handleCreateFormOpened(): void { this.selectedItemForEdit = null; this.showCreateForm = true; }
  handleEditFormOpened(item: any): void { this.selectedItemForEdit = { ...item }; this.showCreateForm = true; }
  handleFormSubmitted(formData: any): void {
    this.isLoading = true;
    const req = formData.id ? this.updateData(formData.id, formData) : this.postData(formData);
    req.pipe(finalize(() => { this.isLoading = false; this.showCreateForm = false; this.cd.markForCheck(); }))
       .subscribe(() => this.refreshData());
  }
  handleViewDetails(item: any): void {
    this.getItemDetails(item.id).subscribe(d => { this.selectedItemForDetails = d; this.showDetails = true; this.cd.markForCheck(); });
  }
  onCancelForm() { this.showCreateForm = false; }
  handleCloseDetails() { this.showDetails = false; }
}