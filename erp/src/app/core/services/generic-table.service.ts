
import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { DataHandler } from './data-handler.service';

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: any[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface AllDataResponse<T> {
  data: T[];
}

export interface FilterParams {
  search?: string;
  status?: string;
  priority?: string;
  email?: string;
  is_deleted?: string; // TOTO BYLO PŘIDÁNO
}

@Injectable({
  providedIn: 'root'
})
export class GenericTableService {
  private pageCache = new Map<string, Observable<PaginatedResponse<any>>>();
  private lastFilterParams: FilterParams = {};

  constructor(private dataHandler: DataHandler) {}

  getPaginatedData<T>(
    endpoint: string,
    page: number = 1,
    perPage: number = 15,
    filters: FilterParams = {}
  ): Observable<PaginatedResponse<T>> {
    if (JSON.stringify(filters) !== JSON.stringify(this.lastFilterParams)) {
      this.clearCache();
      this.lastFilterParams = { ...filters };
    }

    const cacheKey = this.getCacheKey(endpoint, page, perPage, filters);
    if (this.pageCache.has(cacheKey)) {
      return this.pageCache.get(cacheKey) as Observable<PaginatedResponse<T>>;
    }

    let params = new HttpParams();
    params = params.append('page', page.toString());
    params = params.append('per_page', perPage.toString());

    for (const key in filters) {
      if (
        filters.hasOwnProperty(key) &&
        filters[key as keyof FilterParams] !== undefined &&
        filters[key as keyof FilterParams] !== null &&
        filters[key as keyof FilterParams] !== ''
      ) {
        params = params.append(key, filters[key as keyof FilterParams]!.toString());
      }
    }

    const dataObservable = this.dataHandler
      .getPaginatedCollection<PaginatedResponse<T>>(`${endpoint}?${params.toString()}`)
      .pipe(
        tap(() => console.log(`Fetched from API: ${cacheKey}`)),
        shareReplay(1)
      );

    this.pageCache.set(cacheKey, dataObservable);
    return dataObservable;
  }

  preloadAdjacentPages<T>(
    endpoint: string,
    currentPage: number,
    totalPages: number,
    perPage: number,
    preloadRange: number = 2,
    filters: FilterParams = {}
  ): void {
    const pagesToPreload: number[] = [];

    for (let i = 1; i <= preloadRange; i++) {
      const page = currentPage - i;
      if (page >= 1) {
        pagesToPreload.push(page);
      }
    }

    for (let i = 1; i <= preloadRange; i++) {
      const page = currentPage + i;
      if (page <= totalPages) {
        pagesToPreload.push(page);
      }
    }

    pagesToPreload.forEach((page) => {
      const cacheKey = this.getCacheKey(endpoint, page, perPage, filters);
      if (!this.pageCache.has(cacheKey)) {
        this.getPaginatedData<T>(endpoint, page, perPage, filters).subscribe({
          error: (err) => console.error(`Failed to preload ${cacheKey}:`, err)
        });
      }
    });
  }

  clearCache(): void {
    this.pageCache.clear();
  }

  private getCacheKey(
    endpoint: string,
    page: number,
    perPage: number,
    filters: FilterParams
  ): string {
    const sortedFilterKeys = Object.keys(filters).sort();
    const normalizedFilters = sortedFilterKeys.reduce((acc, key) => {
      const value = filters[key as keyof FilterParams];
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);
    return `${endpoint}-${page}-${perPage}-${JSON.stringify(normalizedFilters)}`;
  }

  getAllData<T>(endpoint: string, filters: FilterParams = {}): Observable<T[]> {
    let params = new HttpParams();

    for (const key in filters) {
      if (
        filters.hasOwnProperty(key) &&
        filters[key as keyof FilterParams] !== undefined &&
        filters[key as keyof FilterParams] !== null &&
        filters[key as keyof FilterParams] !== ''
      ) {
        params = params.append(key, filters[key as keyof FilterParams]!.toString());
      }
    }

    params = params.append('no_pagination', 'true');
    return this.dataHandler.getCollection<T>(`${endpoint}?${params.toString()}`);
  }
}
