import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

// Tvůj hromadný import pro služby a RxJS nástroje
import * as Web from '../../../shared/imports/web-providers';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacyPolicyComponent implements OnInit, OnDestroy {
  p: any = null; // Proměnná pro JSON data
  private destroy$ = new Web.Subject<void>();

  constructor(
    private localizationService: Web.LocalizationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.localizationService.currentTranslations$
      .pipe(Web.takeUntil(this.destroy$))
      .subscribe(translations => {
        if (translations && translations.privacy_policy) {
          this.p = translations.privacy_policy;
          this.cdr.detectChanges();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}