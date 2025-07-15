// src/app/core/interceptors/auth-token.interceptor.ts

import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service'; // Import AuthService
import { Router } from '@angular/router'; // Import Router pro přesměrování na login

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private authService: AuthService, private router: Router) {} // Injektujeme Router

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Přidáme přístupový token do hlavičky, pokud existuje
    const accessToken = this.authService.getAccessToken();
    if (accessToken) {
      request = this.addToken(request, accessToken);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Pokud je chyba 401 a není to požadavek na /login nebo /refresh
        if (error.status === 401 && !request.url.includes('/login') && !request.url.includes('/refresh')) {
          return this.handle401Error(request, next);
        }
        // Pro ostatní chyby nebo 401 na login/refresh propadneme chybu dál
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null); // Resetujeme subject, dokud nezískáme nový token

      // Voláme metodu pro obnovení tokenu z AuthService
      return this.authService.refreshAccessToken().pipe(
        switchMap((response: any) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(response.token); // Předáme nový přístupový token všem čekajícím požadavkům
          // Opakujeme původní požadavek s novým tokenem
          return next.handle(this.addToken(request, response.token));
        }),
        catchError((err: any) => {
          this.isRefreshing = false;
          // Odhlásíme uživatele, pokud se token nepodaří obnovit
          this.authService.logout().subscribe({
            next: () => this.router.navigate(['/auth/login']), // Přesměrujeme na login po odhlášení
            error: () => this.router.navigate(['/auth/login']) // Přesměrujeme i při chybě odhlášení
          });
          return throwError(() => err); // Propagujeme chybu dál
        })
      );
    } else {
      // Pokud se již obnovuje token, čekáme na nový token a opakujeme požadavek
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null), // Čekáme, dokud subject neobdrží nový token
        take(1), // Vezmeme pouze jeden token
        switchMap(token => next.handle(this.addToken(request, token))) // Opakujeme požadavek s novým tokenem
      );
    }
  }
}
