import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PublicDataService {
  private apiUrl = environment.base_api_url;

  constructor(private http: HttpClient) { }

  submitContactForm(formData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/raw_request_commissions`, formData)
      .pipe(catchError(this.handleError));
  }

  submitOrder(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/sales_orders`, formData)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Při komunikaci se serverem nastala chyba.';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Chyba: ${error.error.message}`;
    } else {
      console.error(`Backend error: ${error.status}, body:`, error.error);
    }
    
    return throwError(() => new Error(errorMessage));
  }
}