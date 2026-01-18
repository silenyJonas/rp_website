import { Buttons } from '../../components/generic-table/generic-table.component';
import { InputDefinition } from '../../components/generic-form/generic-form.component';
import { ColumnDefinition } from '../../../shared/interfaces/generic-form-column-definiton';
import { FilterColumns } from '../../../shared/interfaces/filter-columns';
import { ItemDetailsColumns } from '../../../shared/interfaces/item-details-columns';

export const BUTTONS: Buttons[] = [
  { display_name: 'Detaily', isActive: true, type: 'info_button', action: 'details' },
  { display_name: 'Editovat', isActive: true, type: 'neutral_button', action: 'edit' },
  { display_name: 'Nove button', isActive: false, type: 'neutral_button', action: '' },
  { display_name: 'Reset Hesla', isActive: true, type: 'neutral_button', action: 'password_reset' },
  { display_name: 'Smazat', isActive: true, type: 'delete_button', action: 'delete' },
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
    label: 'Přihlašovací login', // Změněno z email na login
    placeholder: 'Zadejte login',
    type: 'text',
    required: true,
    pattern: '^[a-zA-Z0-9._-]{3,20}$',
    errorMessage: 'špatný formát',
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
  }
];

export const STATUS_OPTIONS: string[] = ['Nově zadané', 'Zpracovává se', 'Dokončeno', 'Zrušeno'];
export const PRIORITY_OPTIONS: string[] = ['Nízká', 'Neutrální', 'Vysoká'];

export const TABLE_COLUMNS: ColumnDefinition[] = [
  { key: 'id', header: 'ID', type: 'text' },
  { key: 'user_email', header: 'Login', type: 'text' }, // Vizuálně změněno na Login
  { key: 'last_login_at', header: 'Naposled přihlášen', type: 'date', format: 'short' },
  { key: 'created_at', header: 'Vytvořen', type: 'date', format: 'short' },
  { key: 'updated_at', header: 'Změněn', type: 'date', format: 'short' },
  { key: 'roles.0.role_name', header: 'Role', type: 'text' },
];

export const TRASH_TABLE_COLUMNS: ColumnDefinition[] = [
  { key: 'id', header: 'ID', type: 'text' },
  { key: 'user_email', header: 'Login', type: 'text' }, // Vizuálně změněno na Login
  { key: 'last_login_at', header: 'Naposled přihlášen', type: 'date', format: 'short' },
  { key: 'created_at', header: 'Vytvořen', type: 'date', format: 'short' },
  { key: 'updated_at', header: 'Změněn', type: 'date', format: 'short' },
  { key: 'roles.0.role_name', header: 'Role', type: 'text' },
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
    key: 'user_email',
    header: 'Login', // Vizuálně změněno na Login
    type: 'text',
    placeholder: 'Hledat podle loginu',
    canSort: true,
  },
  {
    key: 'last_login_at',
    header: 'Naposled přihlášen',
    type: 'text',
    placeholder: 'Filtrovat podle posledního přihlášení',
    canSort: true,
  },
  {
    key: 'created_at',
    header: 'Vytvořen',
    type: 'text',
    placeholder: 'Filtrovat podle data vytvoření',
    canSort: true,
  },
  {
    key: 'updated_at',
    header: 'Změněn',
    type: 'text',
    placeholder: 'Filtrovat podle data změny',
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
  {
    key: 'id',
    displayName: 'ID',
    type: 'text'
  },
  {
    key: 'user_email',
    displayName: 'Login', // Vizuálně změněno na Login
    type: 'text'
  },
  {
    key: 'last_login_at',
    displayName: 'Naposled přihlášen',
    type: 'date',
    format: 'medium'
  },
  {
    key: 'created_at',
    displayName: 'Vytvořen',
    type: 'date',
    format: 'medium'
  },
  {
    key: 'updated_at',
    displayName: 'Změněn',
    type: 'date',
    format: 'medium'
  },
  {
    key: 'roles.0.role_name',
    displayName: 'Role',
    type: 'text'
  }
];