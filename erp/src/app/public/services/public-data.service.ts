import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})

//public odesilani dat z public sekce webu
export class PublicDataService {
  private apiUrl = environment.base_api_url;
  constructor(private http: HttpClient) { }

  //odesle data z formu na /home 
  submitContactForm(formData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/raw_request_commissions`, formData);
  }
}