// src/app/generic-form/generic-form.component.ts

import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { FormFieldConfig } from '../../../shared/interfaces/form-field-config';
@Component({
  selector: 'app-generic-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './generic-form.component.html',
  styleUrl: './generic-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenericFormComponent implements OnInit {

  @Input() form_header: string = '';
  @Input() form_description: string = '';
  @Input() form_button: string = '';

  @Input() formConfig: FormFieldConfig[] = [];
  @Output() formSubmitted = new EventEmitter<any>();
  @Output() formReset = new EventEmitter<void>();

  formData: { [key: string]: any } = {};
  @ViewChild('dynamicForm') dynamicForm!: NgForm;

  isLoading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.initializeFormData();
  }

  // Pomocná metoda pro inicializaci dat formuláře
  private initializeFormData(): void {
    this.formData = {}; // Vždy začít s prázdným objektem
    this.formConfig.forEach(field => {
      // Použijeme nullish coalescing pro nastavení výchozí hodnoty
      this.formData[field.name] = field.value ?? null;
      if (field.type === 'checkbox' && field.value === undefined) {
        this.formData[field.name] = false;
      }
    });
  }

  onSubmit(): void {
    if (this.dynamicForm.valid) {
      this.isLoading = true;
      this.errorMessage = null;
      this.successMessage = null;

      console.log('Odesílám data formuláře:', this.formData);

      setTimeout(() => {
        this.isLoading = false;
        const success = Math.random() > 0.2;

        if (success) {
          this.successMessage = 'Formulář byl úspěšně odeslán!';
          this.formSubmitted.emit(this.formData);
          // Zde je klíčová změna: Resetujeme form data až PO odeslání a zobrazení úspěšné zprávy.
          // Ale stav `NgForm` resetujeme až po návratu z úspěšné zprávy, abychom udrželi `dirty` a `touched` pro UX
          // (nebo resetujeme všechno hned, záleží na preferenci).
          // Pro zobrazení potvrzení a následný reset na prázdný formulář:
          this.initializeFormData(); // Vyčistí data pro příští zobrazení formuláře
        } else {
          this.errorMessage = 'Při odesílání formuláře nastala chyba. Zkuste to prosím znovu.';
        }
        this.cd.detectChanges();
      }, 1500);
    } else {
      this.errorMessage = 'Prosím vyplňte všechna povinná pole a opravte chyby.';
      this.cd.detectChanges();
    }
  }

  onReset(): void {
    this.initializeFormData(); // Znovu inicializujeme formData na výchozí hodnoty
    if (this.dynamicForm) {
      // Klíčové: Resetujeme stav formuláře pomocí resetForm() metody NgForm
      // Předáním formData zajistíme, že formulář se resetuje na počáteční hodnoty
      // a stav validace (dirty/touched) se vyčistí.
      this.dynamicForm.resetForm(this.formData);
    }
    this.errorMessage = null;
    this.successMessage = null;
    this.isLoading = false;
    this.formReset.emit();
    this.cd.detectChanges();
  }

  getValidationErrors(fieldName: string): string | null {
    const control = this.dynamicForm?.controls[fieldName];
    if (control && control.invalid && (control.dirty || control.touched)) {
      if (control.errors?.['required']) {
        return 'Toto pole je povinné.';
      }
      if (control.errors?.['email']) {
        return 'Zadejte platnou e-mailovou adresu.';
      }
      if (control.errors?.['pattern']) {
        return 'Neplatný formát.';
      }
      if (control.errors?.['minlength']) {
        return `Minimální délka je ${control.errors['minlength'].requiredLength} znaků.`;
      }
      if (control.errors?.['maxlength']) {
        return `Maximální délka je ${control.errors['maxlength'].requiredLength} znaků.`;
      }
      if (control.errors?.['min']) {
        return `Minimální hodnota je ${control.errors['min'].min}.`;
      }
      if (control.errors?.['max']) {
        return `Maximální hodnota je ${control.errors['max'].max}.`;
      }
      return 'Neplatná hodnota.';
    }
    return null;
  }
}