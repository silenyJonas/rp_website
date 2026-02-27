import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { SHARED_UI_BUILDERS } from '../../../shared/imports/shared-ui-builders';
import { BaseDataComponent } from '../../components/base-data/base-data.component';
import { DataHandler } from '../../../core/services/data-handler.service';
import { GenericTableService, FilterParams } from '../../../core/services/generic-table.service';
import { AuthService } from '../../../core/auth/auth.service';
import { TableBuilderComponent, Buttons } from '../../components/builders/table-builder/table-builder.component';
import { InputDefinition } from '../../components/builders/form-builder/form-builder.component';
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
    SHARED_UI_BUILDERS
  ],
  templateUrl: './job-applications.component.html',
  styleUrl: '../default-style.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobApplicationsComponent extends BaseDataComponent<any> implements OnInit {
  @ViewChild('activeTable') activeTable!: TableBuilderComponent;
  
  override apiEndpoint: string = 'job_applications';
  
  buttons: Buttons[] = JOB_APPLICATION_BUTTONS.filter(b => b.action !== 'create');
  formFields: InputDefinition[] = JOB_APPLICATION_FORM_FIELDS;
  columns = JOB_APPLICATION_COLUMNS;
  trashColumns = JOB_APPLICATION_TRASH_COLUMNS;
  filterColumns = JOB_APPLICATION_FILTER_COLUMNS;
  detailsColumns = JOB_APPLICATION_DETAILS_COLUMNS;

  selectedItemForEdit: any = null;
  selectedItemForDetails: any = null;

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
    if (this.activeTable) this.activeTable.exportToCSV();
  }

  handleEditFormOpened(item: any): void { 
    this.selectedItemForEdit = null;
    this.showCreateForm = false;
    this.cd.detectChanges();

    setTimeout(() => {
      this.selectedItemForEdit = JSON.parse(JSON.stringify(item)); 
      this.showCreateForm = true; 
      this.cd.markForCheck();
    }, 50);
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
    this.updateData(formData.id, formData).pipe(
      finalize(() => {
        this.isLoading = false;
        this.showCreateForm = false;
        this.selectedItemForEdit = null;
        this.cd.markForCheck();
      })
    ).subscribe(() => this.refreshData());
  }

  onCancelForm() {
    this.showCreateForm = false;
    this.selectedItemForEdit = null;
    this.cd.markForCheck();
  }
}