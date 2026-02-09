
import { Directive, OnInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { Subject, Observable, throwError } from 'rxjs';
import { takeUntil, catchError, finalize } from 'rxjs/operators';
import { DataHandler } from '../../../core/services/data-handler.service';
import { HttpErrorResponse } from '@angular/common/http';
import { FilterParams } from '../../../core/services/generic-table.service';

@Directive()
export abstract class BaseDataComponent<T extends { id?: number; deleted_at?: string | null }> implements OnInit, OnDestroy, OnChanges {
  data: T[] = [];
  trashData: T[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  protected destroy$ = new Subject<void>();
  abstract apiEndpoint: string;
  
  private showLoaderTimeout: any;

  constructor(protected dataHandler: DataHandler, protected cd: ChangeDetectorRef) {}
  
  ngOnInit(): void {}
  ngOnChanges(changes: SimpleChanges): void {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.showLoaderTimeout) {
      clearTimeout(this.showLoaderTimeout);
    }
  }

  loadData(): void {
    if (!this.apiEndpoint) {
      const msg = 'Chyba: API endpoint není definován v dědící komponentě. Nelze načíst data.';
      this.errorMessage = msg;
      return;
    }
    this.isLoading = true;
    this.errorMessage = null;
    const url = this.apiEndpoint;
    this.dataHandler.getCollection<T>(url)
      .pipe(
        takeUntil(this.destroy$),
        catchError((err: Error) => {
          this.isLoading = false;
          this.errorMessage = err.message || 'Neznámá chyba při načítání dat.';
          this.cd.markForCheck();
          return throwError(() => err);
        })
      )
      .subscribe({
        next: (responseData) => {
          this.data = responseData;
          this.isLoading = false;
          this.cd.markForCheck();
        },
        error: () => {},
        complete: () => {
          this.isLoading = false;
          this.cd.markForCheck();
        }
      });
  }

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

  getItemDetails(id: number | undefined): Observable<T> {
    if (id === undefined || id === null) {
      const msg = 'Chyba: ID záznamu pro načtení detailů není definováno.';
      this.errorMessage = msg;
      return throwError(() => new Error(msg));
    }

    const url = `${this.apiEndpoint}/${id}/details`;

    this.showLoaderTimeout = setTimeout(() => {
      this.isLoading = true;
      this.cd.markForCheck();
    }, 3000);

    this.errorMessage = null;

    return this.dataHandler.get<T>(url).pipe(
      takeUntil(this.destroy$),
      catchError((err: HttpErrorResponse) => {
        if (this.showLoaderTimeout) {
          clearTimeout(this.showLoaderTimeout);
        }
        this.isLoading = false;
        this.errorMessage = err.message || 'Neznámá chyba při načítání detailů.';
        this.cd.markForCheck();
        return throwError(() => err);
      }),
      finalize(() => {
        if (this.showLoaderTimeout) {
          clearTimeout(this.showLoaderTimeout);
        }
        this.isLoading = false;
        this.cd.markForCheck();
      })
    );
  }

  getOnlySoftDeleted(endpoint: string, filters?: FilterParams): Observable<T[]> {
    const params = new URLSearchParams();
    params.set('only_trashed', 'true');
    params.set('no_pagination', 'true');
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof FilterParams];
        if (value !== '' && value !== null && value !== undefined) {
          params.set(key, value.toString());
        }
      });
    }
    const url = `${endpoint}?${params.toString()}`;
    return this.dataHandler.getCollection<T>(url).pipe(
      takeUntil(this.destroy$),
      catchError((err: HttpErrorResponse) => {
        return throwError(() => err);
      })
    );
  }

  postData(data: T): Observable<T> {
    this.isLoading = true;
    this.errorMessage = null;
    return this.dataHandler.post<T>(this.apiEndpoint, data).pipe(
      takeUntil(this.destroy$),
      catchError((err: Error) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Neznámá chyba při vytváření dat.';
        this.cd.markForCheck();
        return throwError(() => err);
      })
    );
  }
  
  updateData(id: number | undefined, data: T): Observable<T> {
    if (id === undefined || id === null) {
      const msg = 'Chyba: ID záznamu pro aktualizaci není definováno.';
      this.errorMessage = msg;
      return throwError(() => new Error(msg));
    }
    this.isLoading = true;
    this.errorMessage = null;
    const updateUrl = `${this.apiEndpoint}/${id}`;
    return this.dataHandler.put<T>(updateUrl, data).pipe(
      takeUntil(this.destroy$),
      catchError((err: Error) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Neznámá chyba při aktualizaci dat.';
        this.cd.markForCheck();
        return throwError(() => err);
      })
    );
  }
  public updatePassword(id: number, data: any): Observable<any> {
    this.isLoading = true;
    this.errorMessage = null;
    const url = `${this.apiEndpoint}/${id}/change-password`;
    return this.dataHandler.post<any>(url, data).pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isLoading = false;
        this.cd.markForCheck();
      }),
      catchError((err) => {
        this.errorMessage = err.message || 'Neznámá chyba při změně hesla.';
        this.cd.markForCheck();
        return throwError(() => err);
      })
    );
  }
  
  deleteData(id: number | undefined, forceDelete: boolean = false): Observable<void> {
    if (id === undefined || id === null) {
      const msg = 'Chyba: ID záznamu pro smazání není definováno.';
      this.errorMessage = msg;
      return throwError(() => new Error(msg));
    }
    this.isLoading = true;
    this.errorMessage = null;
    let deleteUrl = `${this.apiEndpoint}/${id}`;
    if (forceDelete) {
      deleteUrl += '?force_delete=true';
    }
    return this.dataHandler.delete(deleteUrl).pipe(
      takeUntil(this.destroy$),
      catchError((err: Error) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Neznámá chyba při mazání dat.';
        this.cd.markForCheck();
        return throwError(() => err);
      })
    );
  }
  
  hardDeleteDataFromApi(id: number): Observable<void> {
    return this.deleteData(id, true);
  }
  
  hardDeleteAllTrashedDataFromApi(): Observable<void> {
    if (!this.apiEndpoint) {
      return throwError(() => new Error('Chyba: API endpoint není definován pro hromadné smazání.'));
    }
    const deleteUrl = `${this.apiEndpoint}/force-delete-all`;
    this.isLoading = true;
    this.errorMessage = null;
    return this.dataHandler.delete(deleteUrl).pipe(
      takeUntil(this.destroy$),
      catchError((err: Error) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Neznámá chyba při hromadném mazání.';
        this.cd.markForCheck();
        return throwError(() => err);
      }),
      finalize(() => {
        this.isLoading = false;
        this.cd.markForCheck();
      })
    );
  }
  
  restoreDataFromApi(id: number): Observable<T> {
    this.isLoading = true;
    this.errorMessage = null;
    const restoreUrl = `${this.apiEndpoint}/${id}/restore`;
    return this.dataHandler.post<T>(restoreUrl, {} as T).pipe(
      takeUntil(this.destroy$),
      catchError((err: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Neznámá chyba při obnovování dat.';
        this.cd.markForCheck();
        return throwError(() => err);
      }),
      finalize(() => {
        this.isLoading = false;
        this.cd.markForCheck();
      })
    );
  }
  
  uploadData<U>(formData: FormData, targetUrl?: string): Observable<U> {
    const url = targetUrl || this.apiEndpoint;
    this.isLoading = true;
    this.errorMessage = null;
    return this.dataHandler.upload<U>(url, formData).pipe(
      takeUntil(this.destroy$),
      catchError((err: Error) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Neznámá chyba při nahrávání dat.';
        this.cd.markForCheck();
        return throwError(() => err);
      })
    );
  }
}
