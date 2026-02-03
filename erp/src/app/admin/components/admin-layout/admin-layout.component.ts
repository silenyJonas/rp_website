import { Component, OnInit, OnDestroy, ChangeDetectorRef, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { PermissionService } from '../../../core/auth/services/permission.service';
import { HasPermissionDirective } from '../../../core/directives/has-permission.directive';

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
  currentDate: Date = new Date();
  
  // Stavy sidebaru
  isMenuOpen: boolean = true;
  sidebarWidth: number = 200; 
  isResizing: boolean = false;

  private minWidth: number = 150;
  private maxWidth: number = 500;
  private authSubscription: Subscription | undefined;
  private userEmailSubscription: Subscription | undefined;
  private intervalId: any;

  constructor(
    private router: Router, 
    private authService: AuthService,
    private permissionService: PermissionService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Načtení uložených preferencí
    const savedWidth = localStorage.getItem('admin_sidebar_width');
    if (savedWidth) this.sidebarWidth = parseInt(savedWidth, 10);
    
    const savedState = localStorage.getItem('admin_menu_open');
    this.isMenuOpen = savedState !== null ? savedState === 'true' : true;

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

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    localStorage.setItem('admin_menu_open', this.isMenuOpen.toString());
    this.cdr.detectChanges();
  }

  // --- Resize Logika ---
  startResizing(event: MouseEvent): void {
    this.isResizing = true;
    event.preventDefault(); // Zabrání označování textu při dragu
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isResizing) return;
    
    let newWidth = event.clientX;
    if (newWidth >= this.minWidth && newWidth <= this.maxWidth) {
      this.sidebarWidth = newWidth;
      this.cdr.detectChanges();
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
    if (this.intervalId) clearInterval(this.intervalId);
  }
}