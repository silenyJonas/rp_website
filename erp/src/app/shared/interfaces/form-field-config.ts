// shared/interfaces/form-field-config.ts

// Toto rozhraní bude používat GenericFormComponent
// Label, placeholder a options.label mohou být buď přímý text, nebo klíč.
// Způsob, jak říct, že se jedná o klíč, bude prostřednictvím `isLocalized: true` nebo podobně.
// Nebo prostě předpokládat, že pokud začínají např. "form.field.name", jsou to klíče.
// Pro jednoduchost a explicitnost přidáme `isLocalized` property na každý textový řetězec, který chceme lokalizovat.

export interface FormFieldOption {
  value: string | number;
  label: string; // Může být klíč nebo přímý text
  isLocalizedLabel?: boolean; // True, pokud je 'label' klíč k překladu
}

export interface FormFieldConfig {
  name: string;
  type: 'text' | 'email' | 'tel' | 'password' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox';
  label: string; // Může být klíč nebo přímý text
  isLocalizedLabel?: boolean; // True, pokud je 'label' klíč k překladu
  placeholder?: string; // Může být klíč nebo přímý text
  isLocalizedPlaceholder?: boolean; // True, pokud je 'placeholder' klíč k překladu
  value?: any;
  required?: boolean;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  rows?: number;
  disabled?: boolean;
  options?: FormFieldOption[];
}