import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; // Potřebné pro *ngFor, *ngIf
import { RouterLink } from '@angular/router';
interface Technology {
  id: string;
  name: string;
}

@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [CommonModule, RouterLink], // CommonModule je stále potřeba pro *ngFor a *ngIf
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



  webTechImages: any[] = [
    {name:'C#' , path:'assets/images/services-img/csharp.png'},
    {name:'TypeScript' , path:'assets/images/services-img/ts.png'},
    {name:'Java' , path:'assets/images/services-img/java.png'},
    {name:'Python' , path:'assets/images/services-img/py.png'},
    {name:'PHP' , path:'assets/images/services-img/php.png'},
    {name:'PostgreSQL' , path:'assets/images/services-img/postgresql.png'},
  ]

    desktopTechImages: any[] = [
    {name:'C#' , path:'assets/images/services-img/csharp.png'},
    {name:'C++' , path:'assets/images/services-img/cpp.png'},
    {name:'Java' , path:'assets/images/services-img/java.png'},
    {name:'Python' , path:'assets/images/services-img/py.png'},
    {name:'Rust' , path:'assets/images/services-img/rust.png'},
    {name:'PostgreSQL' , path:'assets/images/services-img/postgresql.png'},
  ]

    mobileTechImages : any[] = [
    {name:'C#' , path:'assets/images/services-img/csharp.png'},
    {name:'TypeScript' , path:'assets/images/services-img/ts.png'},
    {name:'Swift' , path:'assets/images/services-img/swift.png'},
    {name:'Kotlin' , path:'assets/images/services-img/kotlin.png'},
    {name:'SQLite' , path:'assets/images/services-img/sqlite.png'},
    {name:'PostgreSQL' , path:'assets/images/services-img/postgresql.png'},
  ]


    aiTechImages: any[] = [
    {name:'C++' , path:'assets/images/services-img/cpp.png'},
    {name:'Python' , path:'assets/images/services-img/py.png'},
    {name:'Java' , path:'assets/images/services-img/java.png'},
    {name:'JavaScript' , path:'assets/images/services-img/js.png'},
    {name:'Rust' , path:'assets/images/services-img/rust.png'},
    {name:'Go' , path:'assets/images/services-img/go.png'},
  ]
  

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