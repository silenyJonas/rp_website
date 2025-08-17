import { Buttons } from '../../components/generic-table/generic-table.component';
import { InputDefinition } from '../../components/generic-form/generic-form.component';
import { ColumnDefinition } from '../../../shared/interfaces/generic-form-column-definiton';
import { FilterColumns } from '../../../shared/interfaces/filter-columns';
import { ItemDetailsColumns } from '../../../shared/interfaces/item-details-columns';

export const BUTTONS: Buttons[] = [
  { display_name: 'Detaily', isActive: true, type: 'info_button' },
  { display_name: 'Editovat', isActive: true, type: 'neutral_button' },
  { display_name: 'Nove button', isActive: false, type: 'neutral_button' },
  { display_name: 'Smazat', isActive: true, type: 'delete_button' },
];

export const FORM_FIELDS: InputDefinition[] = [
  {
    column_name: 'user_email',
    label: 'Přihlašovaci email',
    placeholder: 'Zadejte Email',
    type: 'text',
    required: true,
    pattern: '[^@]+@[^@]+\\.[^@]+',
    errorMessage: 'spatny format',
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
    errorMessage: 'Zadejte heslo minimalne 8 znaku',
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
  { key: 'user_email', header: 'Email', type: 'text' },
  { key: 'last_login_at', header: 'Naposled přihlášen', type: 'date', format: 'short' },
  { key: 'created_at', header: 'Vytvořen', type: 'date', format: 'short' },
  { key: 'updated_at', header: 'Změněn', type: 'date', format: 'short' },
  { key: 'roles.0.role_name', header: 'Role', type: 'text' },
];

export const TRASH_TABLE_COLUMNS: ColumnDefinition[] = [
  { key: 'id', header: 'ID', type: 'text' },
  { key: 'user_email', header: 'Email', type: 'text' },
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
    header: 'Email',
    type: 'text',
    placeholder: 'Hledat podle emailu',
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
    displayName: 'Email',
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
