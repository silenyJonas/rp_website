// src/app/core/services/generic-table.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

/**
 * Rozhraní pro strukturu odpovědi z Laravel paginace.
 * Obsahuje metadata o stránkování a samotná data.
 */
export interface PaginatedResponse<T> {
  current_page: number;
  data: T[]; // Pole dat pro aktuální stránku
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: any[]; // Pole s odkazy na stránky
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number; // Celkový počet záznamů
}

/**
 * Rozhraní pro volitelné parametry filtru.
 */
export interface FilterParams {
  search?: string;
  status?: string;
  priority?: string;
  email?: string;
  // Přidejte další pole pro filtry podle potřeby
}

@Injectable({
  providedIn: 'root'
})
export class GenericTableService {
  private baseUrl = '/api';
  private pageCache = new Map<string, Observable<PaginatedResponse<any>>>();
  private lastFilterParams: FilterParams = {}; // Sledujeme poslední použité filtry

  constructor(private http: HttpClient) { }

  /**
   * Načte stránkovaná data z daného API endpointu s volitelnými filtry.
   * Nejprve zkontroluje cache. Pokud data nejsou v cache nebo se změnily filtry, načte je z API a uloží.
   *
   * @param endpoint - Název API endpointu (např. 'raw_request_commissions').
   * @param page - Aktuální číslo stránky (výchozí 1).
   * @param perPage - Počet položek na stránku (výchozí 15).
   * @param filters - Volitelný objekt s parametry filtru.
   * @returns Observable s PaginatedResponse<T>.
   */
  getPaginatedData<T>(endpoint: string, page: number = 1, perPage: number = 15, filters: FilterParams = {}): Observable<PaginatedResponse<T>> {
    // Pokud se filtry změnily, vyčistíme celou cache
    if (JSON.stringify(filters) !== JSON.stringify(this.lastFilterParams)) {
      this.clearCache();
      this.lastFilterParams = { ...filters }; // Aktualizujeme poslední filtry
      console.log('Filtry se změnily, cache vyčištěna.');
    }

    const cacheKey = this.getCacheKey(endpoint, page, perPage, filters);

    if (this.pageCache.has(cacheKey)) {
      console.log(`Cache hit for ${cacheKey}`);
      return this.pageCache.get(cacheKey) as Observable<PaginatedResponse<T>>;
    }

    let params = new HttpParams();
    params = params.append('page', page.toString());
    params = params.append('per_page', perPage.toString());

    // Přidáme parametry filtru do HttpParams
    for (const key in filters) {
      if (filters.hasOwnProperty(key) && filters[key as keyof FilterParams] !== undefined && filters[key as keyof FilterParams] !== null && filters[key as keyof FilterParams] !== '') {
        params = params.append(key, filters[key as keyof FilterParams]!.toString());
      }
    }

    const dataObservable = this.http.get<PaginatedResponse<T>>(`${this.baseUrl}/${endpoint}`, { params: params }).pipe(
      tap(() => console.log(`Fetched from API: ${cacheKey}`)),
      shareReplay(1)
    );

    this.pageCache.set(cacheKey, dataObservable);

    return dataObservable;
  }

  /**
   * Přednačte sousední stránky do cache.
   *
   * @param endpoint - Název API endpointu.
   * @param currentPage - Aktuální číslo stránky.
   * @param totalPages - Celkový počet stránek.
   * @param perPage - Počet položek na stránku.
   * @param preloadRange - Kolik stránek před a po aktuální stránce přednačíst (např. 2 pro -2 a +2).
   * @param filters - Aktuální parametry filtru.
   */
  preloadAdjacentPages<T>(endpoint: string, currentPage: number, totalPages: number, perPage: number, preloadRange: number = 2, filters: FilterParams = {}): void {
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

    pagesToPreload.forEach(page => {
      const cacheKey = this.getCacheKey(endpoint, page, perPage, filters);
      if (!this.pageCache.has(cacheKey)) {
        console.log(`Preloading ${cacheKey}...`);
        this.getPaginatedData<T>(endpoint, page, perPage, filters).subscribe({ // Předáváme filtry i pro preload
          error: (err) => console.error(`Failed to preload ${cacheKey}:`, err)
        });
      }
    });
  }

  /**
   * Vyčistí celou cache. Mělo by se volat, když se data na serveru změní (např. po CREATE, UPDATE, DELETE)
   * nebo když se změní filtry.
   */
  clearCache(): void {
    this.pageCache.clear();
    console.log('Pagination cache cleared.');
  }

  /**
   * Generuje unikátní klíč pro cache, zahrnující i filtry.
   */
  private getCacheKey(endpoint: string, page: number, perPage: number, filters: FilterParams): string {
    // Normalizujeme filtry pro konzistentní klíč cache
    const sortedFilterKeys = Object.keys(filters).sort();
    const normalizedFilters = sortedFilterKeys.reduce((acc, key) => {
      const value = filters[key as keyof FilterParams];
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>); // Explicitní typ pro accumulator

    return `${endpoint}-${page}-${perPage}-${JSON.stringify(normalizedFilters)}`;
  }
}
