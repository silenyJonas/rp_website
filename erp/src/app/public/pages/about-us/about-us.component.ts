import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocalizationService } from '../../services/localization.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutUsComponent implements OnInit, OnDestroy {
  header_1_text: string = '';
  p_1: string = '';
  p_2: string = '';
  p_3: string = '';
  p_4: string = '';

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
          this.header_1_text = this.localizationService.getText('about-us.header');
          this.p_1 = this.localizationService.getText('about-us.paragraph_1');
          this.p_2 = this.localizationService.getText('about-us.paragraph_2');
          this.p_3 = this.localizationService.getText('about-us.paragraph_3');
          this.p_4 = this.localizationService.getText('about-us.paragraph_4');
          this.cdr.detectChanges();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}