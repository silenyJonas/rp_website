import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BaseDataComponent } from '../../../admin/components/base-data/base-data.component';
import { DataHandler } from '../../../core/services/data-handler.service'; // Uprav cestu podle potřeby
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './order-form.component.html',
  styleUrl: './order-form.component.css',
})
export class OrderFormComponent extends BaseDataComponent<any> implements OnInit {
  // Definice endpointu pro BaseDataComponent
  override apiEndpoint: string = 'sales_orders';
  
  orderForm!: FormGroup;
  leadId: string | null = null;
  isSubmitted = false;

  constructor(
    protected override dataHandler: DataHandler,
    protected override cd: ChangeDetectorRef,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    // Volání konstruktoru BaseDataComponent
    super(dataHandler, cd);
  }

  override ngOnInit(): void {
    // Inicializace BaseDataComponent (pokud tam máš logiku, kterou potřebuješ)
    super.ngOnInit();

    // Extrakce ID z parametru (např. sales_lead_id=13)
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
      client_phone: [''],
      client_email: ['', [Validators.required, Validators.email]],
      order_description: ['', Validators.required],
      dataProcessingAgreement: [false, Validators.requiredTrue]
    });
  }

  onSubmit(): void {
    if (this.orderForm.valid) {
      this.isLoading = true;
      this.cd.detectChanges();

      // Použití metody postData z BaseDataComponent
      this.postData(this.orderForm.value).pipe(
        finalize(() => {
          this.isLoading = false;
          this.cd.detectChanges();
        })
      ).subscribe({
        next: (response) => {
          console.log('Data úspěšně uložena přes API:', response);
          this.isSubmitted = true;
          this.cd.markForCheck();
        },
        error: (err) => {
          console.error('Chyba při odesílání poptávky:', err);
          // Zde můžeš přidat zobrazení chybové hlášky pro uživatele
        }
      });
    }
  }
}