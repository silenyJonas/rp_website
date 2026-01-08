import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
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
  selector: 'app-references',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './references.component.html',
  styleUrl: './references.component.css',
  // Nastavení OnPush pro konzistentní chování s ostatními opravenými stránkami
  changeDetection: ChangeDetectionStrategy.OnPush
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
    { id: 5, nameKey: 'projects.project_5.name', durationKey: 'projects.project_5.duration', clientKey: 'projects.project_5.client', descriptionKey: 'projects.project_5.description' }
  ];

  // Pole projektů s přeloženými texty
  projects: ProjectItem[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private localizationService: LocalizationService,
    private cdr: ChangeDetectorRef // Přidáno pro manuální detekci změn
  ) { }

  ngOnInit(): void {
    this.localizationService.currentTranslations$
      .pipe(takeUntil(this.destroy$))
      .subscribe(translations => {
        // Kontrola, zda máme reálná data
        if (translations && Object.keys(translations).length > 0) {
          
          // Naplnění statických textů
          this.header_1_text = this.localizationService.getText('projects.header_1');
          this.table_header_title_text = this.localizationService.getText('projects.table_header_title');
          this.table_header_duration_text = this.localizationService.getText('projects.table_header_duration');
          this.table_header_client_text = this.localizationService.getText('projects.table_header_client');
          this.more_button_prompt_text = this.localizationService.getText('projects.more_button_prompt');
          this.more_button_link_text = this.localizationService.getText('projects.more_button_link_text');

          // Načtení projektů
          this.loadProjects();

          // Aktualizace UI
          this.cdr.detectChanges();
        }
      });
  }

  private loadProjects(): void {
    // Použití .map() vytvoří nové pole (novou referenci), což je pro OnPush ideální
    this.projects = this.projectsConfig.map(config => ({
      id: config.id,
      name: this.localizationService.getText(config.nameKey),
      duration: this.localizationService.getText(config.durationKey),
      client: this.localizationService.getText(config.clientKey),
      description: this.localizationService.getText(config.descriptionKey),
      isActive: false
    }));
  }

  toggleProject(clickedProject: ProjectItem): void {
    clickedProject.isActive = !clickedProject.isActive;
    // Musíme zavolat i zde, aby se projevilo rozbalení řádku v OnPush módu
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}