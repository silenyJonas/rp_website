
// import { Directive, OnInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
// import { Subject, Observable, throwError } from 'rxjs';
// import { takeUntil, catchError, finalize } from 'rxjs/operators';
// import { DataHandler } from '../../../core/services/data-handler.service';
// import { HttpErrorResponse } from '@angular/common/http';
// import { FilterParams } from '../../../core/services/generic-table.service';

// @Directive()
// export abstract class BaseDataComponent<T extends { id?: number; deleted_at?: string | null }> implements OnInit, OnDestroy, OnChanges {
//   data: T[] = [];
//   trashData: T[] = [];
//   isLoading = false;
//   errorMessage: string | null = null;
//   protected destroy$ = new Subject<void>();
//   abstract apiEndpoint: string;
  
//   private showLoaderTimeout: any;

//   constructor(protected dataHandler: DataHandler, protected cd: ChangeDetectorRef) {}
  
//   ngOnInit(): void {}
//   ngOnChanges(changes: SimpleChanges): void {}
//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
//     if (this.showLoaderTimeout) {
//       clearTimeout(this.showLoaderTimeout);
//     }
//   }

//   loadData(): void {
//     if (!this.apiEndpoint) {
//       const msg = 'Chyba: API endpoint není definován v dědící komponentě. Nelze načíst data.';
//       this.errorMessage = msg;
//       return;
//     }
//     this.isLoading = true;
//     this.errorMessage = null;
//     const url = this.apiEndpoint;
//     this.dataHandler.getCollection<T>(url)
//       .pipe(
//         takeUntil(this.destroy$),
//         catchError((err: Error) => {
//           this.isLoading = false;
//           this.errorMessage = err.message || 'Neznámá chyba při načítání dat.';
//           this.cd.markForCheck();
//           return throwError(() => err);
//         })
//       )
//       .subscribe({
//         next: (responseData) => {
//           this.data = responseData;
//           this.isLoading = false;
//           this.cd.markForCheck();
//         },
//         error: () => {},
//         complete: () => {
//           this.isLoading = false;
//           this.cd.markForCheck();
//         }
//       });
//   }

//   loadAllData(filters?: FilterParams): Observable<T[]> {
//     if (!this.apiEndpoint) {
//       return throwError(() => new Error('Chyba: API endpoint není definován pro načtení všech dat.'));
//     }
//     const params = new URLSearchParams();
//     params.set('no_pagination', 'true');

//     if (filters) {
//       Object.keys(filters).forEach(key => {
//         const value = filters[key as keyof FilterParams];
//         if (value !== '' && value !== null && value !== undefined) {
//           params.set(key, value.toString());
//         }
//       });
//     }

//     const url = `${this.apiEndpoint}?${params.toString()}`;
//     return this.dataHandler.getCollection<T>(url).pipe(
//       takeUntil(this.destroy$),
//       catchError((err: Error) => {
//         return throwError(() => err);
//       })
//     );
//   }

//   getItemDetails(id: number | undefined): Observable<T> {
//     if (id === undefined || id === null) {
//       const msg = 'Chyba: ID záznamu pro načtení detailů není definováno.';
//       this.errorMessage = msg;
//       return throwError(() => new Error(msg));
//     }

//     const url = `${this.apiEndpoint}/${id}/details`;

//     this.showLoaderTimeout = setTimeout(() => {
//       this.isLoading = true;
//       this.cd.markForCheck();
//     }, 3000);

//     this.errorMessage = null;

//     return this.dataHandler.get<T>(url).pipe(
//       takeUntil(this.destroy$),
//       catchError((err: HttpErrorResponse) => {
//         if (this.showLoaderTimeout) {
//           clearTimeout(this.showLoaderTimeout);
//         }
//         this.isLoading = false;
//         this.errorMessage = err.message || 'Neznámá chyba při načítání detailů.';
//         this.cd.markForCheck();
//         return throwError(() => err);
//       }),
//       finalize(() => {
//         if (this.showLoaderTimeout) {
//           clearTimeout(this.showLoaderTimeout);
//         }
//         this.isLoading = false;
//         this.cd.markForCheck();
//       })
//     );
//   }

