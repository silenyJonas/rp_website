import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { PublicHeaderComponent } from './public/components/public-header/public-header.component';
import { PublicFooterComponent } from './public/components/public-footer/public-footer.component';
import { filter } from 'rxjs/operators';

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

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Sledujeme změny rout
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Zobrazit public layout, POKUD nejsme na /auth/login NEBO na /admin/*
      this.showPublicLayout = !event.urlAfterRedirects.startsWith('/auth/login') && !event.urlAfterRedirects.startsWith('/admin');
    });
  }
}