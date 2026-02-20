import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { PublicDataService } from '../../services/public-data.service';
@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './order-form.component.html',
  styleUrl: './order-form.component.css',
})
export class OrderFormComponent implements OnInit {
  orderForm!: FormGroup;
  leadId: string | null = null;
  isSubmitted = false;
  isLoading = false; 
  selectedFile: File | null = null;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private publicDataService: PublicDataService 
  ) {}

  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('leadParam');
    if (param && param.includes('=')) {
      this.leadId = param.split('=')[1];
    }
    this.initForm();
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
    return this.isLoading ? 'Odesílám...' : 'Odeslat poptávku';
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) this.selectedFile = file;
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
      },
      error: (err) => {
        this.errorMessage = 'Omlouváme se, objednávku se nepodařilo odeslat.';
        console.error('Chyba při odesílání:', err);
      }
    });
  }
}