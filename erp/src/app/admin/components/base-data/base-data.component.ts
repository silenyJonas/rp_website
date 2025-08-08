
// import { Directive, OnInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
// import { Subject, Observable, throwError } from 'rxjs';
// import { takeUntil, catchError } from 'rxjs/operators';
// import { DataHandler } from '../../../core/services/data-handler.service';
// import { HttpErrorResponse } from '@angular/common/http';

// @Directive()
// export abstract class BaseDataComponent<T> implements OnInit, OnDestroy, OnChanges {

//   data: T[] = [];
//   trashData: T[] = [];
//   isLoading = false;
//   errorMessage: string | null = null;

//   protected destroy$ = new Subject<void>();

//   abstract apiEndpoint: string;

//   constructor(
//     protected dataHandler: DataHandler,
//     protected cd: ChangeDetectorRef,
//   ) {}

//   ngOnInit(): void {
//   }

//   ngOnChanges(changes: SimpleChanges): void {
//   }

//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }
  
//   /**
//    * Načte kolekci dat z API.
//    * Ve výchozím nastavení načítá pouze aktivní (nesmazané) záznamy.
//    */
//   loadData(): void {
//     if (!this.apiEndpoint) {
//       const msg = 'Chyba: API endpoint není definován v dědící komponentě. Nelze načíst data.';
//       this.errorMessage = msg;
//       console.error(msg);
//       return;
//     }

//     this.isLoading = true;
//     this.errorMessage = null;
    
//     // Načtení aktivních (nesmazaných) záznamů
//     const url = this.apiEndpoint;

//     this.dataHandler.getCollection<T>(url)
//       .pipe(
//         takeUntil(this.destroy$),
//         catchError((err: Error) => {
//           this.isLoading = false;
//           this.errorMessage = err.message || 'Neznámá chyba při načítání dat.';
//           console.error(`Chyba při načítání z ${url}:`, err);
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
//         error: (err) => {
//           // Chyba je již ošetřena v catchError
//         },
//         complete: () => {
//           this.isLoading = false;
//           this.cd.markForCheck();
//         }
//       });
//   }

//   /**
//    * Načte všechna data (bez stránkování).
//    * @param filters Volitelné filtry.
//    * @returns Observable s polem dat.
//    */
//   loadAllData(filters?: any): Observable<T[]> {
//     if (!this.apiEndpoint) {
//       return throwError(() => new Error('Chyba: API endpoint není definován pro načtení všech dat.'));
//     }
//     const params = new URLSearchParams();
//     params.set('no_pagination', 'true');
//     if (filters) {
//       for (const key in filters) {
//         if (filters.hasOwnProperty(key)) {
//           params.set(key, filters[key]);
//         }
//       }
//     }
//     const url = `${this.apiEndpoint}?${params.toString()}`;
//     return this.dataHandler.getCollection<T>(url).pipe(
//       takeUntil(this.destroy$),
//       catchError((err: Error) => {
//         console.error(`Chyba při načítání všech dat z ${this.apiEndpoint}:`, err);
//         return throwError(() => err);
//       })
//     );
//   }

//   /**
//    * Načte pouze soft-deletnuté položky z API.
//    * Přidává parametr `only_trashed=true` do URL.
//    * @param endpoint API endpoint pro smazané položky.
//    * @returns Observable s polem smazaných dat.
//    */
//   getOnlySoftDeleted(endpoint: string): Observable<T[]> {
//     const url = `${endpoint}?only_trashed=true&no_pagination=true`; // Přidán no_pagination=true
//     return this.dataHandler.getCollection<T>(url).pipe(
//       takeUntil(this.destroy$),
//       catchError((err: HttpErrorResponse) => {
//         console.error(`Chyba při načítání soft-deleted dat z ${endpoint}:`, err);
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
//         console.error(`Chyba při POST na ${this.apiEndpoint}:`, err);
//         this.cd.markForCheck();
//         return throwError(() => err);
//       })
//     );
//   }

//   updateData(id: number | undefined, data: T): Observable<T> {
//     if (id === undefined || id === null) {
//       const msg = 'Chyba: ID záznamu pro aktualizaci není definováno.';
//       this.errorMessage = msg;
//       console.error(msg);
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
//         console.error(`Chyba při PUT na ${updateUrl}:`, err);
//         this.cd.markForCheck();
//         return throwError(() => err);
//       })
//     );
//   }

//   deleteData(id: number | undefined, forceDelete: boolean = false): Observable<void> {
//     if (id === undefined || id === null) {
//       const msg = 'Chyba: ID záznamu pro smazání není definováno.';
//       this.errorMessage = msg;
//       console.error(msg);
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
//         console.error(`Chyba při DELETE na ${deleteUrl}:`, err);
//         this.cd.markForCheck();
//         return throwError(() => err);
//       })
//     );
//   }

//   softDeleteDataFromApi(id: number): Observable<void> {
//     return this.deleteData(id);
//   }

