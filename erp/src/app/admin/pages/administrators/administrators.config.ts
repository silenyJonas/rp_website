
import { Buttons } from '../../components/generic-table/generic-table.component';
import { InputDefinition } from '../../components/generic-form/generic-form.component';
import { ColumnDefinition } from '../../../shared/interfaces/generic-form-column-definiton';
import { FilterColumns } from '../../../shared/interfaces/filter-columns';
import { ItemDetailsColumns } from '../../../shared/interfaces/item-details-columns';

export const BUTTONS: Buttons[] = [
  { display_name: '🔎',header_name: 'Detaily',  isActive: true, type: 'info_button', action: 'details' },
  { display_name: '✒️', header_name: 'Edit', isActive: true, type: 'neutral_button', action: 'edit' },
  { display_name: 'Reset', header_name: 'Heslo', isActive: true, type: 'neutral_button', action: 'password_reset' },
  { display_name: '🗑️', header_name: 'Del', isActive: true, type: 'delete_button', action: 'delete' },
];

export const RESET_PASSWORD_FORM_FIELDS: InputDefinition[] = [
  {
    column_name: 'current_user_id',
    label: '',
    placeholder: '',
    type: 'hidden',
    required: false,
    pattern: '',
    errorMessage: '',
    editable: false,
    show_in_edit: true,
    show_in_create: false,
    hide_in_edit: false
  },
  {
    column_name: 'target_user_id',
    label: '',
    placeholder: '',
    type: 'hidden',
    required: false,
    pattern: '',
    errorMessage: '',
    editable: false,
    show_in_edit: true,
    show_in_create: false,
    hide_in_edit: false
  },
  {
    column_name: 'old_password',
    label: 'Heslo aktuálně přihlášeného uživatele',
    placeholder: 'Zadejte heslo aktuálně přihlášeného uživatele',
    type: 'password',
    required: true,
    pattern: '',
    errorMessage: 'špatný formát',
    editable: true,
    show_in_edit: true,
    show_in_create: true,
    hide_in_edit: true
  },
  {
    column_name: 'new_password',
    label: 'Nové heslo vybraného uživatele',
    placeholder: 'Zadejte nové heslo uživatele',
    type: 'password',
    required: true,
    pattern: '^.{8,}$',
    errorMessage: 'Heslo musí mít 8 a více znaků',
    editable: true,
    show_in_edit: true,
    show_in_create: true,
    hide_in_edit: true
  },
  {
    column_name: 'new_password_confirmation',
    label: 'Potvrzení nového hesla vybraného uživatele',
    placeholder: 'Zadejte potvrzení nového hesla vybraného uživatele',
    type: 'password',
    required: true,
    pattern: '^.{8,}$',
    errorMessage: 'Heslo musí mít 8 a více znaků',
    editable: true,
    show_in_edit: true,
    show_in_create: true,
    hide_in_edit: true
  },
];

export const FORM_FIELDS: InputDefinition[] = [
  {
    column_name: 'user_email',
    label: 'Přihlašovací login',
    placeholder: 'Zadejte login',
    type: 'text',
    required: true,
    pattern: '^[a-zA-Z0-9._-]{3,20}$',
    errorMessage: 'špatný formát (3-20 znaků, bez mezer)',
    editable: true,
    show_in_edit: true,
    show_in_create: true,
  },
  {
    column_name: 'contact_email',
    label: 'Kontaktní e-mail',
    placeholder: 'jmeno@firma.cz',
    type: 'text',
    required: false,
    pattern: '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$',
    errorMessage: 'Neplatný formát e-mailu',
    editable: true,
    show_in_edit: true,
    show_in_create: true
  },
  {
    column_name: 'full_name',
    label: 'Celé jméno',
    placeholder: 'Jméno a příjmení',
    type: 'text',
    required: true,
    errorMessage: 'Jméno je povinné',
    editable: true,
    show_in_edit: true,
    show_in_create: true,
  },
  {
    column_name: 'user_password_hash',
    label: 'Heslo',
    placeholder: 'Zadejte heslo',
    type: 'password',
    required: true,
    pattern: '^.{8,}$',
    errorMessage: 'Zadejte heslo minimálně 8 znaků',
    editable: true,
    show_in_edit: false,
    show_in_create: true
  },
  {
    column_name: 'role_id',
    label: 'Role',
    placeholder: '',
    type: 'select',
    options: [
      { value: '1', label: 'sysadmin' },
      { value: '2', label: 'admin' },
      { value: '4', label: 'UI/UX Designer' },
      { value: '5', label: 'Salesman' },
    ],
    required: true,
    errorMessage: 'Pole je povinné.',
    editable: true,
    show_in_edit: true,
    show_in_create: true
  },
  {
    column_name: 'phone_number',
    label: 'Telefon',
    placeholder: '+420 ...',
    type: 'text',
    required: false,
    editable: true,
    show_in_edit: true,
    show_in_create: true
  },
  {
    column_name: 'birth_date',
    label: 'Datum narození',
    type: 'date',
    required: false,
    editable: true,
    show_in_edit: true,
    show_in_create: true
  },
  {
    column_name: 'personal_id_num',
    label: 'Rodné číslo',
    placeholder: 'xxxxxx/xxxx',
    type: 'text',
    required: false,
    editable: true,
    show_in_edit: true,
    show_in_create: true
  },
  {
    column_name: 'address',
    label: 'Trvalé bydliště',
    placeholder: 'Ulice, město, PSČ',
    type: 'text',
    required: false,
    editable: true,
    show_in_edit: true,
    show_in_create: true
  },
  {
    column_name: 'bank_account',
    label: 'Bankovní účet',
    placeholder: 'číslo účtu / kód banky',
    type: 'text',
    required: false,
    editable: true,
    show_in_edit: true,
    show_in_create: true
  },
  {
    column_name: 'health_insurance',
    label: 'Pojišťovna (kód)',
    placeholder: 'např. 111',
    type: 'text',
    required: false,
    editable: true,
    show_in_edit: true,
    show_in_create: true
  },
  {
    column_name: 'commission_rate',
    label: 'Provize (%)',
    type: 'number',
    required: true,
    errorMessage: 'Zadejte % marže',
    editable: true,
    show_in_edit: true,
    show_in_create: true
  },
  {
    column_name: 'has_tax_declaration',
    label: 'Daňové prohlášení (růžové)',
    type: 'checkbox',
    required: false,
    editable: true,
    show_in_edit: true,
    show_in_create: true
  },
  {
    column_name: 'internal_note',
    label: 'Poznámka',
    placeholder: 'Interní poznámka k uživateli',
    type: 'textarea',
    required: false,
    editable: true,
    show_in_edit: true,
    show_in_create: true
  }
];

