import { Buttons } from '../../components/builders/table-builder/table-builder.component';
import { InputDefinition } from '../../components/builders/form-builder/form-builder.component';
import { ColumnDefinition } from '../../../shared/interfaces/generic-form-column-definiton';
import { FilterColumns } from '../../../shared/interfaces/filter-columns';
import { ItemDetailsColumns } from '../../../shared/interfaces/item-details-columns';

export const NEWS_THEMA_OPTIONS: string[] = [
  'Milník', 
  'Update', 
  'Info', 
  'Novinka', 
  'Upozornění', 
  'Error', 
  'Údržba', 
  'Akce'
];

export const NEWS_BUTTONS: Buttons[] = [
  { display_name: '🔎', header_name: 'Detaily', isActive: true, type: 'info_button', action: 'details' },
  { display_name: '✒️', header_name: 'Edit', isActive: true, type: 'neutral_button', action: 'edit' },
  { display_name: '🗑️', header_name: 'Smazat', isActive: true, type: 'delete_button', action: 'delete' },
];

export const NEWS_FORM_FIELDS: InputDefinition[] = [
  {
    column_name: 'title',
    label: 'Titulek novinky',
    placeholder: 'Např. Nová verze systému 2.0',
    type: 'text',
    required: true,
    pattern: '^.{3,255}$',
    errorMessage: 'Titulek musí mít 3 až 255 znaků.',
    editable: true,
    show_in_edit: true,
    show_in_create: true,
  },
  {
    column_name: 'thema',
    label: 'Téma / Kategorie',
    type: 'select',
    options: NEWS_THEMA_OPTIONS.map(t => ({ value: t, label: t })),
    required: true,
    errorMessage: 'Vyberte téma novinky.',
    editable: true,
    show_in_edit: true,
    show_in_create: true,
  },
  {
    column_name: 'author',
    label: 'Autor',
    placeholder: 'Jméno nebo oddělení',
    type: 'text',
    required: true,
    errorMessage: 'Autor je povinný.',
    editable: true,
    show_in_edit: true,
    show_in_create: true
  },
  {
    column_name: 'message',
    label: 'Hlavní text zprávy',
    placeholder: 'Detailní popis novinky...',
    type: 'textarea', 
    required: true,
    errorMessage: 'Obsah novinky nemůže být prázdný.',
    editable: true,
    show_in_edit: true,
    show_in_create: true
  },
  {
    column_name: 'bullet_1',
    label: 'Důležitý bod 1',
    placeholder: 'Klíčová informace...',
    type: 'text',
    required: false,
    editable: true,
    show_in_edit: true,
    show_in_create: true
  },
  {
    column_name: 'bullet_2',
    label: 'Důležitý bod 2',
    type: 'text',
    required: false,
    editable: true,
    show_in_edit: true,
    show_in_create: true
  },
  {
    column_name: 'bullet_3',
    label: 'Důležitý bod 3',
    type: 'text',
    required: false,
    editable: true,
    show_in_edit: true,
    show_in_create: true
  },
  {
    column_name: 'bullet_4',
    label: 'Důležitý bod 4',
    type: 'text',
    required: false,
    editable: true,
    show_in_edit: true,
    show_in_create: true
  }
];

export const NEWS_COLUMNS: ColumnDefinition[] = [
  { key: 'id', header: 'ID', type: 'text' },
  { key: 'title', header: 'Titulek', type: 'text' },
  { key: 'thema', header: 'Téma', type: 'text' },
  { key: 'author', header: 'Autor', type: 'text' },
  { key: 'created_at', header: 'Vytvořeno', type: 'date', format: 'short' }
];

export const NEWS_TRASH_COLUMNS: ColumnDefinition[] = [
  { key: 'id', header: 'ID', type: 'text' },
  { key: 'title', header: 'Titulek', type: 'text' },
  { key: 'deleted_at', header: 'Smazáno', type: 'date', format: 'short' }
];

export const NEWS_FILTER_COLUMNS: FilterColumns[] = [
  { key: 'id', header: 'ID', type: 'text', placeholder: 'Hledat ID', canSort: true },
  { key: 'title', header: 'Titulek', type: 'text', placeholder: 'Hledat v titulku', canSort: true },
  { key: 'author', header: 'Autor', type: 'text', placeholder: 'Hledat autora', canSort: true },
  { key: 'thema', header: 'Téma', type: 'select', options: NEWS_THEMA_OPTIONS, placeholder: '-- Vybrat téma --', canSort: true }
];

export const NEWS_DETAILS_COLUMNS: ItemDetailsColumns[] = [
  { key: 'id', displayName: 'ID záznamu', type: 'text' },
  { key: 'title', displayName: 'Titulek', type: 'text' },
  { key: 'thema', displayName: 'Kategorie', type: 'text' },
  { key: 'author', displayName: 'Autor', type: 'text' },
  { key: 'message', displayName: 'Hlavní zpráva', type: 'text' },
  { key: 'bullet_1', displayName: 'Bod 1', type: 'text' },
  { key: 'bullet_2', displayName: 'Bod 2', type: 'text' },
  { key: 'bullet_3', displayName: 'Bod 3', type: 'text' },
  { key: 'bullet_4', displayName: 'Bod 4', type: 'text' },
  { key: 'created_at', displayName: 'Vytvořeno', type: 'date', format: 'medium' },
  { key: 'updated_at', displayName: 'Upraveno', type: 'date', format: 'medium' }
];