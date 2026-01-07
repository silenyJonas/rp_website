import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DataHandler } from '../../../core/services/data-handler.service';
import { BaseDataComponent } from '../../components/base-data/base-data.component';
import { AlertDialogService } from '../../../core/services/alert-dialog.service';
import { takeUntil, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-edit-website',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './edit-website.component.html',
  styleUrls: ['./edit-website.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditWebsiteComponent extends BaseDataComponent<any> implements OnInit, OnDestroy {
  
  override apiEndpoint = 'save-translations'; 

  currentLang: string = 'cz';
  translations: any = {}; 
  flattenedKeys: { path: string, value: string }[] = [];
  filteredKeys: { path: string, value: string }[] = [];
  
  searchQuery: string = '';
  override isLoading: boolean = false;

  constructor(
    protected override dataHandler: DataHandler,
    protected override cd: ChangeDetectorRef,
    private http: HttpClient,
    private alertDialogService: AlertDialogService
  ) {
    super(dataHandler, cd);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    // Načte data z assets pouze při prvním vstupu
    this.forceFullRefresh();
  }

  /**
   * Načte data z fyzického souboru (pouze start nebo změna jazyka)
   */
  public forceFullRefresh(): void {
    this.isLoading = true;
    this.cd.detectChanges();

    const url = `assets/i18n/${this.currentLang}.json?t=${new Date().getTime()}`;
    
    this.http.get(url).pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isLoading = false;
        this.cd.detectChanges();
        setTimeout(() => this.resizeAllTextareas(), 10);
      })
    ).subscribe({
      next: (data) => {
        this.translations = data;
        this.refreshFlattenedList();
        this.applyFilter();
      },
      error: () => {
        this.alertDialogService.open('Chyba', `Nepodařilo se načíst překlady.`, 'danger');
      }
    });
  }

  loadLang(lang: string): void {
    if (this.currentLang === lang) return;
    this.currentLang = lang;
    this.forceFullRefresh();
  }

  refreshFlattenedList(): void {
    this.flattenedKeys = [];
    this.flattenObject(this.translations);
  }

  flattenObject(obj: any, path: string = ''): void {
    for (const key in obj) {
      const newPath = path ? `${path}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.flattenObject(obj[key], newPath);
      } else {
        this.flattenedKeys.push({ path: newPath, value: obj[key] ?? '' });
      }
    }
  }

  applyFilter(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredKeys = [...this.flattenedKeys];
    } else {
      this.filteredKeys = this.flattenedKeys.filter(k => 
        k.path.toLowerCase().includes(query) || 
        String(k.value || '').toLowerCase().includes(query)
      );
    }
    this.cd.markForCheck();
  }

  resetFilter(): void {
    this.searchQuery = '';
    this.applyFilter();
    setTimeout(() => this.resizeAllTextareas(), 10);
  }

  adjustHeight(event: any): void {
    const element = event.target;
    element.style.height = 'auto';
    element.style.height = element.scrollHeight + 'px';
  }

  private resizeAllTextareas(): void {
    const textareas = document.querySelectorAll('.edit-input');
    textareas.forEach((ta: any) => {
      ta.style.height = 'auto';
      ta.style.height = ta.scrollHeight + 'px';
    });
  }

  /**
   * Klíčová metoda: Udržuje data v "cache" (this.translations) neustále aktuální
   */
  updateValue(path: string, newValue: string): void {
    const keys = path.split('.');
    let temp = this.translations;
    for (let i = 0; i < keys.length - 1; i++) {
      temp = temp[keys[i]];
    }
    temp[keys[keys.length - 1]] = newValue;

    const item = this.flattenedKeys.find(k => k.path === path);
    if (item) item.value = newValue;
  }

  /**
   * Odešle data na server a po úspěchu pouze oznámí výsledek
   * BEZ reloadu stránky nebo nového stahování JSONu
   */
  onSubmit(): void {
    this.isLoading = true;
    this.cd.detectChanges();

    const payload = {
      lang: this.currentLang,
      data: this.translations
    };

    this.dataHandler.post(this.apiEndpoint, payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
          this.cd.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          this.alertDialogService.open('Administrace', `Změny uloženy v paměti i na serveru.`, 'success');
          // Zde záměrně nevoláme forceFullRefresh(), aby se tabulka neztratila a nenačítala znovu
        },
        error: (err) => {
          this.alertDialogService.open('Chyba', 'Uložení na server selhalo.', 'danger');
        }
      });
  }

  trackByPath(index: number, item: any): string {
    return item.path;
  }
}