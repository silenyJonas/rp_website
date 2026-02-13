import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { BaseDataComponent } from '../../components/base-data/base-data.component';
import { GenericTableComponent, Buttons } from '../../components/generic-table/generic-table.component';
import { GenericFilterFormComponent } from '../../components/generic-filter-form/generic-filter-form.component';
import { GenericDetailsComponent } from '../../components/generic-details/generic-details.component';
import { PaginationButtonsComponent } from '../../components/pagination-buttons/pagination-buttons.component';

import { DataHandler } from '../../../core/services/data-handler.service';
import { GenericTableService, FilterParams } from '../../../core/services/generic-table.service';
import { AuthService } from '../../../core/auth/auth.service';

import {
  BUTTONS,
  TABLE_COLUMNS,
  FILTER_COLUMNS,
  DETAILS_COLUMNS
} from './business-logs.config';

@Component({
  selector: 'app-business-logs',
  standalone: true,
  imports: [
    CommonModule, FormsModule, GenericTableComponent, GenericFilterFormComponent, 
    GenericDetailsComponent, PaginationButtonsComponent
  ],
  templateUrl: './business-logs.component.html',
  styleUrl: '../default-style.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusinessLogsComponent extends BaseDataComponent<any> implements OnInit {
  @ViewChild('activeTable') activeTable!: GenericTableComponent;

  override apiEndpoint: string = 'business_logs';

  // Konfigurace (u logů filtrujeme akce create/edit)
  buttons = BUTTONS.filter(b => b.action !== 'create' && b.action !== 'edit');
  tableColumns = TABLE_COLUMNS;
  filterColumns = FILTER_COLUMNS;
  detailsColumns = DETAILS_COLUMNS;

  selectedItemForDetails: any | null = null;

  // Sjednocené filtry
  filters: FilterParams = {
    sort_by: 'created_at',
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

  // --- Data Logic ---

  public refreshData(): void {
    this.forceFullRefresh(this.filters);
  }

  applyFilters(newFilters: FilterParams): void {
    this.filters = { ...this.filters, ...newFilters };
    this.currentPage = 1;
    this.refreshData();
  }

  clearFilters(): void {
    this.filters = { sort_by: 'created_at', sort_direction: 'desc' };
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

  handleViewDetails(item: any): void {
    const logId = item.business_log_id || item.id;
    if (!logId) return;

    this.isLoading = true;
    this.getItemDetails(logId).subscribe({
      next: (details) => {
        this.selectedItemForDetails = details;
        this.showDetails = true;
        this.cd.markForCheck();
      },
      complete: () => {
        this.isLoading = false;
        this.cd.markForCheck();
      }
    });
  }

  handleCloseDetails(): void {
    this.selectedItemForDetails = null;
    this.showDetails = false;
  }
}