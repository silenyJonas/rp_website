import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, map } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ShopPublicService {
  // Základní URL pro veřejné e-shopové operace - v api.php odpovídá Route::prefix('shop/public')
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
   * Získání seznamu kategorií pro filtry
   */
  getCategories(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/categories`, { 
      params: new HttpParams().set('no_pagination', 'true') 
    }).pipe(catchError(this.handleError));
  }

  /**
   * Získání veřejných dostupných způsobů dopravy pro pokladnu
   */
  getShippingMethods(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/shipping-methods`, {
      params: new HttpParams().set('no_pagination', 'true')
    }).pipe(catchError(this.handleError));
  }

  /**
   * Získání veřejných dostupných platebních metod pro pokladnu
   */
  getPaymentMethods(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/payment-methods`, {
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

  /**
   * Ověření dostupnosti specifického množství v Cache/DB (Vrací anonymní true/false)
   */
  checkStockAvailability(productId: string | number, variantId: number | null, requestedQuantity: number): Observable<boolean> {
    return this.http.get<{ available: boolean }>(`${this.apiUrl}/products/${productId}/check-stock`, {
      params: {
        variant_id: variantId ? variantId.toString() : '',
        quantity: requestedQuantity.toString()
      }
    }).pipe(
      map(res => res.available), 
      catchError(this.handleError)
    );
  }

  /**
   * PŘIDÁNO: Veřejné ověření kupónu v košíku
   */
  validateCoupon(code: string, orderAmount: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/coupons/validate`, {
      code: code,
      order_amount: orderAmount
    });
  }

  /**
   * PŘIDÁNO: Vytvoření objednávky přes checkout endpoint
   */
  createOrder(payload: any): Observable<any> {
    return this.http.post<any>(`${environment.base_api_url}/shop/checkout/create-order`, payload);
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Při komunikaci s e-shopem nastala chyba.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Chyba sítě: ${error.error.message}`;
    } else {
      console.error(`Status: ${error.status}, Body:`, error.error);
      switch (error.status) {
        case 404: errorMessage = 'Požadovaná data nebyla nalezena.'; break;
        case 422: errorMessage = error.error?.message || 'Požadované množství není dostupné.'; break;
        case 500: errorMessage = 'Chyba na straně serveru.'; break;
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}