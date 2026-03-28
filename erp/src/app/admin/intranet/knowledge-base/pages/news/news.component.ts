import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenericTableService, PaginatedResponse } from '../../../../../core/services/generic-table.service';
import { BaseDataComponent } from '../../../../components/base-data/base-data.component';
import { DataHandler } from '../../../../../core/services/data-handler.service';
import { LoadingService } from '../../../../../core/services/loading.service';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news.component.html',
  styleUrl: './news.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewsComponent extends BaseDataComponent<any> implements OnInit {
  // Propojení na globální loading službu
  public override loadingService = inject(LoadingService);

  override apiEndpoint: string = 'web/news';
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
    // Přístup k aktuální hodnotě streamu bez nutnosti snapshotu v servise
    const isCurrentlyLoading = (this.loadingService.isLoading$ as any).value;

    if (isCurrentlyLoading || (this.currentPage > this.totalPages && this.totalPages !== 0)) {
      return;
    }

    // Volání paginovaných dat přes BaseDataComponent
    this.fetchPaginatedData(
      false, 
      this.currentPage, 
      this.itemsPerPage, 
      { sort_by: 'created_at', sort_direction: 'desc' }
    ).subscribe({
      next: (response: PaginatedResponse<any>) => {
        if (response && response.data) {
          // Přidání nových dat k existujícím (Infinite Scroll logika)
          this.accumulatedNews = [...this.accumulatedNews, ...response.data];
          this.currentPage++;
        }
        this.cd.markForCheck();
      },
      error: (err: any) => {
        console.error('Chyba při načítání novinek:', err);
        this.cd.markForCheck();
      }
    });
  }

  get hasMore(): boolean {
    return this.totalPages === 0 || this.currentPage <= this.totalPages;
  }
}