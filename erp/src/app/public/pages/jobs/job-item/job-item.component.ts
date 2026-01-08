import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LocalizationService } from '../../../services/localization.service';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-job-item',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './job-item.component.html',
  styleUrl: './job-item.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobItemComponent implements OnInit, OnDestroy {
  job: any = null;
  back_link_text: string = '';
  apply_btn_text: string = '';
  not_found_text: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private localizationService: LocalizationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.localizationService.currentTranslations$
      .pipe(takeUntil(this.destroy$))
      .subscribe(translations => {
        if (translations && Object.keys(translations).length > 0) {
          this.loadJobData();
          this.cdr.detectChanges();
        }
      });
  }

  private loadJobData() {
    const jobId = this.route.snapshot.paramMap.get('id');
    this.back_link_text = this.localizationService.getText('job_detail.back_link');
    this.apply_btn_text = this.localizationService.getText('job_detail.apply_button');
    this.not_found_text = this.localizationService.getText('job_detail.not_found');

    if (jobId) {
      // Dynamicky sestavíme klíč pro překlad na základě ID z URL
      const title = this.localizationService.getText(`job_detail.${jobId}.title`);
      const content = this.localizationService.getText(`job_detail.${jobId}.content`);

      if (title && content) {
        this.job = { title, fullContent: content };
      } else {
        this.job = null;
      }
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}