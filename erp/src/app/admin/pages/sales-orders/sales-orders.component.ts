import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { BaseDataComponent } from '../../components/base-data/base-data.component';
import { GenericTableComponent, Buttons } from '../../components/generic-table/generic-table.component';
import { GenericTrashTableComponent } from '../../components/generic-trash-table/generic-trash-table.component';
import { GenericFormComponent, InputDefinition } from '../../components/generic-form/generic-form.component';
import { GenericFilterFormComponent } from '../../components/generic-filter-form/generic-filter-form.component';
import { GenericDetailsComponent } from '../../components/generic-details/generic-details.component';
import { PaginationButtonsComponent } from '../../components/pagination-buttons/pagination-buttons.component';

import { DataHandler } from '../../../core/services/data-handler.service';
import { GenericTableService, FilterParams } from '../../../core/services/generic-table.service';
import { AuthService } from '../../../core/auth/auth.service';
import { HasPermissionDirective } from '../../../core/directives/has-permission.directive';

import {
  SALES_ORDER_BUTTONS,
  SALES_ORDER_FORM_FIELDS,
  SALES_ORDER_COLUMNS,
  SALES_ORDER_TRASH_COLUMNS,
  SALES_ORDER_FILTER_COLUMNS,
  SALES_ORDER_DETAILS_COLUMNS
} from './sales-orders.config';

@Component({
  selector: 'app-sales-orders',
  standalone: true,
  imports: [
    CommonModule, FormsModule, GenericTableComponent, GenericTrashTableComponent,
    GenericFormComponent, GenericFilterFormComponent, GenericDetailsComponent, 
    HasPermissionDirective, PaginationButtonsComponent
  ],
  templateUrl: './sales-orders.component.html',
  styleUrl: '../default-style.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesOrdersComponent extends BaseDataComponent<any> implements OnInit {
  @ViewChild('activeTable') activeTable!: GenericTableComponent;
  
  override apiEndpoint: string = 'sales_orders';
  
  // Konfigurace (Sales Orders se většinou nevytvářejí ručně, proto filtrujeme create)
  buttons: Buttons[] = SALES_ORDER_BUTTONS.filter(b => b.action !== 'create');
  formFields: InputDefinition[] = SALES_ORDER_FORM_FIELDS;
  columns = SALES_ORDER_COLUMNS;
  trashColumns = SALES_ORDER_TRASH_COLUMNS;
  filterColumns = SALES_ORDER_FILTER_COLUMNS;
  detailsColumns = SALES_ORDER_DETAILS_COLUMNS;

  selectedItemForEdit: any = null;
  selectedItemForDetails: any = null;

  // Sjednocené filtry pro BaseDataComponent
  filters: FilterParams = { 
    sort_by: 'id', 
    sort_direction: 'desc' 
  };

  constructor(
    protected override dataHandler: DataHandler,
    protected override cd: ChangeDetectorRef,
    protected override genericTableService: GenericTableService,
    private authService: AuthService,
    private router: Router
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

  // --- Data & Filtering Logic ---

  public refreshData(): void {
    this.forceFullRefresh(this.filters);
  }

  applyFilters(newFilters: FilterParams): void { 
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

  // --- Handlery pro záznamy ---

  handleEditFormOpened(item: any): void { 
    this.selectedItemForEdit = { ...item }; 
    this.showCreateForm = true; 
  }
  
  handleViewDetails(item: any): void {
    if (!item.id) return;
    this.isLoading = true;
    this.getItemDetails(item.id).subscribe({
      next: (res) => {
        this.selectedItemForDetails = res;
        this.showDetails = true;
        this.cd.markForCheck();
      }
    });
  }

  handleFormSubmitted(formData: any): void {
    this.isLoading = true;
    // Update existující realizace
    this.updateData(formData.id, formData).pipe(
      finalize(() => {
        this.isLoading = false;
        this.showCreateForm = false;
        this.cd.markForCheck();
      })
    ).subscribe(() => this.refreshData());
  }

  onCancelForm() {
    this.showCreateForm = false;
    this.selectedItemForEdit = null;
  }
}