import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ShopPublicService {
  /**
   * Změněno na /shop/public pro přístup k veřejným routám bez tokenu.
   * V Laravelu tyto trasy musí být mimo 'auth:sanctum' middleware.
   */
  private readonly apiUrl = `${environment.base_api_url}/shop/public`;

  constructor(private http: HttpClient) { }

  /**
   * Získání seznamu produktů s paginací a filtry
   * @param params Objekt s filtry (page, per_page, category_id, search, price_from, price_to, atd.)
   */
  getProducts(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    
    // Mapování parametrů na query string
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== null && value !== undefined && value !== '') {
        httpParams = httpParams.set(key, value.toString());
      }
    });

    // Volá GET: /api/shop/public/products?...
    return this.http.get<any>(`${this.apiUrl}/products`, { params: httpParams })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Získání detailu produktu podle ID nebo SLUG
   * @param slugOrId Identifikátor produktu (veřejná metoda preferuje slug)
   */
  getProductDetail(slugOrId: string | number): Observable<any> {
    // Volá GET: /api/shop/public/products/{slugOrId}
    return this.http.get<any>(`${this.apiUrl}/products/${slugOrId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Ošetření chyb specificky pro veřejné rozhraní
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Při komunikaci s e-shopem nastala chyba.';
    
    if (error.error instanceof ErrorEvent) {
      // Chyba sítě nebo na straně klienta
      errorMessage = `Chyba sítě: ${error.error.message}`;
    } else {
      // Chyba vrácená z Laravelu
      console.error(`Status: ${error.status}, Body:`, error.error);
      
      switch (error.status) {
        case 404:
          errorMessage = 'Produkt nebo kategorie nebyly nalezeny.';
          break;
        case 401:
          errorMessage = 'Nepovolený přístup. Trasa pravděpodobně vyžaduje přihlášení.';
          break;
        case 429:
          errorMessage = 'Příliš mnoho požadavků. Zkuste to prosím později.';
          break;
        case 500:
          errorMessage = 'Chyba na straně serveru. Na nápravě pracujeme.';
          break;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}