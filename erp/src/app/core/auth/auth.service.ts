// src/app/core/auth/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // --- TOTO JE TA ZMĚNA! ---
  private baseUrl = '/api'; // Místo 'http://localhost:8000/api'

  private _isLoggedIn = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this._isLoggedIn.asObservable();

  constructor(private http: HttpClient) { }

  private getCsrfCookie(): Observable<any> {
    return this.http.get(`${this.baseUrl}/sanctum/csrf-cookie`, { withCredentials: true }).pipe(
      tap({
        next: () => console.log('CSRF cookie získán.'),
        error: (error: HttpErrorResponse) => console.error('Chyba při získávání CSRF cookie:', error)
      }),
      catchError((error: HttpErrorResponse) => {
        const errorMessage = 'Chyba serveru při získávání CSRF cookie. Zkuste to prosím později.';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.getCsrfCookie().pipe(
      switchMap(() => this.http.post<any>(`${this.baseUrl}/login`, credentials, { withCredentials: true })),
      tap({
        next: (response: any) => {
          sessionStorage.setItem('isLoggedIn', 'true');
          sessionStorage.setItem('userEmail', response.user.email);
          this._isLoggedIn.next(true);
          console.log('Přihlášení úspěšné:', response);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Chyba přihlášení:', error);
          this._isLoggedIn.next(false);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Neplatné uživatelské jméno nebo heslo.';
        if (error.status === 419) {
            errorMessage = 'Problém s ověřením relace. Zkuste to znovu.';
        } else if (error.status === 401 && error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.status !== 401) {
          errorMessage = 'Vyskytla se chyba při komunikaci se serverem.';
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap({
        next: () => {
          sessionStorage.removeItem('isLoggedIn');
          sessionStorage.removeItem('userEmail');
          this._isLoggedIn.next(false);
          console.log('Odhlášení úspěšné.');
        },
        error: (error: HttpErrorResponse) => {
          console.error('Chyba při odhlášení:', error);
          sessionStorage.removeItem('isLoggedIn');
          sessionStorage.removeItem('userEmail');
          this._isLoggedIn.next(false);
        }
      }),
      catchError(() => {
        return throwError(() => new Error('Chyba při odhlášení.'));
      })
    );
  }

  getUserEmail(): string | null {
    return sessionStorage.getItem('userEmail');
  }

  private hasToken(): boolean {
    return !!sessionStorage.getItem('isLoggedIn');
  }

  checkAuth(): Observable<boolean> {
    if (!this.hasToken()) {
      return of(false);
    }

    return this.http.get<any>(`${this.baseUrl}/user`, { withCredentials: true }).pipe(
      tap({
        next: () => this._isLoggedIn.next(true),
        error: (error: HttpErrorResponse) => {
          console.warn('Uživatel není ověřen API (session vypršela nebo je neplatná).', error);
          this.logout();
        }
      }),
      catchError(() => {
        return of(false);
      })
    );
  }
}