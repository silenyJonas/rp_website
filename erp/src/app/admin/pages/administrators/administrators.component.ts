import { Component, ViewChild, ChangeDetectionStrategy, OnInit } from '@angular/core';
import * as Core from '../../../shared/imports/core-providers';
import { SHARED_UI_BUILDERS } from '../../../shared/imports/shared-ui-builders';
import { TableBuilderComponent } from '../../components/builders/table-builder/table-builder.component';
import { BaseDataComponent } from '../../components/base-data/base-data.component';
import * as Config from './administrators.config';
@Component({
  selector: 'app-administrators',
  standalone: true,
  imports: [SHARED_UI_BUILDERS],
  templateUrl: './administrators.component.html',
  styleUrl: '../default-style.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdministratorsComponent extends BaseDataComponent<any> implements OnInit {
  @ViewChild('activeTable') activeTable!: TableBuilderComponent;

  override apiEndpoint: string = 'users';

  buttons = Config.TABLE_BUTTONS;
  formFields = Config.FORM_FIELDS;
  tableColumns = Config.TABLE_COLUMNS;
  trashTableColumns = Config.TRASH_TABLE_COLUMNS;
  filterColumns = Config.FILTER_COLUMNS;
  detailsColumns = Config.DETAILS_COLUMNS;
  resetPasswordFormFields = Config.RESET_PASSWORD_FORM_FIELDS;

  showResetPasswordForm: boolean = false;
  selectedItemForEdit: any | null = null;
  selectedItemForDetails: any | null = null;
  resetPasswordTitle: string = 'Resetovat heslo';
  filters: Core.FilterParams = { sort_by: 'id', sort_direction: 'desc' };

  constructor(
    protected override dataHandler: Core.DataHandler,
    protected override cd: Core.ChangeDetectorRef,
    protected override genericTableService: Core.GenericTableService,
    private alertDialogService: Core.AlertDialogService,
    private authService: Core.AuthService,
    private permissionService: Core.PermissionService, // <--- TADY JE TA SLUŽBA
    private router: Core.Router
  ) {
    super(dataHandler, cd, genericTableService);
  }

  get toolbarButtons(): Core.Button[] {
    return Config.TOOLBAR_BUTTONS.map(btn => {
      let updatedBtn = { ...btn };

      if (updatedBtn.permission && !this.permissionService.hasPermission(updatedBtn.permission)) {
        updatedBtn.showIf = false;
      }

      // DYNAMICKÉ ZMĚNY (Label, Icon, Koš)
      switch (btn.action) {
        case 'toggleFilters':
          updatedBtn.label = this.isFilterVisible ? 'Skrýt' : 'Filtry';
          updatedBtn.isActive = this.isFilterVisible;
          break;
        case 'handleCreateFormOpened':
        case 'exportActiveTable':
          // Schováme v koši, pokud už nebylo schováno kvůli právům
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
    super.ngOnInit();
    this.authService.isLoggedIn$
      .pipe(Core.takeUntil(this.destroy$))
      .subscribe(loggedIn => {
        if (loggedIn) this.refreshData();
        else this.router.navigate(['/auth/login']);
      });
  }

  public refreshData(): void { this.forceFullRefresh(this.filters); }
  handlePageChange(page: number): void { this.onHandlePageChange(page, this.filters); }
  handleItemsPerPageChange(value: number): void { this.onHandleItemsPerPageChange(value, this.filters); }
  applyFilters(newFilters: any): void { this.filters = { ...newFilters }; this.refreshData(); }
  clearFilters(): void { this.filters = { sort_by: 'id', sort_direction: 'desc' }; this.refreshData(); }
  exportActiveTable(): void { if (this.activeTable) this.activeTable.exportToCSV(); }

  handleCreateFormOpened(): void {
    this.selectedItemForEdit = null;
    this.showCreateForm = true;
  }
  
  handleEditFormOpened(item: any): void {
    const itemToEdit = { ...item };
    if (itemToEdit.roles?.length > 0) itemToEdit.role_id = itemToEdit.roles[0].id;
    this.selectedItemForEdit = itemToEdit;
    this.showCreateForm = true;
  }

  handleFormSubmitted(formData: any): void {
    const payload = { ...formData };
    if (payload.role_id) payload.role_id = parseInt(payload.role_id, 10);
    const request$ = payload.id ? this.updateData(payload.id, payload) : this.postData(payload);
    request$.pipe(Core.finalize(() => { this.showCreateForm = false; this.cd.markForCheck(); }))
      .subscribe({ next: () => this.refreshData() });
  }

  handleResetPasswordFormOpened(item: any): void {
    this.resetPasswordTitle = `Resetovat heslo: ${item.user_email}`;
    this.selectedItemForEdit = { id: item.id, old_password: '', new_password: '' };
    this.showResetPasswordForm = true;
    this.cd.markForCheck();
  }

  handleResetPasswordFormSubmitted(formData: any): void {
    const payload = { old_password: formData.old_password, new_password: formData.new_password, new_password_confirmation: formData.new_password };
    this.dataHandler.put(`users/${formData.id}/change-password`, payload)
      .pipe(Core.finalize(() => { this.showResetPasswordForm = false; this.cd.markForCheck(); }))
      .subscribe({
        next: () => this.alertDialogService.open('Úspěch', 'Heslo bylo změněno.', 'success'),
        error: (err: any) => this.alertDialogService.open('Chyba', err.error?.message || 'Akce selhala.', 'danger')
      });
  }

  handleViewDetails(item: any): void {
    if (!item.id) return;
    this.getItemDetails(item.id).subscribe(details => {
      this.selectedItemForDetails = details;
      this.showDetails = true;
      this.cd.markForCheck();
    });
  }

  handleItemRestored(): void { this.refreshData(); }
  handleItemDeleted(): void { this.refreshData(); }
}