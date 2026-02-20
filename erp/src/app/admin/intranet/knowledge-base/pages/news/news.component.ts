import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { GenericTableService, PaginatedResponse } from '../../../../../core/services/generic-table.service';
import { BaseDataComponent } from '../../../../components/base-data/base-data.component';
import { DataHandler } from '../../../../../core/services/data-handler.service';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news.component.html',
  styleUrl: './news.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewsComponent extends BaseDataComponent<any> implements OnInit {

  override apiEndpoint: string = 'news';
  
  override itemsPerPage: number = 5; 
  
  accumulatedNews: any[] = [];

  constructor(
    protected override dataHandler: DataHandler,
    protected override cd: ChangeDetectorRef,
    protected override genericTableService: GenericTableService 
  ) {
    super(dataHandler, cd, genericTableService);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.loadMore();
  }

  loadMore(): void {
    if (this.isLoading || (this.currentPage > this.totalPages && this.totalPages !== 0)) {
      return;
    }

    this.isLoading = true;
    this.cd.detectChanges();

    this.fetchPaginatedData(
      false, 
      this.currentPage, 
      this.itemsPerPage, 
      { sort_by: 'created_at', sort_direction: 'desc' }
    ).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cd.detectChanges();
      })
    ).subscribe({
      next: (response: PaginatedResponse<any>) => {
        if (response && response.data) {
          this.accumulatedNews = [...this.accumulatedNews, ...response.data];
          this.currentPage++;
        }
        this.cd.markForCheck();
      },
      error: (err: any) => {
        console.error('Chyba při načítání novinek:', err);
      }
    });
  }

  get hasMore(): boolean {
    return this.totalPages === 0 || this.currentPage <= this.totalPages;
  }
}