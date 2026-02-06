// src/app/pages/sales-lead/sales-lead.config.ts

import { Buttons } from '../../components/generic-table/generic-table.component';
import { InputDefinition } from '../../components/generic-form/generic-form.component';
import { ColumnDefinition } from '../../../shared/interfaces/generic-form-column-definiton';
import { FilterColumns } from '../../../shared/interfaces/filter-columns';
import { ItemDetailsColumns } from '../../../shared/interfaces/item-details-columns';

export const SALES_LEAD_BUTTONS: Buttons[] = [
  { display_name: '🔎', header_name: 'Detaily', isActive: true, type: 'info_button', action: 'details' },
  { display_name: '✒️', header_name: 'Edit', isActive: true, type: 'neutral_button', action: 'edit' },
  { display_name: '🔗', header_name: 'Link', isActive: true, type: 'neutral_button', action: 'generate_form' },
  { display_name: '🗑️', header_name: 'Smazat', isActive: true, type: 'delete_button', action: 'delete' },
];

export const SALES_LEAD_STATUS_OPTIONS: string[] = [
  'Nové', 
  'Probíhá komunikace', 
  'Příprava nabídky', 
  'Nabídka odeslána', 
  'Poptávkový formulář odeslán', 
  'Vyjednávání', 
  'Pozastaveno', 
  'Přebírá si dev team',
  'Uzavřeno - Získáno', 
  'Čeká se na fakturaci',
  'Čeká se na zaplacení',
  'Uhrazeno - Projekt spuštěn',
  'Uzavřeno - Ztraceno',
  'Jiné'
];

export const SALES_LEAD_PRIORITY_OPTIONS: string[] = [
  'Nízká', 
  'Podprůměrná', 
  'Neutrální', 
  'Vysoká', 
  'Kritická'
];

export const SALES_LEAD_SOURCE_CHANNELS: string[] = [
  'LinkedIn - Direct Message',
  'LinkedIn - Komentář/Post',
  'Facebook - Skupina',
  'Facebook - Direct Message',
  'Instagram - DM',
  'X (Twitter)',
  'WhatsApp',
  'Telegram',
  'Webový formulář',
  'Email - Studený (Cold Email)',
  'Email - Newsletter',
  'Telefon - Studený (Cold Call)',
  'Telefon - Příchozí poptávka',
  'Osobní setkání',
  'Networking / Akce / Konference',
  'Doporučení (Referral)',
  'Bývalý klient',
  'Poptávkový portál',
  'Google Moje Firma',
  'Inzerát / Placená reklama (PPC)',
  'Partner / Affiliate',
  'Jiný online kanál',
  'Jiný offline kanál'
];

export const SALES_LEAD_FORM_FIELDS: InputDefinition[] = [
  {
    column_name: 'subject_name',
    label: 'Název subjektu / Firmy',
    placeholder: 'Zadejte název firmy nebo jméno',
    type: 'text',
    required: true,
    editable: true,
    show_in_edit: true,
    show_in_create: true,
  },
  {
    column_name: 'contact_person',
    label: 'Kontaktní osoba',
    placeholder: 'Jméno konkrétní osoby',
    type: 'text',
    required: false,
    editable: true,
    show_in_edit: true,
    show_in_create: true,
  },
  {
    column_name: 'contact_email',
    label: 'Email',
    placeholder: 'priklad@firma.cz',
    type: 'text',
    required: false,
    editable: true,
    show_in_edit: true,
    show_in_create: true,
  },
  {
    column_name: 'contact_phone',
    label: 'Telefon',
    placeholder: '+420 ...',
    type: 'text',
    required: false,
    editable: true,
    show_in_edit: true,
    show_in_create: true,
  },
  {
    column_name: 'contact_other',
    label: 'Jiný kontakt (ostatní)',
    placeholder: 'Skype, WhatsApp atd.',
    type: 'text',
    required: false,
    editable: true,
    show_in_edit: true,
    show_in_create: true,
  },
  {
    column_name: 'location',
    label: 'Lokalita (Město/Region)',
    placeholder: 'Zadejte lokalitu',
    type: 'text',
    required: false,
    editable: true,
    show_in_edit: true,
    show_in_create: true,
  },
  {
    column_name: 'source_channel',
    label: 'Zdroj oslovení',
    type: 'select',
    options: SALES_LEAD_SOURCE_CHANNELS.map(opt => ({ value: opt, label: opt })),
    required: true,
    editable: true,
    show_in_edit: true,
    show_in_create: true
  },
  {
    column_name: 'source_url',
    label: 'URL Odkaz',
    placeholder: 'Odkaz na profil/inzerát',
    type: 'text',
    required: false,
    editable: true,
    show_in_edit: true,
    show_in_create: true,
  },
  {
    column_name: 'status',
    label: 'Aktuální stav',
    type: 'select',
    options: SALES_LEAD_STATUS_OPTIONS.map(opt => ({ value: opt, label: opt })),
    required: true,
    editable: true,
    show_in_edit: true,
    show_in_create: true
  },
  {
    column_name: 'priority',
    label: 'Priorita',
    type: 'select',
    options: SALES_LEAD_PRIORITY_OPTIONS.map(opt => ({ value: opt, label: opt })),
    required: true,
    editable: true,
    show_in_edit: true,
    show_in_create: true
  },
  {
    column_name: 'last_contact_date',
    label: 'Poslední kontakt',
    type: 'date',
    required: false,
    editable: true,
    show_in_edit: true,
    show_in_create: false
  },
  {
    column_name: 'next_step',
    label: 'Další krok',
    placeholder: 'Co se má udělat dál?',
    type: 'text',
    required: false,
    editable: true,
    show_in_edit: true,
    show_in_create: true
  },
  {
    column_name: 'description',
    label: 'Poznámka k případu',
    type: 'textarea',
    required: false,
    editable: true,
    show_in_edit: true,
    show_in_create: true
  },
  {
    column_name: 'rejection_reason',
    label: 'Důvod zamítnutí',
    type: 'textarea',
    required: false,
    editable: true,
    show_in_edit: true,
    show_in_create: false
  }
];

