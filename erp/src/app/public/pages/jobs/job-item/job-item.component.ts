import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { finalize, takeUntil } from 'rxjs/operators';

import { BaseDataComponent } from '../../../../admin/components/base-data/base-data.component';
import { DataHandler } from '../../../../core/services/data-handler.service';
import { GenericTableService } from '../../../../core/services/generic-table.service';
import { LocalizationService } from '../../../services/localization.service';

@Component({
  selector: 'app-job-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './job-item.component.html',
  styleUrl: './job-item.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
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
    protected override genericTableService: GenericTableService, 
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private localizationService: LocalizationService
  ) {
    super(dataHandler, cd, genericTableService);
  }

  override ngOnInit(): void {
    this.initForm();
    
    this.localizationService.currentTranslations$
      .pipe(takeUntil(this.destroy$))
      .subscribe(translations => {
        if (translations && Object.keys(translations).length > 0) {
          this.loadJobData();
          this.cd.markForCheck();
        }
      });
  }

  private initForm(): void {
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
    if (this.isLoading) return 'Odesílám...';
    return this.localizationService.getText('job_detail.form.submit_btn') || 'Odeslat přihlášku';
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.cd.markForCheck();
    }
  }

  onSubmit(): void {
    if (this.applicationForm.invalid || !this.selectedFile) {
      this.applicationForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.cd.markForCheck();

    const formData = new FormData();
    
    Object.keys(this.applicationForm.value).forEach(key => {
      const value = this.applicationForm.value[key];
      if (value !== null && value !== undefined) {
        const finalValue = key === 'dataProcessingAgreement' ? (value ? '1' : '0') : value;
        formData.append(key, finalValue);
      }
    });

    if (this.job) {
      formData.append('position_name', this.job.title);
    }
    formData.append('cv_file', this.selectedFile, this.selectedFile.name);

    this.uploadData<any>(formData).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cd.markForCheck();
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.isSubmitted = true;
        this.cd.markForCheck();
      },
      error: (err) => {
        this.errorMessage = 'Omlouváme se, přihlášku se nepodařilo odeslat. Zkuste to prosím později.';
        console.error('Chyba při odesílání přihlášky:', err);
      }
    });
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
}