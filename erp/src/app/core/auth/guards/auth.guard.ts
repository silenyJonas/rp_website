import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
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
    private permissionService: PermissionService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.authService.isLoggedIn$.pipe(
      take(1),
      map(isLoggedIn => {
        if (!isLoggedIn) {
          return this.router.createUrlTree(['/auth/login']);
        }

        // Získáme požadované oprávnění z definice routy
        const requiredPermission = route.data['permission'] as string;
        
        // Pokud routa vyžaduje oprávnění, zkontrolujeme ho v PermissionService
        if (requiredPermission) {
          if (this.permissionService.hasPermission(requiredPermission)) {
            return true;
          } else {
            console.warn(`AuthGuard: Chybí oprávnění '${requiredPermission}'. Přesměrování.`);
            return this.router.createUrlTree(['/admin/dashboard']);
          }
        }
        
        return true;
      })
    );
  }
}