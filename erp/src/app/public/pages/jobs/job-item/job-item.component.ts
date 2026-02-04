import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BaseDataComponent } from '../../../../admin/components/base-data/base-data.component';
import { DataHandler } from '../../../../core/services/data-handler.service';
import { LocalizationService } from '../../../services/localization.service';
import { finalize, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-job-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './job-item.component.html',
  styleUrl: './job-item.component.css',
})
export class JobItemComponent extends BaseDataComponent<any> implements OnInit, OnDestroy {
  override apiEndpoint: string = 'job_applications';
  
  applicationForm!: FormGroup;
  job: any = null;
  back_link_text: string = '';
  isSubmitted = false;
  selectedFile: File | null = null;

  constructor(
    protected override dataHandler: DataHandler,
    protected override cd: ChangeDetectorRef,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private localizationService: LocalizationService
  ) {
    super(dataHandler, cd);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.initForm();
    
    this.localizationService.currentTranslations$
      .pipe(takeUntil(this.destroy$))
      .subscribe(translations => {
        if (translations && Object.keys(translations).length > 0) {
          this.loadJobData();
          this.cd.detectChanges();
        }
      });
  }

  initForm(): void {
    this.applicationForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      message: [''],
      dataProcessingAgreement: [false, Validators.requiredTrue]
    });
  }

  get btnText(): string {
    return this.isLoading ? 'Odesílám...' : 'Odeslat přihlášku';
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.cd.detectChanges();
    }
  }

  onSubmit(): void {
    if (this.applicationForm.valid && this.selectedFile) {
      this.isLoading = true;
      this.cd.detectChanges();

      const formData = new FormData();
      
      // Textová pole
      Object.keys(this.applicationForm.value).forEach(key => {
        const value = this.applicationForm.value[key];
        if (value !== null && value !== undefined) {
          const finalValue = key === 'dataProcessingAgreement' ? (value ? '1' : '0') : value;
          formData.append(key, finalValue);
        }
      });

      // Pozice a soubor
      if (this.job) {
        formData.append('position_name', this.job.title);
      }
      formData.append('cv_file', this.selectedFile, this.selectedFile.name);

      this.uploadData<any>(formData).pipe(
        finalize(() => {
          this.isLoading = false;
          this.cd.detectChanges();
        }),
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.isSubmitted = true;
          this.cd.markForCheck();
        },
        error: (err) => {
          console.error('Chyba při odesílání:', err);
          this.cd.detectChanges();
        }
      });
    }
  }

  private loadJobData(): void {
    const jobId = this.route.snapshot.paramMap.get('id');
    this.back_link_text = this.localizationService.getText('job_detail.back_link');
    
    if (jobId) {
      const title = this.localizationService.getText(`job_detail.${jobId}.title`);
      const content = this.localizationService.getText(`job_detail.${jobId}.content`);
      if (title && content) {
        this.job = { title, fullContent: content };
      }
    }
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}