import { Component, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as Core from '../../../shared/imports/core-providers';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BaseDataComponent } from '../../components/base-data/base-data.component';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-edit-website',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './edit-website.component.html',
  styleUrls: ['./edit-website.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditWebsiteComponent extends BaseDataComponent<any> implements Core.OnInit, Core.OnDestroy {
  
  // Přidáno pro propojení s HTML a automatický loading
  public override loadingService = inject(LoadingService);

  override apiEndpoint = 'save-translations'; 

  currentLang: string = 'cz';
  translations: any = {}; 
  flattenedKeys: { path: string, value: string }[] = [];
  filteredKeys: { path: string, value: string }[] = [];
  
  searchQuery: string = '';

  constructor(
    protected override dataHandler: Core.DataHandler,
    protected override cd: ChangeDetectorRef, 
    protected override genericTableService: Core.GenericTableService, 
    private http: HttpClient,
  ) {
    super(dataHandler, cd, genericTableService);
  }
  override ngOnInit(): void {
    this.refreshTranslations();
  }

  public refreshTranslations(): void {
    this.errorMessage = null;
    this.cd.markForCheck();

    const url = `assets/i18n/${this.currentLang}.json?t=${new Date().getTime()}`;
    
    // HTTP GET v Angularu Interceptor zachytí a zapne loading
    this.http.get(url).pipe(
      Core.takeUntil(this.destroy$),
      Core.finalize(() => {
        this.cd.markForCheck();
        setTimeout(() => this.resizeAllTextareas(), 50);
      })
    ).subscribe({
      next: (data) => {
        this.translations = data;
        this.refreshFlattenedList();
        this.applyFilter();
      },
      error: () => {
        this.errorMessage = 'Nepodařilo se načíst soubor překladů.';
        this.alertDialogService.open('Chyba', `Nepodařilo se načíst ${this.currentLang}.json`, 'danger');
      }
    });
  }

  loadLang(lang: string): void {
    if (this.currentLang === lang) return;
    this.currentLang = lang;
    this.refreshTranslations();
  }

  refreshFlattenedList(): void {
    this.flattenedKeys = [];
    this.flattenObject(this.translations);
  }

  private flattenObject(obj: any, path: string = ''): void {
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

  onSubmit(): void {
    const payload = {
      lang: this.currentLang,
      data: this.translations
    };

    // dataHandler.post je zachycen interceptorem
    this.dataHandler.post(this.apiEndpoint, payload)
      .pipe(Core.takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.alertDialogService.open('Administrace', `Web byl úspěšně aktualizován (${this.currentLang}).`, 'success');
        },
        error: () => {
          this.alertDialogService.open('Chyba', 'Uložení na server selhalo. Zkontrolujte práva k zápisu.', 'danger');
        }
      });
  }

  trackByPath(index: number, item: any): string {
    return item.path;
  }
}