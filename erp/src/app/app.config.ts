import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http'; // Stále potřeba pro registraci interceptorů

// Importujte nový interceptor pro Bearer token (bude potřeba vytvořit)
import { AuthTokenInterceptor } from './core/interceptors/auth-token.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Toto je klíčové: Povoluje injekci interceptorů založených na DI (třídových)
    provideHttpClient(withInterceptorsFromDi()),
    // Odstraněna registrace CookieService a CsrfInterceptor
    // CookieService, // Již není potřeba
    // { provide: HTTP_INTERCEPTORS, useClass: CsrfInterceptor, multi: true } // Již není potřeba

    // Zaregistrujte nový AuthTokenInterceptor
    // Tento interceptor bude přidávat Bearer token do hlaviček požadavků
    { provide: HTTP_INTERCEPTORS, useClass: AuthTokenInterceptor, multi: true }
  ]
};
