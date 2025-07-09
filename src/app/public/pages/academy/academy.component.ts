
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

// Rozhraní pro položku timeline
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
  imports: [CommonModule],
  templateUrl: './academy.component.html',
  styleUrls: ['./academy.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AcademyComponent implements OnInit {

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
        'Základní HTML tagy (h1-5, img, iframe, span, div, ..)',
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
      title: 'Začátečník (9-17 let)',
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
        ['Python', 'assets/images/icons/curses/python.png'],
        ['Blockly', 'assets/images/icons/curses/blockly.png'] // Example, replace with actual icon
      ],
    },
    {
      id: 2,
      title: 'Pokročilý (11-17 let)',
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
        ['Python (Tkinter)', 'assets/images/icons/curses/python.png'],
        ['C# (WinForms)', 'assets/images/icons/curses/csharp.png'] // Example, replace with actual icon
      ],
    },
    {
      id: 3,
      title: 'Expert (12-17 let)',
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
        ['PyQt', 'assets/images/icons/curses/python.png'], // Example, replace with actual icon
        ['SQLite', 'assets/images/icons/curses/sqlite.png'] // Example, replace with actual icon
      ],
    },
  ];


  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    // Inicializační logika, pokud je potřeba
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