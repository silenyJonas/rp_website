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
import { HasPermissionDirective } from '../../../core/directives/has-permission.directive';
import { RawRequestCommission } from '../../../shared/interfaces/raw-request-commission';

import {
  USER_REQUEST_BUTTONS,
  USER_REQUEST_FORM_FIELDS,
  USER_REQUEST_COLUMNS,
  USER_REQUEST_TRASH_COLUMNS,
  USER_REQUEST_FILTER_COLUMNS,
  USER_REQUEST_DETAILS_COLUMNS
} from './user-request.config';

@Component({
  selector: 'app-user-request',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableBuilderComponent, TrashTableBuilderComponent,
    FormBuilderComponent, FilterFormBuilderComponent, DetailsbuilderComponent,
    HasPermissionDirective, PaginationButtonsBuilderComponent
  ],
  templateUrl: './user-request.component.html',
  styleUrl: '../default-style.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserRequestComponent extends BaseDataComponent<RawRequestCommission> implements OnInit {
  @ViewChild('activeTable') activeTable!: TableBuilderComponent;

  override apiEndpoint: string = 'raw_request_commissions';

  buttons = USER_REQUEST_BUTTONS;
  formFields = USER_REQUEST_FORM_FIELDS;
  userRequestColumns = USER_REQUEST_COLUMNS;
  trashUserRequestColumns = USER_REQUEST_TRASH_COLUMNS;
  filterColumns = USER_REQUEST_FILTER_COLUMNS;
  detailsColumns = USER_REQUEST_DETAILS_COLUMNS;

  selectedItemForEdit: RawRequestCommission | null = null;
  selectedItemForDetails: any | null = null;

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
    if (this.activeTable) {
      this.activeTable.exportToCSV();
    }
  }

  handleCreateFormOpened(): void {
    this.selectedItemForEdit = null;
    this.showCreateForm = true;
  }

  handleEditFormOpened(item: RawRequestCommission): void {
    this.selectedItemForEdit = { ...item };
    this.showCreateForm = true;
  }

  handleFormSubmitted(formData: RawRequestCommission): void {
    this.isLoading = true;
    const request$ = formData.id 
      ? this.updateData(formData.id, formData) 
      : this.postData(formData);

    request$.pipe(
      finalize(() => {
        this.isLoading = false;
        this.showCreateForm = false;
        this.cd.markForCheck();
      })
    ).subscribe({
      next: () => this.refreshData(),
      error: (err: any) => console.error('Chyba při ukládání:', err)
    });
  }

  handleViewDetails(item: RawRequestCommission): void {
    if (!item.id) return;
    this.getItemDetails(item.id).subscribe({
      next: (details) => {
        this.selectedItemForDetails = details;
        this.showDetails = true;
        this.cd.markForCheck();
      }
    });
  }

  handleCloseDetails() {
    this.selectedItemForDetails = null;
    this.showDetails = false;
  }

  onCancelForm() {
    this.showCreateForm = false;
    this.selectedItemForEdit = null;
  }

  handleItemRestored() { this.refreshData(); }
  handleItemDeleted() { this.refreshData(); }
}