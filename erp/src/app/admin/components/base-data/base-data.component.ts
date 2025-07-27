
import { Directive, OnInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { Subject, Observable, throwError } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { DataHandler } from '../../../core/services/data-handler.service';
import { HttpErrorResponse } from '@angular/common/http';

@Directive()
export abstract class BaseDataComponent<T> implements OnInit, OnDestroy, OnChanges {

  data: T[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  protected destroy$ = new Subject<void>();

  abstract apiEndpoint: string;

  constructor(
    protected dataHandler: DataHandler,
    protected cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // DŮLEŽITÉ ZMĚNA: ODSTRANĚNO automatické volání loadData() zde.
    // Dědící komponenty (jako UserRequestComponent) budou volat své specifické metody pro načítání dat.
    // console.log('BaseDataComponent ngOnInit - loadData() není voláno automaticky.');
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Tato metoda je zde, aby ji dědící třídy mohly implementovat, pokud potřebují reagovat na @Input() změny.
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Tato metoda loadData() zůstává pro případ, že by dědící komponenta chtěla načítat
  // nepaginovaná data pomocí DataHandleru.
  loadData(): void {
    if (!this.apiEndpoint) {
      const msg = 'Chyba: API endpoint není definován v dědící komponentě. Nelze načíst data.';
      this.errorMessage = msg;
      console.error(msg);
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    this.dataHandler.getCollection<T>(this.apiEndpoint)
      .pipe(
        takeUntil(this.destroy$),
        catchError((err: Error) => {
          this.isLoading = false;
          this.errorMessage = err.message || 'Neznámá chyba při načítání dat.';
          console.error(`Chyba při načítání z ${this.apiEndpoint}:`, err);
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
          // Chyba je již zpracována v catchError výše
        },
        complete: () => {
          this.isLoading = false;
          this.cd.markForCheck();
        }
      });
  }

  // Ostatní CRUD metody (postData, updateData, deleteData, uploadData) zůstávají nezměněny,
  // protože se spoléhají na DataHandler a jsou volány explicitně.
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

  deleteData(id: number | undefined): Observable<void> {
    if (id === undefined || id === null) {
      const msg = 'Chyba: ID záznamu pro smazání není definováno.';
      this.errorMessage = msg;
      console.error(msg);
      return throwError(() => new Error(msg));
    }

    this.isLoading = true;
    this.errorMessage = null;

    const deleteUrl = `${this.apiEndpoint}/${id}`;

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
