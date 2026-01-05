import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DataHandler } from '../../../core/services/data-handler.service';
import { BaseDataComponent } from '../../components/base-data/base-data.component';
import { AlertDialogService } from '../../../core/services/alert-dialog.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent extends BaseDataComponent<any> implements OnInit, OnDestroy {
  
  apiEndpoint = 'save-translations'; 

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
    this.loadLang(this.currentLang);
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  loadLang(lang: string): void {
    this.currentLang = lang;
    this.http.get(`assets/i18n/${lang}.json?t=${new Date().getTime()}`).subscribe({
      next: (data) => {
        this.translations = data;
        this.refreshFlattenedList();
        this.applyFilter();
        this.cd.markForCheck();
      }
    });
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
        // Ošetření null hodnoty pomocí ?? ''
        this.flattenedKeys.push({ path: newPath, value: obj[key] ?? '' });
      }
    }
  }

  applyFilter(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredKeys = [...this.flattenedKeys];
    } else {
      this.filteredKeys = this.flattenedKeys.filter(k => {
        const pathMatch = k.path.toLowerCase().includes(query);
        // Bezpečný převod na string pro vyhledávání v hodnotách
        const valueStr = String(k.value || '').toLowerCase();
        const valueMatch = valueStr.includes(query);
        return pathMatch || valueMatch;
      });
    }
    this.cd.markForCheck();
  }

  resetFilter(): void {
    this.searchQuery = '';
    this.applyFilter();
  }

  updateValue(path: string, newValue: string): void {
    const keys = path.split('.');
    let temp = this.translations;
    for (let i = 0; i < keys.length - 1; i++) {
      temp = temp[keys[i]];
    }
    temp[keys[keys.length - 1]] = newValue;

    const item = this.flattenedKeys.find(k => k.path === path);
    if (item) {
      item.value = newValue;
    }
  }

  onSubmit(): void {
    this.isLoading = true;
    const payload = {
      lang: this.currentLang,
      data: this.translations
    };

    this.dataHandler.post(this.apiEndpoint, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.alertDialogService.open('Administrace', `Soubor ${this.currentLang}.json byl uložen.`, 'success');
          this.cd.markForCheck();
        },
        error: (err) => {
          this.isLoading = false;
          console.error(err);
          this.alertDialogService.open('Chyba', 'Nepodařilo se uložit změny.', 'danger');
          this.cd.markForCheck();
        }
      });
  }

  trackByPath(index: number, item: any): string {
    return item.path;
  }
}