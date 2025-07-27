// src/app/shared/interfaces/form-field-config.interface.ts

export interface FormFieldConfig {
  label: string; // Popisek pole
  name: string; // Název pole (pro ngModel a name atribut)
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'password' | 'number'; // Typ inputu
  required?: boolean; // Je pole povinné?
  pattern?: string; // Regulární výraz pro validaci (pro typy input)
  options?: { value: string; label: string; }[]; // Možnosti pro select a radio
  placeholder?: string; // Zástupný text pro inputy
  rows?: number; // Počet řádků pro textarea
  value?: any; // Počáteční hodnota pole
  min?: number; // Minimální hodnota pro number input
  max?: number; // Maximální hodnota pro number input
  minLength?: number; // Minimální délka pro textové inputy/textarea
  maxLength?: number; // Maximální délka pro textové inputy/textarea
  disabled?: boolean; // Je pole zakázané?
}