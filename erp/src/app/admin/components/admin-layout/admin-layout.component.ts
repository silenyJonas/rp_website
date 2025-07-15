import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router'; // Importujeme RouterModule
import { CommonModule, DatePipe } from '@angular/common'; // Importujeme CommonModule a DatePipe
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css'],
  standalone: true, // Předpokládám, že používáte standalone komponenty
  imports: [
    CommonModule, // Pro *ngIf a date pipe
    RouterModule // Pro router-outlet
  ]
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  userEmail: string | null = null;
  isLoggedIn: boolean = false;
  private authSubscription: Subscription | undefined;

  // currentDate již není potřeba, pokud ho nebudete používat jinde
  // Pokud ho chcete použít, musíte ho zde deklarovat a inicializovat:
  currentDate: Date = new Date(); 

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.authSubscription = this.authService.isLoggedIn$.subscribe(loggedIn => {
      this.isLoggedIn = loggedIn;
      if (loggedIn) {
        this.userEmail = this.authService.getUserEmail();
      } else {
        this.userEmail = null;
      }
    });

    this.authService.checkAuth().subscribe(loggedIn => {
      this.isLoggedIn = loggedIn;
      if (loggedIn) {
        this.userEmail = this.authService.getUserEmail();
      } else {
        this.userEmail = null;
      }
    });
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

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}
