import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError, timer, Subject } from 'rxjs';
import { tap, catchError, switchMap, takeUntil } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PermissionService } from './services/permission.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = environment.base_api_url;

  private _isLoggedIn = new BehaviorSubject<boolean>(!!localStorage.getItem('accessToken'));
  isLoggedIn$ = this._isLoggedIn.asObservable();
  
  private _userEmailSubject = new BehaviorSubject<string | null>(localStorage.getItem('userEmail'));
  userEmail$ = this._userEmailSubject.asObservable();

  private stopTokenRefresh$ = new Subject<void>();
  private readonly REFRESH_INTERVAL = 20 * 60 * 1000;

  constructor(
    private http: HttpClient,
    private permissionService: PermissionService
  ) {
    this.checkAuth().subscribe(isAuth => {
      if (isAuth) {
        this.startTokenRefreshTimer();
        this.syncPermissions();
      }
    });
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, credentials).pipe(
      tap((response: any) => {
        localStorage.setItem('accessToken', response.token);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('userEmail', response.user.user_email);
        localStorage.setItem('userId', response.user.user_login_id.toString());
        
        // Uložení ROLE
        if (response.user_roles && response.user_roles.length > 0) {
          localStorage.setItem('userRole', response.user_roles[0]); 
        }

        // Uložení PERMISSIONS a synchronizace do PermissionService
        if (response.user_permissions) {
          localStorage.setItem('userPermissions', JSON.stringify(response.user_permissions));
          this.permissionService.setPermissions(response.user_permissions);
        }

        this._userEmailSubject.next(response.user.user_email);
        this._isLoggedIn.next(true);
        this.startTokenRefreshTimer();
      }),
      catchError(this.handleError)
    );
  }

  private syncPermissions(): void {
    const perms = this.getUserPermissions();
    this.permissionService.setPermissions(perms);
  }

  private clearAuthData(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userPermissions');
    
    this.permissionService.clearPermissions();
    this._isLoggedIn.next(false);
    this._userEmailSubject.next(null);
  }

  // --- POMOCNÉ METODY PRO KOMPONENTY ---
  public getUserId(): string | null { return localStorage.getItem('userId'); }
  public getUserEmail(): string | null { return localStorage.getItem('userEmail'); }
  public setUserEmail(email: string): void {
    localStorage.setItem('userEmail', email);
    this._userEmailSubject.next(email);
  }
  public getUserRole(): string | null { return localStorage.getItem('userRole'); }
  public getAccessToken(): string | null { return localStorage.getItem('accessToken'); }
  public getRefreshToken(): string | null { return localStorage.getItem('refreshToken'); }
  
  public getUserPermissions(): string[] {
    const perms = localStorage.getItem('userPermissions');
    return perms ? JSON.parse(perms) : [];
  }

  // --- LOGIKA TOKENŮ ---
  logout(): Observable<any> {
    const body = { refreshToken: this.getRefreshToken() };
    return this.http.post<any>(`${this.baseUrl}/logout`, body).pipe(
      tap(() => {
        this.clearAuthData();
        this.stopTokenRefreshTimer();
      }),
      catchError(() => {
        this.clearAuthData();
        return of(null);
      })
    );
  }

  refreshAccessToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearAuthData();
      return throwError(() => new Error('Chybí refresh token'));
    }
    return this.http.post<any>(`${this.baseUrl}/refresh`, { refreshToken }).pipe(
      tap(res => {
        localStorage.setItem('accessToken', res.token);
        localStorage.setItem('refreshToken', res.refreshToken);
      }),
      catchError(err => {
        this.clearAuthData();
        return throwError(() => err);
      })
    );
  }

  checkAuth(): Observable<boolean> {
    return localStorage.getItem('accessToken') 
      ? of(true) 
      : this.refreshAccessToken().pipe(switchMap(() => of(true)), catchError(() => of(false)));
  }

  private startTokenRefreshTimer(): void {
    this.stopTokenRefreshTimer();
    this.intervalId = timer(this.REFRESH_INTERVAL, this.REFRESH_INTERVAL).pipe(
      switchMap(() => this.refreshAccessToken()),
      takeUntil(this.stopTokenRefresh$)
    ).subscribe();
  }
  private intervalId: any;

  private stopTokenRefreshTimer(): void { this.stopTokenRefresh$.next(); }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Nastala chyba při přihlášení.';
    if (error.status === 401) errorMessage = 'Neplatné jméno nebo heslo.';
    return throwError(() => new Error(errorMessage));
  }
}