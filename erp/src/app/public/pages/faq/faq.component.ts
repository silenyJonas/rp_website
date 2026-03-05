import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocalizationService } from '../../services/localization.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface FaqItem {
  question: string;
  answer: string;
  isActive: boolean;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush 
})
export class FaqComponent implements OnInit, OnDestroy {
  t: any = null;
  faqItems: FaqItem[] = [];

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
        if (translations?.faq) {
          this.t = translations.faq;
          this.loadFaqItems();
          this.cdr.markForCheck();
        }
      });
  }

  private loadFaqItems(): void {
    const newFaqItems: FaqItem[] = [];
    // Projdeme JSON a hledáme dvojice otázka/odpověď (limit 20 je pro jistotu)
    for (let i = 1; i <= 20; i++) {
      const q = this.t[`question_${i}`];
      const a = this.t[`answer_${i}`];
      if (q && a) {
        newFaqItems.push({ question: q, answer: a, isActive: false });
      }
    }
    this.faqItems = newFaqItems;
  }

  toggleFaq(item: FaqItem): void {
    item.isActive = !item.isActive;
    this.cdr.markForCheck(); // Efektivnější než detectChanges()
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}