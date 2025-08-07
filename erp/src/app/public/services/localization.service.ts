// src/app/services/localization.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs'; // Přidáme 'of'
import { catchError, tap } from 'rxjs/operators'; // Přidáme 'tap'

@Injectable({
  providedIn: 'root'
})
export class LocalizationService {
  private defaultLanguage: string = 'cz'; // Výchozí jazyk
  private currentLanguageSource = new BehaviorSubject<string>(this.defaultLanguage);
  public currentLanguage$ = this.currentLanguageSource.asObservable();

  // --- ZMĚNA ZDE: Nový BehaviorSubject pro překlady ---
  private currentTranslationsSource = new BehaviorSubject<any>(null);
  public currentTranslations$: Observable<any> = this.currentTranslationsSource.asObservable();

  private translations: any = {}; // Uložíme zde aktuální překlady

  constructor(private http: HttpClient) {
    this.loadInitialLanguage();
    // Nasloucháme změnám jazyka a načítáme překlady
    this.currentLanguage$.subscribe(lang => {
      this.loadTranslations(lang);
    });
  }

  private loadInitialLanguage(): void {
    const storedLang = localStorage.getItem('selectedLanguage');
    if (storedLang && ['cz', 'sk', 'en'].includes(storedLang)) { // Kontrola platnosti uloženého jazyka
      this.currentLanguageSource.next(storedLang);
    } else {
      this.currentLanguageSource.next(this.defaultLanguage);
    }
  }

  private loadTranslations(languageCode: string): void {
    this.http.get(`assets/i18n/${languageCode}.json`).pipe(
      tap(data => {
        this.translations = data;
        this.currentTranslationsSource.next(this.translations); // <--- Publikujeme nové překlady
      }),
      catchError(error => {
        // Volitelná logika: načíst výchozí jazyk, pokud vybraný selže
        if (languageCode !== this.defaultLanguage) {
          this.loadTranslations(this.defaultLanguage); // Rekurzivně načíst výchozí jazyk
        } else {
          // Pokud selže i výchozí jazyk, můžeme nastavit prázdné překlady
          this.translations = {};
          this.currentTranslationsSource.next(this.translations);
        }
        return of({}); // Vrátíme prázdný objekt, aby observable nespadlo
      })
    ).subscribe();
  }

  public setLanguage(languageCode: string): void {
    if (this.currentLanguageSource.getValue() !== languageCode && ['cz', 'sk', 'en'].includes(languageCode)) {
      localStorage.setItem('selectedLanguage', languageCode);
      this.currentLanguageSource.next(languageCode); // Toto spustí `loadTranslations` v rámci odběru
    }
  }

  public getText(key: string): string {
    // Rozdělíme klíč na části (např. "faq.question_1" -> ["faq", "question_1"])
    const keys = key.split('.');
    let current: any = this.translations;

    // Projdeme strukturu JSONu
    for (const k of keys) {
      if (current && typeof current === 'object' && current.hasOwnProperty(k)) {
        current = current[k];
      } else {
        // Klíč nebyl nalezen
        return key; // Vrátíme samotný klíč, aby bylo vidět, co chybí
      }
    }
    // Pokud je hodnota string, vrátíme ji, jinak varování (např. pokud klíč vede na objekt)
    return typeof current === 'string' ? current : key;
  }
}