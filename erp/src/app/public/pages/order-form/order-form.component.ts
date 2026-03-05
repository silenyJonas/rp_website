import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { PublicDataService } from '../../services/public-data.service';
import { LocalizationService } from '../../services/localization.service';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './order-form.component.html',
  styleUrl: './order-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderFormComponent implements OnInit, OnDestroy {
  orderForm!: FormGroup;
  leadId: string | null = null;
  isSubmitted = false;
  isLoading = false; 
  selectedFile: File | null = null;
  errorMessage: string | null = null;
  
  f: any = null; // Proměnná pro překlady
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private publicDataService: PublicDataService,
    private localizationService: LocalizationService
  ) {}

  ngOnInit(): void {
    // Lokalizace
    this.localizationService.currentTranslations$
      .pipe(takeUntil(this.destroy$))
      .subscribe(translations => {
        if (translations?.order_form) {
          this.f = translations.order_form;
          this.cd.markForCheck();
        }
      });

    const param = this.route.snapshot.paramMap.get('leadParam');
    if (param && param.includes('=')) {
      this.leadId = param.split('=')[1];
    }
    this.initForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.orderForm = this.fb.group({
      lead_id: [this.leadId],
      client_name: ['', Validators.required],
      ico: ['', [Validators.pattern('^[0-9]*$')]],
      client_address: [''],
      client_phone: ['', [Validators.pattern('^\\+?[0-9]*$'), Validators.maxLength(20)]],
      client_email: ['', [Validators.required, Validators.email]],
      order_description: ['', Validators.required],
      dataProcessingAgreement: [false, Validators.requiredTrue],
      tosAgreement: [false, Validators.requiredTrue]
    });
  }
  
  get btnText(): string {
    if (!this.f) return '...';
    return this.isLoading ? this.f.buttons.sending : this.f.buttons.send;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.cd.markForCheck();
    }
  }

  onSubmit(): void {
    if (this.orderForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = null;

    const formData = new FormData();
    Object.keys(this.orderForm.value).forEach(key => {
      const value = this.orderForm.value[key];
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    if (this.selectedFile) {
      formData.append('attachment', this.selectedFile, this.selectedFile.name);
    }

    this.publicDataService.submitOrder(formData).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cd.markForCheck();
      })
    ).subscribe({
      next: () => {
        this.isSubmitted = true;
        this.cd.markForCheck();
      },
      error: (err) => {
        this.errorMessage = this.f.errors.submit_error;
        console.error('Chyba při odesílání:', err);
        this.cd.markForCheck();
      }
    });
  }
}