import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocalizationService } from '../../services/localization.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-about-us', // Opraven selektor, aby odpovídal AboutUs
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.css',
  // OnPush fix pro spolehlivé přepínání jazyků
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutUsComponent implements OnInit, OnDestroy {

  // Proměnné pro statické texty v HTML
  header_1_text: string = '';
  p_1: string = '';
  p_2: string = '';
  p_3: string = '';
  p_4: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private localizationService: LocalizationService,
    private cdr: ChangeDetectorRef // Přidáno pro manuální detekci změn
  ) { }

  ngOnInit(): void {
    this.localizationService.currentTranslations$
      .pipe(takeUntil(this.destroy$))
      .subscribe(translations => {
        // Kontrola, zda máme reálná data v JSONu
        if (translations && Object.keys(translations).length > 0) {
          
          // Naplnění proměnných s přeloženými texty
          this.header_1_text = this.localizationService.getText('about-us.header');
          this.p_1 = this.localizationService.getText('about-us.paragraph_1');
          this.p_2 = this.localizationService.getText('about-us.paragraph_2');
          this.p_3 = this.localizationService.getText('about-us.paragraph_3');
          this.p_4 = this.localizationService.getText('about-us.paragraph_4');

          // Klíčový krok: Vynucení překreslení UI
          this.cdr.detectChanges();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}