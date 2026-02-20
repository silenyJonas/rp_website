import { Buttons } from '../../components/generic-table/generic-table.component';
import { InputDefinition } from '../../components/generic-form/generic-form.component';
import { ColumnDefinition } from '../../../shared/interfaces/generic-form-column-definiton';
import { FilterColumns } from '../../../shared/interfaces/filter-columns';
import { ItemDetailsColumns } from '../../../shared/interfaces/item-details-columns';

export const BUTTONS: Buttons[] = [
  { display_name: '🔎', header_name: 'Detaily', isActive: true, type: 'info_button', action: 'details' },
];

export const FORM_FIELDS: InputDefinition[] = [];

export const TABLE_COLUMNS: ColumnDefinition[] = [
  { key: 'id', header: 'ID', type: 'text' },
  { key: 'created_at', header: 'Čas', type: 'date', format: 'short' },
  { key: 'user_email_plain', header: 'Uživatel', type: 'text' },
  { key: 'event_type', header: 'Akce', type: 'text' },
  { key: 'module', header: 'Modul', type: 'text' },
  { key: 'description', header: 'Popis události', type: 'text' },
  { key: 'origin', header: 'IP adresa', type: 'text' }
];

export const FILTER_COLUMNS: FilterColumns[] = [
  { key: 'id', header: 'ID', type: 'text', placeholder: 'ID logu', canSort: true },
  { key: 'user_email_plain', header: 'Uživatel', type: 'text', placeholder: 'Email uživatele', canSort: true },
  { 
    key: 'event_type', 
    header: 'Událost', 
    type: 'select', 
    options: ["create", "update", "soft_delete", "hard_delete", "restore", "login", "bulk_hard_delete"], 
    placeholder: '-- Typ akce --', 
    canSort: true 
  },
  { 
    key: 'module', 
    header: 'Modul', 
    type: 'select', 
    options: ["Auth", "BusinessLog", "JobApplication", "News", "RawRequestCommission", "Role", "SalesLead", "SalesOrder", "SupportTicket", "Translation", "User"], 
    placeholder: '-- Modul --', 
    canSort: true 
  },
  { key: 'origin', header: 'IP adresa', type: 'text', placeholder: 'Hledat IP', canSort: true }
];

export const DETAILS_COLUMNS: ItemDetailsColumns[] = [
  { key: 'id', displayName: 'ID Záznamu', type: 'text' },
  { key: 'created_at', displayName: 'Čas události', type: 'date', format: 'medium' },
  { key: 'origin', displayName: 'IP adresa zdroje', type: 'text' },
  { key: 'event_type', displayName: 'Typ události', type: 'text' },
  { key: 'module', displayName: 'Systémový modul', type: 'text' },
  { key: 'description', displayName: 'Podrobný popis', type: 'text' },
  { key: 'affected_entity_type', displayName: 'Tabulka / Entita', type: 'text' },
  { key: 'affected_entity_id', displayName: 'ID záznamu entity', type: 'text' },
  { key: 'user_id_plain', displayName: 'ID uživatele (Plain)', type: 'text' },
  { key: 'user_email_plain', displayName: 'Uživatel (Plain Email)', type: 'text' },
  { key: 'context_data', displayName: 'Payload / JSON Data', type: 'text' }
];