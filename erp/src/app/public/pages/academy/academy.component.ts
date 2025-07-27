// src/app/academy/academy.component.ts

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; // Potřebné pro *ngFor, *ngIf
import { PublicDataService } from '../../services/public-data.service';
import { HttpErrorResponse } from '@angular/common/http'; // Pro zpracování chyb

// Import GenericFormComponent a rozhraní pro konfiguraci polí
import { GenericFormComponent } from '../../components/generic-form/generic-form.component';
import { FormFieldConfig } from '../../../shared/interfaces/form-field-config';
import { FormsModule } from '@angular/forms'; // FormsModule je potřeba pro komponentu, která GenericForm používá

// Rozhraní pro položku timeline (zůstává stejné)
interface TimelineItem {
  id: number;
  title: string;
  content: string;
  isActive: boolean;
  themes: string[];
  newThings: string[][];
}

@Component({
  selector: 'app-academy',
  standalone: true,
  imports: [
    CommonModule,
    GenericFormComponent, // Důležité: Přidejte GenericFormComponent do imports
    FormsModule // Důležité: FormsModule je potřeba pro GenericFormComponent
  ],
  templateUrl: './academy.component.html',
  styleUrls: ['./academy.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AcademyComponent implements OnInit {

  form_header : string = 'Zanechte kontakt pro konzultaci';
  form_description: string = 'Odezva do 24h'; 
  form_button: string = 'Rezervovat konzultaci';


  // Konfigurace formuláře pro GenericFormComponent
  contactFormConfig: FormFieldConfig[] = [];

  // Ostatní vlastnosti pro ikony a data timeline (zůstávají stejné)
  time: string = 'assets/images/icons/curses/time.png';
  calendar: string = 'assets/images/icons/curses/calendar.png';
  online: string = 'assets/images/icons/curses/online.png';
  discord: string = 'assets/images/icons/curses/discord.png';
  client: string = 'assets/images/icons/curses/client.png';
  www: string = 'assets/images/icons/curses/www.png';
  database: string = 'assets/images/icons/curses/database.png';
  pc: string = 'assets/images/icons/curses/pc.png';
  cmd: string = 'assets/images/icons/curses/cmd.png';
  gui: string = 'assets/images/icons/curses/gui.png';

  // Separate timeline items for Web Development
  webTimelineItems: TimelineItem[] = [
    {
      id: 1,
      title: 'Začátečník (9-17 let)',
      content: 'Tento kurz je určen pro děti, které nemají žádné předchozí zkušenosti s programováním. Naučíme se základní koncepty logiky, algoritmů a řešení problémů pomocí vizuálního programování (např. Scratch) a jednoduchých textových příkazů. Děti si vytvoří své první interaktivní příběhy a hry.',
      isActive: false,
      themes: [
        'Úvod do internetu',
        'Co to je HTML & CSS',
        'Základní HTML tagy',
        'Základy CSS',
        'Header a Footer',
        'Miniprojekty: Galerie, Semafor'
      ],
      newThings: [
        ['HTML', 'assets/images/icons/curses/html.png'],
        ['CSS', 'assets/images/icons/curses/css.png']
      ],
    },
    {
      id: 2,
      title: 'Pokročilý (11-17 let)',
      content: 'Navazuje na základy a prohlubuje znalosti v konkrétním programovacím jazyce (např. úvod do Pythonu nebo JavaScriptu). Zaměříme se na složitější datové struktury, funkce a tvorbu komplexnějších projektů, jako jsou jednoduché aplikace nebo pokročilejší hry. Děti se naučí efektivněji psát kód a řešit složitější problémy.',
      isActive: false,
      themes: [
        'Pokročilé HTML tagy a atributy',
        'Styly a layout v CSS (flexbox, grid)',
        'Úvod do JavaScriptu',
        'Moderní TypeScript frameworky (Angular)',
        'Základy dynamického obsahu (DOM)',
        'Interaktivní prvky (formuláře, tlačítka)',
        'Projekty: Interaktivní formulář, Jednoduchá hra, Animation ball'
      ],
      newThings: [
        ['JavaScript', 'assets/images/icons/curses/js.png'],
        ['TypeScript', 'assets/images/icons/curses/ts.png']
      ],
    },
    {
      id: 3,
      title: 'Expert (12-17 let)',
      content: 'Pro ty, kteří již mají solidní základy a chtějí se stát skutečnými experty. Budeme pracovat na individuálních projektech, řešit reálné programovací výzvy a učit se pokročilé techniky. Děti si zdokonalí své dovednosti v debugování, optimalizaci, práci s API a týmové spolupráci. Budou připraveny tvořit vlastní inovativní řešení.',
      isActive: false,
      themes: [
        'Moderní TypeScript frameworky (Angular)',
        'Základy backendového vývoje (PHP)',
        'Práce s databázemi (MySQL, PostgreSQL)',
        'Vytváření full-stack aplikací',
        'Verzování kódu (Git)',
        'Projekty: Chat aplikace, E-commerce web'
      ],
      newThings: [
        ['PHP', 'assets/images/icons/curses/php.png'],
        ['MySQL', 'assets/images/icons/curses/mysql.png']
      ],
    },
  ];

  // Separate timeline items for Desktop Development
  desktopTimelineItems: TimelineItem[] = [
    {
      id: 1,
      title: 'Začátečník (11-17 let)',
      content: 'Tento kurz je určen pro děti, které nemají žádné předchozí zkušenosti s programováním. Naučíme se základní koncepty logiky, algoritmů a řešení problémů pomocí vizuálního programování (např. Scratch) a jednoduchých textových příkazů. Děti si vytvoří své první interaktivní příběhy a hry.',
      isActive: false,
      themes: [
        'Úvod do programování (základy logiky, algoritmy)',
        'Vizuální programování (např. Scratch)',
        'Základy datových typů a proměnných',
        'Podmíněné příkazy a smyčky',
        'Miniprojekty: Jednoduchá kalkulačka, Generátor náhodných čísel'
      ],
      newThings: [
        ['Scratch', 'assets/images/icons/curses/scratch.png'],
        ['Python', 'assets/images/icons/curses/py.png']
      ],
    },
    {
      id: 2,
      title: 'Pokročilý (13-17 let)',
      content: 'Navazuje na základy a prohlubuje znalosti v konkrétním programovacím jazyce (např. úvod do Pythonu s tkinter nebo C# s WinForms). Zaměříme se na tvorbu grafických uživatelských rozhraní (GUI), práci s událostmi, ukládání dat do souborů a objektově orientované programování.',
      isActive: false,
      themes: [
        'Základy GUI programování (např. Tkinter/WinForms)',
        'Práce s událostmi (kliknutí, stisky kláves)',
        'Ukládání a načítání dat ze souborů',
        'Základy objektově orientovaného programování (OOP)',
        'Miniprojekty: Jednoduchý textový editor, Malovací program'
      ],
      newThings: [
        ['C#', 'assets/images/icons/curses/csharp.png'],
        ['MSSQL', 'assets/images/icons/curses/mssql.png'] // Example, replace with actual icon
      ],
    },
    {
      id: 3,
      title: 'Expert (14-17 let)',
      content: 'Pro ty, kteří již mají solidní základy a chtějí se stát skutečnými experty. Budeme pracovat na komplexních desktopových aplikacích, řešit optimalizaci výkonu, práci s externími knihovnami a týmovou spolupráci na větších projektech. Cílem je vytvořit robustní a uživatelsky přívětivé aplikace.',
      isActive: false,
      themes: [
        'Pokročilé GUI frameworky (např. PyQt, WPF)',
        'Databáze v desktopových aplikacích (SQLite)',
        'Multithreading a asynchronní programování',
        'Deployování aplikací',
        'Pokročilé datové struktury a algoritmy',
        'Projekty: Správce úkolů s databází, Jednoduchá 2D hra'
      ],
      newThings: [
        ['C++', 'assets/images/icons/curses/cpp.png'], // Example, replace with actual icon
        ['SQLite', 'assets/images/icons/curses/sqlite.png'] // Example, replace with actual icon
      ],
    },
  ];

  constructor(private publicDataService: PublicDataService, private cdr: ChangeDetectorRef) { } // Přidán PublicDataService

  // OPRAVENO: Změněno z OnInit() na ngOnInit()
  ngOnInit(): void {
    // Definujeme konfiguraci polí pro kontaktní formulář v AcademyComponent
    this.contactFormConfig = [
      {
        label: 'Okruh:',
        name: 'theme', // Odpovídá name="theme" v původním HTML
        type: 'select',
        required: true,
        value: 'desktop-development', // Výchozí hodnota z původního HTML
        options: [
          { value: 'desktop-development', label: 'Desktopový vývoj' },
          { value: 'web-development', label: 'Webový vývoj' }
        ]
      },
      {
        label: 'Obtížnost:',
        name: 'diff', // Odpovídá name="diff" v původním HTML
        type: 'select',
        required: true,
        value: 'begginer', // Výchozí hodnota z původního HTML
        options: [
          { value: 'begginer', label: 'Začátečník (11-17 let)' },
          { value: 'advanced', label: 'Pokročilý (13-17 let)' },
          { value: 'expert', label: 'Expert (14-17 let)' }
        ]
      },
      {
        label: 'E-mail:',
        name: 'email', // Odpovídá name="email" v původním HTML
        type: 'email',
        required: true,
        placeholder: 'vas.email@priklad.cz',
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$'
      },
      {
        label: 'Telefon (nepovinné):',
        name: 'phone', // Odpovídá name="phone" v původním HTML
        type: 'tel',
        required: false,
        placeholder: 'např. +420 123 456 789',
        pattern: '^[0-9\\s\\-+\\(\\)]+$'
      }
    ];
  }

  // Metoda pro odeslání dat formuláře přes PublicDataService
  handleFormSubmission(formData: any): void {
    console.log('Data přijata z generického formuláře k odeslání do PublicDataService:', formData);

    // Zde voláme vaši PublicDataService pro odeslání dat na backend
    // Předpokládáme, že endpoint pro Academy formulář je stejný nebo podobný
    // a backend ho očekává bez autentizace.
    this.publicDataService.submitContactForm(formData).subscribe({
      next: (response) => {
        console.log('Formulář odeslán úspěšně přes PublicDataService!', response);
        // GenericFormComponent už si sám zobrazí zprávu o úspěchu.
      },
      error: (error: HttpErrorResponse) => {
        console.error('Chyba při odesílání formuláře přes PublicDataService:', error);
        // GenericFormComponent už si sám zobrazí chybovou zprávu.
      }
    });
  }

  // Metoda pro resetování formuláře
  handleFormReset(): void {
    console.log('Generický formulář byl resetován.');
  }

  // Metoda pro přepínání stavu rozbalení/sbalení pro webové kroužky
  toggleWebItem(clickedItem: TimelineItem): void {
    clickedItem.isActive = !clickedItem.isActive;
    this.cdr.detectChanges();
  }

  // Metoda pro přepínání stavu rozbalení/sbalení pro desktopové kroužky
  toggleDesktopItem(clickedItem: TimelineItem): void {
    clickedItem.isActive = !clickedItem.isActive;
    this.cdr.detectChanges();
  }
}
