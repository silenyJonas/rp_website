import { Directive, OnInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { Subject, Observable, throwError } from 'rxjs';
import { takeUntil, catchError, map } from 'rxjs/operators';
import { DataHandler } from '../../../core/services/data-handler.service';
import { HttpErrorResponse } from '@angular/common/http';

@Directive()
export abstract class BaseDataComponent<T extends { id?: number; deleted_at?: string | null }> implements OnInit, OnDestroy, OnChanges {
  data: T[] = [];
  trashData: T[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  protected destroy$ = new Subject<void>();
  abstract apiEndpoint: string;
  constructor(protected dataHandler: DataHandler, protected cd: ChangeDetectorRef) {}
  ngOnInit(): void {}
  ngOnChanges(changes: SimpleChanges): void {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  loadData(): void {
    if (!this.apiEndpoint) {
      const msg = 'Chyba: API endpoint není definován v dědící komponentě. Nelze načíst data.';
      this.errorMessage = msg;
      console.error(msg);
      return;
    }
    console.log('base-data: Spouštím načítání dat. isLoading je true.');
    this.isLoading = true;
    this.errorMessage = null;
    const url = this.apiEndpoint;
    this.dataHandler.getCollection<T>(url)
      .pipe(
        takeUntil(this.destroy$),
        catchError((err: Error) => {
          console.error(`base-data: Chyba při načítání z ${url}:`, err);
          this.isLoading = false;
          this.errorMessage = err.message || 'Neznámá chyba při načítání dat.';
          this.cd.markForCheck();
          return throwError(() => err);
        })
      )
      .subscribe({
        next: (responseData) => {
          console.log('base-data: Načítání dat proběhlo úspěšně. isLoading je false.');
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
  loadAllData(filters?: any): Observable<T[]> {
    if (!this.apiEndpoint) {
      return throwError(() => new Error('Chyba: API endpoint není definován pro načtení všech dat.'));
    }
    const params = new URLSearchParams();
    params.set('no_pagination', 'true');
    if (filters) {
      for (const key in filters) {
        if (filters.hasOwnProperty(key)) {
          params.set(key, filters[key]);
        }
      }
    }
    const url = `${this.apiEndpoint}?${params.toString()}`;
    console.log('base-data: Spouštím načítání všech dat.');
    return this.dataHandler.getCollection<T>(url).pipe(
      takeUntil(this.destroy$),
      catchError((err: Error) => {
        console.error(`base-data: Chyba při načítání všech dat z ${this.apiEndpoint}:`, err);
        return throwError(() => err);
      })
    );
  }
  getOnlySoftDeleted(endpoint: string): Observable<T[]> {
    const url = `${endpoint}?only_trashed=true&no_pagination=true`;
    console.log('base-data: Spouštím načítání soft-deleted dat.');
    return this.dataHandler.getCollection<T>(url).pipe(
      takeUntil(this.destroy$),
      catchError((err: HttpErrorResponse) => {
        console.error(`base-data: Chyba při načítání soft-deleted dat z ${endpoint}:`, err);
        return throwError(() => err);
      })
    );
  }
  postData(data: T): Observable<T> {
    console.log('base-data: Spouštím POST request. isLoading je true.');
    this.isLoading = true;
    this.errorMessage = null;
    return this.dataHandler.post<T>(this.apiEndpoint, data).pipe(
      takeUntil(this.destroy$),
      catchError((err: Error) => {
        console.error(`base-data: Chyba při POST na ${this.apiEndpoint}:`, err);
        console.log('base-data: POST request selhal. isLoading je false.');
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
      console.error(msg);
      return throwError(() => new Error(msg));
    }
    console.log('base-data: Spouštím PUT request. isLoading je true.');
    this.isLoading = true;
    this.errorMessage = null;
    const updateUrl = `${this.apiEndpoint}/${id}`;
    return this.dataHandler.put<T>(updateUrl, data).pipe(
      takeUntil(this.destroy$),
      catchError((err: Error) => {
        console.error(`base-data: Chyba při PUT na ${updateUrl}:`, err);
        console.log('base-data: PUT request selhal. isLoading je false.');
        this.isLoading = false;
        this.errorMessage = err.message || 'Neznámá chyba při aktualizaci dat.';
        this.cd.markForCheck();
        return throwError(() => err);
      })
    );
  }
  deleteData(id: number | undefined, forceDelete: boolean = false): Observable<void> {
    if (id === undefined || id === null) {
      const msg = 'Chyba: ID záznamu pro smazání není definováno.';
      this.errorMessage = msg;
      console.error(msg);
      return throwError(() => new Error(msg));
    }
    console.log('base-data: Spouštím DELETE request. isLoading je true.');
    this.isLoading = true;
    this.errorMessage = null;
    let deleteUrl = `${this.apiEndpoint}/${id}`;
    if (forceDelete) {
      deleteUrl += '?force_delete=true';
    }
    return this.dataHandler.delete(deleteUrl).pipe(
      takeUntil(this.destroy$),
      catchError((err: Error) => {
        console.error(`base-data: Chyba při DELETE na ${deleteUrl}:`, err);
        console.log('base-data: DELETE request selhal. isLoading je false.');
        this.isLoading = false;
        this.errorMessage = err.message || 'Neznámá chyba při mazání dat.';
        this.cd.markForCheck();
        return throwError(() => err);
      })
    );
  }
  hardDeleteDataFromApi(id: number): Observable<void> {
    console.log('base-data: Spouštím trvalé smazání dat.');
    return this.deleteData(id, true);
  }
  hardDeleteAllTrashedDataFromApi(): Observable<void> {
    if (!this.apiEndpoint) {
      return throwError(() => new Error('Chyba: API endpoint není definován pro hromadné smazání.'));
    }
    const deleteUrl = `${this.apiEndpoint}/force-delete-all`;
    console.log('base-data: Spouštím hromadný DELETE request.');
    this.isLoading = true;
    this.errorMessage = null;
    return this.dataHandler.delete(deleteUrl).pipe(
      takeUntil(this.destroy$),
      catchError((err: Error) => {
        console.error(`base-data: Chyba při hromadném DELETE na ${deleteUrl}:`, err);
        this.isLoading = false;
        this.errorMessage = err.message || 'Neznámá chyba při hromadném mazání.';
        this.cd.markForCheck();
        return throwError(() => err);
      }),
      map(() => {
        this.isLoading = false;
        this.cd.markForCheck();
      })
    );
  }
  restoreDataFromApi(id: number): Observable<T> {
    console.log('base-data: Spouštím obnovení dat. isLoading je true.');
    this.isLoading = true;
    this.errorMessage = null;
    const restoreUrl = `${this.apiEndpoint}/${id}/restore`;
    return this.dataHandler.put<T>(restoreUrl, {} as T).pipe(
      takeUntil(this.destroy$),
      catchError((err: HttpErrorResponse) => {
        console.error(`base-data: Chyba při obnovování na ${restoreUrl}:`, err);
        console.log('base-data: Obnovení dat selhalo. isLoading je false.');
        this.isLoading = false;
        this.errorMessage = err.message || 'Neznámá chyba při obnovování dat.';
        this.cd.markForCheck();
        return throwError(() => err);
      })
    );
  }
  uploadData<U>(formData: FormData, targetUrl?: string): Observable<U> {
    const url = targetUrl || this.apiEndpoint;
    console.log('base-data: Spouštím nahrávání dat. isLoading je true.');
    this.isLoading = true;
    this.errorMessage = null;
    return this.dataHandler.upload<U>(url, formData).pipe(
      takeUntil(this.destroy$),
      catchError((err: Error) => {
        console.error(`base-data: Chyba při nahrávání na ${url}:`, err);
        console.log('base-data: Nahrávání dat selhalo. isLoading je false.');
        this.isLoading = false;
        this.errorMessage = err.message || 'Neznámá chyba při nahrávání dat.';
        this.cd.markForCheck();
        return throwError(() => err);
      })
    );
  }
}
