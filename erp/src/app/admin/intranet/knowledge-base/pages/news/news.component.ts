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
  
  // Přepisujeme výchozí hodnotu pro tuto komponentu
  override itemsPerPage: number = 5; 
  
  // Pro Load More si držíme vlastní pole, abychom data kumulovali
  accumulatedNews: any[] = [];

  constructor(
    protected override dataHandler: DataHandler,
    protected override cd: ChangeDetectorRef,
    protected override genericTableService: GenericTableService // Přidáno protected a předáno rodiči
  ) {
    // Předáváme všechny 3 parametry do super konstruktoru
    super(dataHandler, cd, genericTableService);
  }

  override ngOnInit(): void {
    // Voláme super.ngOnInit() pro inicializaci základních stavů, pokud je potřeba
    super.ngOnInit();
    this.loadMore();
  }

  loadMore(): void {
    // Kontrola, zda už nejsme na konci, pomocí stavů z rodiče
    if (this.isLoading || (this.currentPage > this.totalPages && this.totalPages !== 0)) {
      return;
    }

    this.isLoading = true;
    this.cd.detectChanges();

    // Využíváme metodu z rodiče pro získání dat
    // Předáváme aktuální filtry pro řazení
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
          // Kumulujeme data (vlastnost 'data' v rodiči se přepisuje, 
          // ale 'accumulatedNews' si drží vše)
          this.accumulatedNews = [...this.accumulatedNews, ...response.data];
          
          // Inkrementujeme stránku pro další volání
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
    // Pokud je aktuální stránka menší nebo rovna celkovému počtu stran
    return this.totalPages === 0 || this.currentPage <= this.totalPages;
  }
}