//   getOnlySoftDeleted(endpoint: string, filters?: FilterParams): Observable<T[]> {
//     const params = new URLSearchParams();
//     params.set('only_trashed', 'true');
//     params.set('no_pagination', 'true');
    
//     if (filters) {
//       Object.keys(filters).forEach(key => {
//         const value = filters[key as keyof FilterParams];
//         if (value !== '' && value !== null && value !== undefined) {
//           params.set(key, value.toString());
//         }
//       });
//     }
//     const url = `${endpoint}?${params.toString()}`;
//     return this.dataHandler.getCollection<T>(url).pipe(
//       takeUntil(this.destroy$),
//       catchError((err: HttpErrorResponse) => {
//         return throwError(() => err);
//       })
//     );
//   }

//   postData(data: T): Observable<T> {
//     this.isLoading = true;
//     this.errorMessage = null;
//     return this.dataHandler.post<T>(this.apiEndpoint, data).pipe(
//       takeUntil(this.destroy$),
//       catchError((err: Error) => {
//         this.isLoading = false;
//         this.errorMessage = err.message || 'Neznámá chyba při vytváření dat.';
//         this.cd.markForCheck();
//         return throwError(() => err);
//       })
//     );
//   }
  
//   updateData(id: number | undefined, data: T): Observable<T> {
//     if (id === undefined || id === null) {
//       const msg = 'Chyba: ID záznamu pro aktualizaci není definováno.';
//       this.errorMessage = msg;
//       return throwError(() => new Error(msg));
//     }
//     this.isLoading = true;
//     this.errorMessage = null;
//     const updateUrl = `${this.apiEndpoint}/${id}`;
//     return this.dataHandler.put<T>(updateUrl, data).pipe(
//       takeUntil(this.destroy$),
//       catchError((err: Error) => {
//         this.isLoading = false;
//         this.errorMessage = err.message || 'Neznámá chyba při aktualizaci dat.';
//         this.cd.markForCheck();
//         return throwError(() => err);
//       })
//     );
//   }
  
//   public updatePassword(id: number, data: any): Observable<any> {
//     this.isLoading = true;
//     this.errorMessage = null;
//     const url = `${this.apiEndpoint}/${id}/change-password`;
//     return this.dataHandler.post<any>(url, data).pipe(
//       takeUntil(this.destroy$),
//       finalize(() => {
//         this.isLoading = false;
//         this.cd.markForCheck();
//       }),
//       catchError((err) => {
//         this.errorMessage = err.message || 'Neznámá chyba při změně hesla.';
//         this.cd.markForCheck();
//         return throwError(() => err);
//       })
//     );
//   }
  
//   deleteData(id: number | undefined, forceDelete: boolean = false): Observable<void> {
//     if (id === undefined || id === null) {
//       const msg = 'Chyba: ID záznamu pro smazání není definováno.';
//       this.errorMessage = msg;
//       return throwError(() => new Error(msg));
//     }
//     this.isLoading = true;
//     this.errorMessage = null;
//     let deleteUrl = `${this.apiEndpoint}/${id}`;
//     if (forceDelete) {
//       deleteUrl += '?force_delete=true';
//     }
//     return this.dataHandler.delete(deleteUrl).pipe(
//       takeUntil(this.destroy$),
//       catchError((err: Error) => {
//         this.isLoading = false;
//         this.errorMessage = err.message || 'Neznámá chyba při mazání dat.';
//         this.cd.markForCheck();
//         return throwError(() => err);
//       })
//     );
//   }
  
//   hardDeleteDataFromApi(id: number): Observable<void> {
//     return this.deleteData(id, true);
//   }
  
//   hardDeleteAllTrashedDataFromApi(): Observable<void> {
//     if (!this.apiEndpoint) {
//       return throwError(() => new Error('Chyba: API endpoint není definován pro hromadné smazání.'));
//     }
//     const deleteUrl = `${this.apiEndpoint}/force-delete-all`;
//     this.isLoading = true;
//     this.errorMessage = null;
//     return this.dataHandler.delete(deleteUrl).pipe(
//       takeUntil(this.destroy$),
//       catchError((err: Error) => {
//         this.isLoading = false;
//         this.errorMessage = err.message || 'Neznámá chyba při hromadném mazání.';
//         this.cd.markForCheck();
//         return throwError(() => err);
//       }),
//       finalize(() => {
//         this.isLoading = false;
//         this.cd.markForCheck();
//       })
//     );
//   }
  
