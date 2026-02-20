import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, takeUntil } from 'rxjs/operators';

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
import { AlertDialogService } from '../../../core/services/alert-dialog.service';
import { ColumnDefinition } from '../../../shared/interfaces/generic-form-column-definiton';

import {
  BUTTONS,
  FORM_FIELDS,
  TABLE_COLUMNS,
  TRASH_TABLE_COLUMNS,
  FILTER_COLUMNS,
  DETAILS_COLUMNS,
  RESET_PASSWORD_FORM_FIELDS
} from './administrators.config';

@Component({
  selector: 'app-administrators',
  standalone: true,
  imports: [
    CommonModule, FormsModule, GenericTableComponent, GenericTrashTableComponent,
    GenericFormComponent, GenericFilterFormComponent, GenericDetailsComponent,
    HasPermissionDirective, PaginationButtonsComponent
  ],
  templateUrl: './administrators.component.html',
  styleUrl: '../default-style.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdministratorsComponent extends BaseDataComponent<any> implements OnInit {
  @ViewChild('activeTable') activeTable!: GenericTableComponent;

  override apiEndpoint: string = 'users';
  
  buttons: Buttons[] = BUTTONS;
  formFields: InputDefinition[] = FORM_FIELDS;
  resetPasswordFormFields: InputDefinition[] = RESET_PASSWORD_FORM_FIELDS;
  tableColumns: ColumnDefinition[] = TABLE_COLUMNS;
  trashTableColumns: ColumnDefinition[] = TRASH_TABLE_COLUMNS;
  filterColumns = FILTER_COLUMNS;
  detailsColumns = DETAILS_COLUMNS;

  showResetPasswordForm: boolean = false;
  selectedItemForEdit: any | null = null;
  selectedItemForDetails: any | null = null;

  filters: FilterParams = {
    sort_by: 'id',
    sort_direction: 'desc'
  };

  constructor(
    protected override dataHandler: DataHandler,
    protected override cd: ChangeDetectorRef,
    protected override genericTableService: GenericTableService,
    private alertDialogService: AlertDialogService,
    private authService: AuthService,
    private router: Router
  ) {
    super(dataHandler, cd, genericTableService);
  }

  override ngOnInit(): void {
    this.authService.isLoggedIn$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loggedIn => {
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

  handlePageChange(page: number): void {
    this.onHandlePageChange(page, this.filters);
  }

  handleItemsPerPageChange(value: number): void {
    this.onHandleItemsPerPageChange(value, this.filters);
  }

  applyFilters(newFilters: any): void {
    this.filters = { ...newFilters };
    this.refreshData();
  }

  clearFilters(): void {
    this.filters = { sort_by: 'id', sort_direction: 'desc' };
    this.refreshData();
  }

  exportActiveTable(): void {
    if (this.activeTable) this.activeTable.exportToCSV();
  }

  handleCreateFormOpened() {
    this.selectedItemForEdit = null;
    this.showCreateForm = true;
  }
  
  handleEditFormOpened(item: any) {
    const itemToEdit = { ...item };
    if (itemToEdit.roles && itemToEdit.roles.length > 0) {
      itemToEdit.role_id = itemToEdit.roles[0].id; 
    }
    this.selectedItemForEdit = itemToEdit;
    this.showCreateForm = true;
  }

  handleFormSubmitted(formData: any) {
    this.isLoading = true;
    const payload = { ...formData };
    if (payload.role_id) {
      payload.role_id = parseInt(payload.role_id, 10);
    }
    const request$ = payload.id ? this.updateData(payload.id, payload) : this.postData(payload);
    request$.pipe(
      finalize(() => {
        this.isLoading = false;
        this.showCreateForm = false;
        this.cd.markForCheck();
      })
    ).subscribe({
      next: () => this.refreshData(),
      error: (err) => console.error('Ukládání selhalo:', err)
    });
  }

  // --- Reset Hesla (UPRAVENO) ---

  handleResetPasswordFormOpened(item: any) {
    this.showResetPasswordForm = true;
    // Mapujeme na strukturu pro GenericForm s 3 poli
    this.selectedItemForEdit = { 
      id: item.id, // target_user_id
      old_password: '', // Heslo admina
      new_password: '', // Nové heslo
      new_password_confirmation: '' // Potvrzení
    };
    this.cd.markForCheck();
  }

  handleResetPasswordFormSubmitted(formData: any) {
    this.isLoading = true;
    // Payload pro backend
    const payload = {
      old_password: formData.old_password,
      new_password: formData.new_password,
      new_password_confirmation: formData.new_password_confirmation
    };

    // Voláme users/{id}/change-password
    this.dataHandler.put(`users/${formData.id}/change-password`, payload)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.showResetPasswordForm = false;
          this.cd.markForCheck();
        })
      )
      .subscribe({
        next: () => this.alertDialogService.open('Úspěch', 'Heslo bylo změněno.', 'success'),
        error: (err) => this.alertDialogService.open('Chyba', err.error?.message || 'Heslo se nepodařilo změnit.', 'danger')
      });
  }

  handleViewDetails(item: any) {
    if (!item.id) return;
    this.getItemDetails(item.id).subscribe(details => {
      this.selectedItemForDetails = details;
      this.showDetails = true;
      this.cd.markForCheck();
    });
  }

  handleItemRestored() { this.refreshData(); }
  handleItemDeleted() { this.refreshData(); }
}