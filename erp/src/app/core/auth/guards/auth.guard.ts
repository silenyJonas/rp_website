import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take, switchMap } from 'rxjs/operators'; // Přidán switchMap
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
    // Místo isLoggedIn$ použijeme přímo checkAuth(), který se ptá serveru
    return this.authService.checkAuth().pipe(
      take(1),
      map(isLoggedIn => {
        if (!isLoggedIn) {
          // Pokud server řekne, že token neplatí, smažeme data a jdeme na login
          return this.router.createUrlTree(['/auth/login']);
        }

        // --- KONTROLA OPRÁVNĚNÍ ---
        const requiredPermission = route.data['permission'] as string;
        
        if (requiredPermission) {
          // checkAuth už v tap() metodě v AuthService naplnil PermissionService čerstvými daty
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