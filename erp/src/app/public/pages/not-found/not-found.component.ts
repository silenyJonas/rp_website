import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css',
})
export class NotFoundComponent implements OnInit {
  // Zde bude uložena ta původní špatná adresa
  attemptedUrl: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Získáme informaci o poslední navigaci
    // 'url' v getCurrentNavigation obsahuje tu adresu, která vyvolala přesměrování
    const navigation = this.router.getCurrentNavigation();
    
    if (navigation && navigation.previousNavigation) {
      // Pokud došlo k přesměrování z jiné URL, vezmeme ji odtud
      this.attemptedUrl = navigation.previousNavigation.finalUrl?.toString() || '';
    } else {
      // Pokud uživatel přišel přímo na /404 nebo refreshnul, zkusíme vzít stav routeru
      this.attemptedUrl = this.router.url;
    }

    // Pro ladění si to můžeš vypsat do konzole
    console.log('Uživatel se pokusil navštívit neexistující adresu:', this.attemptedUrl);
  }
}