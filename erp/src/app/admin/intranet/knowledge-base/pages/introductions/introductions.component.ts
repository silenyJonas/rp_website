import { Component } from '@angular/core';
import { RouterLink } from '@angular/router'; // 1. Importuj RouterLink

@Component({
  selector: 'app-introductions',
  standalone: true, // Předpokládám, že používáš standalone (dle tvého kódu)
  imports: [RouterLink], // 2. Přidej ho do pole imports
  templateUrl: './introductions.component.html',
  styleUrl: './introductions.component.css',
})
export class IntroductionsComponent {
  // Komponenta je nyní připravena na navigaci
}