/**
 * HLAVNÍ TABULKA - Jen ty nejdůležitější sloupce pro přehled
 */
export const SALES_LEAD_COLUMNS: ColumnDefinition[] = [
  { key: 'id', header: 'ID', type: 'text' },
  { key: 'subject_name', header: 'Subjekt / Firma', type: 'text' },
  { key: 'status', header: 'Stav', type: 'text' },
  { key: 'priority', header: 'Priorita', type: 'text' },
  { key: 'salesman_name', header: 'Obchodník', type: 'text' },
  { key: 'updated_at', header: 'Aktualizace', type: 'date', format: 'short' }
];

/**
 * TRASH TABULKA
 */
export const SALES_LEAD_TRASH_COLUMNS: ColumnDefinition[] = [
  { key: 'id', header: 'ID', type: 'text' },
  { key: 'subject_name', header: 'Subjekt', type: 'text' },
  { key: 'deleted_at', header: 'Smazáno', type: 'date', format: 'short' }
];

/**
 * FILTRY
 */
export const SALES_LEAD_FILTER_COLUMNS: FilterColumns[] = [
  { key: 'id', header: 'ID', type: 'text', placeholder: 'ID...', canSort: true },
  { key: 'subject_name', header: 'Subjekt', type: 'text', placeholder: 'Hledat firmu...', canSort: true },
  { key: 'status', header: 'Stav', type: 'select', options: SALES_LEAD_STATUS_OPTIONS, placeholder: '-- Stav --', canSort: true },
  { key: 'priority', header: 'Priorita', type: 'select', options: SALES_LEAD_PRIORITY_OPTIONS, placeholder: '-- Priorita --', canSort: true },
  { key: 'salesman_name', header: 'Obchodník', type: 'text', placeholder: 'Jméno...', canSort: true },
  { key: 'source_channel', header: 'Zdroj', type: 'select', options: SALES_LEAD_SOURCE_CHANNELS, placeholder: '-- Zdroj --', canSort: true },
];

/**
 * DETAIL LEADU - TADY JE ÚPLNĚ VŠE
 */
export const SALES_LEAD_DETAILS_COLUMNS: ItemDetailsColumns[] = [
  { key: 'id', displayName: 'ID Leadů', type: 'text' },
  { key: 'subject_name', displayName: 'Název subjektu', type: 'text' },
  { key: 'contact_person', displayName: 'Kontaktní osoba', type: 'text' },
  { key: 'contact_email', displayName: 'Email', type: 'text' },
  { key: 'contact_phone', displayName: 'Telefon', type: 'text' },
  { key: 'contact_other', displayName: 'Ostatní kontakt', type: 'text' },
  { key: 'location', displayName: 'Lokalita', type: 'text' },
  { key: 'salesman_name', displayName: 'Obchodník', type: 'text' },
  { key: 'source_channel', displayName: 'Zdroj oslovení', type: 'text' },
  { key: 'source_url', displayName: 'Odkaz (URL)', type: 'text' },
  { key: 'status', displayName: 'Stav', type: 'text' },
  { key: 'priority', displayName: 'Priorita', type: 'text' },
  { key: 'last_contact_date', displayName: 'Poslední kontakt', type: 'date', format: 'medium' },
  { key: 'next_step', displayName: 'Následný krok', type: 'text' },
  { key: 'description', displayName: 'Popis/Poznámka', type: 'text' },
  { key: 'rejection_reason', displayName: 'Důvod zamítnutí', type: 'text' },
  { key: 'created_at', displayName: 'Vytvořeno', type: 'date', format: 'medium' },
  { key: 'updated_at', displayName: 'Upraveno', type: 'date', format: 'medium' }
];