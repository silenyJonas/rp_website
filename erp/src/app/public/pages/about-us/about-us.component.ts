import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocalizationService } from '../../services/localization.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-references', // Selektor komponenty
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.css'
})
export class AboutUsComponent implements OnInit, OnDestroy {

  // Proměnné pro statické texty v HTML
  header_1_text: string = '';
  p_1: string = '';
  p_2: string = '';
  p_3: string = '';
  p_4: string = '';

  private destroy$ = new Subject<void>(); // Pro správné odhlášení z odběrů

  constructor(private localizationService: LocalizationService) { }

  ngOnInit(): void {
    // Přihlásíme se k odběru změn překladů
    this.localizationService.currentTranslations$
      .pipe(takeUntil(this.destroy$)) // Automatické odhlášení při zničení komponenty
      .subscribe(translations => {
        if (translations) {
          // Naplnění proměnných s přeloženými texty
          this.header_1_text = this.localizationService.getText('about-us.header');
          this.p_1 = this.localizationService.getText('about-us.paragraph_1');
          this.p_2 = this.localizationService.getText('about-us.paragraph_2');
          this.p_3 = this.localizationService.getText('about-us.paragraph_3');
          this.p_4 = this.localizationService.getText('about-us.paragraph_4');

          // Načtení a naplnění pole projektů s přeloženými texty
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}