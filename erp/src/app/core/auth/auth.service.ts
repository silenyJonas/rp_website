// src/app/core/auth/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators'; // switchMap již není nutný, protože nevoláme csrf-cookie před loginem

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = '/api';

  // Sledujeme stav přihlášení na základě existence tokenu v localStorage
  private _isLoggedIn = new BehaviorSubject<boolean>(this.hasAuthToken());
  isLoggedIn$ = this._isLoggedIn.asObservable();

  constructor(private http: HttpClient) { }

  // Metoda pro přihlášení uživatele
  login(credentials: { email: string; password: string }): Observable<any> {
    // Pro token-based autentizaci již nepotřebujeme volat /sanctum/csrf-cookie
    // Požadavek na login endpoint
    return this.http.post<any>(`${this.baseUrl}/login`, credentials).pipe(
      tap({
        next: (response: any) => {
          console.log('Přihlášení úspěšné:', response);
          // Uložení získaného tokenu a uživatelského e-mailu do localStorage
          // Předpokládáme, že API vrátí objekt s klíčem 'token' a objektem 'user' s 'user_email'
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('userEmail', response.user.user_email);
          this._isLoggedIn.next(true); // Aktualizace stavu přihlášení
        },
        error: (error: HttpErrorResponse) => {
          console.error('Chyba přihlášení:', error);
          this._isLoggedIn.next(false); // Při chybě se uživatel nepovažuje za přihlášeného
        }
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Neplatné uživatelské jméno nebo heslo.';
        if (error.status === 401 && error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.status !== 401) {
          errorMessage = 'Vyskytla se chyba při komunikaci se serverem.';
        }
        return throwError(() => new Error(errorMessage)); // Předání chyby dál
      })
    );
  }

  // Metoda pro odhlášení uživatele
  logout(): Observable<any> {
    // Odeslání požadavku na logout endpoint na serveru.
    // Na serveru by tento endpoint měl token zneplatnit (např. smazat z databáze).
    return this.http.post<any>(`${this.baseUrl}/logout`, {}).pipe(
      tap({
        next: () => {
          console.log('Odhlášení úspěšné.');
          this.clearAuthData(); // Vyčistíme data po úspěšném odhlášení
        },
        error: (err) => {
          console.error('Chyba při odhlášení:', err);
          this.clearAuthData(); // Vyčistíme data i při chybě na serveru, aby se frontend odhlásil
        }
      }),
      catchError(() => {
        return throwError(() => new Error('Chyba při odhlášení.')); // Předání chyby dál
      })
    );
  }

  // Pomocná metoda pro vyčištění autentizačních dat z localStorage
  private clearAuthData(): void {
    localStorage.removeItem('authToken'); // Odstranění tokenu
    localStorage.removeItem('userEmail'); // Odstranění e-mailu
    this._isLoggedIn.next(false); // Aktualizace stavu přihlášení
  }

  // Získání e-mailu uživatele z localStorage
  getUserEmail(): string | null {
    return localStorage.getItem('userEmail');
  }

  // Kontrola, zda existuje autentizační token v localStorage
  private hasAuthToken(): boolean {
    return !!localStorage.getItem('authToken');
  }

  // Metoda pro kontrolu autentizace (např. při načtení aplikace nebo refresh stránky)
  checkAuth(): Observable<boolean> {
    if (!this.hasAuthToken()) {
      return of(false); // Pokud není token, uživatel není přihlášen
    }

    // Volání /api/user endpointu pro ověření platnosti tokenu na serveru
    // AuthTokenInterceptor automaticky přidá hlavičku Authorization
    return this.http.get<any>(`${this.baseUrl}/user`).pipe(
      tap({
        next: (response: any) => {
          // Volitelně aktualizujte userEmail, pokud se vrací v /user response
          localStorage.setItem('userEmail', response.user_email);
          this._isLoggedIn.next(true); // Token je platný, uživatel je přihlášen
        },
        error: (error: HttpErrorResponse) => {
          console.warn('Uživatel není ověřen API (token vypršel nebo je neplatný).', error);
          this.clearAuthData(); // Vyčistíme data, pokud token není platný
        }
      }),
      catchError(() => {
        return of(false); // Při chybě ověření tokenu se uživatel nepovažuje za přihlášeného
      })
    );
  }
}
