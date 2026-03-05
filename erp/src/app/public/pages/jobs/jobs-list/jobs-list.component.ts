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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobsListComponent implements OnInit, OnDestroy {
  t: any = null;
  availableJobs: JobItem[] = [];

  ig_icon: string = 'assets/images/icons/ig.png';
  email_icon: string = 'assets/images/icons/email.png';

  private destroy$ = new Subject<void>();

  constructor(
    private localizationService: LocalizationService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.localizationService.currentTranslations$
      .pipe(takeUntil(this.destroy$))
      .subscribe(translations => {
        if (translations?.careers) {
          this.t = translations; // Ukládáme celý objekt pro přístup ke careers i job_detail
          this.loadJobs();
          this.cdr.markForCheck();
        }
      });
  }

  private loadJobs(): void {
    const jobs: JobItem[] = [];
    // Logika procházení jobů zůstává, mapujeme na tvé klíče job_1, job_2...
    for (let i = 1; i <= 10; i++) {
      const id = this.t.careers[`job_${i}_id`];
      const title = this.t.careers[`job_${i}_title`];
      const desc = this.t.careers[`job_${i}_short_desc`];

      if (id && title && desc) {
        jobs.push({ id, title, shortDescription: desc });
      }
    }
    this.availableJobs = jobs;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}