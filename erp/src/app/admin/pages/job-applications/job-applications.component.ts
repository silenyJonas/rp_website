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
  JOB_APPLICATION_BUTTONS,
  JOB_APPLICATION_FORM_FIELDS,
  JOB_APPLICATION_COLUMNS,
  JOB_APPLICATION_TRASH_COLUMNS,
  JOB_APPLICATION_FILTER_COLUMNS,
  JOB_APPLICATION_DETAILS_COLUMNS
} from './job-applications.config';

@Component({
  selector: 'app-job-applications',
  standalone: true,
  imports: [
    CommonModule, FormsModule, GenericTableComponent, GenericTrashTableComponent,
    GenericFormComponent, GenericFilterFormComponent, GenericDetailsComponent, 
    HasPermissionDirective, PaginationButtonsComponent
  ],
  templateUrl: './job-applications.component.html',
  styleUrl: '../default-style.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobApplicationsComponent extends BaseDataComponent<any> implements OnInit {
  @ViewChild('activeTable') activeTable!: GenericTableComponent;
  
  override apiEndpoint: string = 'job_applications';
  
  // Konfigurace šablony z config souboru
  buttons: Buttons[] = JOB_APPLICATION_BUTTONS.filter(b => b.action !== 'create');
  formFields: InputDefinition[] = JOB_APPLICATION_FORM_FIELDS;
  columns = JOB_APPLICATION_COLUMNS;
  trashColumns = JOB_APPLICATION_TRASH_COLUMNS;
  filterColumns = JOB_APPLICATION_FILTER_COLUMNS;
  detailsColumns = JOB_APPLICATION_DETAILS_COLUMNS;

  selectedItemForEdit: any = null;
  selectedItemForDetails: any = null;

  // Sjednocené filtry pro dynamický filter form
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

  // --- Data & Refresh Logic ---

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

  // --- Record Actions ---

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
    // HR Modul: Typicky pouze update stavu uchazeče
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