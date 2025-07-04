// projects.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Důležité pro *ngFor a [ngClass]

// Rozhraní pro definici struktury jednoho projektu
interface ProjectItem {
  id: number;
  name: string;
  duration: string;
  client: string;
  description: string;
  isActive: boolean; // Vlastnost pro sledování stavu rozbalení
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './references.component.html',
  styleUrl: './references.component.css'
})
export class ReferencesComponent implements OnInit {

  // Pole projektů
  projects: ProjectItem[] = [
    {
      id: 1,
      name: 'E-shop s elektronikou',
      duration: '4 měsíce',
      client: 'ABC Tech s.r.o.',
      description: 'Kompletní vývoj moderního e-shopu na míru s pokročilými funkcemi, jako je správa objednávek, platební brána, sledování zásob a responzivní design pro mobilní zařízení.',
      isActive: false
    },
    {
      id: 2,
      name: 'Mobilní aplikace pro fitness',
      duration: '6 měsíců',
      client: 'FitLife Studios',
      description: 'Vývoj nativní mobilní aplikace pro iOS a Android, která uživatelům umožňuje sledovat tréninky, plánovat cvičení, monitorovat pokrok a interagovat s trenéry. Obsahuje i integraci s nositelnou elektronikou.',
      isActive: false
    },
    {
      id: 3,
      name: 'Informační systém pro logistiku',
      duration: '8 měsíců',
      client: 'Global Logistics a.s.',
      description: 'Zakázkový webový informační systém pro optimalizaci logistických procesů, včetně sledování zásilek, správy vozového parku, plánování tras a reportingu. Zlepšuje efektivitu a snižuje náklady.',
      isActive: false
    },
    {
      id: 4,
      name: 'Prezentační web pro architektonické studio',
      duration: '2 měsíce',
      client: 'ArchiDesign s.r.o.',
      description: 'Vytvoření elegantní a vizuálně poutavé webové stránky, která prezentuje portfolio architektonických projektů, s interaktivními galeriemi a kontaktními formuláři.',
      isActive: false
    },
    {
      id: 5,
      name: 'Rezervační systém pro ordinaci',
      duration: '3 měsíce',
      client: 'MUDr. Nováková',
      description: 'Jednoduchý a intuitivní online rezervační systém pro lékařskou ordinaci, umožňující pacientům rezervovat termíny, dostávat připomenutí a spravovat své schůzky.',
      isActive: false
    },
    {
      id: 6,
      name: 'Redesign korporátního webu',
      duration: '3.5 měsíce',
      client: 'Enterprise Solutions Inc.',
      description: 'Kompletní redesign stávajícího korporátního webu s důrazem na moderní UI/UX, optimalizaci pro mobilní zařízení a zlepšení SEO. Cílem bylo zvýšit konverze a posílit brand.',
      isActive: false
    },
    {
      id: 7,
      name: 'Platforma pro online kurzy',
      duration: '7 měsíců',
      client: 'EduTech Academy',
      description: 'Vývoj komplexní vzdělávací platformy s video kurzy, interaktivními cvičeními, správou uživatelů a pokročilým systémem pro hodnocení a certifikaci.',
      isActive: false
    },
    {
      id: 8,
      name: 'CRM systém na míru',
      duration: '10 měsíců',
      client: 'ClientCare Ltd.',
      description: 'Vývoj CRM (Customer Relationship Management) systému šitého na míru pro specifické potřeby klienta, zahrnující správu zákazníků, prodejních cyklů, komunikace a analytiku.',
      isActive: false
    },
    {
      id: 9,
      name: 'Automatizace reportingu',
      duration: '5 měsíců',
      client: 'Data Insights Corp.',
      description: 'Software pro automatizaci sběru dat z různých zdrojů a generování dynamických reportů a dashboardů. Zkracuje čas potřebný pro analýzu dat a zlepšuje rozhodování.',
      isActive: false
    },
    {
      id: 10,
      name: 'Webová aplikace pro správu akcí',
      duration: '4 měsíce',
      client: 'Eventify Solutions',
      description: 'Interaktivní webová aplikace pro organizátory akcí, umožňující správu registrací, prodej vstupenek, komunikaci s účastníky a plánování logistiky událostí.',
      isActive: false
    }
  ];

  constructor() { }

  ngOnInit(): void { }

  // Metoda pro přepínání stavu projektu (umožňuje více otevřených najednou)
  toggleProject(clickedProject: ProjectItem): void {
    clickedProject.isActive = !clickedProject.isActive;
  }
}