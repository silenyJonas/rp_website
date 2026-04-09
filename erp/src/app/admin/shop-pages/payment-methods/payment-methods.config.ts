import * as Core from '../../../shared/imports/core-providers';

export const PAYMENT_BUTTONS: Core.TableButtons[] = [
  { display_name: '🔍', header_name: 'Detaily', isActive: true, type: 'info_button', action: 'details' },
  { display_name: '✒️', header_name: 'Edit', isActive: true, type: 'neutral_button', action: 'edit' },
  { display_name: '🗑️', header_name: 'Smazat', isActive: true, type: 'delete_button', action: 'delete' },
];

export const PAYMENT_TOOLBAR_BUTTONS: Core.Button[] = [
  { action: 'toggleFilters', label: 'Filtry', icon: '🔍', class: 'btn-filter', isActive: false },
  { action: 'handleCreateFormOpened', label: 'Přidat', icon: '➕', class: 'btn-create', showIf: true },
  { action: 'exportActiveTable', label: 'Export CSV', icon: '📥', class: 'btn-export', showIf: true },
  { action: 'toggleTable', label: 'Koš', icon: '🗑️', class: 'btn-trash', permission: 'view-deleted' }
];

export const PAYMENT_FORM_FIELDS: Core.InputDefinition[] = [
  {
    column_name: 'name',
    label: 'Název platby',
    placeholder: 'Např. Bankovní převod',
    type: 'text',
    required: true,
    editable: true, show_in_edit: true, show_in_create: true,
  },
  {
    column_name: 'code',
    label: 'Kód (ID)',
    placeholder: 'např. bank_transfer',
    type: 'text',
    required: true,
    editable: true, show_in_edit: true, show_in_create: true,
  },
  {
    column_name: 'price',
    label: 'Poplatek (Kč)',
    type: 'number',
    required: true,
    editable: true, show_in_edit: true, show_in_create: true
  },
  {
    column_name: 'provider',
    label: 'Poskytovatel',
    type: 'select',
    options: [
      { value: 'manual', label: 'Manuální (Převod/Dobírka)' },
      { value: 'stripe', label: 'Stripe (Karta/Apple/Google)' },
      { value: 'paypal', label: 'PayPal' }
    ],
    required: true,
    editable: true, show_in_edit: true, show_in_create: true
  },
  {
    column_name: 'bank_account_number',
    label: 'Číslo účtu',
    placeholder: '123456789',
    type: 'text',
    required: false,
    editable: true, show_in_edit: true, show_in_create: true
  },
  {
    column_name: 'bank_account_code',
    label: 'Kód banky',
    placeholder: '0100',
    type: 'text',
    required: false,
    editable: true, show_in_edit: true, show_in_create: true
  },
  {
    column_name: 'variable_symbol_type',
    label: 'Variabilní symbol',
    type: 'select',
    options: [
      { value: 'order_number', label: 'Číslo objednávky' },
      { value: 'phone_number', label: 'Telefonní číslo' },
      { value: 'none', label: 'Žádný' }
    ],
    required: true,
    editable: true, show_in_edit: true, show_in_create: true
  },
  {
    column_name: 'sort_order',
    label: 'Pořadí',
    type: 'number',
    required: false,
    editable: true, show_in_edit: true, show_in_create: true
  },
  {
    column_name: 'is_active',
    label: 'Aktivní',
    type: 'select',
    options: [{ value: '1', label: 'Ano' }, { value: '0', label: 'Ne' }],
    required: true,
    editable: true, show_in_edit: true, show_in_create: true
  },
  {
    column_name: 'description',
    label: 'Popis pro zákazníka',
    type: 'textarea',
    required: false,
    editable: true, show_in_edit: true, show_in_create: true
  }
];

export const PAYMENT_COLUMNS: Core.ColumnDefinition[] = [
  { key: 'id', header: 'ID', type: 'text' },
  { key: 'name', header: 'Název', type: 'text' },
  { key: 'provider', header: 'Poskytovatel', type: 'text' },
  { key: 'price', header: 'Cena', type: 'currency' },
  { key: 'sort_order', header: 'Pořadí', type: 'text' },
  { key: 'is_active', header: 'Aktivní', type: 'boolean' }
];

export const PAYMENT_TRASH_COLUMNS: Core.ColumnDefinition[] = [
  { key: 'id', header: 'ID', type: 'text' },
  { key: 'name', header: 'Název', type: 'text' },
  { key: 'deleted_at', header: 'Smazáno', type: 'date', format: 'short' }
];

export const PAYMENT_FILTER_COLUMNS: Core.FilterColumns[] = [
  { key: 'id', header: 'ID', type: 'text', placeholder: 'ID...', canSort: true },
  { key: 'name', header: 'Název', type: 'text', placeholder: 'Hledat název...', canSort: true },
  { key: 'provider', header: 'Poskytovatel', type: 'select', options: ["manual", "stripe", "paypal"], placeholder: '-- Typ --', canSort: true },
];

export const PAYMENT_DETAILS_COLUMNS: Core.ItemDetailsColumns[] = [
  { key: 'id', displayName: 'ID', type: 'text' },
  { key: 'name', displayName: 'Název platby', type: 'text' },
  { key: 'code', displayName: 'Kód', type: 'text' },
  { key: 'price', displayName: 'Cena', type: 'currency' },
  { key: 'provider', displayName: 'Poskytovatel', type: 'text' },
  { key: 'bank_account_number', displayName: 'Číslo účtu', type: 'text' },
  { key: 'bank_account_code', displayName: 'Kód banky', type: 'text' },
  { key: 'variable_symbol_type', displayName: 'Typ VS', type: 'text' },
  { key: 'is_active', displayName: 'Aktivní', type: 'boolean' },
  { key: 'sort_order', displayName: 'Pořadí', type: 'text' },
  { key: 'description', displayName: 'Popis', type: 'text' },
  { key: 'created_at', displayName: 'Vytvořeno', type: 'date', format: 'medium' },
];