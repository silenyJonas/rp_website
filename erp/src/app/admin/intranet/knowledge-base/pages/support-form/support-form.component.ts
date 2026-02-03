import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BaseDataComponent } from '../../../../components/base-data/base-data.component';
import { DataHandler } from '../../../../../core/services/data-handler.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-support-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './support-form.component.html',
  styleUrl: './support-form.component.css',
})
export class SupportFormComponent extends BaseDataComponent<any> implements OnInit {
  // Cílíme na tabulku support_tickets přes API
  override apiEndpoint: string = 'support_tickets';
  
  supportForm!: FormGroup;
  isSubmitted = false;
  selectedFile: File | null = null;
  lastTicketId: number | null = null;

  constructor(
    protected override dataHandler: DataHandler,
    protected override cd: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    super(dataHandler, cd);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.initForm();
  }

  initForm(): void {
    this.supportForm = this.fb.group({
      category: ['it', Validators.required],
      priority: ['medium', Validators.required],
      subject: ['', Validators.required], // Odstraněna minLength
      description: ['', Validators.required] // Odstraněna minLength
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit(): void {
    if (this.supportForm.valid) {
      this.isLoading = true;
      this.cd.detectChanges();

      const formData = new FormData();
      // Automatické naplnění FormData z reaktivního formuláře
      Object.keys(this.supportForm.value).forEach(key => {
        formData.append(key, this.supportForm.value[key]);
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
          this.lastTicketId = response.id;
          this.cd.markForCheck();
        },
        error: (err) => {
          console.error('Chyba při odesílání ticketu:', err);
        }
      });
    }
  }
}