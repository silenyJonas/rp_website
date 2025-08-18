// import { Injectable } from '@angular/core';
// import { HttpClient, HttpErrorResponse } from '@angular/common/http';
// import { Observable, BehaviorSubject, of, throwError, timer } from 'rxjs';
// import { tap, catchError, switchMap, takeUntil } from 'rxjs/operators';
// import { Subject } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//   private baseUrl = '/api';

//   private _isLoggedIn = new BehaviorSubject<boolean>(this.hasAccessToken());
//   isLoggedIn$ = this._isLoggedIn.asObservable();

//   // Předmět pro zrušení časovače obnovení tokenu
//   private stopTokenRefresh$ = new Subject<void>();
//   private tokenRefreshTimer: any;
//   private readonly REFRESH_INTERVAL = 20 * 60 * 1000; // 20 minut v milisekundách

//   constructor(private http: HttpClient) {
//     // Při inicializaci služby zkusíme získat přístupový token z Local Storage a zahájit proaktivní obnovu
//     this.checkAuth().subscribe(
//       isAuth => {
//         if (isAuth) {
//           this.startTokenRefreshTimer();
//         }
//       }
//     );
//   }

//   login(credentials: { email: string; password: string }): Observable<any> {
//     return this.http.post<any>(`${this.baseUrl}/login`, credentials).pipe(
//       tap({
//         next: (response: any) => {
//           console.log('Přihlášení úspěšné:', response);
//           console.log(response.user.user_login_id);
//           localStorage.setItem('accessToken', response.token);
//           localStorage.setItem('refreshToken', response.refreshToken);
//           localStorage.setItem('userEmail', response.user.user_email);
//           localStorage.setItem('userId', response.user.user_login_id);

//           // Zde zpracujeme a uložíme název role
//           if (response.user_roles && response.user_roles.length > 0) {
//             localStorage.setItem('userRole', response.user_roles[0].role_name);
//           } else {
//             localStorage.removeItem('userRole');
//           }
          
//           this._isLoggedIn.next(true);
//           this.startTokenRefreshTimer(); // Spustíme proaktivní obnovu po úspěšném přihlášení
//         },
//         error: (error: HttpErrorResponse) => {
//           console.error('Chyba přihlášení:', error);
//           this.clearAuthData();
//         }
//       }),
//       catchError((error: HttpErrorResponse) => {
//         let errorMessage = 'Neplatné uživatelské jméno nebo heslo.';
//         if (error.status === 401 && error.error && error.error.message) {
//           errorMessage = error.error.message;
//         } else if (error.status !== 401) {
//           errorMessage = 'Vyskytla se chyba při komunikaci se serverem.';
//         }
//         return throwError(() => new Error(errorMessage));
//       })
//     );
//   }

//   logout(): Observable<any> {
//     const refreshToken = this.getRefreshToken();
//     const body = refreshToken ? { refreshToken: refreshToken } : {};

//     return this.http.post<any>(`${this.baseUrl}/logout`, body).pipe(
//       tap({
//         next: () => {
//           console.log('Odhlášení úspěšné.');
//           this.clearAuthData();
//           this.stopTokenRefreshTimer(); // Zastavíme časovač po odhlášení
//         },
//         error: (err) => {
//           console.error('Chyba při odhlášení:', err);
//           this.clearAuthData();
//           this.stopTokenRefreshTimer(); // Zastavíme časovač i při chybě odhlášení
//         }
//       }),
//       catchError(() => {
//         return throwError(() => new Error('Chyba při odhlášení.'));
//       })
//     );
//   }

//   refreshAccessToken(): Observable<any> {
//     const refreshToken = this.getRefreshToken();
//     if (!refreshToken) {
//       console.warn('Refresh token není v Local Storage, nelze obnovit.');
//       this.clearAuthData();
//       this.stopTokenRefreshTimer();
//       return throwError(() => new Error('Refresh token chybí.'));
//     }

//     return this.http.post<any>(`${this.baseUrl}/refresh`, { refreshToken: refreshToken }).pipe(
//       tap({
//         next: (response: any) => {
//           console.log('Přístupový token obnoven:', response);
//           localStorage.setItem('accessToken', response.token);
//           localStorage.setItem('refreshToken', response.refreshToken);
//           this._isLoggedIn.next(true);
//           this.startTokenRefreshTimer(); // Po úspěšné obnově znovu spustíme časovač
//         },
//         error: (error: HttpErrorResponse) => {
//           console.error('Chyba při obnovování tokenu:', error);
//           this.clearAuthData();
//           this.stopTokenRefreshTimer(); // Pokud obnova selže, zastavíme časovač
//         }
//       }),
//       catchError((error: HttpErrorResponse) => {
//         let errorMessage = 'Nepodařilo se obnovit token.';
//         if (error.status === 401 && error.error && error.error.message) {
//           errorMessage = error.error.message;
//         }
//         return throwError(() => new Error(errorMessage));
//       })
//     );
//   }

//   private clearAuthData(): void {
//     localStorage.removeItem('accessToken');
//     localStorage.removeItem('refreshToken');
//     localStorage.removeItem('userEmail');
//     localStorage.removeItem('userId');
//     localStorage.removeItem('userRole'); // Nově také odstraníme roli
//     this._isLoggedIn.next(false);
//   }

//   public getAccessToken(): string | null {
//     return localStorage.getItem('accessToken');
//   }

//   public getRefreshToken(): string | null {
//     return localStorage.getItem('refreshToken');
//   }

//   public getuserId(): string | null {
//     return localStorage.getItem('userId');
//   }

//   public getUserEmail(): string | null {
//     return localStorage.getItem('userEmail');
//   }

