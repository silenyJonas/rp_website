import { Component, Input, Output, EventEmitter, ChangeDetectorRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, FormControl } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';

export interface InputDefinition {
  column_name: string;
  label: string;
  placeholder?: string;
  type: string;
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  errorMessage?: string;
  options?: { value: string; label: string }[];
  defaultValue?: any;
  step?: number;
  editable?: boolean;
  show_in_edit?: boolean;
  show_in_create?: boolean;
  hide_in_edit?: boolean;
}

@Component({
  selector: 'app-generic-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './generic-form.component.html',
  styleUrl: './generic-form.component.css',
})
export class GenericFormComponent implements OnInit, OnDestroy {
  @Input() headerText: string = 'Vytvořit nový záznam';

  @Input() inputDefinitions: InputDefinition[] = [];
  @Output() formSubmitted = new EventEmitter<any>();
  @Output() formCanceled = new EventEmitter<void>();

  @ViewChild('genericForm') genericForm!: NgForm;

  formData: { [key: string]: any } = {};
  confirmPasswordData: { [key: string]: string } = {}; // Pro pomocné potvrzovací pole
  isSubmitting = false;
  passwordsNotMatching = false;

  @Input() formDataToEdit: any = null;
  @Input() passwordReset: boolean = false;
  
  visibleInputDefinitions: InputDefinition[] = [];
  isUserRoleLocked: boolean = false;

  constructor(private cd: ChangeDetectorRef, private authService: AuthService) {}

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';

    const currentUserId = this.authService.getUserId();

    if (this.formDataToEdit) {
      this.formData = { ...this.formDataToEdit };
      this.headerText = 'Editovat záznam';

      this.visibleInputDefinitions = this.inputDefinitions.filter(input =>
        input.show_in_edit !== false
      );

      if (currentUserId && this.formData['id'] == currentUserId) {
        this.isUserRoleLocked = true;
      }
    } else {
      this.formData = {};
      this.visibleInputDefinitions = this.inputDefinitions.filter(input =>
        input.show_in_create !== false
      );
      this.visibleInputDefinitions.forEach(input => {
        this.formData[input.column_name] = input.defaultValue || '';
      });
    }
  }

  ngOnDestroy(): void {
    document.body.style.overflow = 'auto';
  }

  onFileChange(event: any, columnName: string): void {
    const file = event.target.files[0];
    if (file) {
      this.formData[columnName] = file;
    }
  }

  getControl(columnName: string): FormControl | null {
    if (!this.genericForm) return null;
    return this.genericForm.controls[columnName] as FormControl || null;
  }

  // Sjednocená funkce pro kontrolu shody hesel
  checkPasswordMatch(columnName?: string): void {
    // 1. Logika pro speciální režim passwordReset (staré chování)
    if (this.passwordReset && !columnName) {
      const newPassword = this.formData['new_password'];
      const newPasswordConfirmation = this.formData['new_password_confirmation'];
      this.passwordsNotMatching = newPassword !== newPasswordConfirmation;
      return;
    }

    // 2. Logika pro dynamický typ 'confirm-password'
    if (columnName) {
      const original = this.formData[columnName];
      const confirmation = this.confirmPasswordData[columnName];
      this.passwordsNotMatching = (original !== confirmation) && !!confirmation;
    }
  }

  getValidationErrorMessage(control: FormControl | null, fieldDefinition: InputDefinition): string | null {
    if (!control || !control.invalid || (!control.dirty && !control.touched)) {
      return null;
    }

    if (control.errors?.['required']) return fieldDefinition.errorMessage || 'Toto pole je povinné.';
    if (control.errors?.['pattern']) return fieldDefinition.errorMessage || 'Neplatný formát.';
    if (control.errors?.['email']) return fieldDefinition.errorMessage || 'Neplatný formát e-mailu.';
    if (control.errors?.['min']) return `Minimální hodnota je ${fieldDefinition.min}.`;
    if (control.errors?.['max']) return `Maximální hodnota je ${fieldDefinition.max}.`;

    return null;
  }

  onSliderChange(input: InputDefinition): void {}

  onFormClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  onCancel(): void {
    this.formCanceled.emit();
  }

  onSubmit(form: NgForm, event?: Event): void {
    event?.preventDefault();
    if (this.isSubmitting) return;

    // Označit všechna pole jako dotčená pro zobrazení validací
    Object.keys(form.controls).forEach(field => {
      const control = form.controls[field];
      if (control) {
        control.markAsTouched();
        control.markAsDirty();
      }
    });

    // Kontrola shody hesel před odesláním (pro oba případy)
    if (this.passwordReset) {
      this.checkPasswordMatch();
    }
    
    this.visibleInputDefinitions.forEach(input => {
      if (input.type === 'confirm-password') {
        this.checkPasswordMatch(input.column_name);
      }
    });

    if (this.passwordsNotMatching) {
      console.warn('Formulář nelze odeslat. Hesla se neshodují.');
      return;
    }

    if (form.valid) {
      this.isSubmitting = true;
      
      let hasFile = false;
      Object.keys(this.formData).forEach(key => {
        if (this.formData[key] instanceof File) hasFile = true;
      });

      if (hasFile) {
        const formDataPayload = new FormData();
        Object.keys(this.formData).forEach(key => {
          const value = this.formData[key];
          if (value instanceof File) {
            formDataPayload.append(key, value, value.name);
          } else if (value !== null && value !== undefined) {
            formDataPayload.append(key, String(value));
          }
        });
        this.formSubmitted.emit(formDataPayload);
      } else {
        this.formSubmitted.emit({ ...this.formData });
      }

      this.onCancel();
      this.isSubmitting = false;
    } else {
      console.warn('Formulář je neplatný.');
    }
  }
}