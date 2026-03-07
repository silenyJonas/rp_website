import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BaseDataComponent } from '../../../../components/base-data/base-data.component';
import { DataHandler } from '../../../../../core/services/data-handler.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { GenericTableService } from '../../../../../core/services/generic-table.service'; 
import { LoadingService } from '../../../../../core/services/loading.service';

@Component({
  selector: 'app-support-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './support-form.component.html',
  styleUrl: './support-form.component.css',
})
export class SupportFormComponent extends BaseDataComponent<any> implements OnInit {
  // Propojení na globální loading stav
  public override loadingService = inject(LoadingService);
  
  override apiEndpoint: string = 'support_tickets';
  
  supportForm!: FormGroup;
  isSubmitted = false;
  selectedFile: File | null = null;
  lastTicketId: number | null = null;

  constructor(
    protected override dataHandler: DataHandler,
    protected override cd: ChangeDetectorRef,
    protected override genericTableService: GenericTableService, 
    private fb: FormBuilder
  ) {
    super(dataHandler, cd, genericTableService);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.initForm();
  }

  initForm(): void {
    this.supportForm = this.fb.group({
      category: ['it', Validators.required],
      priority: ['medium', Validators.required],
      subject: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.cd.markForCheck();
    }
  }

  onSubmit(): void {
    if (this.supportForm.valid) {
      // Stav isLoading už neřešíme ručně, interceptor ho zapne automaticky
      const formData = new FormData();
      Object.keys(this.supportForm.value).forEach(key => {
        formData.append(key, this.supportForm.value[key]);
      });

      if (this.selectedFile) {
        formData.append('attachment', this.selectedFile, this.selectedFile.name);
      }

      this.uploadData<any>(formData).subscribe({
        next: (response: any) => { 
          this.isSubmitted = true;
          this.lastTicketId = response.id;
          this.cd.markForCheck();
        },
        error: (err: any) => {
          console.error('Chyba při odesílání ticketu:', err);
          this.cd.markForCheck();
        }
      });
    }
  }
}