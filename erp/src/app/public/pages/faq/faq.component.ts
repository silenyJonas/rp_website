// src/app/faq/faq.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocalizationService } from '../../services/localization.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Rozhraní pro FAQ položku
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
  styleUrls: ['./faq.component.css']
})
export class FaqComponent implements OnInit, OnDestroy {

  // Proměnné pro všechny texty, které se zobrazí v HTML
  header_1_text: string = '';
  write_us_prompt_text: string = '';
  faqItems: FaqItem[] = [];

  // Ikonky (tyto se nemusí překládat, jen se načte cesta k nim)
  ig_icon: string = 'assets/images/icons/ig.png';
  in_icon: string = 'assets/images/icons/fb.png';
  email_icon: string = 'assets/images/icons/email.png';

  private destroy$ = new Subject<void>(); // Pro správné odhlášení z odběrů

  constructor(private localizationService: LocalizationService) {} // Zde může být private, protože ji v HTML přímo nevoláme

  ngOnInit(): void {
    // Přihlásíme se k odběru změn překladů
    this.localizationService.currentTranslations$
      .pipe(takeUntil(this.destroy$)) // Automatické odhlášení při zničení komponenty
      .subscribe(translations => {
        if (translations) {
          // Naplnění proměnných s přeloženými texty
          this.header_1_text = this.localizationService.getText('faq.header_1');
          this.write_us_prompt_text = this.localizationService.getText('faq.write_us_prompt');
          this.loadFaqItems(); // Voláme metodu pro načtení FAQ položek s novým jazykem
        }
      });
  }

  private loadFaqItems(): void {
    this.faqItems = []; // Vyprázdníme pole před novým naplněním
    for (let i = 1; i <= 6; i++) { // Předpokládáme 6 FAQ položek
      const questionKey = `faq.question_${i}`;
      const answerKey = `faq.answer_${i}`;

      const question = this.localizationService.getText(questionKey);
      const answer = this.localizationService.getText(answerKey);

      if (question && answer) {
        this.faqItems.push({
          question: question,
          answer: answer,
          isActive: false
        });
      }
    }
  }

  // Metoda pro přepínání FAQ položek (zůstává stejná)
  toggleFaq(item: FaqItem): void {
    item.isActive = !item.isActive;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}