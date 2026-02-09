//rozhraní pro jednotlivou položku dropdownu u formfield dropdownu
export interface FormFieldOption {
  value: string | number;
  label: string;
  isLocalizedLabel?: boolean;
}

//rozhraní pro jeden input ve formu
export interface FormFieldConfig {
  name: string;
  type: 'text' | 'email' | 'tel' | 'password' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox';
  label: string;
  isLocalizedLabel?: boolean;
  placeholder?: string;
  isLocalizedPlaceholder?: boolean; 
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