// src/app/admin/auth/login/login.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service'; // Cesta k AuthService

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = ''; // Pro Laravel Auth::attempt používáme 'email'
  password = '';
  errorMessage = '';

  constructor(private router: Router, private authService: AuthService) {} // Injektujeme AuthService

  onLogin(): void {
    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        // Po úspěšném přihlášení v AuthService se provede přesměrování
        // na dashboard (pokud tam chcete uživatele poslat)
        this.router.navigate(['/admin/dashboard']);
      },
      error: (error) => {
        // Chyba přihlášení zpracovaná v AuthService a re-thrown
        this.errorMessage = error.message;
      }
    });
  }
}