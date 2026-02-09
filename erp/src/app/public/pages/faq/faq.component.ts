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

  header_1_text: string = '';
  write_us_prompt_text: string = '';
  faqItems: FaqItem[] = [];

  ig_icon: string = 'assets/images/icons/ig.png';
  in_icon: string = 'assets/images/icons/fb.png';
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
        if (translations && Object.keys(translations).length > 0) {
          this.header_1_text = this.localizationService.getText('faq.header_1');
          this.write_us_prompt_text = this.localizationService.getText('faq.write_us_prompt');
          this.loadFaqItems();
          this.cdr.detectChanges();
        }
      });
  }

  private loadFaqItems(): void {
    const newFaqItems: FaqItem[] = [];
    for (let i = 1; i <= 6; i++) {
      const question = this.localizationService.getText(`faq.question_${i}`);
      const answer = this.localizationService.getText(`faq.answer_${i}`);
      if (question && answer) {
        newFaqItems.push({
          question: question,
          answer: answer,
          isActive: false
        });
      }
    }
    this.faqItems = newFaqItems;
  }

  toggleFaq(item: FaqItem): void {
    item.isActive = !item.isActive;
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}