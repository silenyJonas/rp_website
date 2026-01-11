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
  constructor(private router: Router) {}

  isRootPath(): boolean {
    // Teď už v cestě není /admin/
    return this.router.url === '/company-pages/knowledge-base';
  }
}