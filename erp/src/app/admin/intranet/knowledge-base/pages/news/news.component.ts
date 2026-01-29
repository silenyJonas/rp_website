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
  
  currentPage: number = 1;
  itemsPerPage: number = 5; // Nastaveno na 5 dle požadavku
  totalPages: number = 0;   // Výchozí 0, aby prošla první podmínka
  totalItems: number = 0;
  
  accumulatedNews: any[] = [];

  constructor(
    protected override dataHandler: DataHandler,
    protected override cd: ChangeDetectorRef,
    private genericTableService: GenericTableService
  ) {
    super(dataHandler, cd);
  }

  override ngOnInit(): void {
    this.loadMore();
  }

  loadMore(): void {
    // Podmínka pro zastavení: Pokud už načítáme, nebo nejsme na první straně a aktuální strana překročila totál
    if (this.isLoading || (this.currentPage > this.totalPages && this.totalPages !== 0)) {
      return;
    }

    this.isLoading = true;
    this.cd.detectChanges();

    this.genericTableService.getPaginatedData<any>(
      this.apiEndpoint,
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
        // Laravel vrací data v poli 'data'
        if (response && response.data) {
          this.accumulatedNews = [...this.accumulatedNews, ...response.data];
          this.totalPages = response.last_page;
          this.totalItems = response.total;
          this.currentPage++;
        }
        
        this.cd.markForCheck();
      },
      error: (err) => {
        console.error('Chyba při načítání novinek:', err);
      }
    });
  }

  get hasMore(): boolean {
    // Tlačítko zobrazíme jen pokud máme co načítat
    // return this.currentPage <= this.totalPages;
    return true;
  }
}