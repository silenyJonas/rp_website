import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { PublicHeaderComponent } from './public/components/public-header/public-header.component';
import { PublicFooterComponent } from './public/components/public-footer/public-footer.component';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    PublicHeaderComponent,
    PublicFooterComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'YourApp';
  showPublicLayout: boolean = false;

  constructor(
    private router: Router, 
    private authService: AuthService
  ) {
    // OKAMŽITÁ SYNCHRONNÍ KONTROLA PŘI STARTU
    const path = window.location.pathname;
    
    // Zakázané oblasti, kde se layout NESMÍ zobrazit (včetně 404)
    const isHiddenArea = 
      path.includes('/admin') || 
      path.includes('/auth/login') || 
      path.includes('/404');

    this.showPublicLayout = !isHiddenArea;
  }

  ngOnInit(): void {
    this.authService.checkAuth().subscribe();
    
    // Sledujeme změny navigace (např. když uživatel klikne na špatný odkaz)
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects;
      
      this.showPublicLayout = 
        !url.includes('/admin') && 
        !url.includes('/auth/login') && 
        !url.includes('/404');
    });
  }

  toggleRootScroll(isMenuOpen: boolean): void {
    const htmlElement = document.documentElement;
    if (isMenuOpen) {
      htmlElement.classList.add('no-scroll');
    } else {
      htmlElement.classList.remove('no-scroll');
    }
  }
}