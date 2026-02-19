import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { BaseDataComponent } from '../../components/base-data/base-data.component';
import { GenericTableComponent } from '../../components/generic-table/generic-table.component';
import { GenericTrashTableComponent } from '../../components/generic-trash-table/generic-trash-table.component';
import { GenericFormComponent } from '../../components/generic-form/generic-form.component';
import { GenericFilterFormComponent } from '../../components/generic-filter-form/generic-filter-form.component';
import { GenericDetailsComponent } from '../../components/generic-details/generic-details.component';
import { PaginationButtonsComponent } from '../../components/pagination-buttons/pagination-buttons.component';

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
    CommonModule, FormsModule, GenericTableComponent, GenericTrashTableComponent,
    GenericFormComponent, GenericFilterFormComponent, GenericDetailsComponent,
    HasPermissionDirective, PaginationButtonsComponent
  ],
  templateUrl: './sales-leads.component.html',
  styleUrl: '../default-style.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesLeadsComponent extends BaseDataComponent<any> implements OnInit {
  @ViewChild('activeTable') activeTable!: GenericTableComponent;

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

  // --- LOGIKA GENEROUVÁNÍ LINKU A LOGOVÁNÍ ---
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

  // --- DATA FLOW ---
  refreshData(): void { this.forceFullRefresh(this.filters); }
  applyFilters(f: FilterParams): void { this.filters = { ...this.filters, ...f }; this.currentPage = 1; this.refreshData(); }
  clearFilters(): void { this.filters = { sort_by: 'id', sort_direction: 'desc' }; this.refreshData(); }
  handlePageChange(p: number): void { this.onHandlePageChange(p, this.filters); }
  handleItemsPerPageChange(v: number): void { this.onHandleItemsPerPageChange(v, this.filters); }
  exportActiveTable(): void { this.activeTable?.exportToCSV(); }

  // --- MODÁLY ---
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