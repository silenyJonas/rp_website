    import { Injectable } from '@angular/core';
    import {
      HttpRequest,
      HttpHandler,
      HttpEvent,
      HttpInterceptor,
      HttpHeaders // Importujte HttpHeaders
    } from '@angular/common/http';
    import { Observable } from 'rxjs';
    import { CookieService } from 'ngx-cookie-service'; // <<<<< Budeme potřebovat tuto službu!

    @Injectable()
    export class CsrfInterceptor implements HttpInterceptor {

      constructor(private cookieService: CookieService) {} // Injectujeme CookieService

      intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        // Kontrolujeme, zda se jedná o POST, PUT, PATCH nebo DELETE požadavek
        if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH' || request.method === 'DELETE') {
          // Získáme XSRF-TOKEN z cookies
          const xsrfToken = this.cookieService.get('XSRF-TOKEN');

          // Pokud token existuje, přidáme ho do hlaviček
          if (xsrfToken) {
            // Vytvoříme klon požadavku a přidáme hlavičku X-XSRF-TOKEN
            request = request.clone({
              headers: request.headers.set('X-XSRF-TOKEN', xsrfToken)
            });
          }
        }

        // Pokračujeme s požadavkem
        return next.handle(request);
      }
    }
    