//   restoreDataFromApi(id: number): Observable<T> {
//     this.isLoading = true;
//     this.errorMessage = null;
//     const restoreUrl = `${this.apiEndpoint}/${id}/restore`;
//     return this.dataHandler.post<T>(restoreUrl, {} as T).pipe(
//       takeUntil(this.destroy$),
//       catchError((err: HttpErrorResponse) => {
//         this.isLoading = false;
//         this.errorMessage = err.message || 'Neznámá chyba při obnovování dat.';
//         this.cd.markForCheck();
//         return throwError(() => err);
//       }),
//       finalize(() => {
//         this.isLoading = false;
//         this.cd.markForCheck();
//       })
//     );
//   }
  
//   uploadData<U>(formData: FormData, targetUrl?: string): Observable<U> {
//     const url = targetUrl || this.apiEndpoint;
//     this.isLoading = true;
//     this.errorMessage = null;
//     return this.dataHandler.upload<U>(url, formData).pipe(
//       takeUntil(this.destroy$),
//       catchError((err: Error) => {
//         this.isLoading = false;
//         this.errorMessage = err.message || 'Neznámá chyba při nahrávání dat.';
//         this.cd.markForCheck();
//         return throwError(() => err);
//       })
//     );
//   }
// }
import { Directive, OnInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Subject, Observable, throwError, of, forkJoin } from 'rxjs';
import { takeUntil, catchError, finalize, tap, retry } from 'rxjs/operators';
import { DataHandler } from '../../../core/services/data-handler.service';
import { HttpErrorResponse } from '@angular/common/http';
import { FilterParams, PaginatedResponse, GenericTableService } from '../../../core/services/generic-table.service';

