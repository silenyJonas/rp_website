import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BaseDataComponent } from '../../../../components/base-data/base-data.component';
import { DataHandler } from '../../../../../core/services/data-handler.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { GenericTableService } from '../../../../../core/services/generic-table.service'; // Import přidán

@Component({
  selector: 'app-support-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './support-form.component.html',
  styleUrl: './support-form.component.css',
})
export class SupportFormComponent extends BaseDataComponent<any> implements OnInit {
  override apiEndpoint: string = 'support_tickets';
  
  supportForm!: FormGroup;
  isSubmitted = false;
  selectedFile: File | null = null;
  lastTicketId: number | null = null;

  constructor(
    protected override dataHandler: DataHandler,
    protected override cd: ChangeDetectorRef,
    protected override genericTableService: GenericTableService, // Přidáno pro rodičovskou třídu
    private fb: FormBuilder
  ) {
    // Předáváme všechny 3 parametry do super konstruktoru
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
    }
  }

  onSubmit(): void {
    if (this.supportForm.valid) {
      this.isLoading = true;
      this.cd.detectChanges();

      const formData = new FormData();
      Object.keys(this.supportForm.value).forEach(key => {
        formData.append(key, this.supportForm.value[key]);
      });

      if (this.selectedFile) {
        formData.append('attachment', this.selectedFile, this.selectedFile.name);
      }

      // Využíváme metodu uploadData z BaseDataComponent
      this.uploadData<any>(formData).pipe(
        finalize(() => {
          this.isLoading = false;
          this.cd.detectChanges();
        })
      ).subscribe({
        next: (response: any) => { // Přidáno :any pro opravu Implicit Any
          this.isSubmitted = true;
          this.lastTicketId = response.id;
          this.cd.markForCheck();
        },
        error: (err: any) => {
          console.error('Chyba při odesílání ticketu:', err);
        }
      });
    }
  }
}