import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, takeUntil } from 'rxjs/operators';
import { SHARED_UI_BUILDERS } from '../../../shared/imports/shared-ui-builders';
import { BaseDataComponent } from '../../components/base-data/base-data.component';
import { DataHandler } from '../../../core/services/data-handler.service';
import { GenericTableService, FilterParams } from '../../../core/services/generic-table.service';
import { AuthService } from '../../../core/auth/auth.service';
import { AlertDialogService } from '../../../core/services/alert-dialog.service';
import { Buttons, TableBuilderComponent } from '../../components/builders/table-builder/table-builder.component';
import { InputDefinition } from '../../components/builders/form-builder/form-builder.component';
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
    SHARED_UI_BUILDERS
],
  templateUrl: './administrators.component.html',
  styleUrl: '../default-style.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdministratorsComponent extends BaseDataComponent<any> implements OnInit {
  @ViewChild('activeTable') activeTable!: TableBuilderComponent;

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

 resetPasswordTitle: string = 'Resetovat heslo';

handleResetPasswordFormOpened(item: any) {
  // Sestavíme titulek přímo zde - formbuilder ho jen tupě zobrazí
  this.resetPasswordTitle = `Resetovat heslo: ${item.user_email}`;
  
  // Připravíme data pro formbuilder
  this.selectedItemForEdit = { 
    id: item.id, 
    old_password: '', 
    new_password: '' 
  };
  this.showResetPasswordForm = true;
  this.cd.markForCheck();
}

handleResetPasswordFormSubmitted(formData: any) {
  this.isLoading = true;
  
  // API očekává potvrzení hesla. Protože používáme v configu 'confirm-password',
  // formbuilder nám pošle hodnotu v klíči 'new_password'. 
  // My ji pro API zdvojíme.
  const payload = {
    old_password: formData.old_password,
    new_password: formData.new_password,
    new_password_confirmation: formData.new_password // Mapování pro API
  };

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
      error: (err) => this.alertDialogService.open('Chyba', err.error?.message || 'Akce selhala.', 'danger')
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