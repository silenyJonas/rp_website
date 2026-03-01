import * as Core from '../../../shared/imports/core-providers';


export const USER_REQUEST_BUTTONS: Core.Buttons[] = [
  { display_name: '🔍', header_name: 'Detaily', isActive: true, type: 'info_button', action: 'details' },
  { display_name: '✒️', header_name: 'Edit', isActive: true, type: 'neutral_button', action: 'edit' },
  { display_name: '🗑️', header_name: 'Smazat', isActive: true, type: 'delete_button', action: 'delete' },
];

export const USER_REQUEST_STATUS_OPTIONS: string[] = ['Nově zadané', 'Zpracovává se', 'Dokončeno', 'Zrušeno'];
export const USER_REQUEST_PRIORITY_OPTIONS: string[] = ['Nízká', 'Neutrální', 'Vysoká'];
export const USER_REQUEST_THEMA_OPTIONS: string[] = ['Webový vývoj', 'Desktopový vývoj', 'Mobilní vývoj', 'AI vývoj', 'Jiné'];

export const USER_REQUEST_FORM_FIELDS: Core.InputDefinition[] = [
  {
    column_name: 'thema',
    label: 'Téma / Předmět',
    placeholder: 'Zadejte téma požadavku',
    type: 'text',
    required: true,
    pattern: '^[a-zA-Z0-9ěščřžýáíéóúůďťňĚŠČŘŽÝÁÍÉÚŮĎŤŇ\\s\\.\\-]{3,255}$',
    errorMessage: 'Téma musí mít 3-255 znaků.',
    editable: true, show_in_edit: true, show_in_create: true,
  },
  {
    column_name: 'contact_email',
    label: 'Kontaktní e-mail',
    placeholder: 'priklad@email.cz',
    type: 'email',
    required: true,
    pattern: '[^@]+@[^@]+\\.[^@]+',
    errorMessage: 'Zadejte platnou e-mailovou adresu.',
    editable: true, show_in_edit: true, show_in_create: true
  },
  {
    column_name: 'contact_phone',
    label: 'Telefon',
    placeholder: '+420 123 456 789',
    type: 'tel',
    required: false,
    errorMessage: 'Zadejte platné telefonní číslo.',
    editable: true, show_in_edit: true, show_in_create: true
  },
  {
    column_name: 'status',
    label: 'Stav zpracování',
    type: 'select',
    options: USER_REQUEST_STATUS_OPTIONS.map(opt => ({ value: opt, label: opt })),
    required: true,
    editable: true, show_in_edit: true, show_in_create: true
  },
  {
    column_name: 'priority',
    label: 'Priorita',
    type: 'select',
    options: USER_REQUEST_PRIORITY_OPTIONS.map(opt => ({ value: opt, label: opt })),
    required: true,
    editable: true, show_in_edit: true, show_in_create: true
  },
  {
    column_name: 'order_description',
    label: 'Popis požadavku',
    placeholder: 'Zde rozepište detaily objednávky/provize...',
    type: 'textarea',
    required: true,
    errorMessage: 'Popis je povinný pro zpracování.',
    editable: true, show_in_edit: true, show_in_create: true
  },
  {
    column_name: 'note',
    label: 'Interní poznámka',
    placeholder: 'Poznámka pro administrátora',
    type: 'textarea',
    required: false,
    editable: true, show_in_edit: true, show_in_create: true
  }
];

export const USER_REQUEST_COLUMNS: Core.ColumnDefinition[] = [
  { key: 'id', header: 'ID', type: 'text' },
  { key: 'thema', header: 'Téma', type: 'text' },
  { key: 'contact_email', header: 'Email', type: 'text' },
  { key: 'status', header: 'Stav', type: 'text' },
  { key: 'priority', header: 'Priorita', type: 'text' },
  { key: 'created_at', header: 'Vytvořeno', type: 'date', format: 'short' }
];

export const USER_REQUEST_TRASH_COLUMNS: Core.ColumnDefinition[] = [
  { key: 'id', header: 'ID', type: 'text' },
  { key: 'thema', header: 'Téma', type: 'text' },
  { key: 'contact_email', header: 'Email', type: 'text' },
  { key: 'deleted_at', header: 'Smazáno', type: 'date', format: 'short' }
];

export const USER_REQUEST_FILTER_COLUMNS: Core.FilterColumns[] = [
  { key: 'id', header: 'ID', type: 'text', placeholder: 'ID...', canSort: true },
  { key: 'thema', header: 'Téma', type: 'select', placeholder: 'Hledat téma...',options: USER_REQUEST_THEMA_OPTIONS, canSort: true },
  { key: 'contact_email', header: 'Email', type: 'text', placeholder: 'Hledat email...', canSort: true },
  { key: 'status', header: 'Stav', type: 'select', options: USER_REQUEST_STATUS_OPTIONS, placeholder: '-- Stav --', canSort: true },
  { key: 'priority', header: 'Priorita', type: 'select', options: USER_REQUEST_PRIORITY_OPTIONS, placeholder: '-- Priorita --', canSort: true },
];

export const USER_REQUEST_DETAILS_COLUMNS: Core.ItemDetailsColumns[] = [
  { key: 'id', displayName: 'ID požadavku', type: 'text' },
  { key: 'thema', displayName: 'Téma', type: 'text' },
  { key: 'contact_email', displayName: 'Email', type: 'text' },
  { key: 'contact_phone', displayName: 'Telefon', type: 'text' },
  { key: 'status', displayName: 'Stav', type: 'text' },
  { key: 'priority', displayName: 'Priorita', type: 'text' },
  { key: 'order_description', displayName: 'Popis požadavku', type: 'text' },
  { key: 'note', displayName: 'Poznámka', type: 'text' },
  { key: 'created_at', displayName: 'Vytvořeno', type: 'date', format: 'medium' },
  { key: 'updated_at', displayName: 'Naposledy změněno', type: 'date', format: 'medium' },
];