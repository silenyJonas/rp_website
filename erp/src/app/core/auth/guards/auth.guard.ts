
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { PermissionService } from '../services/permission.service';
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService, 
    private router: Router,
    private permissionService: PermissionService // Injektujeme PermissionService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.authService.isLoggedIn$.pipe(
      take(1),
      map(isLoggedIn => {
        if (!isLoggedIn) {
          console.warn('AuthGuard: Uživatel není přihlášen, přesměrování na login.');
          return this.router.createUrlTree(['/auth/login']);
        }

        const requiredPermission = route.data['permission'] as string;
        const userRole = this.authService.getUserRole();
        
        // Zde kontrolujeme oprávnění namísto rolí
        if (requiredPermission && userRole) {
          if (this.permissionService.hasPermission(userRole, requiredPermission)) {
            console.log(`AuthGuard: Uživatel s rolí '${userRole}' má oprávnění '${requiredPermission}'. Přístup povolen.`);
            return true;
          } else {
            console.warn(`AuthGuard: Uživatel s rolí '${userRole}' nemá oprávnění '${requiredPermission}'. Přesměrování na dashboard.`);
            return this.router.createUrlTree(['/admin/dashboard']);
          }
        }
        
        // Pokud trasa nevyžaduje žádné oprávnění, je přístup povolen pro přihlášené uživatele
        console.log('AuthGuard: Trasa nevyžaduje specifické oprávnění, přístup povolen.');
        return true;
      })
    );
  }
}
