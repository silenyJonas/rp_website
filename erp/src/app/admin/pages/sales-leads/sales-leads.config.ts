import { Buttons } from '../../components/generic-table/generic-table.component';
import { InputDefinition } from '../../components/generic-form/generic-form.component';
import { ColumnDefinition } from '../../../shared/interfaces/generic-form-column-definiton';
import { FilterColumns } from '../../../shared/interfaces/filter-columns';
import { ItemDetailsColumns } from '../../../shared/interfaces/item-details-columns';

export const SALES_LEAD_BUTTONS: Buttons[] = [
  { display_name: 'Detaily', isActive: true, type: 'info_button', action: 'details' },
  { display_name: 'Editovat', isActive: true, type: 'neutral_button', action: 'edit' },
  { display_name: 'Smazat', isActive: true, type: 'delete_button', action: 'delete' },
];

export const SALES_LEAD_STATUS_OPTIONS: string[] = [
  'nové', 
  'probíhá komunikace', 
  'příprava nabídky', 
  'nabídka odeslána', 
  'vyjednávání', 
  'pozastaveno', 
  'Přebírá si dev team',
  'uzavřeno - získáno', 
  'uzavřeno - ztraceno',
  'jiné'
];

export const SALES_LEAD_PRIORITY_OPTIONS: string[] = [
  'Nízká', 
  'Podprůměrná', 
  'Neutrální', 
  'Vysoká', 
  'Kritická'
];

export const SALES_LEAD_SOURCE_CHANNELS: string[] = [
  'LinkedIn', 
  'Instagram', 
  'Telefon', 
  'Inzerát', 
  'Osobní', 
  'Web', 
  'Email',
  'Doporučení'
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
    column_name: 'first_contact_date',
    label: 'Datum prvního kontaktu',
    type: 'date',
    required: true,
    editable: true,
    show_in_edit: true,
    show_in_create: true
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

export const SALES_LEAD_COLUMNS: ColumnDefinition[] = [
  { key: 'id', header: 'ID', type: 'text' },
  { key: 'subject_name', header: 'Subjekt / Firma', type: 'text' },
  { key: 'status', header: 'Stav', type: 'text' },
  { key: 'priority', header: 'Priorita', type: 'text' },
  { key: 'contact_person', header: 'Kontaktní osoba', type: 'text' },
  { key: 'contact_email', header: 'Email', type: 'text' },
  { key: 'contact_phone', header: 'Telefon', type: 'text' },
  { key: 'contact_other', header: 'Ostatní kontakt', type: 'text' },
  { key: 'location', header: 'Lokalita', type: 'text' },
  { key: 'salesman_name', header: 'Obchodník', type: 'text' },
  { key: 'first_contact_date', header: 'Kontaktováno', type: 'date', format: 'short' },
  { key: 'next_step', header: 'Další krok', type: 'text' },
  { key: 'updated_at', header: 'Aktualizace', type: 'date', format: 'short' }
];

export const SALES_LEAD_TRASH_COLUMNS: ColumnDefinition[] = [
  { key: 'id', header: 'ID', type: 'text' },
  { key: 'subject_name', header: 'Subjekt', type: 'text' },
  { key: 'deleted_at', header: 'Smazáno', type: 'date', format: 'short' }
];

export const SALES_LEAD_FILTER_COLUMNS: FilterColumns[] = [
  { key: 'id', header: 'ID', type: 'text', placeholder: 'ID...', canSort: true },
  { key: 'subject_name', header: 'Subjekt', type: 'text', placeholder: 'Hledat firmu...', canSort: true },
  { key: 'status', header: 'Stav', type: 'select', options: SALES_LEAD_STATUS_OPTIONS, placeholder: '-- Stav --', canSort: true },
  { key: 'priority', header: 'Priorita', type: 'select', options: SALES_LEAD_PRIORITY_OPTIONS, placeholder: '-- Priorita --', canSort: true },
  { key: 'contact_email', header: 'Email', type: 'text', placeholder: 'Hledat email...', canSort: true },
  { key: 'contact_phone', header: 'Telefon', type: 'text', placeholder: 'Hledat telefon...', canSort: true },
  { key: 'contact_other', header: 'Ostatní', type: 'text', placeholder: 'Ostatní kontakt...', canSort: true },
  { key: 'salesman_name', header: 'Obchodník', type: 'text', placeholder: 'Jméno...', canSort: true },
];

export const SALES_LEAD_DETAILS_COLUMNS: ItemDetailsColumns[] = [
  { key: 'id', displayName: 'ID', type: 'text' },
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
  { key: 'first_contact_date', displayName: 'První kontakt', type: 'date', format: 'medium' },
  { key: 'last_contact_date', displayName: 'Poslední kontakt', type: 'date', format: 'medium' },
  { key: 'next_step', displayName: 'Následný krok', type: 'text' },
  { key: 'description', displayName: 'Popis/Poznámka', type: 'text' },
  { key: 'rejection_reason', displayName: 'Důvod zamítnutí', type: 'text' },
  { key: 'created_at', displayName: 'Vytvořeno', type: 'date', format: 'medium' },
  { key: 'updated_at', displayName: 'Upraveno', type: 'date', format: 'medium' }
];