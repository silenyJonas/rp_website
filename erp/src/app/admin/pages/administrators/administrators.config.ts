import { Buttons } from '../../components/generic-table/generic-table.component';
import { InputDefinition } from '../../components/generic-form/generic-form.component';
import { ColumnDefinition } from '../../../shared/interfaces/generic-form-column-definiton';
import { FilterColumns } from '../../../shared/interfaces/filter-columns';
import { ItemDetailsColumns } from '../../../shared/interfaces/item-details-columns';

export const ROLE_OPTIONS = [
  { value: '1', label: 'sysadmin' },
  { value: '2', label: 'admin' },
  { value: '4', label: 'UI/UX Designer' },
  { value: '5', label: 'Salesman' },
];

export const BUTTONS: Buttons[] = [
  { display_name: '🔎', header_name: 'Detaily', isActive: true, type: 'info_button', action: 'details' },
  { display_name: '✒️', header_name: 'Edit', isActive: true, type: 'neutral_button', action: 'edit' },
  { display_name: '🔑', header_name: 'Heslo', isActive: true, type: 'neutral_button', action: 'password_reset' },
  { display_name: '🗑️', header_name: 'Smazat', isActive: true, type: 'delete_button', action: 'delete' },
];

export const RESET_PASSWORD_FORM_FIELDS: InputDefinition[] = [
  { column_name: 'old_password', label: 'Vaše aktuální heslo (potvrzení)', placeholder: 'Zadejte své heslo', type: 'password', required: true, editable: true, show_in_edit: true, show_in_create: true },
  { column_name: 'new_password', label: 'Nové heslo uživatele', placeholder: 'Minimálně 8 znaků', type: 'password', required: true, pattern: '^.{8,}$', errorMessage: 'Heslo musí mít 8 a více znaků', editable: true, show_in_edit: true, show_in_create: true },
  { column_name: 'new_password_confirmation', label: 'Potvrzení nového hesla', placeholder: 'Zadejte znovu nové heslo', type: 'password', required: true, pattern: '^.{8,}$', errorMessage: 'Heslo musí mít 8 a více znaků', editable: true, show_in_edit: true, show_in_create: true },
];

export const FORM_FIELDS: InputDefinition[] = [
  {
    column_name: 'user_email',
    label: 'Přihlašovací login',
    placeholder: 'Zadejte login',
    type: 'text',
    required: true,
    pattern: '^[a-zA-Z0-9._-]{3,20}$',
    errorMessage: 'Špatný formát (3-20 znaků, bez mezer)',
    editable: true, show_in_edit: true, show_in_create: true,
  },
  {
    column_name: 'full_name',
    label: 'Celé jméno',
    placeholder: 'Jméno a příjmení',
    type: 'text',
    required: true,
    errorMessage: 'Jméno je povinné',
    editable: true, show_in_edit: true, show_in_create: true,
  },
  {
    column_name: 'contact_email',
    label: 'Kontaktní e-mail',
    placeholder: 'jmeno@firma.cz',
    type: 'text',
    required: false,
    pattern: '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$',
    errorMessage: 'Neplatný formát e-mailu',
    editable: true, show_in_edit: true, show_in_create: true
  },
  {
    column_name: 'user_password_hash',
    label: 'Heslo',
    placeholder: 'Zadejte heslo',
    type: 'confirm-password',
    required: true,
    pattern: '^.{8,}$',
    errorMessage: 'Minimálně 8 znaků',
    editable: true, show_in_edit: false, show_in_create: true
  },
  {
    column_name: 'role_id',
    label: 'Role',
    type: 'select',
    options: ROLE_OPTIONS,
    required: true,
    editable: true, show_in_edit: true, show_in_create: true
  },
  { column_name: 'phone_number', label: 'Telefon', type: 'text', required: false, editable: true, show_in_edit: true, show_in_create: true },
  { column_name: 'birth_date', label: 'Datum narození', type: 'date', required: false, editable: true, show_in_edit: true, show_in_create: true },
  { column_name: 'personal_id_num', label: 'Rodné číslo', type: 'text', required: false, editable: true, show_in_edit: true, show_in_create: true },
  { column_name: 'address', label: 'Trvalé bydliště', type: 'text', required: false, editable: true, show_in_edit: true, show_in_create: true },
  { column_name: 'bank_account', label: 'Bankovní účet', type: 'text', required: false, editable: true, show_in_edit: true, show_in_create: true },
  { column_name: 'commission_rate', label: 'Provize (%)', type: 'number', required: true, editable: true, show_in_edit: true, show_in_create: true },
  { column_name: 'has_tax_declaration', label: 'Daňové prohlášení', type: 'checkbox', required: false, editable: true, show_in_edit: true, show_in_create: true },
  { column_name: 'internal_note', label: 'Poznámka', type: 'textarea', required: false, editable: true, show_in_edit: true, show_in_create: true }
];

export const TABLE_COLUMNS: ColumnDefinition[] = [
  { key: 'id', header: 'ID', type: 'text' },
  { key: 'full_name', header: 'Jméno', type: 'text' },
  { key: 'user_email', header: 'Login', type: 'text' },
  { key: 'roles.0.role_name', header: 'Role', type: 'text' },
  { key: 'last_login_at', header: 'Poslední log', type: 'date', format: 'short' },
];

export const TRASH_TABLE_COLUMNS: ColumnDefinition[] = [
  { key: 'id', header: 'ID', type: 'text' },
  { key: 'full_name', header: 'Jméno', type: 'text' },
  { key: 'user_email', header: 'Login', type: 'text' },
  { key: 'deleted_at', header: 'Smazáno', type: 'date', format: 'short' },
];

export const FILTER_COLUMNS: FilterColumns[] = [
  { key: 'id', header: 'ID', type: 'text', placeholder: 'ID', canSort: true },
  { key: 'full_name', header: 'Jméno', type: 'text', placeholder: 'Hledat jméno', canSort: true },
  { key: 'user_email', header: 'Login', type: 'text', placeholder: 'Hledat login', canSort: true },
  { 
    key: 'role_id', 
    header: 'Role', 
    type: 'select', 
    placeholder: '-- Vyberte roli --', 
    canSort: true,
    options: ROLE_OPTIONS.map(opt => opt.label) 
  }
];

export const DETAILS_COLUMNS: ItemDetailsColumns[] = [
  { key: 'id', displayName: 'ID uživatele', type: 'text' },
  { key: 'full_name', displayName: 'Celé jméno', type: 'text' },
  { key: 'user_email', displayName: 'Systémový Login', type: 'text' },
  { key: 'roles.0.role_name', displayName: 'Přiřazená role', type: 'text' },
  { key: 'contact_email', displayName: 'Soukromý e-mail', type: 'text' },
  { key: 'phone_number', displayName: 'Telefon', type: 'text' },
  { key: 'birth_date', displayName: 'Datum narození', type: 'date', format: 'medium' },
  { key: 'personal_id_num', displayName: 'Rodné číslo', type: 'text' },
  { key: 'address', displayName: 'Trvalé bydliště', type: 'text' },
  { key: 'bank_account', displayName: 'Bankovní účet', type: 'text' },
  { key: 'commission_rate', displayName: 'Sazba provize', type: 'text' },
  { key: 'has_tax_declaration', displayName: 'Daňové prohlášení', type: 'text' },
  { key: 'internal_note', displayName: 'Interní poznámka', type: 'text' },
  { key: 'created_at', displayName: 'Účet vytvořen', type: 'date', format: 'medium' },
  { key: 'updated_at', displayName: 'Poslední změna údajů', type: 'date', format: 'medium' }
];