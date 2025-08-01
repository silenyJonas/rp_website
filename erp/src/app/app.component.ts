// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
// import { PublicHeaderComponent } from './public/components/public-header/public-header.component';
// import { PublicFooterComponent } from './public/components/public-footer/public-footer.component';
// import { filter } from 'rxjs/operators';
// import { AuthService } from './core/auth/auth.service';

// @Component({
//   selector: 'app-root',
//   standalone: true,
//   imports: [
//     CommonModule,
//     RouterOutlet,
//     PublicHeaderComponent,
//     PublicFooterComponent
//   ],
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.css']
// })
// export class AppComponent implements OnInit {
//   title = 'YourApp';
//   showPublicLayout = true; // Určuje, zda zobrazit public hlavičku/patičku

//   constructor(private router: Router, private authService: AuthService) {}

//   ngOnInit(): void {
//      this.authService.checkAuth().subscribe();
//     // Sledujeme změny rout
//     this.router.events.pipe(
//       filter(event => event instanceof NavigationEnd)
//     ).subscribe((event: NavigationEnd) => {
//       // Zobrazit public layout, POKUD nejsme na /auth/login NEBO na /admin/*
//       this.showPublicLayout = !event.urlAfterRedirects.startsWith('/auth/login') && !event.urlAfterRedirects.startsWith('/admin');
//     });
//   }
// }
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
  showPublicLayout = true; // Určuje, zda zobrazit public hlavičku/patičku

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.checkAuth().subscribe();
    // Sledujeme změny rout
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Zobrazit public layout, POKUD nejsme na /auth/login NEBO na /admin/*
      this.showPublicLayout = !event.urlAfterRedirects.startsWith('/auth/login') && !event.urlAfterRedirects.startsWith('/admin');
    });
  }

  // NOVÁ METODA: Přidá/odebere třídu pro zablokování scrollu na HTML elementu
  toggleRootScroll(isMenuOpen: boolean): void {
    const htmlElement = document.documentElement; // Získáme HTML element
    if (isMenuOpen) {
      htmlElement.classList.add('no-scroll');
    } else {
      htmlElement.classList.remove('no-scroll');
    }
  }
}