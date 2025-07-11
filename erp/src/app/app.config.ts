import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'; // <<<<< DŮLEŽITÉ: Používáme withInterceptorsFromDi
import { HTTP_INTERCEPTORS } from '@angular/common/http'; // Importujte HTTP_INTERCEPTORS
import { CsrfInterceptor } from './core/interceptors/csrf.interceptor'; // Importujte váš interceptor
import { CookieService } from 'ngx-cookie-service'; // Importujte CookieService

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Toto je klíčové: Povoluje injekci interceptorů založených na DI (třídových)
    provideHttpClient(withInterceptorsFromDi()),
    // Zaregistrujte CookieService, aby ji CsrfInterceptor mohl injectovat
    CookieService,
    // Zaregistrujte váš CsrfInterceptor
    // 'multi: true' je důležité, protože umožňuje mít více interceptorů
    { provide: HTTP_INTERCEPTORS, useClass: CsrfInterceptor, multi: true }
  ]
};
