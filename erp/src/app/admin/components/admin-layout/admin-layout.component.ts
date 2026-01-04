import { Component, OnInit, OnDestroy, LOCALE_ID, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { PermissionService } from '../../../core/auth/services/permission.service';

import localeCs from '@angular/common/locales/cs';

registerLocaleData(localeCs);

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DatePipe
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'cs' }
  ]
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  userEmail: string | null = null;
  userRole: string | null = null;
  isLoggedIn: boolean = false;
  currentDate: Date = new Date();
  
  private authSubscription: Subscription | undefined;
  private userEmailSubscription: Subscription | undefined;
  private intervalId: any;

  constructor(
    private router: Router, 
    private authService: AuthService,
    private permissionService: PermissionService,
    private cdr: ChangeDetectorRef // Přidáno pro ruční aktualizaci zobrazení
  ) { }

  ngOnInit(): void {
    // Sledování stavu přihlášení
    this.authSubscription = this.authService.isLoggedIn$.subscribe(loggedIn => {
      this.isLoggedIn = loggedIn;
      if (loggedIn) {
        this.userRole = this.authService.getUserRole();
      } else {
        this.userEmail = null;
        this.userRole = null;
      }
      this.cdr.detectChanges(); // Aktualizovat UI při změně stavu
    });

    // Sledování emailu uživatele
    this.userEmailSubscription = this.authService.userEmail$.subscribe(email => {
      this.userEmail = email;
      this.cdr.detectChanges();
    });

    // Počáteční kontrola autorizace
    this.authService.checkAuth().subscribe(loggedIn => {
      this.isLoggedIn = loggedIn;
      if (loggedIn) {
        this.userRole = this.authService.getUserRole();
      }
      this.cdr.detectChanges();
    });

    // INTERVAL PRO AKTUALIZACI ČASU
    this.intervalId = setInterval(() => {
      this.currentDate = new Date();
      // Vynutit překreslení šablony, protože setInterval běží mimo základní detekci v některých verzích
      this.cdr.detectChanges(); 
    }, 1000);
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Odhlášení úspěšné.');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        console.error('Chyba při odhlášení:', err);
        this.router.navigate(['/auth/login']);
      }
    });
  }

  // Metoda pro kontrolu oprávnění s ochranou proti null
  hasPermission(permission: string): boolean {
    if (!this.userRole) {
      return false;
    }
    return this.permissionService.hasPermission(this.userRole, permission);
  }

  ngOnDestroy(): void {
    // Úklid po zničení komponenty
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.userEmailSubscription) {
      this.userEmailSubscription.unsubscribe();
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}