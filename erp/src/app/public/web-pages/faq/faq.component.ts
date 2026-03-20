import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

// Tvůj hromadný import pro služby a RxJS nástroje
import * as Web from '../../../shared/imports/web-providers';

import { FaqItem } from '../../../shared/interfaces/faq-item';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush 
})
export class FaqComponent implements Web.OnInit, Web.OnDestroy {
  t: any = null;
  faqItems: FaqItem[] = [];

  ig_icon: string = 'assets/images/icons/ig.png';
  email_icon: string = 'assets/images/icons/email.png';

  private destroy$ = new Web.Subject<void>();

  constructor(
    private localizationService: Web.LocalizationService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.localizationService.currentTranslations$
      .pipe(Web.takeUntil(this.destroy$))
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