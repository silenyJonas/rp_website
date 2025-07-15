// // src/app/core/base-components/base-data.component.ts

// import { Directive, OnInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
// import { Subject, Observable, throwError } from 'rxjs';
// import { takeUntil, catchError } from 'rxjs/operators'; // catchError je stále potřeba pro lokální handling
// import { DataHandler } from '../../../core/services/data-handler.service';
// import { HttpErrorResponse } from '@angular/common/http'; // Stále pro silné typování v catchError

// // @Directive() se používá, protože base třída nemá vlastní template ani selector
// @Directive()
// export abstract class BaseDataComponent<T> implements OnInit, OnDestroy, OnChanges {

//   // Společné vlastnosti pro stav komponenty
//   data: T[] = [];
//   isLoading = false;
//   errorMessage: string | null = null;

//   // Subject pro automatické odhlášení z observables při zničení komponenty
//   protected destroy$ = new Subject<void>();

//   // Abstraktní vlastnost - každá dědící komponenta MUSÍ definovat svůj konkrétní API endpoint
//   // Příklad: apiEndpoint = environment.apiUrl + '/raw_request_commissions';
//   abstract apiEndpoint: string;

//   // Konstruktor přijímá společné závislosti
//   constructor(
//     protected dataHandler: DataHandler, // Přejmenováno z dataService na dataHandler
//     protected cd: ChangeDetectorRef,
//   ) {}

//   // ngOnInit je volán jednou po inicializaci komponenty
//   ngOnInit(): void {
//     // Načtení dat při inicializaci, pokud komponenta nemá žádné vstupy, které by to měnily
//     // Pokud načítání závisí na @Input(), loadData() by se mělo volat v ngOnChanges.
//     this.loadData();
//   }

//   // ngOnChanges je volán vždy, když se změní některá ze vstupních vlastností (@Input)
//   // Je důležité, aby tato metoda existovala, pokud ji komponenty dědící z BaseDataComponent
//   // potřebují implementovat nebo volat super.ngOnChanges().
//   ngOnChanges(changes: SimpleChanges): void {
//     // V této base komponentě není specifická logika pro ngOnChanges,
//     // ale metoda je zde, aby ji dědící třídy mohly použít.
//   }

//   ngOnDestroy(): void {
//     // Ukončíme všechny subscriptions navázané na destroy$
//     this.destroy$.next();
//     this.destroy$.complete();
//   }

//   loadData(): void {
//     if (!this.apiEndpoint) {
//       const msg = 'Chyba: API endpoint není definován v dědící komponentě. Nelze načíst data.';
//       this.errorMessage = msg;
//       console.error(msg);
//       return;
//     }

//     this.isLoading = true;
//     this.errorMessage = null;

//     this.dataHandler.getCollection<T>(this.apiEndpoint) // Používáme getCollection
//       .pipe(
//         takeUntil(this.destroy$), // Automaticky odhlásí subscribe při OnDestroy
//         // Zde NEPOUŽÍVÁME catchError pro *zobrazení* chyby do popupu,
//         // protože to už dělá dataHandler.handleError.
//         // Můžeme ho ale použít pro lokální vedlejší efekty, jako je nastavení isLoading.
//         catchError((err: Error) => { // dataHandler už vrací Error objekt
//           this.isLoading = false;
//           this.errorMessage = err.message || 'Neznámá chyba při načítání dat.';
//           console.error(`Chyba při načítání z ${this.apiEndpoint}:`, err);
//           this.cd.markForCheck(); // Trigger change detection
//           return throwError(() => err); // Propagujeme chybu dál (např. pro další zpracování)
//         })
//       )
//       .subscribe({
//         next: (responseData) => {
//           this.data = responseData; // Data jsou již rozbalena z 'data' obalu
//           this.isLoading = false;
//           this.cd.markForCheck(); // Trigger change detection
//         },
//         error: (err) => {
//           // Chyba už byla zpracována v catchError v pipe výše, nebo přímo v DataHandler.
//           // Zde už jen reagujeme na propagovanou chybu, pokud je to potřeba.
//           // errorMessage je nastaven v catchError výše.
//         },
//         complete: () => {
//           this.isLoading = false;
//           this.cd.markForCheck();
//         }
//       });
//   }

