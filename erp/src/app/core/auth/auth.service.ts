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

  // Sledujeme stav přihlášení na základě existence přístupového tokenu v Local Storage
  private _isLoggedIn = new BehaviorSubject<boolean>(this.hasAccessToken());
  isLoggedIn$ = this._isLoggedIn.asObservable();

  constructor(private http: HttpClient) {
    // Při inicializaci služby zkusíme získat přístupový token z Local Storage
    this.checkAuth().subscribe(); // Spustíme kontrolu autentizace hned při startu služby
  }

  // Metoda pro přihlášení uživatele
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, credentials).pipe(
      tap({
        next: (response: any) => {
          console.log('Přihlášení úspěšné:', response);
          localStorage.setItem('accessToken', response.token); // Uložíme přístupový token
          localStorage.setItem('refreshToken', response.refreshToken); // Uložíme obnovovací token
          localStorage.setItem('userEmail', response.user.user_email);
          this._isLoggedIn.next(true);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Chyba přihlášení:', error);
          this.clearAuthData();
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
    // Odešleme refresh token pro zneplatnění na serveru
    const refreshToken = this.getRefreshToken();
    const body = refreshToken ? { refreshToken: refreshToken } : {};

    return this.http.post<any>(`${this.baseUrl}/logout`, body).pipe(
      tap({
        next: () => {
          console.log('Odhlášení úspěšné.');
          this.clearAuthData();
        },
        error: (err) => {
          console.error('Chyba při odhlášení:', err);
          this.clearAuthData(); // Vyčistíme data i při chybě odhlášení
        }
      }),
      catchError(() => {
        return throwError(() => new Error('Chyba při odhlášení.'));
      })
    );
  }

  // Metoda pro obnovení přístupového tokenu
  refreshAccessToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      console.warn('Refresh token není v Local Storage, nelze obnovit.');
      this.clearAuthData();
      return throwError(() => new Error('Refresh token chybí.'));
    }

    // Odešleme refresh token v těle požadavku
    return this.http.post<any>(`${this.baseUrl}/refresh`, { refreshToken: refreshToken }).pipe(
      tap({
        next: (response: any) => {
          console.log('Přístupový token obnoven:', response);
          localStorage.setItem('accessToken', response.token); // Uložíme nový přístupový token
          localStorage.setItem('refreshToken', response.refreshToken); // Uložíme nový obnovovací token
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
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userEmail');
    this._isLoggedIn.next(false);
  }

  // Získání aktuálního přístupového tokenu
  public getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  // Získání obnovovacího tokenu
  public getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  // Získání e-mailu uživatele z localStorage
  public getUserEmail(): string | null {
    return localStorage.getItem('userEmail');
  }

  // Kontrola, zda existuje přístupový token v Local Storage
  private hasAccessToken(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  // Metoda pro kontrolu autentizace (při načtení aplikace nebo refresh stránky)
  checkAuth(): Observable<boolean> {
    if (this.hasAccessToken()) {
      return of(true); // Pokud je token v Local Storage, jsme přihlášeni
    }

    // Pokud token není v Local Storage, zkusíme ho obnovit pomocí refresh tokenu
    return this.refreshAccessToken().pipe(
      catchError(() => {
        return of(false); // Pokud se nepodaří obnovit, uživatel není přihlášen
      })
    );
  }
}
