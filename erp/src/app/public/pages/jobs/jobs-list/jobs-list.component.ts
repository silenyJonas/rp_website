import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocalizationService } from '../../../services/localization.service';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface JobItem {
  id: string;
  title: string;
  shortDescription: string;
}

@Component({
  selector: 'app-jobs-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './jobs-list.component.html',
  styleUrls: ['./jobs-list.component.css'],
  // Přidáno OnPush pro garantovanou synchronizaci překladů
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobsListComponent implements OnInit, OnDestroy {

  header_1_text: string = '';
  write_us_prompt_text: string = '';
  availableJobs: JobItem[] = [];

  // Ikonky (cesty zůstávají, jen zajistíme jejich zobrazení)
  ig_icon: string = 'assets/images/icons/ig.png';
  in_icon: string = 'assets/images/icons/fb.png';
  email_icon: string = 'assets/images/icons/email.png';

  private destroy$ = new Subject<void>();

  constructor(
    private localizationService: LocalizationService,
    private cdr: ChangeDetectorRef // Klíčové pro opravu bugu
  ) {}

  ngOnInit(): void {
    this.localizationService.currentTranslations$
      .pipe(takeUntil(this.destroy$))
      .subscribe(translations => {
        // Kontrola, zda už máme načtený JSON
        if (translations && Object.keys(translations).length > 0) {
          
          this.header_1_text = this.localizationService.getText('careers.header_1');
          this.write_us_prompt_text = this.localizationService.getText('careers.write_us_prompt');

          // Dynamické načtení pozic z JSONu
          this.loadJobs();

          // Okamžité překreslení s novým jazykem
          this.cdr.detectChanges();
        }
      });
  }

  private loadJobs(): void {
    const jobs: JobItem[] = [];
    // Cyklus projde pozice v JSONu (např. job_1 až job_5)
    for (let i = 1; i <= 2; i++) {
      const id = this.localizationService.getText(`careers.job_${i}_id`);
      const title = this.localizationService.getText(`careers.job_${i}_title`);
      const desc = this.localizationService.getText(`careers.job_${i}_short_desc`);

      if (id && title && desc) {
        jobs.push({
          id: id,
          title: title,
          shortDescription: desc
        });
      }
    }
    // Přiřazení nového pole (imutabilita)
    this.availableJobs = jobs;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}