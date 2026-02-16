import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError, timer, Subject } from 'rxjs';
import { tap, catchError, switchMap, takeUntil, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PermissionService } from './services/permission.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = environment.base_api_url;

  // Inicializace přímo ze sessionStorage zajistí, že stav přežije F5
  private _isLoggedIn = new BehaviorSubject<boolean>(!!sessionStorage.getItem('accessToken'));
  isLoggedIn$ = this._isLoggedIn.asObservable();
  
  private _userEmailSubject = new BehaviorSubject<string | null>(sessionStorage.getItem('userEmail'));
  userEmail$ = this._userEmailSubject.asObservable();

  private stopTokenRefresh$ = new Subject<void>();
  private readonly REFRESH_INTERVAL = 20 * 60 * 1000;
  private intervalId: any;

  constructor(
    private http: HttpClient,
    private permissionService: PermissionService
  ) {
    if (this.getAccessToken()) {
      this.startTokenRefreshTimer();
      this.syncPermissions();
    }
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, credentials).pipe(
      tap((response: any) => {
        const userId = (response.user.id || response.user.user_login_id).toString();
        
        sessionStorage.setItem('accessToken', response.token);
        sessionStorage.setItem('refreshToken', response.refreshToken);
        sessionStorage.setItem('userEmail', response.user.user_email);
        sessionStorage.setItem('userId', userId);
        
        if (response.user_roles?.length > 0) {
          sessionStorage.setItem('userRole', response.user_roles[0]); 
        }

        if (response.user_permissions) {
          sessionStorage.setItem('userPermissions', JSON.stringify(response.user_permissions));
          this.permissionService.setPermissions(response.user_permissions);
        }

        this._userEmailSubject.next(response.user.user_email);
        this._isLoggedIn.next(true);
        this.startTokenRefreshTimer();
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Klíčová metoda pro AuthGuard. 
   * Při refreshu (F5) jen ověří lokální data. Pokud jsou neplatná, 
   * první následný požadavek na API vyvolá 401 a Interceptor provede refresh.
   */
  checkAuth(): Observable<boolean> {
    const token = this.getAccessToken();
    if (!token) {
      this._isLoggedIn.next(false);
      return of(false);
    }
    
    this._isLoggedIn.next(true);
    return of(true);
  }

  refreshAccessToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearAuthData();
      return throwError(() => new Error('Chybí refresh token'));
    }

    return this.http.post<any>(`${this.baseUrl}/refresh`, { refreshToken }).pipe(
      tap(res => {
        sessionStorage.setItem('accessToken', res.token);
        sessionStorage.setItem('refreshToken', res.refreshToken);
        this._isLoggedIn.next(true);
      }),
      catchError(err => {
        // Pokud refresh selže (např. 401 na refresh endpointu), okamžitě logout
        this.clearAuthData();
        return throwError(() => err);
      })
    );
  }

  public clearAuthData(): void {
    sessionStorage.clear(); // Vymaže vše najednou
    this.permissionService.clearPermissions();
    this._isLoggedIn.next(false);
    this._userEmailSubject.next(null);
    this.stopTokenRefreshTimer();
  }

  // Gettery
  public getUserId(): string | null { return sessionStorage.getItem('userId'); }
  public getUserEmail(): string | null { return sessionStorage.getItem('userEmail'); }
  public setUserEmail(email: string): void {
    sessionStorage.setItem('userEmail', email);
    this._userEmailSubject.next(email);
  }
  public getUserRole(): string | null { return sessionStorage.getItem('userRole'); }
  public getAccessToken(): string | null { return sessionStorage.getItem('accessToken'); }
  public getRefreshToken(): string | null { return sessionStorage.getItem('refreshToken'); }
  public getUserPermissions(): string[] {
    const perms = sessionStorage.getItem('userPermissions');
    return perms ? JSON.parse(perms) : [];
  }

  logout(): Observable<any> {
    const body = { refreshToken: this.getRefreshToken() };
    return this.http.post<any>(`${this.baseUrl}/logout`, body).pipe(
      tap(() => this.clearAuthData()),
      catchError(() => {
        this.clearAuthData();
        return of(null);
      })
    );
  }

  private startTokenRefreshTimer(): void {
    this.stopTokenRefreshTimer();
    this.intervalId = timer(this.REFRESH_INTERVAL, this.REFRESH_INTERVAL).pipe(
      switchMap(() => this.refreshAccessToken()),
      takeUntil(this.stopTokenRefresh$)
    ).subscribe();
  }

  private stopTokenRefreshTimer(): void { 
    this.stopTokenRefresh$.next(); 
  }

  private syncPermissions(): void {
    const perms = this.getUserPermissions();
    this.permissionService.setPermissions(perms);
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Nastala chyba při přihlášení.';
    if (error.status === 401) errorMessage = 'Neplatné jméno nebo heslo.';
    return throwError(() => new Error(errorMessage));
  }
}