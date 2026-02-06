import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-knowledge-base',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './knowledge-base.component.html',
  styleUrl: './knowledge-base.component.css'
})
export class KnowledgeBaseComponent {
  isMenuOpen = false; // Stav pro hamburger menu

  constructor(private router: Router) {}

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  isRootPath(): boolean {
    return this.router.url === '/company-pages/knowledge-base';
  }
}