@Directive()
export abstract class BaseDataComponent<T extends { id?: number; deleted_at?: string | null }> implements OnInit, OnDestroy, OnChanges {
  // Základní data
  data: T[] = [];
  trashData: T[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  protected destroy$ = new Subject<void>();
  abstract apiEndpoint: string;
  
  // UI stavy
  isTableFullWidth = true;
  isFilterVisible = false;
  showTrashTable = false;
  showCreateForm = false;
  showDetails = false;

  // Stránkování - Aktivní data
  currentPage = 1;
  itemsPerPage = 15;
  totalItems = 0;
  totalPages = 0;

  // Stránkování - Koš
  trashCurrentPage = 1;
  trashItemsPerPage = 15;
  trashTotalItems = 0;
  trashTotalPages = 0;

  // Filtry a Cache
  protected activeCache = new Map<number, T[]>();
  protected trashCache = new Map<number, T[]>();
  protected currentActiveFilters: FilterParams = {};
  protected currentTrashFilters: FilterParams = {};
  
  // Výchozí řazení (lze přebít v dceřiné komponentě)
  protected defaultFilters: FilterParams = {
    sort_by: 'id',
    sort_direction: 'desc'
  };

  private showLoaderTimeout: any;

  constructor(
    protected dataHandler: DataHandler, 
    protected cd: ChangeDetectorRef,
    protected genericTableService: GenericTableService // Přidáno pro paginaci
  ) {}
  
  ngOnInit(): void {}
  ngOnChanges(changes: SimpleChanges): void {}
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.showLoaderTimeout) {
      clearTimeout(this.showLoaderTimeout);
    }
  }

  // --- UNIVERZÁLNÍ NAČÍTÁNÍ DAT (PAGINOVANÉ) ---

  protected fetchPaginatedData(
    isTrash: boolean, 
    page: number, 
    perPage: number, 
    filters: FilterParams
  ): Observable<PaginatedResponse<T>> {
    const cache = isTrash ? this.trashCache : this.activeCache;
    const currentStoredFilters = isTrash ? this.currentTrashFilters : this.currentActiveFilters;

    // Pokud se změnily filtry, vymažeme cache a resetujeme stránku
    if (JSON.stringify(filters) !== JSON.stringify(currentStoredFilters)) {
      cache.clear();
      if (isTrash) {
        this.trashCurrentPage = 1;
        this.currentTrashFilters = { ...filters };
      } else {
        this.currentPage = 1;
        this.currentActiveFilters = { ...filters };
      }
    }

    // Vrácení z cache, pokud existuje
    if (cache.has(page)) {
      const cachedData = cache.get(page)!;
      if (isTrash) this.trashData = cachedData; else this.data = cachedData;
      this.cd.markForCheck();
      return of({ 
        data: cachedData, 
        current_page: page, 
        last_page: isTrash ? this.trashTotalPages : this.totalPages, 
        total: isTrash ? this.trashTotalItems : this.totalItems 
      } as PaginatedResponse<T>);
    }

    // HTTP Požadavek
    const params: FilterParams = { ...filters };
    if (isTrash) params['only_trashed'] = 'true';

    return this.genericTableService.getPaginatedData<T>(this.apiEndpoint, page, perPage, params).pipe(
      takeUntil(this.destroy$),
      retry(1),
      tap(response => {
        if (isTrash) {
          this.trashData = response.data;
          this.trashTotalItems = response.total;
          this.trashTotalPages = response.last_page;
          this.trashCurrentPage = response.current_page;
        } else {
          this.data = response.data;
          this.totalItems = response.total;
          this.totalPages = response.last_page;
          this.currentPage = response.current_page;
        }
        cache.set(page, response.data);
        this.cd.markForCheck();
      })
    );
  }

  public forceFullRefresh(currentFilters: FilterParams = this.defaultFilters): void {
    this.activeCache.clear();
    this.trashCache.clear();
    this.isLoading = true;
    this.cd.markForCheck();

    forkJoin([
      this.fetchPaginatedData(false, this.currentPage, this.itemsPerPage, currentFilters),
      this.fetchPaginatedData(true, this.trashCurrentPage, this.trashItemsPerPage, currentFilters)
    ]).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cd.markForCheck();
      })
    ).subscribe();
  }

  // --- HANDLERY STRÁNKOVÁNÍ ---

  onHandlePageChange(page: number, filters: FilterParams = this.currentActiveFilters): void {
    if (this.showTrashTable) {
      if (page >= 1 && page <= this.trashTotalPages && page !== this.trashCurrentPage) {
        this.trashCurrentPage = page;
        this.fetchPaginatedData(true, page, this.trashItemsPerPage, filters).subscribe();
      }
    } else {
      if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
        this.currentPage = page;
        this.fetchPaginatedData(false, page, this.itemsPerPage, filters).subscribe();
      }
    }
  }

  onHandleItemsPerPageChange(value: number, filters: FilterParams = this.currentActiveFilters): void {
    if (this.showTrashTable) {
      this.trashItemsPerPage = value;
      this.trashCurrentPage = 1;
      this.trashCache.clear();
      this.fetchPaginatedData(true, 1, value, filters).subscribe();
    } else {
      this.itemsPerPage = value;
      this.currentPage = 1;
      this.activeCache.clear();
      this.fetchPaginatedData(false, 1, value, filters).subscribe();
    }
  }

  // --- UI PŘEPÍNAČE ---

  toggleTable(): void {
    this.showTrashTable = !this.showTrashTable;
    // Při přepnutí tabulky většinou chceme čerstvá data
    this.forceFullRefresh(this.showTrashTable ? this.currentTrashFilters : this.currentActiveFilters);
  }

  toggleFilters(): void {
    this.isFilterVisible = !this.isFilterVisible;
  }

  // --- PŮVODNÍ METODY (ZŮSTÁVAJÍ) ---

  loadData(): void {
    if (!this.apiEndpoint) {
      this.errorMessage = 'Chyba: API endpoint není definován.';
      return;
    }
    this.isLoading = true;
    this.dataHandler.getCollection<T>(this.apiEndpoint)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => { this.isLoading = false; this.cd.markForCheck(); })
      )
      .subscribe(responseData => this.data = responseData);
  }

  getItemDetails(id: number | undefined): Observable<T> {
    if (!id) return throwError(() => new Error('ID není definováno.'));
    const url = `${this.apiEndpoint}/${id}/details`;
    this.isLoading = true;
    return this.dataHandler.get<T>(url).pipe(
      takeUntil(this.destroy$),
      finalize(() => { this.isLoading = false; this.cd.markForCheck(); })
    );
  }

  postData(data: T): Observable<T> {
    this.isLoading = true;
    return this.dataHandler.post<T>(this.apiEndpoint, data).pipe(
      takeUntil(this.destroy$),
      finalize(() => { this.isLoading = false; this.cd.markForCheck(); })
    );
  }
  
  updateData(id: number | undefined, data: T): Observable<T> {
    if (!id) return throwError(() => new Error('ID není definováno.'));
    this.isLoading = true;
    return this.dataHandler.put<T>(`${this.apiEndpoint}/${id}`, data).pipe(
      takeUntil(this.destroy$),
      finalize(() => { this.isLoading = false; this.cd.markForCheck(); })
    );
  }
  
  deleteData(id: number | undefined, forceDelete: boolean = false): Observable<void> {
    if (!id) return throwError(() => new Error('ID není definováno.'));
    this.isLoading = true;
    let url = `${this.apiEndpoint}/${id}`;
    if (forceDelete) url += '?force_delete=true';
    return this.dataHandler.delete(url).pipe(
      takeUntil(this.destroy$),
      finalize(() => { this.isLoading = false; this.cd.markForCheck(); })
    );
  }

  restoreDataFromApi(id: number): Observable<T> {
    this.isLoading = true;
    return this.dataHandler.post<T>(`${this.apiEndpoint}/${id}/restore`, {} as T).pipe(
      takeUntil(this.destroy$),
      finalize(() => { this.isLoading = false; this.cd.markForCheck(); })
    );
  }
  
  uploadData<U>(formData: FormData, targetUrl?: string): Observable<U> {
    this.isLoading = true;
    return this.dataHandler.upload<U>(targetUrl || this.apiEndpoint, formData).pipe(
      takeUntil(this.destroy$),
      finalize(() => { this.isLoading = false; this.cd.markForCheck(); })
    );
  }

  // --- SPECIFICKÉ OPERACE ---

  /**
   * Univerzální metoda pro změnu hesla, používaná zejména v AdministratorsComponent.
   * @param id ID uživatele
   * @param data Objekt s hesly (new_password, current_user_id atd.)
   */
  public updatePassword(id: number, data: any): Observable<any> {
    if (!id) return throwError(() => new Error('ID uživatele pro změnu hesla není definováno.'));
    
    this.isLoading = true;
    this.errorMessage = null;
    const url = `${this.apiEndpoint}/${id}/change-password`;

    return this.dataHandler.post<any>(url, data).pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isLoading = false;
        this.cd.markForCheck();
      }),
      catchError((err: HttpErrorResponse) => {
        this.errorMessage = err.message || 'Neznámá chyba při změně hesla.';
        this.cd.markForCheck();
        return throwError(() => err);
      })
    );
  }
  /**
   * Trvale smaže všechny záznamy v koši pro aktuální endpoint.
   */
   loadAllData(filters?: FilterParams): Observable<T[]> {
    if (!this.apiEndpoint) {
      return throwError(() => new Error('Chyba: API endpoint není definován pro načtení všech dat.'));
    }
    const params = new URLSearchParams();
    params.set('no_pagination', 'true');

    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof FilterParams];
        if (value !== '' && value !== null && value !== undefined) {
          params.set(key, value.toString());
        }
      });
    }

    const url = `${this.apiEndpoint}?${params.toString()}`;
    return this.dataHandler.getCollection<T>(url).pipe(
      takeUntil(this.destroy$),
      catchError((err: Error) => {
        return throwError(() => err);
      })
    );
  }
  public hardDeleteAllTrashedDataFromApi(): Observable<void> {
    if (!this.apiEndpoint) {
      return throwError(() => new Error('Chyba: API endpoint není definován pro hromadné smazání.'));
    }

    const deleteUrl = `${this.apiEndpoint}/force-delete-all`;
    this.isLoading = true;
    this.errorMessage = null;

    return this.dataHandler.delete(deleteUrl).pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isLoading = false;
        this.cd.markForCheck();
      }),
      catchError((err: HttpErrorResponse) => {
        this.errorMessage = err.message || 'Neznámá chyba při hromadném mazání.';
        this.cd.markForCheck();
        return throwError(() => err);
      })
    );
  }
}