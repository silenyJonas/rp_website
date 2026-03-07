import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { routes } from './app.routes';
import { AuthTokenInterceptor } from './core/interceptors/auth-token.interceptor';
import { LoadingInterceptor } from './core/interceptors/loading.interceptor'; // Importuj tvůj nový interceptor
import { registerLocaleData } from '@angular/common';
import localeCs from '@angular/common/locales/cs';

registerLocaleData(localeCs, 'cs-CZ');

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    
    // Interceptor pro AUTH TOKEN (už tam máš)
    { 
      provide: HTTP_INTERCEPTORS, 
      useClass: AuthTokenInterceptor, 
      multi: true 
    },
    
    // NOVÝ Interceptor pro LOADING
    { 
      provide: HTTP_INTERCEPTORS, 
      useClass: LoadingInterceptor, 
      multi: true 
    },
  ]
};