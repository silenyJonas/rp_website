import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { takeUntil, finalize } from 'rxjs/operators';
import { DataHandler } from '../../../core/services/data-handler.service';
import { BaseDataComponent } from '../../components/base-data/base-data.component';
import { GenericTableService } from '../../../core/services/generic-table.service';
import { AlertDialogService } from '../../../core/services/alert-dialog.service';

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

  constructor(
    protected override dataHandler: DataHandler,
    protected override cd: ChangeDetectorRef,
    protected override genericTableService: GenericTableService, 
    private http: HttpClient,
    private alertDialogService: AlertDialogService
  ) {
    super(dataHandler, cd, genericTableService);
  }

  override ngOnInit(): void {
    this.refreshTranslations();
  }
  public refreshTranslations(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cd.markForCheck();

    const url = `assets/i18n/${this.currentLang}.json?t=${new Date().getTime()}`;
    
    this.http.get(url).pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isLoading = false;
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
    this.isLoading = true;
    this.cd.markForCheck();

    const payload = {
      lang: this.currentLang,
      data: this.translations
    };

    this.dataHandler.post(this.apiEndpoint, payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
          this.cd.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          this.alertDialogService.open('Administrace', `Web byl úspěšně aktualizován (${this.currentLang}).`, 'success');
        },
        error: (err) => {
          this.alertDialogService.open('Chyba', 'Uložení na server selhalo. Zkontrolujte práva k zápisu.', 'danger');
        }
      });
  }

  trackByPath(index: number, item: any): string {
    return item.path;
  }
}