import { Component, OnInit, OnDestroy, ChangeDetectorRef, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { Subscription, interval, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AuthService } from '../../../core/auth/auth.service';
import { PermissionService } from '../../../core/auth/services/permission.service';
import { HasPermissionDirective } from '../../../core/directives/has-permission.directive';
import { LoadingService } from '../../../core/services/loading.service'; // Uprav cestu dle tvé struktury

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, HasPermissionDirective]
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  userEmail: string | null = null;
  userRole: string | null = null;
  isLoggedIn: boolean = false;
  
  // Globální loading stream
  isLoadingGlobal$: Observable<boolean>;
  
  currentDate$: Observable<Date> = interval(1000).pipe(
    startWith(0),
    map(() => new Date())
  );
  
  isMenuOpen: boolean = true;
  sidebarWidth: number = 200; 
  isResizing: boolean = false;

  private minWidth: number = 150;
  private maxWidth: number = 500;
  private authSubscription: Subscription | undefined;
  private userEmailSubscription: Subscription | undefined;

  constructor(
    private router: Router, 
    private authService: AuthService,
    private permissionService: PermissionService,
    private cdr: ChangeDetectorRef,
    private loadingService: LoadingService // Vstříknutí loading služby
  ) { 
    // Inicializace streamu loadingu
    this.isLoadingGlobal$ = this.loadingService.isLoading$;
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      const savedWidth = localStorage.getItem('admin_sidebar_width');
      if (savedWidth) this.sidebarWidth = parseInt(savedWidth, 10);
      
      const savedState = localStorage.getItem('admin_menu_open');
      
      if (window.innerWidth <= 768) {
        this.isMenuOpen = false; 
      } else {
        this.isMenuOpen = savedState !== null ? savedState === 'true' : true;
      }
    }

    this.authSubscription = this.authService.isLoggedIn$.subscribe(loggedIn => {
      this.isLoggedIn = loggedIn;
      this.userRole = loggedIn ? this.authService.getUserRole() : null;
      this.cdr.markForCheck(); 
    });

    this.userEmailSubscription = this.authService.userEmail$.subscribe(email => {
      this.userEmail = email;
      this.cdr.markForCheck();
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    if (window.innerWidth > 768) {
      localStorage.setItem('admin_menu_open', this.isMenuOpen.toString());
    }
    this.cdr.markForCheck();
  }

  onLinkClick(): void {
    if (window.innerWidth <= 768) {
      this.isMenuOpen = false;
    }
  }

  startResizing(event: MouseEvent): void {
    if (window.innerWidth > 768) {
      this.isResizing = true;
      event.preventDefault();
    }
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isResizing) return;
    let newWidth = event.clientX;
    if (newWidth >= this.minWidth && newWidth <= this.maxWidth) {
      this.sidebarWidth = newWidth;
      this.cdr.markForCheck();
    }
  }

  @HostListener('window:mouseup')
  onMouseUp(): void {
    if (this.isResizing) {
      this.isResizing = false;
      localStorage.setItem('admin_sidebar_width', this.sidebarWidth.toString());
    }
  }

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
  }
}