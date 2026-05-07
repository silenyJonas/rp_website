import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ShopPublicService {
  private readonly apiUrl = `${environment.base_api_url}/shop/public`;

  constructor(private http: HttpClient) { }

  /**
   * Získání seznamu produktů
   */
  getProducts(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== null && value !== undefined && value !== '') {
        httpParams = httpParams.set(key, value.toString());
      }
    });

    return this.http.get<any>(`${this.apiUrl}/products`, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  /**
   * NOVÉ: Získání seznamu kategorií pro filtry
   * Přidáváme parametr no_pagination=true, aby nám Laravel vrátil prostý seznam
   */
  getCategories(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/categories`, { 
      params: new HttpParams().set('no_pagination', 'true') 
    }).pipe(catchError(this.handleError));
  }

  /**
   * Získání detailu produktu
   */
  getProductDetail(slugOrId: string | number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/products/${slugOrId}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Při komunikaci s e-shopem nastala chyba.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Chyba sítě: ${error.error.message}`;
    } else {
      console.error(`Status: ${error.status}, Body:`, error.error);
      switch (error.status) {
        case 404: errorMessage = 'Produkt nebo kategorie nebyly nalezeny.'; break;
        case 500: errorMessage = 'Chyba na straně serveru.'; break;
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}