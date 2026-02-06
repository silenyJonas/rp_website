// src/app/pages/support-ticket/support-ticket.config.ts

import { Buttons } from '../../components/generic-table/generic-table.component';
import { InputDefinition } from '../../components/generic-form/generic-form.component';
import { ColumnDefinition } from '../../../shared/interfaces/generic-form-column-definiton';
import { FilterColumns } from '../../../shared/interfaces/filter-columns';
import { ItemDetailsColumns } from '../../../shared/interfaces/item-details-columns';

/**
 * TLAČÍTKA AKCÍ
 */
export const SUPPORT_TICKET_BUTTONS: Buttons[] = [
  { display_name: '🔎', header_name: 'Detaily', isActive: true, type: 'info_button', action: 'details' },
  { display_name: '✒️', header_name: 'Edit', isActive: true, type: 'neutral_button', action: 'edit' },
  { display_name: '🗑️', header_name: 'Smazat', isActive: true, type: 'delete_button', action: 'delete' },
];

/**
 * FORMULÁŘOVÁ POLE (PRO CREATE / EDIT)
 */
export const SUPPORT_TICKET_FORM_FIELDS: InputDefinition[] = [
  {
    column_name: 'subject',
    label: 'Předmět',
    placeholder: 'Stručný popis problému',
    type: 'text',
    required: true,
    errorMessage: 'Předmět je povinný.',
    editable: true, show_in_edit: true, show_in_create: true,
  },
  {
    column_name: 'category',
    label: 'Kategorie',
    type: 'select',
    required: true,
    options: [
      { value: 'it', label: 'IT / Technický' },
      { value: 'obchod', label: 'Obchodní' },
      { value: 'chyba', label: 'Chyba' },
      { value: 'ostatni', label: 'Ostatní' }
    ],
    editable: true, show_in_edit: true, show_in_create: true
  },
  {
    column_name: 'priority',
    label: 'Priorita',
    type: 'select',
    required: true,
    options: [
      { value: 'low', label: 'Nízká' },
      { value: 'medium', label: 'Střední' },
      { value: 'high', label: 'Vysoká' }
    ],
    editable: true, show_in_edit: true, show_in_create: true
  },
  {
    column_name: 'description',
    label: 'Detailní popis',
    type: 'textarea',
    required: true,
    editable: true, show_in_edit: true, show_in_create: true
  }
];

/**
 * HLAVNÍ TABULKA - POUZE PŘEHLEDOVÉ ÚDAJE
 */
export const SUPPORT_TICKET_COLUMNS: ColumnDefinition[] = [
  { key: 'id', header: 'ID', type: 'text' },
  { key: 'subject', header: 'Předmět', type: 'text' },
  { key: 'user_name_plain', header: 'Žadatel', type: 'text' },
  { key: 'category', header: 'Kategorie', type: 'text' },
  { key: 'priority', header: 'Priorita', type: 'text' },
  { key: 'created_at', header: 'Vytvořeno', type: 'date', format: 'short' }
];

/**
 * TRASH TABULKA - PŘEHLED + DATUM SMAZÁNÍ
 * (Vynechal jsem zbytečné sloupce pro čistotu)
 */
export const SUPPORT_TICKET_TRASH_COLUMNS: ColumnDefinition[] = [
  { key: 'id', header: 'ID', type: 'text' },
  { key: 'subject', header: 'Předmět', type: 'text' },
  { key: 'user_name_plain', header: 'Žadatel', type: 'text' },
  { key: 'category', header: 'Kategorie', type: 'text' },
  { key: 'deleted_at', header: 'Smazáno', type: 'date', format: 'short' }
];

/**
 * FILTRY
 */
export const SUPPORT_TICKET_FILTER_COLUMNS: FilterColumns[] = [
  { key: 'id', header: 'ID', type: 'text', placeholder: 'ID', canSort: true },
  { key: 'subject', header: 'Předmět', type: 'text', placeholder: 'Hledat předmět', canSort: true },
  { key: 'user_name_plain', header: 'Žadatel', type: 'text', placeholder: 'Hledat žadatele', canSort: true },
  { key: 'category', header: 'Kategorie', type: 'text', placeholder: 'Kategorie', canSort: true }
];

/**
 * DETAIL TICKETU - KOMPLETNÍ INFORMACE
 */
export const SUPPORT_TICKET_DETAILS_COLUMNS: ItemDetailsColumns[] = [
  { key: 'id', displayName: 'ID Ticketu', type: 'text' },
  { key: 'subject', displayName: 'Předmět', type: 'text' },
  { key: 'user_name_plain', displayName: 'Žadatel', type: 'text' },
  { key: 'user_email_plain', displayName: 'Email', type: 'text' },
  { key: 'category', displayName: 'Kategorie', type: 'text' },
  { key: 'priority', displayName: 'Priorita', type: 'text' },
  { key: 'description', displayName: 'Popis problému', type: 'text' }, // Zde popis dává největší smysl
  { key: 'attachment_url', displayName: 'Příloha', type: 'file' }, 
  { key: 'created_at', displayName: 'Datum vytvoření', type: 'date', format: 'medium' }
];