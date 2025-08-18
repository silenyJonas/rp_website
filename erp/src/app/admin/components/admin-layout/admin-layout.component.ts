// import { Component, OnInit, OnDestroy, LOCALE_ID } from '@angular/core';
// import { Router, RouterModule } from '@angular/router';
// import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
// import { Subscription } from 'rxjs';
// import { AuthService } from '../../../core/auth/auth.service';

// import localeCs from '@angular/common/locales/cs';

// registerLocaleData(localeCs);
// @Component({
//   selector: 'app-admin-layout',
//   templateUrl: './admin-layout.component.html',
//   styleUrls: ['./admin-layout.component.css'],
//   standalone: true,
//   imports: [
//     CommonModule,
//     RouterModule,
//     DatePipe
//   ],
//   providers: [
//     { provide: LOCALE_ID, useValue: 'cs' }
//   ]
// })
// export class AdminLayoutComponent implements OnInit, OnDestroy {
//   userEmail: string | null = null;
//   userRole: string | null = null;
//   isLoggedIn: boolean = false;
//   currentDate: Date = new Date();
  
//   private authSubscription: Subscription | undefined;
//   private intervalId: any;

//   constructor(private router: Router, private authService: AuthService) { }

//   ngOnInit(): void {
//     // Přihlášení
//     this.authSubscription = this.authService.isLoggedIn$.subscribe(loggedIn => {
//       this.isLoggedIn = loggedIn;
//       if (loggedIn) {
//         this.userEmail = this.authService.getUserEmail();
//         this.userRole = this.authService.getUserRole();
//       } else {
//         this.userEmail = null;
//         this.userRole = null;
//       }
//     });

//     this.authService.checkAuth().subscribe(loggedIn => {
//       this.isLoggedIn = loggedIn;
//       if (loggedIn) {
//         this.userEmail = this.authService.getUserEmail();
//         this.userRole = this.authService.getUserRole();
//       } else {
//         this.userEmail = null;
//         this.userRole = null;
//       }
//     });

//     // Spouštění aktualizace času každou vteřinu
//     this.intervalId = setInterval(() => {
//       this.currentDate = new Date();
//     }, 1000);
//   }

//   logout(): void {
//     this.authService.logout().subscribe({
//       next: () => {
//         console.log('Odhlášení úspěšné.');
//         this.router.navigate(['/auth/login']);
//       },
//       error: (err) => {
//         console.error('Chyba při odhlášení:', err);
//         this.router.navigate(['/auth/login']);
//       }
//     });
//   }

//   ngOnDestroy(): void {
//     if (this.authSubscription) {
//       this.authSubscription.unsubscribe();
//     }
//     // Důležité: zastavte interval, aby nedocházelo k úniku paměti
//     if (this.intervalId) {
//       clearInterval(this.intervalId);
//     }
//   }
// }

import { Component, OnInit, OnDestroy, LOCALE_ID } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';

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
  // Nový subscription pro sledování změn v e-mailu uživatele
  private userEmailSubscription: Subscription | undefined;
  private intervalId: any;

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    // Přihlášení
    this.authSubscription = this.authService.isLoggedIn$.subscribe(loggedIn => {
      this.isLoggedIn = loggedIn;
      if (loggedIn) {
        this.userRole = this.authService.getUserRole();
      } else {
        this.userEmail = null;
        this.userRole = null;
      }
    });

    // Nový odběr pro e-mail, který se bude aktualizovat při každé změně
    this.userEmailSubscription = this.authService.userEmail$.subscribe(email => {
      this.userEmail = email;
    });

    this.authService.checkAuth().subscribe(loggedIn => {
      this.isLoggedIn = loggedIn;
      if (loggedIn) {
        this.userRole = this.authService.getUserRole();
      }
    });

    // Spouštění aktualizace času každou vteřinu
    this.intervalId = setInterval(() => {
      this.currentDate = new Date();
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

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    // Důležité: zastavte interval, aby nedocházelo k úniku paměti
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    // Odhlášení od odběru e-mailu
    if (this.userEmailSubscription) {
      this.userEmailSubscription.unsubscribe();
    }
  }
}