export const STATUS_OPTIONS: string[] = ['Nově zadané', 'Zpracovává se', 'Dokončeno', 'Zrušeno'];
export const PRIORITY_OPTIONS: string[] = ['Nízká', 'Neutrální', 'Vysoká'];

export const TABLE_COLUMNS: ColumnDefinition[] = [
  { key: 'id', header: 'ID', type: 'text' },
  { key: 'full_name', header: 'Jméno', type: 'text' },
  { key: 'user_email', header: 'Login', type: 'text' },
  { key: 'commission_rate', header: 'Provize %', type: 'text' },
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
  {
    key: 'user_login_id',
    header: 'ID',
    type: 'text',
    placeholder: 'Hledat podle ID',
    canSort: true,
  },
  {
    key: 'full_name',
    header: 'Jméno',
    type: 'text',
    placeholder: 'Hledat podle jména',
    canSort: true,
  },
  {
    key: 'user_email',
    header: 'Login',
    type: 'text',
    placeholder: 'Hledat podle loginu',
    canSort: true,
  },
  {
    key: 'contact_email',
    header: 'Kontaktní e-mail',
    type: 'text',
    placeholder: 'Hledat podle e-mailu',
    canSort: true,
  },
  {
    key: 'personal_id_num',
    header: 'Rodné číslo',
    type: 'text',
    placeholder: 'Hledat podle RČ',
    canSort: true,
  },
  {
    key: 'role_name',
    header: 'Role',
    type: 'text',
    placeholder: 'Hledat podle role',
    canSort: true,
  }
];

export const DETAILS_COLUMNS: ItemDetailsColumns[] = [
  { key: 'id', displayName: 'ID', type: 'text' },
  { key: 'full_name', displayName: 'Celé jméno', type: 'text' },
  { key: 'user_email', displayName: 'Login', type: 'text' },
  { key: 'contact_email', displayName: 'Kontaktní e-mail', type: 'text' },
  { key: 'phone_number', displayName: 'Telefon', type: 'text' },
  { key: 'birth_date', displayName: 'Datum narození', type: 'date', format: 'medium' },
  { key: 'personal_id_num', displayName: 'Rodné číslo', type: 'text' },
  { key: 'address', displayName: 'Adresa', type: 'text' },
  { key: 'bank_account', displayName: 'Účet', type: 'text' },
  { key: 'commission_rate', displayName: 'Sazba provize', type: 'text' },
  { key: 'dpp_hours_spent', displayName: 'Odpracováno (DPP)', type: 'text' },
  { key: 'has_tax_declaration', displayName: 'Daňové prohlášení', type: 'text' },
  { key: 'internal_note', displayName: 'Poznámka', type: 'text' },
  { key: 'roles.0.role_name', displayName: 'Role', type: 'text' },
  { key: 'created_at', displayName: 'Vytvořen', type: 'date', format: 'medium' },
  { key: 'updated_at', displayName: 'Změněn', type: 'date', format: 'medium' }
];