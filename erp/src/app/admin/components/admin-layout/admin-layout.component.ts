import { Component, OnInit, OnDestroy, LOCALE_ID, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { PermissionService } from '../../../core/auth/services/permission.service';
import { HasPermissionDirective } from '../../../core/directives/has-permission.directive';
import localeCs from '@angular/common/locales/cs';
registerLocaleData(localeCs);

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, HasPermissionDirective],
  providers: [{ provide: LOCALE_ID, useValue: 'cs' }]
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
    private permissionService: PermissionService, // Necháváme pro logout
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.authSubscription = this.authService.isLoggedIn$.subscribe(loggedIn => {
      this.isLoggedIn = loggedIn;
      this.userRole = loggedIn ? this.authService.getUserRole() : null;
      this.cdr.detectChanges();
    });

    this.userEmailSubscription = this.authService.userEmail$.subscribe(email => {
      this.userEmail = email;
      this.cdr.detectChanges();
    });

    this.intervalId = setInterval(() => {
      this.currentDate = new Date();
      this.cdr.detectChanges(); 
    }, 1000);
  }

  // TATO METODA UŽ NENÍ POTŘEBA - SMAZÁNO, DIREKTIVA JI NAHRADILA

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.permissionService.clearPermissions();
        this.router.navigate(['/auth/login']);
      },
      error: () => this.router.navigate(['/auth/login'])
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) this.authSubscription.unsubscribe();
    if (this.userEmailSubscription) this.userEmailSubscription.unsubscribe();
    if (this.intervalId) clearInterval(this.intervalId);
  }
}