//   hardDeleteDataFromApi(id: number): Observable<void> {
//     return this.deleteData(id, true);
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
//         console.error(`Chyba při nahrávání na ${url}:`, err);
//         this.cd.markForCheck();
//         return throwError(() => err);
//       })
//     );
//   }
// }
import { Directive, OnInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { Subject, Observable, throwError } from 'rxjs';
import { takeUntil, catchError, map } from 'rxjs/operators';
import { DataHandler } from '../../../core/services/data-handler.service';
import { HttpErrorResponse } from '@angular/common/http';

@Directive()
export abstract class BaseDataComponent<T extends { id?: number; deleted_at?: string | null }> implements OnInit, OnDestroy, OnChanges {
  // Rozšířeno o typ T, aby se zaručilo, že má vlastnosti id a deleted_at
  
  data: T[] = [];
  trashData: T[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  protected destroy$ = new Subject<void>();

  abstract apiEndpoint: string;

  constructor(
    protected dataHandler: DataHandler,
    protected cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  /**
   * Načte kolekci dat z API.
   * Ve výchozím nastavení načítá pouze aktivní (nesmazané) záznamy.
   */
  loadData(): void {
    if (!this.apiEndpoint) {
      const msg = 'Chyba: API endpoint není definován v dědící komponentě. Nelze načíst data.';
      this.errorMessage = msg;
      console.error(msg);
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    
    // Načtení aktivních (nesmazaných) záznamů
    const url = this.apiEndpoint;

    this.dataHandler.getCollection<T>(url)
      .pipe(
        takeUntil(this.destroy$),
        catchError((err: Error) => {
          this.isLoading = false;
          this.errorMessage = err.message || 'Neznámá chyba při načítání dat.';
          console.error(`Chyba při načítání z ${url}:`, err);
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
        error: (err) => {
          // Chyba je již ošetřena v catchError
        },
        complete: () => {
          this.isLoading = false;
          this.cd.markForCheck();
        }
      });
  }

  /**
   * Načte všechna data (bez stránkování).
   * @param filters Volitelné filtry.
   * @returns Observable s polem dat.
   */
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
    return this.dataHandler.getCollection<T>(url).pipe(
      takeUntil(this.destroy$),
      catchError((err: Error) => {
        console.error(`Chyba při načítání všech dat z ${this.apiEndpoint}:`, err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Načte pouze soft-deletnuté položky z API.
   * Přidává parametr `only_trashed=true` do URL.
   * @param endpoint API endpoint pro smazané položky.
   * @returns Observable s polem smazaných dat.
   */
  getOnlySoftDeleted(endpoint: string): Observable<T[]> {
    const url = `${endpoint}?only_trashed=true&no_pagination=true`;
    return this.dataHandler.getCollection<T>(url).pipe(
      takeUntil(this.destroy$),
      catchError((err: HttpErrorResponse) => {
        console.error(`Chyba při načítání soft-deleted dat z ${endpoint}:`, err);
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
        console.error(`Chyba při POST na ${this.apiEndpoint}:`, err);
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

    this.isLoading = true;
    this.errorMessage = null;

    const updateUrl = `${this.apiEndpoint}/${id}`;

    return this.dataHandler.put<T>(updateUrl, data).pipe(
      takeUntil(this.destroy$),
      catchError((err: Error) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Neznámá chyba při aktualizaci dat.';
        console.error(`Chyba při PUT na ${updateUrl}:`, err);
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
        console.error(`Chyba při DELETE na ${deleteUrl}:`, err);
        this.cd.markForCheck();
        return throwError(() => err);
      })
    );
  }

  /**
   * Provádí soft-delete záznamu pomocí PUT requestu na API.
   * @param id ID záznamu, který se má soft-smazat.
   * @returns Observable s aktualizovaným záznamem.
   */
  softDeleteDataFromApi(id: number): Observable<T> {
    const softDeleteUrl = `${this.apiEndpoint}/${id}`;
    const payload = { deleted_at: new Date().toISOString() };
    return this.dataHandler.put<T>(softDeleteUrl, payload as T).pipe(
      takeUntil(this.destroy$),
      catchError((err: HttpErrorResponse) => {
        console.error(`Chyba při soft-delete na ${softDeleteUrl}:`, err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Provádí trvalé smazání záznamu voláním DELETE s parametrem force_delete.
   * @param id ID záznamu, který se má trvale smazat.
   * @returns Observable<void>.
   */
  hardDeleteDataFromApi(id: number): Observable<void> {
    return this.deleteData(id, true);
  }
  
  /**
   * Obnoví soft-smazanou položku z API nastavením deleted_at na null.
   * @param id ID položky, která se má obnovit.
   * @returns Observable s aktualizovaným záznamem.
   */
  restoreDataFromApi(id: number): Observable<T> {
    this.isLoading = true;
    this.errorMessage = null;
    const restoreUrl = `${this.apiEndpoint}/${id}`;
    const restorePayload = { deleted_at: null };
    
    // Použijeme metodu PUT pro aktualizaci záznamu
    return this.dataHandler.put<T>(restoreUrl, restorePayload as T).pipe(
      takeUntil(this.destroy$),
      catchError((err: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Neznámá chyba při obnovování dat.';
        console.error(`Chyba při obnovování na ${restoreUrl}:`, err);
        this.cd.markForCheck();
        return throwError(() => err);
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
        console.error(`Chyba při nahrávání na ${url}:`, err);
        this.cd.markForCheck();
        return throwError(() => err);
      })
    );
  }
}
