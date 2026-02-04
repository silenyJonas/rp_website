import { Buttons } from '../../components/generic-table/generic-table.component';
import { InputDefinition } from '../../components/generic-form/generic-form.component';
import { ColumnDefinition } from '../../../shared/interfaces/generic-form-column-definiton';
import { FilterColumns } from '../../../shared/interfaces/filter-columns';
import { ItemDetailsColumns } from '../../../shared/interfaces/item-details-columns';

export const JOB_APPLICATION_BUTTONS: Buttons[] = [
  { display_name: '🔎', header_name: 'Detaily', isActive: true, type: 'info_button', action: 'details' },
  { display_name: '✒️', header_name: 'Edit', isActive: true, type: 'neutral_button', action: 'edit' },
  { display_name: '🗑️', header_name: 'Del', isActive: true, type: 'delete_button', action: 'delete' },
];

export const JOB_APPLICATION_FORM_FIELDS: InputDefinition[] = [
  {
    column_name: 'state',
    label: 'Stav uchazeče',
    type: 'select',
    options: [
      { value: 'Nový', label: 'Nový' },
      { value: 'Pohovor', label: 'Pohovor' },
      { value: 'Vybrán', label: 'Vybrán' },
      { value: 'Zamítnut', label: 'Zamítnut' }
    ],
    required: true,
    editable: true, show_in_edit: true, show_in_create: false
  },
  {
    column_name: 'internal_note',
    label: 'Interní poznámka (nevidí uchazeč)',
    placeholder: 'Zadejte výsledek pohovoru nebo poznámky...',
    type: 'textarea',
    required: false,
    editable: true, show_in_edit: true, show_in_create: false
  },
  {
    column_name: 'first_name',
    label: 'Jméno',
    type: 'text',
    editable: false, show_in_edit: true, show_in_create: false
  },
  {
    column_name: 'last_name',
    label: 'Příjmení',
    type: 'text',
    editable: false, show_in_edit: true, show_in_create: false
  }
];

export const JOB_APPLICATION_COLUMNS: ColumnDefinition[] = [
  { key: 'id', header: 'ID', type: 'text' },
  { key: 'full_name', header: 'Uchazeč', type: 'text' },
  { key: 'position_name', header: 'Pozice', type: 'text' },
  { key: 'email', header: 'E-mail', type: 'text' },
  { key: 'state', header: 'Stav', type: 'text' },
  { key: 'created_at', header: 'Doručeno', type: 'date', format: 'short' }
];

export const JOB_APPLICATION_TRASH_COLUMNS: ColumnDefinition[] = [
  ...JOB_APPLICATION_COLUMNS,
  { key: 'deleted_at', header: 'Smazáno', type: 'date', format: 'short' }
];

export const JOB_APPLICATION_FILTER_COLUMNS: FilterColumns[] = [
  { key: 'id', header: 'ID', type: 'text', placeholder: 'ID', canSort: true },
  { key: 'first_name', header: 'Jméno', type: 'text', placeholder: 'Hledat jméno', canSort: true },
  { key: 'last_name', header: 'Příjmení', type: 'text', placeholder: 'Hledat příjmení', canSort: true },
  { key: 'position_name', header: 'Pozice', type: 'text', placeholder: 'Název pozice', canSort: true },
  { key: 'state', header: 'Stav', type: 'text', placeholder: 'Hledat stav', canSort: true }
];

export const JOB_APPLICATION_DETAILS_COLUMNS: ItemDetailsColumns[] = [
  { key: 'id', displayName: 'ID', type: 'text' },
  { key: 'full_name', displayName: 'Celé jméno', type: 'text' },
  { key: 'position_name', displayName: 'Pozice', type: 'text' },
  { key: 'email', displayName: 'E-mail', type: 'text' },
  { key: 'phone', displayName: 'Telefon', type: 'text' },
  { key: 'message', displayName: 'Zpráva / Průvodní dopis', type: 'text' },
  { key: 'cv_url', displayName: 'Životopis (Odkaz)', type: 'file' },
  { key: 'state', displayName: 'Aktuální stav', type: 'text' },
  { key: 'internal_note', displayName: 'Interní poznámka', type: 'text' },
  { key: 'created_at', displayName: 'Doručeno', type: 'date', format: 'medium' }
];