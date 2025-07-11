// src/app/admin/components/admin-layout/admin-layout.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core'; // Přidáme OnDestroy
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { Subscription } from 'rxjs'; // Importujeme Subscription

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent implements OnInit, OnDestroy { // Implementujeme OnDestroy
  userEmail: string | null = null; // Proměnná pro uložení e-mailu uživatele
  isLoggedIn: boolean = false; // Proměnná pro sledování stavu přihlášení
  private authSubscription: Subscription | undefined; // Pro správu odběru
  currentDate: Date = new Date(); 
  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    // Přihlásíme se k odběru změn stavu přihlášení z AuthService
    // Tím se komponenta automaticky aktualizuje, když se uživatel přihlásí/odhlásí
    this.authSubscription = this.authService.isLoggedIn$.subscribe(loggedIn => {
      this.isLoggedIn = loggedIn;
      if (loggedIn) {
        this.userEmail = this.authService.getUserEmail(); // Získáme e-mail
      } else {
        this.userEmail = null; // Vyčistíme e-mail, když je uživatel odhlášen
      }
    });
setInterval(() => {
      this.currentDate = new Date();
    }, 1000);
    // Okamžitá inicializace stavu při načtení komponenty
    // Získáme e-mail přímo z AuthService, pokud už je uživatel přihlášen
    this.userEmail = this.authService.getUserEmail();
    this.isLoggedIn = this.userEmail !== null; // Nebo this.authService.hasToken();
  }

  // Metoda pro odhlášení
  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        // Po úspěšném odhlášení na backendu
        // AuthService už sám vyčistí sessionStorage a aktualizuje isLoggedIn$
        // Následně přesměrujeme uživatele na login stránku
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        console.error('Chyba při odhlášení:', err);
        // I když dojde k chybě na serveru, na frontendu uživatele odhlásíme
        // a přesměrujeme.
        this.router.navigate(['/auth/login']);
      }
    });
    // Odstranili jsme sessionStorage.removeItem('isLoggedIn'); odsud,
    // protože to dělá AuthService.
  }

  // Důležité: Odhlásit se z odběru, aby nedocházelo k úniku paměti
  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}