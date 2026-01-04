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
  
  // ZDE DOPÍŠEŠ SVŮJ ENDPOINT
  apiEndpoint = 'save-translations'; 

  currentLang: string = 'cz';
  translations: any = {};
  flattenedKeys: { path: string, value: string }[] = [];
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
        this.flattenedKeys.push({ path: newPath, value: obj[key] });
      }
    }
  }

  updateValue(path: string, newValue: string): void {
    const keys = path.split('.');
    let temp = this.translations;
    for (let i = 0; i < keys.length - 1; i++) {
      temp = temp[keys[i]];
    }
    temp[keys[keys.length - 1]] = newValue;
  }

  /**
   * Odeslání dat podobně jako v PersonalInfoComponent
   */
  onSubmit(): void {
    this.isLoading = true;
    const payload = {
      lang: this.currentLang,
      data: this.translations
    };

    console.log('Odesílaná data překladů:', payload);

    // Použijeme dataHandler pro odeslání (post/update záleží na tvém DataHandleru)
    this.dataHandler.post(this.apiEndpoint, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;
          this.alertDialogService.open(
            'Administrace',
            `Soubor ${this.currentLang}.json byl úspěšně uložen.`,
            'success'
          );
          this.cd.markForCheck();
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Chyba při ukládání:', err);
          this.alertDialogService.open(
            'Chyba',
            'Nepodařilo se uložit změny na server.',
            'danger'
          );
          this.cd.markForCheck();
        }
      });
  }

  get filteredKeys() {
    return this.flattenedKeys.filter(k => 
      k.path.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
      k.value.toString().toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }
}