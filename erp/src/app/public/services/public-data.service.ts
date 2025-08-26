// src/app/public/services/public-data.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root' // Zajistí, že servis je dostupný v celé aplikaci
})

export class PublicDataService {

  private apiUrl = environment.base_api_url; // Změňte na URL vašeho backendu

  constructor(private http: HttpClient) { }

  // Příklad metody pro odeslání kontaktního formuláře
  submitContactForm(formData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/raw_request_commissions`, formData);
  }
  
}