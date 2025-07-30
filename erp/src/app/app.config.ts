// src/app/app.config.ts

import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

// Důležité importy pro HashLocationStrategy
import { LocationStrategy, HashLocationStrategy } from '@angular/common';

import { routes } from './app.routes'; // Import tvých rout
import { AuthTokenInterceptor } from './core/interceptors/auth-token.interceptor';

// DŮLEŽITÉ: Import pro registraci lokalizačních dat
import { registerLocaleData } from '@angular/common';
import localeCs from '@angular/common/locales/cs'; // Import lokalizačních dat pro češtinu

// Registrace lokalizačních dat pro 'cs-CZ'
registerLocaleData(localeCs, 'cs-CZ');

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthTokenInterceptor, multi: true },
    // Zde přidáš HashLocationStrategy do pole 'providers'
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    // Volitelně můžete přidat PROVIDE_LOCALE, pokud chcete nastavit výchozí locale pro celou aplikaci
    // { provide: LOCALE_ID, useValue: 'cs-CZ' }
  ]
};
