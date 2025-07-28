// src/app/public/pages/references/references.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocalizationService } from '../../services/localization.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Rozhraní pro definici struktury jednoho projektu (s klíči pro lokalizaci)
interface ProjectItemConfig {
  id: number;
  nameKey: string;
  durationKey: string;
  clientKey: string;
  descriptionKey: string;
}

// Rozhraní pro projektovou položku s přeloženými texty
interface ProjectItem {
  id: number;
  name: string;
  duration: string;
  client: string;
  description: string;
  isActive: boolean;
}

@Component({
  selector: 'app-references', // Selektor komponenty
  standalone: true,
  imports: [CommonModule],
  templateUrl: './references.component.html',
  styleUrl: './references.component.css'
})
export class ReferencesComponent implements OnInit, OnDestroy {

  // Proměnné pro statické texty v HTML
  header_1_text: string = '';
  table_header_title_text: string = '';
  table_header_duration_text: string = '';
  table_header_client_text: string = '';
  more_button_prompt_text: string = '';
  more_button_link_text: string = '';

  // Konfigurace projektů s klíči pro lokalizaci
  projectsConfig: ProjectItemConfig[] = [
    { id: 1, nameKey: 'projects.project_1.name', durationKey: 'projects.project_1.duration', clientKey: 'projects.project_1.client', descriptionKey: 'projects.project_1.description' },
    { id: 2, nameKey: 'projects.project_2.name', durationKey: 'projects.project_2.duration', clientKey: 'projects.project_2.client', descriptionKey: 'projects.project_2.description' },
    { id: 3, nameKey: 'projects.project_3.name', durationKey: 'projects.project_3.duration', clientKey: 'projects.project_3.client', descriptionKey: 'projects.project_3.description' },
    { id: 4, nameKey: 'projects.project_4.name', durationKey: 'projects.project_4.duration', clientKey: 'projects.project_4.client', descriptionKey: 'projects.project_4.description' },
    { id: 5, nameKey: 'projects.project_5.name', durationKey: 'projects.project_5.duration', clientKey: 'projects.project_5.client', descriptionKey: 'projects.project_5.description' },
    { id: 6, nameKey: 'projects.project_6.name', durationKey: 'projects.project_6.duration', clientKey: 'projects.project_6.client', descriptionKey: 'projects.project_6.description' },
    { id: 7, nameKey: 'projects.project_7.name', durationKey: 'projects.project_7.duration', clientKey: 'projects.project_7.client', descriptionKey: 'projects.project_7.description' },
    { id: 8, nameKey: 'projects.project_8.name', durationKey: 'projects.project_8.duration', clientKey: 'projects.project_8.client', descriptionKey: 'projects.project_8.description' },
    { id: 9, nameKey: 'projects.project_9.name', durationKey: 'projects.project_9.duration', clientKey: 'projects.project_9.client', descriptionKey: 'projects.project_9.description' },
    { id: 10, nameKey: 'projects.project_10.name', durationKey: 'projects.project_10.duration', clientKey: 'projects.project_10.client', descriptionKey: 'projects.project_10.description' }
  ];

  // Pole projektů s přeloženými texty, které se zobrazí v HTML
  projects: ProjectItem[] = [];

  private destroy$ = new Subject<void>(); // Pro správné odhlášení z odběrů

  constructor(private localizationService: LocalizationService) { }

  ngOnInit(): void {
    // Přihlásíme se k odběru změn překladů
    this.localizationService.currentTranslations$
      .pipe(takeUntil(this.destroy$)) // Automatické odhlášení při zničení komponenty
      .subscribe(translations => {
        if (translations) {
          // Naplnění proměnných s přeloženými texty
          this.header_1_text = this.localizationService.getText('projects.header_1');
          this.table_header_title_text = this.localizationService.getText('projects.table_header_title');
          this.table_header_duration_text = this.localizationService.getText('projects.table_header_duration');
          this.table_header_client_text = this.localizationService.getText('projects.table_header_client');
          this.more_button_prompt_text = this.localizationService.getText('projects.more_button_prompt');
          this.more_button_link_text = this.localizationService.getText('projects.more_button_link_text');

          // Načtení a naplnění pole projektů s přeloženými texty
          this.loadProjects();
        }
      });
  }

  // Metoda pro načtení a aktualizaci pole projektů
  private loadProjects(): void {
    this.projects = this.projectsConfig.map(config => ({
      id: config.id,
      name: this.localizationService.getText(config.nameKey),
      duration: this.localizationService.getText(config.durationKey),
      client: this.localizationService.getText(config.clientKey),
      description: this.localizationService.getText(config.descriptionKey),
      isActive: false // Výchozí stav
    }));
  }

  // Metoda pro přepínání stavu projektu (umožňuje více otevřených najednou)
  toggleProject(clickedProject: ProjectItem): void {
    clickedProject.isActive = !clickedProject.isActive;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}