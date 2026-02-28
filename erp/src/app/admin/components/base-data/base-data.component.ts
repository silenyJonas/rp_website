import { Directive } from '@angular/core'; // Přímý import pro dekorátor
import * as Core from '../../../shared/imports/core-providers';

@Directive() // Použít přímo, ne přes Core.Directive()
export abstract class BaseDataComponent<T extends { id?: number; deleted_at?: string | null }> implements Core.OnInit, Core.OnDestroy, Core.OnChanges {
  // Základní data
  data: T[] = [];
  trashData: T[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  protected destroy$ = new Core.Subject<void>();
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
  protected currentActiveFilters: Core.FilterParams = {};
  protected currentTrashFilters: Core.FilterParams = {};
  
  // Výchozí řazení (lze přebít v dceřiné komponentě)
  protected defaultFilters: Core.FilterParams = {
    sort_by: 'id',
    sort_direction: 'desc'
  };

  private showLoaderTimeout: any;

  constructor(
    protected dataHandler: Core.DataHandler, 
    protected cd: Core.ChangeDetectorRef,
    protected genericTableService: Core.GenericTableService 
  ) {}
  
  ngOnInit(): void {}
  ngOnChanges(changes: Core.SimpleChanges): void {}
  
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
    filters: Core.FilterParams
  ): Core.Observable<Core.PaginatedResponse<T>> {
    const cache = isTrash ? this.trashCache : this.activeCache;
    const currentStoredFilters = isTrash ? this.currentTrashFilters : this.currentActiveFilters;

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

    if (cache.has(page)) {
      const cachedData = cache.get(page)!;
      if (isTrash) this.trashData = cachedData; else this.data = cachedData;
      this.cd.markForCheck();
      return Core.of({ 
        data: cachedData, 
        current_page: page, 
        last_page: isTrash ? this.trashTotalPages : this.totalPages, 
        total: isTrash ? this.trashTotalItems : this.totalItems 
      } as Core.PaginatedResponse<T>);
    }

    const params: Core.FilterParams = { ...filters };
    if (isTrash) params['only_trashed'] = 'true';

    return this.genericTableService.getPaginatedData<T>(this.apiEndpoint, page, perPage, params).pipe(
      Core.takeUntil(this.destroy$),
      Core.retry(1),
      Core.tap(response => {
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

  public forceFullRefresh(currentFilters: Core.FilterParams = this.defaultFilters): void {
    this.activeCache.clear();
    this.trashCache.clear();
    this.isLoading = true;
    this.cd.markForCheck();

    Core.forkJoin([
      this.fetchPaginatedData(false, this.currentPage, this.itemsPerPage, currentFilters),
      this.fetchPaginatedData(true, this.trashCurrentPage, this.trashItemsPerPage, currentFilters)
    ]).pipe(
      Core.finalize(() => {
        this.isLoading = false;
        this.cd.markForCheck();
      })
    ).subscribe();
  }

  // --- HANDLERY STRÁNKOVÁNÍ ---

  onHandlePageChange(page: number, filters: Core.FilterParams = this.currentActiveFilters): void {
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

  onHandleItemsPerPageChange(value: number, filters: Core.FilterParams = this.currentActiveFilters): void {
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
    this.forceFullRefresh(this.showTrashTable ? this.currentTrashFilters : this.currentActiveFilters);
  }

  toggleFilters(): void {
    this.isFilterVisible = !this.isFilterVisible;
  }

  loadData(): void {
    if (!this.apiEndpoint) {
      this.errorMessage = 'Chyba: API endpoint není definován.';
      return;
    }
    this.isLoading = true;
    this.dataHandler.getCollection<T>(this.apiEndpoint)
      .pipe(
        Core.takeUntil(this.destroy$),
        Core.finalize(() => { this.isLoading = false; this.cd.markForCheck(); })
      )
      .subscribe(responseData => this.data = responseData);
  }

  getItemDetails(id: number | undefined): Core.Observable<T> {
    if (!id) return Core.throwError(() => new Error('ID není definováno.'));
    const url = `${this.apiEndpoint}/${id}/details`;
    this.isLoading = true;
    return this.dataHandler.get<T>(url).pipe(
      Core.takeUntil(this.destroy$),
      Core.finalize(() => { this.isLoading = false; this.cd.markForCheck(); })
    );
  }

  postData(data: T): Core.Observable<T> {
    this.isLoading = true;
    return this.dataHandler.post<T>(this.apiEndpoint, data).pipe(
      Core.takeUntil(this.destroy$),
      Core.finalize(() => { this.isLoading = false; this.cd.markForCheck(); })
    );
  }
  
  updateData(id: number | undefined, data: T): Core.Observable<T> {
    if (!id) return Core.throwError(() => new Error('ID není definováno.'));
    this.isLoading = true;
    return this.dataHandler.put<T>(`${this.apiEndpoint}/${id}`, data).pipe(
      Core.takeUntil(this.destroy$),
      Core.finalize(() => { this.isLoading = false; this.cd.markForCheck(); })
    );
  }
  
  deleteData(id: number | undefined, forceDelete: boolean = false): Core.Observable<void> {
    if (!id) return Core.throwError(() => new Error('ID není definováno.'));
    this.isLoading = true;
    let url = `${this.apiEndpoint}/${id}`;
    if (forceDelete) url += '?force_delete=true';
    return this.dataHandler.delete(url).pipe(
      Core.takeUntil(this.destroy$),
      Core.finalize(() => { this.isLoading = false; this.cd.markForCheck(); })
    );
  }

  restoreDataFromApi(id: number): Core.Observable<T> {
    this.isLoading = true;
    return this.dataHandler.post<T>(`${this.apiEndpoint}/${id}/restore`, {} as T).pipe(
      Core.takeUntil(this.destroy$),
      Core.finalize(() => { this.isLoading = false; this.cd.markForCheck(); })
    );
  }
  
  uploadData<U>(formData: FormData, targetUrl?: string): Core.Observable<U> {
    this.isLoading = true;
    return this.dataHandler.upload<U>(targetUrl || this.apiEndpoint, formData).pipe(
      Core.takeUntil(this.destroy$),
      Core.finalize(() => { this.isLoading = false; this.cd.markForCheck(); })
    );
  }

  // --- SPECIFICKÉ OPERACE ---

  public updatePassword(id: number, data: any): Core.Observable<any> {
    if (!id) return Core.throwError(() => new Error('ID uživatele pro změnu hesla není definováno.'));
    
    this.isLoading = true;
    this.errorMessage = null;
    const url = `${this.apiEndpoint}/${id}/change-password`;

    return this.dataHandler.put<any>(url, data).pipe(
      Core.takeUntil(this.destroy$),
      Core.finalize(() => {
        this.isLoading = false;
        this.cd.markForCheck();
      }),
      Core.catchError((err: Core.HttpErrorResponse) => {
        this.errorMessage = err.message || 'Neznámá chyba při změně hesla.';
        this.cd.markForCheck();
        return Core.throwError(() => err);
      })
    );
  }

  loadAllData(filters?: Core.FilterParams): Core.Observable<T[]> {
    if (!this.apiEndpoint) {
      return Core.throwError(() => new Error('Chyba: API endpoint není definován pro načtení všech dat.'));
    }
    const params = new URLSearchParams();
    params.set('no_pagination', 'true');

    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof Core.FilterParams];
        if (value !== '' && value !== null && value !== undefined) {
          params.set(key, value.toString());
        }
      });
    }

    const url = `${this.apiEndpoint}?${params.toString()}`;
    return this.dataHandler.getCollection<T>(url).pipe(
      Core.takeUntil(this.destroy$),
      Core.catchError((err: Error) => {
        return Core.throwError(() => err);
      })
    );
  }

  public hardDeleteAllTrashedDataFromApi(): Core.Observable<void> {
    if (!this.apiEndpoint) {
      return Core.throwError(() => new Error('Chyba: API endpoint není definován pro hromadné smazání.'));
    }

    const deleteUrl = `${this.apiEndpoint}/force-delete-all`;
    this.isLoading = true;
    this.errorMessage = null;

    return this.dataHandler.delete(deleteUrl).pipe(
      Core.takeUntil(this.destroy$),
      Core.finalize(() => {
        this.isLoading = false;
        this.cd.markForCheck();
      }),
      Core.catchError((err: Core.HttpErrorResponse) => {
        this.errorMessage = err.message || 'Neznámá chyba při hromadném mazání.';
        this.cd.markForCheck();
        return Core.throwError(() => err);
      })
    );
  }
}