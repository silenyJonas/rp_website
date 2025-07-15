// src/app/core/auth/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = '/api';

  // Ukládáme přístupový token v paměti, protože má krátkou životnost
  private accessToken: string | null = null;

  // Sledujeme stav přihlášení na základě existence přístupového tokenu
  private _isLoggedIn = new BehaviorSubject<boolean>(this.hasAccessToken());
  isLoggedIn$ = this._isLoggedIn.asObservable();

  constructor(private http: HttpClient) {
    // Při inicializaci služby zkusíme získat přístupový token, pokud je uložen
    // (např. pokud se stránka obnoví a token je v paměti z předchozího stavu)
    // Nicméně, pro refresh token strategii, bude accessToken obvykle null po refresh
    // a bude se spoléhat na refreshAccessToken() při checkAuth().
    // Pro jednoduchost ho zde explicitně nenastavujeme z localStorage, protože je krátkodobý.
  }

  // Metoda pro přihlášení uživatele
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, credentials).pipe(
      tap({
        next: (response: any) => {
          console.log('Přihlášení úspěšné:', response);
          this.accessToken = response.token; // Uložíme přístupový token do paměti
          localStorage.setItem('userEmail', response.user.user_email); // E-mail stále v localStorage
          this._isLoggedIn.next(true);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Chyba přihlášení:', error);
          this.clearAuthData(); // Vyčistíme data při chybě
        }
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Neplatné uživatelské jméno nebo heslo.';
        if (error.status === 401 && error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.status !== 401) {
          errorMessage = 'Vyskytla se chyba při komunikaci se serverem.';
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  // Metoda pro odhlášení uživatele
  logout(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap({
        next: () => {
          console.log('Odhlášení úspěšné.');
          this.clearAuthData();
        },
        error: (err) => {
          console.error('Chyba při odhlášení:', err);
          this.clearAuthData();
        }
      }),
      catchError(() => {
        return throwError(() => new Error('Chyba při odhlášení.'));
      })
    );
  }

  // Nová metoda pro obnovení přístupového tokenu
  refreshAccessToken(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/refresh`, {}, { withCredentials: true }).pipe(
      tap({
        next: (response: any) => {
          console.log('Přístupový token obnoven:', response);
          this.accessToken = response.token; // Uložíme nový přístupový token
          this._isLoggedIn.next(true);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Chyba při obnovování tokenu:', error);
          this.clearAuthData();
        }
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Nepodařilo se obnovit token.';
        if (error.status === 401 && error.error && error.error.message) {
          errorMessage = error.error.message;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  // Pomocná metoda pro vyčištění autentizačních dat
  private clearAuthData(): void {
    this.accessToken = null;
    localStorage.removeItem('userEmail');
    this._isLoggedIn.next(false);
  }

  // Získání aktuálního přístupového tokenu
  public getAccessToken(): string | null { // Zajištěno, že je public
    return this.accessToken;
  }

  // Získání e-mailu uživatele z localStorage
  public getUserEmail(): string | null { // Zajištěno, že je public
    return localStorage.getItem('userEmail');
  }

  // Kontrola, zda existuje přístupový token (v paměti)
  private hasAccessToken(): boolean {
    return !!this.accessToken;
  }

  // Metoda pro kontrolu autentizace (při načtení aplikace nebo refresh stránky)
  checkAuth(): Observable<boolean> {
    if (this.hasAccessToken()) {
      return of(true);
    }

    return this.refreshAccessToken().pipe(
      catchError(() => {
        return of(false);
      })
    );
  }
}