//   /**
//    * Nová metoda pro získání role uživatele z Local Storage.
//    * @returns Název role nebo null, pokud neexistuje.
//    */
//   public getUserRole(): string | null {
//     return localStorage.getItem('userRole');
//   }

//   private hasAccessToken(): boolean {
//     return !!localStorage.getItem('accessToken');
//   }

//   checkAuth(): Observable<boolean> {
//     if (this.hasAccessToken()) {
//       return of(true);
//     }

//     return this.refreshAccessToken().pipe(
//       catchError(() => {
//         return of(false);
//       })
//     );
//   }

//   private startTokenRefreshTimer(): void {
//     // Nejprve zrušíme předchozí časovač, aby se nespustil dvakrát
//     this.stopTokenRefreshTimer();
//     console.log('Spouštím proaktivní časovač pro obnovu tokenu.');

//     this.tokenRefreshTimer = timer(this.REFRESH_INTERVAL).pipe(
//       switchMap(() => this.refreshAccessToken()),
//       takeUntil(this.stopTokenRefresh$)
//     ).subscribe();
//   }

//   private stopTokenRefreshTimer(): void {
//     console.log('Zastavuji proaktivní časovač pro obnovu tokenu.');
//     this.stopTokenRefresh$.next();
//   }
// }

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError, timer } from 'rxjs';
import { tap, catchError, switchMap, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = '/api';

  private _isLoggedIn = new BehaviorSubject<boolean>(this.hasAccessToken());
  isLoggedIn$ = this._isLoggedIn.asObservable();

  // Předmět pro zrušení časovače obnovení tokenu
  private stopTokenRefresh$ = new Subject<void>();
  private tokenRefreshTimer: any;
  private readonly REFRESH_INTERVAL = 20 * 60 * 1000; // 20 minut v milisekundách

  constructor(private http: HttpClient) {
    // Při inicializaci služby zkusíme získat přístupový token z Local Storage a zahájit proaktivní obnovu
    this.checkAuth().subscribe(
      isAuth => {
        if (isAuth) {
          this.startTokenRefreshTimer();
        }
      }
    );
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, credentials).pipe(
      tap({
        next: (response: any) => {
          console.log('Přihlášení úspěšné:', response);
          console.log(response.user.user_login_id);
          localStorage.setItem('accessToken', response.token);
          localStorage.setItem('refreshToken', response.refreshToken);
          localStorage.setItem('userEmail', response.user.user_email);
          localStorage.setItem('userId', response.user.user_login_id);

          // Zde zpracujeme a uložíme název role
          if (response.user_roles && response.user_roles.length > 0) {
            // Změna: Ukládáme přímo název role, protože server vrací pole řetězců
            localStorage.setItem('userRole', response.user_roles[0]); 
          } else {
            localStorage.removeItem('userRole');
          }
          
          this._isLoggedIn.next(true);
          this.startTokenRefreshTimer(); // Spustíme proaktivní obnovu po úspěšném přihlášení
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

  logout(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    const body = refreshToken ? { refreshToken: refreshToken } : {};

    return this.http.post<any>(`${this.baseUrl}/logout`, body).pipe(
      tap({
        next: () => {
          console.log('Odhlášení úspěšné.');
          this.clearAuthData();
          this.stopTokenRefreshTimer(); // Zastavíme časovač po odhlášení
        },
        error: (err) => {
          console.error('Chyba při odhlášení:', err);
          this.clearAuthData();
          this.stopTokenRefreshTimer(); // Zastavíme časovač i při chybě odhlášení
        }
      }),
      catchError(() => {
        return throwError(() => new Error('Chyba při odhlášení.'));
      })
    );
  }

  refreshAccessToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      console.warn('Refresh token není v Local Storage, nelze obnovit.');
      this.clearAuthData();
      this.stopTokenRefreshTimer();
      return throwError(() => new Error('Refresh token chybí.'));
    }

    return this.http.post<any>(`${this.baseUrl}/refresh`, { refreshToken: refreshToken }).pipe(
      tap({
        next: (response: any) => {
          console.log('Přístupový token obnoven:', response);
          localStorage.setItem('accessToken', response.token);
          localStorage.setItem('refreshToken', response.refreshToken);
          this._isLoggedIn.next(true);
          this.startTokenRefreshTimer(); // Po úspěšné obnově znovu spustíme časovač
        },
        error: (error: HttpErrorResponse) => {
          console.error('Chyba při obnovování tokenu:', error);
          this.clearAuthData();
          this.stopTokenRefreshTimer(); // Pokud obnova selže, zastavíme časovač
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

  private clearAuthData(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole'); // Nově také odstraníme roli
    this._isLoggedIn.next(false);
  }

  public getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  public getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  public getuserId(): string | null {
    return localStorage.getItem('userId');
  }

  public getUserEmail(): string | null {
    return localStorage.getItem('userEmail');
  }

  /**
     * Nová metoda pro získání role uživatele z Local Storage.
     * @returns Název role nebo null, pokud neexistuje.
     */
  public getUserRole(): string | null {
    return localStorage.getItem('userRole');
  }

  private hasAccessToken(): boolean {
    return !!localStorage.getItem('accessToken');
  }

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

  private startTokenRefreshTimer(): void {
    // Nejprve zrušíme předchozí časovač, aby se nespustil dvakrát
    this.stopTokenRefreshTimer();
    console.log('Spouštím proaktivní časovač pro obnovu tokenu.');

    this.tokenRefreshTimer = timer(this.REFRESH_INTERVAL).pipe(
      switchMap(() => this.refreshAccessToken()),
      takeUntil(this.stopTokenRefresh$)
    ).subscribe();
  }

  private stopTokenRefreshTimer(): void {
    console.log('Zastavuji proaktivní časovač pro obnovu tokenu.');
    this.stopTokenRefresh$.next();
  }
}
