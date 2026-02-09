import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BaseDataComponent } from '../../../admin/components/base-data/base-data.component';
import { DataHandler } from '../../../core/services/data-handler.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './order-form.component.html',
  styleUrl: './order-form.component.css',
})
export class OrderFormComponent extends BaseDataComponent<any> implements OnInit {
  override apiEndpoint: string = 'sales_orders';
  
  orderForm!: FormGroup;
  leadId: string | null = null;
  isSubmitted = false;
  selectedFile: File | null = null;

  constructor(
    protected override dataHandler: DataHandler,
    protected override cd: ChangeDetectorRef,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    super(dataHandler, cd);
  }

  override ngOnInit(): void {
    super.ngOnInit();
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
      client_phone: ['', [
        Validators.pattern('^\\+?[0-9]*$'), 
        Validators.maxLength(20)
      ]],
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
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit(): void {
    if (this.orderForm.valid) {
      this.isLoading = true;
      this.cd.detectChanges();

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

      this.uploadData<any>(formData).pipe(
        finalize(() => {
          this.isLoading = false;
          this.cd.detectChanges();
        })
      ).subscribe({
        next: (response) => {
          this.isSubmitted = true;
          this.cd.markForCheck();
        },
        error: (err) => {
          console.error('Chyba při odesílání:', err);
        }
      });
    }
  }
}