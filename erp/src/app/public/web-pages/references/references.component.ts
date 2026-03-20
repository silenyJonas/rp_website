import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Web from '../../../shared/imports/web-providers';

@Component({
  selector: 'app-references',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './references.component.html',
  styleUrl: './references.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReferencesComponent implements OnInit, OnDestroy {
  r: any = null;

  private destroy$ = new Web.Subject<void>();

  constructor(
    private localizationService: Web.LocalizationService,
    private cdr: ChangeDetectorRef 
  ) { }

  ngOnInit(): void {
    this.localizationService.currentTranslations$
      .pipe(Web.takeUntil(this.destroy$))
      .subscribe(translations => {
        if (translations && translations.projects) {
          this.r = translations.projects;
          Object.keys(this.r).forEach(key => {
            if (key.startsWith('project_') && typeof this.r[key] === 'object') {
              this.r[key].isActive = false;
            }
          });

          this.cdr.detectChanges();
        }
      });
  }

  toggleProject(project: any): void {
    project.isActive = !project.isActive;
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}