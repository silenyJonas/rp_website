import { Component, Input, Output, EventEmitter, ChangeDetectorRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, FormControl } from '@angular/forms';

// Rozšířené rozhraní pro definici pole ve formuláři
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
}

@Component({
  selector: 'app-generic-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './generic-form.component.html',
  styleUrl: './generic-form.component.css',
})
export class GenericFormComponent implements OnInit {
  // Nový Input pro nadpis, který nahrazuje `formTitle`
  @Input() headerText: string = 'Vytvořit nový záznam';
  
  @Input() inputDefinitions: InputDefinition[] = [];
  @Output() formSubmitted = new EventEmitter<any>();
  @Output() formCanceled = new EventEmitter<void>();

  @ViewChild('genericForm') genericForm!: NgForm;

  formData: { [key: string]: any } = {};
  isSubmitting = false;

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Inicializace formData s defaultními hodnotami, pokud jsou definovány
    this.inputDefinitions.forEach(input => {
      this.formData[input.column_name] = input.defaultValue || '';
    });
  }

  // Pomocná metoda pro získání FormControl
  getControl(columnName: string): FormControl | null {
    if (!this.genericForm) {
      return null;
    }
    return this.genericForm.controls[columnName] as FormControl || null;
  }

  // Pomocná metoda pro získání chybové hlášky
  getValidationErrorMessage(control: FormControl | null, fieldDefinition: InputDefinition): string | null {
    if (!control || !control.invalid || (!control.dirty && !control.touched)) {
      return null;
    }

    if (control.errors?.['required']) {
      return fieldDefinition.errorMessage || 'Toto pole je povinné.';
    }
    if (control.errors?.['pattern']) {
      return fieldDefinition.errorMessage || 'Neplatný formát.';
    }
    if (control.errors?.['email']) {
      return fieldDefinition.errorMessage || 'Neplatný formát e-mailu.';
    }
    if (control.errors?.['min']) {
      return `Minimální hodnota je ${fieldDefinition.min}.`;
    }
    if (control.errors?.['max']) {
      return `Maximální hodnota je ${fieldDefinition.max}.`;
    }

    return null;
  }

  onSliderChange(input: InputDefinition): void {
    // Zde můžete implementovat dynamickou změnu stylu slideru
  }

  onFormClick(event: MouseEvent): void {
    event.stopPropagation();
  }
  
  // Nová metoda pro zrušení formuláře
  onCancel(): void {
    // Před zavřením vypíšeme zprávu do konzole
    console.log('Formulář byl zrušen a zavřen.');
    this.formCanceled.emit();
  }

  onSubmit(form: NgForm, event?: Event): void {
    event?.preventDefault();
    if (this.isSubmitting) return;

    // Vynucení dotyku a dirty stavu pro zobrazení chyb
    Object.keys(form.controls).forEach(field => {
      const control = form.controls[field];
      if (control) {
        control.markAsTouched();
        control.markAsDirty();
      }
    });

    if (form.valid) {
      this.isSubmitting = true;
      // Výpis dat do konzole před odesláním
      console.log('Odesílaná data:', this.formData);

      this.formSubmitted.emit(this.formData);

      // Simulace odeslání, po kterém se formulář resetuje
      setTimeout(() => {
        form.resetForm();
        this.isSubmitting = false;
        this.formCanceled.emit(); // Zavřeme formulář po úspěšném odeslání
      }, 1000);
    } else {
      console.warn('Formulář je neplatný. Opravte prosím chyby.');
    }
  }
}
