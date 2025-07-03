import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; // Potřebné pro *ngFor, *ngIf

interface Technology {
  id: string;
  name: string;
}

@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [CommonModule], // CommonModule je stále potřeba pro *ngFor a *ngIf
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServicesComponent implements OnInit {

  // Definice technologií, nyní bez htmlContent
  technologies: Technology[] = [
    { id: 'web-dev', name: 'Webový vývoj' },
    { id: 'desktop-dev', name: 'Desktopový vývoj' },
    { id: 'mobile-dev', name: 'Mobilní vývoj' },
    { id: 'ai-dev', name: 'AI vývoj' }
  ];

  currentTech: string = 'web-dev'; // ID aktuálně vybrané technologie

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    // Inicializační logika
  }

  selectTech(techId: string): void {
    if (this.currentTech !== techId) {
      this.currentTech = techId;
      this.cdr.detectChanges(); // Vynutí detekci změn pro OnPush strategii
    }
  }
}