//   postData(data: T): Observable<T> { // Typujeme data jako T
//     this.isLoading = true;
//     this.errorMessage = null;
//     return this.dataHandler.post<T>(this.apiEndpoint, data).pipe( // Používáme post
//       takeUntil(this.destroy$),
//       catchError((err: Error) => { // Zde 'err' je už Error objekt z DataHandler
//         this.isLoading = false;
//         this.errorMessage = err.message || 'Neznámá chyba při vytváření dat.';
//         console.error(`Chyba při POST na ${this.apiEndpoint}:`, err);
//         this.cd.markForCheck();
//         return throwError(() => err);
//       })
//     );
//   }


//   updateData(id: number | undefined, data: T): Observable<T> { // id může být undefined u nového objektu, ale pro update je potřeba
//     if (id === undefined || id === null) {
//       const msg = 'Chyba: ID záznamu pro aktualizaci není definováno.';
//       this.errorMessage = msg;
//       console.error(msg);
//       return throwError(() => new Error(msg));
//     }

//     this.isLoading = true;
//     this.errorMessage = null;

//     const updateUrl = `${this.apiEndpoint}/${id}`; // URL už neřeší query string, předpokládáme čistý resource URL

//     return this.dataHandler.put<T>(updateUrl, data).pipe( // Používáme put
//       takeUntil(this.destroy$),
//       catchError((err: Error) => { // Zde 'err' je už Error objekt z DataHandler
//         this.isLoading = false;
//         this.errorMessage = err.message || 'Neznámá chyba při aktualizaci dat.';
//         console.error(`Chyba při PUT na ${updateUrl}:`, err);
//         this.cd.markForCheck();
//         return throwError(() => err);
//       })
//     );
//   }


//   deleteData(id: number | undefined): Observable<void> { // id může být undefined, ale pro delete je potřeba
//     if (id === undefined || id === null) {
//       const msg = 'Chyba: ID záznamu pro smazání není definováno.';
//       this.errorMessage = msg;
//       console.error(msg);
//       return throwError(() => new Error(msg));
//     }

//     this.isLoading = true;
//     this.errorMessage = null;

//     const deleteUrl = `${this.apiEndpoint}/${id}`; // URL už neřeší query string

//     return this.dataHandler.delete(deleteUrl).pipe( // Používáme delete
//       takeUntil(this.destroy$),
//       catchError((err: Error) => { // Zde 'err' je už Error objekt z DataHandler
//         this.isLoading = false;
//         this.errorMessage = err.message || 'Neznámá chyba při mazání dat.';
//         console.error(`Chyba při DELETE na ${deleteUrl}:`, err);
//         this.cd.markForCheck();
//         return throwError(() => err);
//       })
//     );
//   }


//   uploadData<U>(formData: FormData, targetUrl?: string): Observable<U> {
//     const url = targetUrl || this.apiEndpoint; // Použijte targetUrl, pokud je zadáno, jinak výchozí apiEndpoint
//     this.isLoading = true;
//     this.errorMessage = null;

//     return this.dataHandler.upload<U>(url, formData).pipe( // Používáme upload
//       takeUntil(this.destroy$),
//       catchError((err: Error) => { // Zde 'err' je už Error objekt z DataHandler
//         this.isLoading = false;
//         this.errorMessage = err.message || 'Neznámá chyba při nahrávání dat.';
//         console.error(`Chyba při nahrávání na ${url}:`, err);
//         this.cd.markForCheck();
//         return throwError(() => err);
//       })
//     );
//   }
// }
// src/app/core/base-components/base-data.component.ts

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
