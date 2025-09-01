import { Buttons } from '../../components/generic-table/generic-table.component';
import { InputDefinition } from '../../components/generic-form/generic-form.component';
import { ColumnDefinition } from '../../../shared/interfaces/generic-form-column-definiton';
import { FilterColumns } from '../../../shared/interfaces/filter-columns';
import { ItemDetailsColumns } from '../../../shared/interfaces/item-details-columns';

export const BUTTONS: Buttons[] = [
  { display_name: 'Detaily', isActive: true, type: 'info_button', action: 'details' },
  { display_name: 'Editovat', isActive: false, type: 'neutral_button', action: '' },
  { display_name: 'Nove button', isActive: false, type: 'neutral_button', action: '' },
  { display_name: 'Smazat', isActive: false, type: 'delete_button', action: '' },
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
  { key: 'business_log_id', header: 'ID', type: 'text' },
  { key: 'created_at', header: 'Vytvořen', type: 'date', format: 'short' },
  { key: 'origin', header: 'IP zdroje', type: 'text' },
  { key: 'event_type', header: 'Událost',   type: 'text'},
  { key: 'module', header: 'Modul',   type: 'text' },
  { key: 'description', header: 'Popis', type: 'text' },
  { key: 'affected_entity_type', header: 'Ovlivněná Entita', type: 'text' },
  { key: 'affected_entity_id', header: 'ID Ovlivněná Entita', type: 'text' },
  { key: 'user_login_id_plain', header: 'ID uživatele', type: 'text' },
  { key: 'user_login_email_plain', header: 'Uživatel', type: 'text' },
  { key: 'user_login_id', header: 'ID uživatele (Reference)', type: 'text' },
  { key: 'user.user_email', header: 'Uživatel (Reference)', type: 'text' },
  { key: 'context_data', header: 'Doplňující data', type: 'text' },
];

export const FILTER_COLUMNS: FilterColumns[] = [
  {
    key: 'business_log_id',
    header: 'ID',
    type: 'text',
    placeholder: 'Hledat podle ID',
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
    key: 'origin',
    header: 'IP zdroje',
    type: 'text',
    placeholder: 'Hledat podle IP zdroje',
    canSort: true,
  },
  {
    key: 'event_type',
    header: 'Událost',
    type: 'select',
    options: ["create", "update", "soft_delete", "hard_delete", "restore"],
    placeholder: '-- Vybrat prioritu --',
    canSort: true,
  },
  {
    key: 'module',
    header: 'Modul',
    type: 'text',
    placeholder: 'Hledat podle modulu',
    canSort: true,
  },
  {
    key: 'description',
    header: 'Popis',
    type: 'text',
    placeholder: 'Hledat podle popisu',
    canSort: true,
  },
  {
    key: 'affected_entity_type',
    header: 'Ovlivněná Entita',
    type: 'text',
    placeholder: 'Hledat podle ovlivněné entity',
    canSort: true,
  },
  {
    key: 'affected_entity_id',
    header: 'ID Ovlivněná Entita',
    type: 'text',
    placeholder: 'Hledat podle ID ovlivněné entity',
    canSort: true,
  },
  {
    key: 'user_login_id',
    header: 'ID uživatele',
    type: 'text',
    placeholder: 'Hledat podle ID uživatele',
    canSort: true,
  },
  {
    key: 'user.user_email',
    header: 'Uživatel',
    type: 'text',
    placeholder: 'Hledat podle uživatele',
    canSort: true,
  },
  {
    key: 'context_data',
    header: 'Doplňující data',
    type: 'text',
    placeholder: 'Hledat podle doplňujících dat',
    canSort: true,
  }
];

export const DETAILS_COLUMNS: ItemDetailsColumns[] = [
  {
    key: 'business_log_id',
    displayName: 'ID',
    type: 'text'
  },
  {
    key: 'created_at',
    displayName: 'Vytvořen',
    type: 'date',
    format: 'medium'
  },
  {
    key: 'origin',
    displayName: 'IP zdroje',
    type: 'text'
  },
  {
    key: 'event_type',
    displayName: 'Událost',
    type: 'text'
  },
  {
    key: 'module',
    displayName: 'Modul',
    type: 'text'
  },
  {
    key: 'description',
    displayName: 'Popis',
    type: 'text'
  },
  {
    key: 'affected_entity_type',
    displayName: 'Ovlivněná Entita',
    type: 'text'
  },
  {
    key: 'affected_entity_id',
    displayName: 'ID Ovlivněná Entita',
    type: 'text'
  },
  {
    key: 'user.user_login_id',
    displayName: 'ID uživatele',
    type: 'text'
  },
  {
    key: 'user.user_email',
    displayName: 'Uživatel',
    type: 'text'
  },
  {
    key: 'context_data',
    displayName: 'Doplňující data',
    type: 'text'
  },
];
