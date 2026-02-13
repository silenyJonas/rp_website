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
    CommonModule, FormsModule, GenericTableComponent, GenericTrashTableComponent,
    GenericFormComponent, GenericFilterFormComponent, GenericDetailsComponent,
    HasPermissionDirective, PaginationButtonsComponent
  ],
  templateUrl: './user-request.component.html',
  styleUrl: '../default-style.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserRequestComponent extends BaseDataComponent<RawRequestCommission> implements OnInit {
  @ViewChild('activeTable') activeTable!: GenericTableComponent;

  override apiEndpoint: string = 'raw_request_commissions';

  // Konfigurace načtená z config souboru
  buttons = USER_REQUEST_BUTTONS;
  formFields = USER_REQUEST_FORM_FIELDS;
  userRequestColumns = USER_REQUEST_COLUMNS;
  trashUserRequestColumns = USER_REQUEST_TRASH_COLUMNS;
  filterColumns = USER_REQUEST_FILTER_COLUMNS;
  detailsColumns = USER_REQUEST_DETAILS_COLUMNS;

  // Stavy pro UI
  selectedItemForEdit: RawRequestCommission | null = null;
  selectedItemForDetails: any | null = null;

  // Filtry - inicializujeme pouze sort, zbytek se doplní z GenericFilterForm
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

  // --- Filtrování a Refresh ---

  public refreshData(): void {
    this.forceFullRefresh(this.filters);
  }

  applyFilters(newFilters: FilterParams): void {
    this.filters = { ...this.filters, ...newFilters };
    this.currentPage = 1; // Při změně filtru vždy na začátek
    this.refreshData();
  }

  clearFilters(): void {
    this.filters = { sort_by: 'id', sort_direction: 'desc' };
    this.currentPage = 1;
    this.refreshData();
  }

  // --- Handlery událostí ---

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

  // --- Formularové akce ---

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