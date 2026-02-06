// src/app/pages/business-log/business-log.config.ts

import { Buttons } from '../../components/generic-table/generic-table.component';
import { InputDefinition } from '../../components/generic-form/generic-form.component';
import { ColumnDefinition } from '../../../shared/interfaces/generic-form-column-definiton';
import { FilterColumns } from '../../../shared/interfaces/filter-columns';
import { ItemDetailsColumns } from '../../../shared/interfaces/item-details-columns';

/**
 * TLAČÍTKA - U logů většinou stačí jen detail (lupa), smazání nebo editace logů nedává smysl.
 */
export const BUTTONS: Buttons[] = [
  { display_name: '🔎', header_name: 'Detaily', isActive: true, type: 'info_button', action: 'details' },
];

/**
 * FORMULÁŘOVÁ POLE (Většinou se logy needitují, ale ponechávám dle zadání)
 */
export const FORM_FIELDS: InputDefinition[] = [
  {
    column_name: 'user_email',
    label: 'Přihlašovací email',
    placeholder: 'Zadejte Email',
    type: 'text',
    required: true,
    pattern: '[^@]+@[^@]+\\.[^@]+',
    errorMessage: 'Špatný formát emailu',
    editable: true,
    show_in_edit: true,
    show_in_create: true,
  },
  {
    column_name: 'role_id',
    label: 'Role',
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

/**
 * HLAVNÍ TABULKA LOGŮ - PŘEHLEDNÁ A RYCHLÁ
 */
export const TABLE_COLUMNS: ColumnDefinition[] = [
  { key: 'business_log_id', header: 'ID', type: 'text' },
  { key: 'created_at', header: 'Čas', type: 'date', format: 'short' },
  { key: 'user_login_email_plain', header: 'Uživatel', type: 'text' },
  { key: 'event_type', header: 'Akce', type: 'text' },
  { key: 'module', header: 'Modul', type: 'text' },
  { key: 'description', header: 'Popis události', type: 'text' },
  { key: 'origin', header: 'IP', type: 'text' }
];

/**
 * FILTRY
 */
export const FILTER_COLUMNS: FilterColumns[] = [
  { key: 'business_log_id', header: 'ID', type: 'text', placeholder: 'ID logu', canSort: true },
  { key: 'user_login_email_plain', header: 'Uživatel', type: 'text', placeholder: 'Email uživatele', canSort: true },
  { key: 'event_type', header: 'Událost', type: 'select', options: ["create", "update", "soft_delete", "hard_delete", "restore"], placeholder: '-- Typ --', canSort: true },
  { key: 'module', header: 'Modul', type: 'text', placeholder: 'Modul systému', canSort: true },
  { key: 'origin', header: 'IP adresa', type: 'text', placeholder: 'Hledat IP', canSort: true }
];

/**
 * DETAIL LOGU - TADY JSOU VŠECHNA TECHNICKÁ DATA
 */
export const DETAILS_COLUMNS: ItemDetailsColumns[] = [
  { key: 'business_log_id', displayName: 'ID Záznamu', type: 'text' },
  { key: 'created_at', displayName: 'Čas události', type: 'date', format: 'medium' },
  { key: 'origin', displayName: 'IP adresa zdroje', type: 'text' },
  { key: 'event_type', displayName: 'Typ události', type: 'text' },
  { key: 'module', displayName: 'Systémový modul', type: 'text' },
  { key: 'description', displayName: 'Podrobný popis', type: 'text' },
  { key: 'affected_entity_type', displayName: 'Ovlivněná entita (Tabulka)', type: 'text' },
  { key: 'affected_entity_id', displayName: 'ID ovlivněné entity', type: 'text' },
  { key: 'user_login_id_plain', displayName: 'ID uživatele', type: 'text' },
  { key: 'user_login_email_plain', displayName: 'Uživatel (Email)', type: 'text' },
  { key: 'context_data', displayName: 'Technická data (JSON)', type: 'text' }
];