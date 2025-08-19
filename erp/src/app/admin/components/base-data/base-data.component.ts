
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
    console.log('base-data: Spouštím načítání všech dat s filtry:', filters);
    return this.dataHandler.getCollection<T>(url).pipe(
      takeUntil(this.destroy$),
      catchError((err: Error) => {
        console.error(`base-data: Chyba při načítání všech dat z ${this.apiEndpoint}:`, err);
        return throwError(() => err);
      })
    );
  }

  getItemDetails(id: number | undefined): Observable<T> {
    if (id === undefined || id === null) {
      const msg = 'Chyba: ID záznamu pro načtení detailů není definováno.';
      this.errorMessage = msg;
      console.error(msg);
      return throwError(() => new Error(msg));
    }

    const url = `${this.apiEndpoint}/${id}/details`;
    console.log(`base-data: Spouštím načítání detailů pro ID ${id}.`);

    this.showLoaderTimeout = setTimeout(() => {
      this.isLoading = true;
      this.cd.markForCheck();
      console.log('base-data: Načítání trvá déle, zobrazuji loader.');
    }, 3000);

    this.errorMessage = null;

    return this.dataHandler.get<T>(url).pipe(
      takeUntil(this.destroy$),
      catchError((err: HttpErrorResponse) => {
        if (this.showLoaderTimeout) {
          clearTimeout(this.showLoaderTimeout);
        }
        console.error(`base-data: Chyba při načítání detailů z ${url}:`, err);
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
    console.log('base-data: Spouštím načítání soft-deleted dat s filtry:', filters);
    return this.dataHandler.getCollection<T>(url).pipe(
      takeUntil(this.destroy$),
      catchError((err: HttpErrorResponse) => {
        console.error(`base-data: Chyba při načítání soft-deleted dat z ${endpoint}:`, err);
        return throwError(() => err);
      })
    );
  }

  postData(data: T): Observable<T> {
    console.log('base-data: Spouštím POST request.');
    console.log('base-data: Odesílám data:', data);
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
    console.log('base-data: Spouštím PUT request.');
    console.log('base-data: Odesílám data k aktualizaci:', data);
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

  /**
   * Změní heslo uživatele.
   * @param id ID uživatele.
   * @param data Objekt s hesly (old_password, new_password).
   * @returns Observable s odpovědí z API.
   */
  public updatePassword(id: number, data: any): Observable<any> {
    console.log('base-data: Spouštím POST request pro změnu hesla.');
    
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
        console.error(`base-data: Chyba při změně hesla na ${url}:`, err);
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
      finalize(() => {
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
    return this.dataHandler.post<T>(restoreUrl, {} as T).pipe(
      takeUntil(this.destroy$),
      catchError((err: HttpErrorResponse) => {
        console.error(`base-data: Chyba při obnovování na ${restoreUrl}:`, err);
        console.log('base-data: Obnovení dat selhalo. isLoading je false.');
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
