import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; // *** PŘIDÁNO RouterModule ZDE ***

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // *** Přidáme RouterModule do imports ***
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';

  constructor(private router: Router) {}

  onLogin(): void {
    this.errorMessage = '';

    if (this.username === 'jmeno' && this.password === 'heslo') {
      sessionStorage.setItem('isLoggedIn', 'true');
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.errorMessage = 'Neplatné uživatelské jméno nebo heslo.';
    }
  }
}