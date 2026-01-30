import { Buttons } from '../../components/generic-table/generic-table.component';
import { InputDefinition } from '../../components/generic-form/generic-form.component';
import { ColumnDefinition } from '../../../shared/interfaces/generic-form-column-definiton';
import { FilterColumns } from '../../../shared/interfaces/filter-columns';
import { ItemDetailsColumns } from '../../../shared/interfaces/item-details-columns';

export const SALES_ORDER_BUTTONS: Buttons[] = [
  { display_name: 'Detaily', isActive: true, type: 'info_button', action: 'details' },
  { display_name: 'Editovat', isActive: true, type: 'neutral_button', action: 'edit' },
  { display_name: 'Smazat', isActive: true, type: 'delete_button', action: 'delete' },
];

export const SALES_ORDER_FORM_FIELDS: InputDefinition[] = [
  {
    column_name: 'client_name',
    label: 'Název klienta / Jméno',
    placeholder: 'Zadejte název firmy nebo jméno',
    type: 'text',
    required: true,
    errorMessage: 'Jméno klienta je povinné.',
    editable: true, show_in_edit: true, show_in_create: true,
  },
  {
    column_name: 'salesman_name',
    label: 'Obchodník',
    placeholder: 'Jméno obchodníka',
    type: 'text',
    required: true,
    errorMessage: 'Jméno obchodníka je povinné.',
    editable: true, show_in_edit: true, show_in_create: true,
  },
  {
    column_name: 'ico',
    label: 'IČO',
    placeholder: 'Zadejte IČO',
    type: 'text',
    required: false,
    editable: true, show_in_edit: true, show_in_create: true
  },
  {
    column_name: 'client_email',
    label: 'E-mail klienta',
    placeholder: 'email@klient.cz',
    type: 'email',
    required: false,
    pattern: '[^@]+@[^@]+\\.[^@]+',
    errorMessage: 'Neplatný formát e-mailu.',
    editable: true, show_in_edit: true, show_in_create: true
  },
  {
    column_name: 'client_phone',
    label: 'Telefon',
    placeholder: 'Telefonní číslo',
    type: 'tel',
    required: false,
    editable: true, show_in_edit: true, show_in_create: true
  },
  {
    column_name: 'client_address',
    label: 'Adresa klienta',
    placeholder: 'Ulice, město, PSČ',
    type: 'text',
    required: false,
    editable: true, show_in_edit: true, show_in_create: true
  },
  {
    column_name: 'order_description',
    label: 'Popis realizace',
    placeholder: 'Specifikace objednávky...',
    type: 'textarea',
    required: true,
    errorMessage: 'Popis realizace je povinný.',
    editable: true, show_in_edit: true, show_in_create: true
  }
];

export const SALES_ORDER_COLUMNS: ColumnDefinition[] = [
  { key: 'id', header: 'ID', type: 'text' },
  { key: 'client_name', header: 'Klient', type: 'text' },
  { key: 'salesman_name', header: 'Obchodník', type: 'text' },
  { key: 'ico', header: 'IČO', type: 'text' },
  { key: 'client_email', header: 'Email', type: 'text' },
  { key: 'created_at', header: 'Vytvořeno', type: 'date', format: 'short' }
];

export const SALES_ORDER_TRASH_COLUMNS: ColumnDefinition[] = [
  ...SALES_ORDER_COLUMNS,
  { key: 'deleted_at', header: 'Smazáno', type: 'date', format: 'short' }
];

export const SALES_ORDER_FILTER_COLUMNS: FilterColumns[] = [
  { key: 'id', header: 'ID', type: 'text', placeholder: 'ID', canSort: true },
  { key: 'client_name', header: 'Klient', type: 'text', placeholder: 'Hledat klienta', canSort: true },
  { key: 'salesman_name', header: 'Obchodník', type: 'text', placeholder: 'Hledat obchodníka', canSort: true },
  { key: 'ico', header: 'IČO', type: 'text', placeholder: 'Hledat IČO', canSort: true },
  { key: 'client_email', header: 'E-mail', type: 'text', placeholder: 'Hledat e-mail', canSort: true }
];

export const SALES_ORDER_DETAILS_COLUMNS: ItemDetailsColumns[] = [
  { key: 'id', displayName: 'ID', type: 'text' },
  { key: 'client_name', displayName: 'Klient', type: 'text' },
  { key: 'salesman_name', displayName: 'Obchodník', type: 'text' },
  { key: 'ico', displayName: 'IČO', type: 'text' },
  { key: 'client_address', displayName: 'Adresa', type: 'text' },
  { key: 'client_email', displayName: 'Email', type: 'text' },
  { key: 'client_phone', displayName: 'Telefon', type: 'text' },
  { key: 'order_description', displayName: 'Popis realizace', type: 'text' },
  { key: 'created_at', displayName: 'Vytvořeno', type: 'date', format: 'medium' },
  { key: 'updated_at', displayName: 'Změněno', type: 'date', format: 'medium' }
];