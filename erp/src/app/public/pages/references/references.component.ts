import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocalizationService } from '../../services/localization.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface ProjectItemConfig {
  id: number;
  nameKey: string;
  durationKey: string;
  clientKey: string;
  descriptionKey: string;
}
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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReferencesComponent implements OnInit, OnDestroy {

  header_1_text: string = '';
  table_header_title_text: string = '';
  table_header_duration_text: string = '';
  table_header_client_text: string = '';
  more_button_prompt_text: string = '';
  more_button_link_text: string = '';
  projectsConfig: ProjectItemConfig[] = [
    { id: 1, nameKey: 'projects.project_1.name', durationKey: 'projects.project_1.duration', clientKey: 'projects.project_1.client', descriptionKey: 'projects.project_1.description' },
    { id: 2, nameKey: 'projects.project_2.name', durationKey: 'projects.project_2.duration', clientKey: 'projects.project_2.client', descriptionKey: 'projects.project_2.description' },
  ];
  projects: ProjectItem[] = [];
  private destroy$ = new Subject<void>();
  constructor(
    private localizationService: LocalizationService,
    private cdr: ChangeDetectorRef 
  ) { }

  ngOnInit(): void {
    this.localizationService.currentTranslations$
      .pipe(takeUntil(this.destroy$))
      .subscribe(translations => {
        if (translations && Object.keys(translations).length > 0) {
          this.header_1_text = this.localizationService.getText('projects.header_1');
          this.table_header_title_text = this.localizationService.getText('projects.table_header_title');
          this.table_header_duration_text = this.localizationService.getText('projects.table_header_duration');
          this.table_header_client_text = this.localizationService.getText('projects.table_header_client');
          this.more_button_prompt_text = this.localizationService.getText('projects.more_button_prompt');
          this.more_button_link_text = this.localizationService.getText('projects.more_button_link_text');
          this.loadProjects();
          this.cdr.detectChanges();
        }
      });
  }

  private loadProjects(): void {
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
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}