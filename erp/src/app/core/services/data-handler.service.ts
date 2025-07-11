import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataHandler { 

  constructor(
    private http: HttpClient,
  ) { }

  private getHeaders(contentType: string = 'application/json'): HttpHeaders {
    // Pro FormData (uploadData) nechceme Content-Type: application/json,
    // HttpClient si ho nastaví sám na multipart/form-data.
    // Proto přidáme volitelný parametr contentType.
    if (contentType === 'application/json') {
      return new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      });
    }
    return new HttpHeaders({
      'Accept': 'application/json' // Přijímáme JSON, i když posíláme FormData
    });
  }

  // Vylepšená obsluha chyb pro lepší diagnostiku
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'Nastala neznámá chyba!';
    if (error.error instanceof ErrorEvent) {
      // Chyba na straně klienta nebo síťová chyba
      errorMessage = `Chyba na straně klienta: ${error.error.message}`;
    } else {
      // Backend vrátil neúspěšný kód odpovědi.
      console.error(
        `Backend vrátil kód ${error.status}, ` +
        `tělo odpovědi: ${JSON.stringify(error.error)}`);

      if (error.status === 0) {
        errorMessage = 'Nelze se připojit k serveru. Zkontrolujte síťové připojení nebo zda API běží.';
      } else if (error.status >= 400 && error.status < 500) {
        // Chyby na straně klienta (4xx)
        if (error.error && error.error.message) {
          errorMessage = `Chyba klienta (${error.status}): ${error.error.message}`;
        } else if (error.error && error.error.errors) {
          // Laravel validation errors often come in an 'errors' object
          const validationErrors = Object.values(error.error.errors).flat().join('; ');
          errorMessage = `Chyba validace (${error.status}): ${validationErrors}`;
        } else {
          errorMessage = `Chyba klienta: ${error.status} ${error.statusText || ''}`;
        }
      } else if (error.status >= 500) {
        // Chyby na straně serveru (5xx)
        errorMessage = `Chyba serveru (${error.status}): ${error.statusText || 'Interní chyba serveru'}`;
      }
    }
    console.error(`Chyba API: ${errorMessage}`);
    return throwError(() => new Error(errorMessage));
  };



  getCollection<T>(apiUrl: string): Observable<T[]> {
    return this.http.get<{ data: T[] }>(apiUrl, { headers: this.getHeaders() }).pipe(
      map(response => response.data), // Extrahujeme pole 'data' z odpovědi
      catchError(this.handleError)
    );
  }

  getOne<T>(apiUrl: string): Observable<T> {
    return this.http.get<{ data: T }>(apiUrl, { headers: this.getHeaders() }).pipe(
      map(response => response.data), // Extrahujeme objekt 'data' z odpovědi
      catchError(this.handleError)
    );
  }

  post<T>(apiUrl: string, data: T): Observable<T> {
    return this.http.post<{ data: T }>(apiUrl, data, { headers: this.getHeaders() }).pipe(
      map(response => response.data), // Extrahujeme objekt 'data' z odpovědi
      catchError(this.handleError)
    );
  }

  put<T>(apiUrl: string, data: T): Observable<T> {
    return this.http.put<{ data: T }>(apiUrl, data, { headers: this.getHeaders() }).pipe(
      map(response => response.data), // Extrahujeme objekt 'data' z odpovědi
      catchError(this.handleError)
    );
  }

  patch<T>(apiUrl: string, data: Partial<T>): Observable<T> {
    return this.http.patch<{ data: T }>(apiUrl, data, { headers: this.getHeaders() }).pipe(
      map(response => response.data), // Extrahujeme objekt 'data' z odpovědi
      catchError(this.handleError)
    );
  }

  delete(apiUrl: string): Observable<void> {
    console.log(`DataService: Mažu data z ${apiUrl}`);
    return this.http.delete<void>(apiUrl, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  upload<T>(apiUrl: string, formData: FormData): Observable<T> {
    console.log('DataService: Odesílám FormData na', apiUrl);

    // Kód pro výpis obsahu formuláře (pro ladění, volitelné)
    const dataToSend: { [key: string]: any } = {};
    formData.forEach((value, key) => {
      try {
        dataToSend[key] = JSON.parse(value as string);
      } catch (e) {
        dataToSend[key] = value;
      }
    });
    console.log('Data formuláře k odeslání (bez souborů):', JSON.stringify(dataToSend, null, 2));

    // HttpClient automaticky nastaví Content-Type na multipart/form-data pro FormData,
    // takže zde NENASTAVUJEME hlavičku 'Content-Type'.
    return this.http.post<T>(apiUrl, formData, { headers: this.getHeaders('multipart/form-data') }).pipe(
      catchError(this.handleError)
    );
  }
}