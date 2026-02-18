import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AlertDialogService } from './alert-dialog.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DataHandler {
  private baseUrl = environment.base_api_url;

  constructor(
    private http: HttpClient,
    private alertDialogService: AlertDialogService
  ) { }

  /**
   * Upravená logika generování hlaviček.
   * Pokud jsou data typu FormData, Content-Type se nesmí nastavit, 
   * aby ho prohlížeč mohl nastavit sám včetně "boundary".
   */
  private getHeaders(data?: any): HttpHeaders {
    let headersConfig: any = {
      'Accept': 'application/json'
    };

    // Pokud data NEJSOU FormData, přidáme Content-Type pro JSON
    if (!(data instanceof FormData)) {
      headersConfig['Content-Type'] = 'application/json';
    }

    return new HttpHeaders(headersConfig);
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'Nastala neznámá chyba!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Chyba na straně klienta: ${error.error.message}`;
    } else {
      console.error(
        `Backend vrátil kód ${error.status}, ` +
        `tělo odpovědi: ${JSON.stringify(error.error)}`);

      if (error.status === 0) {
        errorMessage = 'Nelze se připojit k serveru. Zkontrolujte síťové připojení nebo zda API běží.';
      } else if (error.status === 403) {
        if (error.error && error.error.error_code === 'CANNOT_DELETE_OWN_ACCOUNT') {
          errorMessage = 'Nelze smazat uživatele, za kterého jste právě přihlášený/á.';
        } else if (error.error && error.error.message) {
            errorMessage = error.error.message;
        } else {
          errorMessage = 'Při mazání položky nastala chyba.';
        }
      } else if (error.status === 422 && error.error && error.error.errors) {
        const validationErrors = Object.values(error.error.errors).flat().join('; ');
        errorMessage = `Chyba validace (${error.status}): ${validationErrors}`;
      } else if (error.status >= 400 && error.status < 500) {
        if (error.error && error.error.message) {
          errorMessage = `Chyba klienta (${error.status}): ${error.error.message}`;
        } else if (error.error && error.error.errors) {
          const validationErrors = Object.values(error.error.errors).flat().join('; ');
          errorMessage = `Chyba validace (${error.status}): ${validationErrors}`;
        } else {
          errorMessage = `Chyba klienta: ${error.status} ${error.statusText || ''}`;
        }
      } else if (error.status >= 500) {
        errorMessage = `Chyba serveru (${error.status}): ${error.statusText || 'Interní chyba serveru'}`;
      }
    }
    console.error(`Chyba API: ${errorMessage}`);

    this.alertDialogService.open('Chyba API', errorMessage, 'danger');

    return throwError(() => new Error(errorMessage));
  };

  getCollection<T>(apiUrl: string, params?: any): Observable<T[]> {
    let httpParams = new HttpParams();
    
    // Pokud máme parametry (filtry), přidáme je do dotazu
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.append(key, params[key]);
        }
      });
    }

    return this.http.get<T[] | { data: T[] }>(`${this.baseUrl}/${apiUrl}`, { 
      headers: this.getHeaders(),
      params: httpParams // Angular automaticky vytvoří ?key=value&key2=value2
    }).pipe(
      map(response => {
        if (response && typeof response === 'object' && 'data' in response) {
          return (response as { data: T[] }).data;
        }
        return response as T[];
      }),
      catchError(this.handleError)
    );
  }

  getPaginatedCollection<T>(apiUrl: string): Observable<T> {
    console.log('dotaz na:', this.baseUrl + "/" + apiUrl)
    return this.http.get<T>(`${this.baseUrl}/${apiUrl}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  get<T>(apiUrl: string): Observable<T> {
    console.log('DataHandler: GET request na:', `${this.baseUrl}/${apiUrl}`);
    return this.http.get<T>(`${this.baseUrl}/${apiUrl}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getOne<T>(apiUrl: string): Observable<T> {
    console.log('--------', apiUrl)
    return this.http.get<{ data: T }>(`${this.baseUrl}/${apiUrl}`, { headers: this.getHeaders() }).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // Změněno: Volá getHeaders(data) pro detekci FormData
  post<T>(apiUrl: string, data: any): Observable<T> {
    return this.http.post<{ data: T }>(`${this.baseUrl}/${apiUrl}`, data, { headers: this.getHeaders(data) }).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // Změněno: Volá getHeaders(data) pro detekci FormData
  put<T>(apiUrl: string, data: any): Observable<T> {
    return this.http.put<{ data: T }>(`${this.baseUrl}/${apiUrl}`, data, { headers: this.getHeaders(data) }).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // Změněno: Volá getHeaders(data) pro detekci FormData
  patch<T>(apiUrl: string, data: any): Observable<T> {
    return this.http.patch<{ data: T }>(`${this.baseUrl}/${apiUrl}`, data, { headers: this.getHeaders(data) }).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  delete(apiUrl: string): Observable<void> {
    console.log(`DataService: Mažu data z ${this.baseUrl}/${apiUrl}`);
    return this.http.delete<void>(`${this.baseUrl}/${apiUrl}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  upload<T>(apiUrl: string, formData: FormData): Observable<T> {
    console.log('DataService: Odesílám FormData na', `${this.baseUrl}/${apiUrl}`);
    // Ponecháno pro zpětnou kompatibilitu, nyní využívá upravené getHeaders
    return this.http.post<T>(`${this.baseUrl}/${apiUrl}`, formData, { headers: this.getHeaders(formData) }).pipe(
      catchError(this.handleError)
    );
  }
}