import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent implements OnInit {
  // isLoggedIn již není potřeba pro *ngIf v HTML AdminLayoutu,
  // protože samotný AdminLayout se zobrazí jen, když je rouda AdminLayoutu aktivní.
  // Potřebujeme ji spíše pro kontrolu přístupu.

  constructor(private router: Router) {}

  ngOnInit(): void {
    // VELMI ZÁKLADNÍ SIMULACE AUTH GUARDu:
    // Pokud nejsme přihlášeni (podle sessionStorage), přesměrujeme na login.
    if (sessionStorage.getItem('isLoggedIn') !== 'true') {
      this.router.navigate(['/auth/login']);
    }
    // V reálné aplikaci by zde byl skutečný AuthGuard na úrovni routy v app.routes.ts
    // např. canActivate: [AuthGuard]
  }

  logout(): void {
    sessionStorage.removeItem('isLoggedIn'); // Odstranění stavu přihlášení
    this.router.navigate(['/home']); // Přesměrování na login stránku
  }
}