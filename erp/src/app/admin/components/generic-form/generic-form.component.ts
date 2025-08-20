

import { Component, Input, Output, EventEmitter, ChangeDetectorRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, FormControl } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';

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
  editable?: boolean; // Jestli je pole editovatelné
  show_in_edit?: boolean; // Jestli se pole má zobrazit při editaci
  show_in_create?: boolean; // Jestli se pole má zobrazit při vytvoření
  hide_in_edit?: boolean;
}

@Component({
  selector: 'app-generic-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './generic-form.component.html',
  styleUrl: './generic-form.component.css',
})
export class GenericFormComponent implements OnInit {
  // Nový Input pro nadpis
  @Input() headerText: string = 'Vytvořit nový záznam';

  @Input() inputDefinitions: InputDefinition[] = [];
  @Output() formSubmitted = new EventEmitter<any>();
  @Output() formCanceled = new EventEmitter<void>();

  @ViewChild('genericForm') genericForm!: NgForm;

  formData: { [key: string]: any } = {};
  isSubmitting = false;
  // Nová proměnná pro zobrazení chyby neshody hesel
  passwordsNotMatching = false;

  // Input pro předání dat pro editaci
  @Input() formDataToEdit: any = null;
  @Input() passwordReset: boolean = false;
  
  // Proměnná pro uložení definicí polí, která se mají zobrazit
  visibleInputDefinitions: InputDefinition[] = [];

  // Nová proměnná pro uchování stavu, zda je role uživatele uzamčena
  isUserRoleLocked: boolean = false;

  constructor(private cd: ChangeDetectorRef, private authService: AuthService) {} // Vstříkněte AuthService

  ngOnInit(): void {
    console.log(this.formDataToEdit)

    const currentUserId = this.authService.getUserId();

    // Logika pro inicializaci formuláře na základě, zda se jedná o editaci nebo vytvoření
    if (this.formDataToEdit) {
      // Režim editace: naplníme formulář daty
      console.log('generic-form: Inicializace pro editaci s daty:', this.formDataToEdit);
      this.formData = { ...this.formDataToEdit };
      this.headerText = 'Editovat záznam';

      // Filtr na pole, která se mají v editaci zobrazit
      this.visibleInputDefinitions = this.inputDefinitions.filter(input =>
        input.show_in_edit !== false // Zobrazíme, pokud je true, undefined, nebo chybí
      );

      // Logika pro uzamčení role, pokud editujeme sebe sama
      if (currentUserId && this.formData['id'] == currentUserId) {
        this.isUserRoleLocked = true;
        console.log('Uživatel se pokouší editovat vlastní záznam. Pole pro roli bude uzamčeno.');
      }
    } else {
      // Režim vytvoření: inicializujeme prázdná data nebo defaultní hodnoty
      console.log('generic-form: Inicializace pro vytvoření nového záznamu.');
      this.formData = {};
      this.visibleInputDefinitions = this.inputDefinitions.filter(input =>
        input.show_in_create !== false // Zobrazíme, pokud je true, undefined, nebo chybí
      );
      this.visibleInputDefinitions.forEach(input => {
        this.formData[input.column_name] = input.defaultValue || '';
      });
    }
  }

  // Pomocná metoda pro získání FormControl
  getControl(columnName: string): FormControl | null {
    if (!this.genericForm) {
      return null;
    }
    return this.genericForm.controls[columnName] as FormControl || null;
  }

  // Metoda pro real-time kontrolu shody hesel
  checkPasswordMatch(): void {
    if (!this.passwordReset) {
      return;
    }
    const newPassword = this.formData['new_password'];
    const newPasswordConfirmation = this.formData['new_password_confirmation'];
    this.passwordsNotMatching = newPassword !== newPasswordConfirmation;
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

  // Metoda pro obsluhu kliknutí na overlay
  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  onCancel(): void {
    console.log('Formulář byl zrušen a zavřen.');
    this.formCanceled.emit();
  }

  onSubmit(form: NgForm, event?: Event): void {
    event?.preventDefault();
    if (this.isSubmitting) return;

    Object.keys(form.controls).forEach(field => {
      const control = form.controls[field];
      if (control) {
        control.markAsTouched();
        control.markAsDirty();
      }
    });

    // Spuštění kontroly shody hesel před odesláním
    if (this.passwordReset) {
      this.checkPasswordMatch();
      if (this.passwordsNotMatching) {
        console.warn('Formulář nelze odeslat. Hesla se neshodují.');
        return;
      }
    }

    if (form.valid) {
      this.isSubmitting = true;
      console.log('Odesílaná data:', this.formData);

      // Logika pro aktualizaci userEmail v AuthService
      const currentUserId = this.authService.getUserId();
      if (this.formDataToEdit && currentUserId && this.formDataToEdit['id'] == currentUserId) {
        // Kontrola, zda došlo ke změně e-mailu
        if (this.formData['user_email'] && this.formData['user_email'] !== this.authService.getUserEmail()) {
          this.authService.setUserEmail(this.formData['user_email']);
          console.log('User Email byl úspěšně aktualizován v Local Storage.');
        }
      }

      this.formSubmitted.emit({ ...this.formData });

      // Uzavření formuláře po odeslání, aby to bylo v souladu s rodičovským komponentem
      this.onCancel();

      this.isSubmitting = false;
    } else {
      console.warn('Formulář je neplatný. Opravte prosím chyby.');
    }
  }
}
