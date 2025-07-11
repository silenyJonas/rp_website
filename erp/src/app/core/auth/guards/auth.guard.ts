// src/app/core/auth/guards/auth.guard.ts (Aktuální stav podle chyby)

import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'; // Importujeme CanActivate
import { Injectable } from '@angular/core'; // Importujeme Injectable
import { AuthService } from '../auth.service'; // Cesta k AuthService
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate { // <<<<<<<<<< JE TO TŘÍDA A JMENUJE SE AuthGuard
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.authService.isLoggedIn$.pipe(
      tap(isLoggedIn => {
        if (!isLoggedIn) {
          console.warn('AuthGuard: Uživatel není přihlášen, přesměrování na login.');
          this.router.navigate(['/auth/login']); // <<<<<<<<<< Správná cesta k login stránce
        }
      })
    );
  }
}