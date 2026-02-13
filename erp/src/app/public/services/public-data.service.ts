import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
/**
 * PublicDataService
 * Slouží pro odesílání dat z veřejné sekce webu, kde není vyžadována autentizace.
 */
export class PublicDataService {
  private apiUrl = environment.base_api_url;

  constructor(private http: HttpClient) { }

  /**
   * Odešle kontaktní formulář (např. z úvodní stránky)
   */
  submitContactForm(formData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/raw_request_commissions`, formData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Odešle objednávkový formulář (Order Form)
   * Podporuje FormData kvůli nahrávání příloh (attachments)
   */
  submitOrder(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/sales_orders`, formData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Globální handler pro chyby v public API požadavcích
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Při komunikaci se serverem nastala chyba.';
    
    if (error.error instanceof ErrorEvent) {
      // Chyba na straně klienta
      errorMessage = `Chyba: ${error.error.message}`;
    } else {
      // Chyba na straně serveru
      console.error(`Backend error: ${error.status}, body:`, error.error);
    }
    
    return throwError(() => new Error(errorMessage));
  }
}