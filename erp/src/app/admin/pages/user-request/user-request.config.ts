// src/app/pages/user-request/user-request.config.ts

import { Buttons } from '../../components/generic-table/generic-table.component';
import { InputDefinition } from '../../components/generic-form/generic-form.component';
import { ColumnDefinition } from '../../../shared/interfaces/generic-form-column-definiton';
import { FilterColumns } from '../../../shared/interfaces/filter-columns';
import { ItemDetailsColumns } from '../../../shared/interfaces/item-details-columns';

export const USER_REQUEST_BUTTONS: Buttons[] = [
  { display_name: 'Detaily', isActive: true, type: 'info_button' },
  { display_name: 'Editovat', isActive: true, type: 'neutral_button' },
  { display_name: 'Nove button', isActive: false, type: 'neutral_button' },
  { display_name: 'Smazat', isActive: true, type: 'delete_button' },
];

export const USER_REQUEST_FORM_FIELDS: InputDefinition[] = [
  {
    column_name: 'thema',
    label: 'Téma',
    placeholder: 'Zadejte téma požadavku',
    type: 'text',
    required: true,
    pattern: '^[a-zA-Z0-9ěščřžýáíéóúůďťňĚŠČŘŽÝÁÍÉÚŮĎŤŇ\\s]{3,100}$',
    errorMessage: 'Téma musí mít 3-100 znaků.',
    editable: true,
    show_in_edit: true,
    show_in_create: true,
  },
  {
    column_name: 'contact_email',
    label: 'Kontaktní e-mail',
    placeholder: 'Zadejte e-mail',
    type: 'email',
    required: true,
    pattern: '[^@]+@[^@]+\\.[^@]+',
    errorMessage: 'Zadejte platnou e-mailovou adresu.',
    editable: true,
    show_in_edit: true,
    show_in_create: true
  },
  {
    column_name: 'contact_phone',
    label: 'Telefon',
    placeholder: 'Zadejte telefonní číslo (volitelné)',
    type: 'tel',
    required: false,
    pattern: '^[0-9+\\s-]{9,20}$',
    errorMessage: 'Zadejte platné telefonní číslo.',
    editable: true,
    show_in_edit: true,
    show_in_create: true
  },
  {
    column_name: 'order_description',
    label: 'Popis objednávky',
    placeholder: 'Popište svůj požadavek',
    type: 'textarea',
    required: true,
    errorMessage: 'Popis je povinný.',
    editable: true,
    show_in_edit: true,
    show_in_create: true
  },
  {
    column_name: 'note',
    label: 'Poznámka',
    placeholder: 'Napište poznámku',
    type: 'textarea',
    required: false,
    errorMessage: '',
    editable: true,
    show_in_edit: true,
    show_in_create: true
  },
  {
    column_name: 'status',
    label: 'Status',
    placeholder: '',
    type: 'select',
    options: [
      { value: 'Nově zadané', label: 'Nízká' },
      { value: 'Zpracovává se', label: 'Zpracovává se' },
      { value: 'Dokončeno', label: 'Dokončeno' },
      { value: 'Zrušeno', label: 'Zrušeno' },
    ],
    required: true,
    errorMessage: 'Pole je povinné.',
    editable: true,
    show_in_edit: true,
    show_in_create: true
  },
  {
    column_name: 'priority',
    label: 'Priorita',
    placeholder: '',
    type: 'select',
    options: [
      { value: 'Nízká', label: 'Nízká' },
      { value: 'Neutrální', label: 'Neutrální' },
      { value: 'Vysoká', label: 'Vysoká' },
    ],
    required: true,
    errorMessage: 'Pole je povinné.',
    editable: true,
    show_in_edit: true,
    show_in_create: true
  },
  {
    column_name: 'id',
    label: 'ID záznamu',
    type: 'text',
    editable: false,
    show_in_edit: false,
    show_in_create: false
  },
  {
    column_name: 'created_at',
    label: 'Vytvořeno',
    type: 'text',
    editable: false,
    show_in_edit: false,
    show_in_create: false
  },
  
];

export const USER_REQUEST_COLUMNS: ColumnDefinition[] = [
  { key: 'id', header: 'ID', type: 'text' },
  { key: 'thema', header: 'Téma', type: 'text' },
  { key: 'contact_email', header: 'Email', type: 'text' },
  { key: 'contact_phone', header: 'Telefon', type: 'text' },
  { key: 'status', header: 'Stav', type: 'text' },
  { key: 'priority', header: 'Priorita', type: 'text' },
  { key: 'created_at', header: 'Vytvořeno', type: 'date', format: 'short' },
  { key: 'order_description', header: 'Popis objednávky', type: 'text' },
  { key: 'note', header: 'Poznámka', type: 'text' },
  { key: 'updated_at', header: 'Změněno', type: 'date', format: 'short' }
];

export const USER_REQUEST_TRASH_COLUMNS: ColumnDefinition[] = [
  { key: 'id', header: 'ID', type: 'text' },
  { key: 'thema', header: 'Téma', type: 'text' },
  { key: 'contact_email', header: 'Email', type: 'text' },
  { key: 'contact_phone', header: 'Telefon', type: 'text' },
  { key: 'status', header: 'Stav', type: 'text' },
  { key: 'priority', header: 'Priorita', type: 'text' },
  { key: 'created_at', header: 'Vytvořeno', type: 'date', format: 'short' },
  { key: 'order_description', header: 'Popis objednávky', type: 'text' },
  { key: 'note', header: 'Poznámka', type: 'text' },
  { key: 'deleted_at', header: 'Smazáno', type: 'date', format: 'short' },
  { key: 'updated_at', header: 'Změněno', type: 'date', format: 'short' }
];

export const USER_REQUEST_STATUS_OPTIONS: string[] = ['Nově zadané', 'Zpracovává se', 'Dokončeno', 'Zrušeno'];
export const USER_REQUEST_PRIORITY_OPTIONS: string[] = ['Nízká', 'Neutrální', 'Vysoká'];

export const USER_REQUEST_FILTER_COLUMNS: FilterColumns[] = [
  {
    key: 'id',
    header: 'ID',
    type: 'text',
    placeholder: 'Hledat podle ID',
    canSort: true,
  },
  {
    key: 'thema',
    header: 'Téma',
    type: 'text',
    placeholder: 'Hledat téma',
    canSort: true,
  },
  {
    key: 'contact_email',
    header: 'E-mail',
    type: 'email',
    placeholder: 'Hledat podle e-mailu',
    canSort: true,
  },
  {
    key: 'contact_phone',
    header: 'Telefon',
    type: 'text',
    placeholder: 'Hledat telefon',
    canSort: true,
  },
  {
    key: 'order_description',
    header: 'Popis objednávky',
    type: 'text',
    placeholder: 'Hledat v popisu objednávky',
    canSort: true,
  },
  {
    key: 'status',
    header: 'Stav',
    type: 'select',
    options: USER_REQUEST_STATUS_OPTIONS,
    placeholder: '-- Vybrat stav --',
    canSort: true,
  },
  {
    key: 'priority',
    header: 'Priorita',
    type: 'select',
    options: USER_REQUEST_PRIORITY_OPTIONS,
    placeholder: '-- Vybrat prioritu --',
    canSort: true,
  },
  {
    key: 'created_at',
    header: 'Datum vytvoření',
    type: 'text',
    placeholder: 'Hledat podle data vytvoření',
    canSort: true,
  },
  {
    key: 'updated_at',
    header: 'Datum aktualizace',
    type: 'text',
    placeholder: 'Hledat podle data aktualizace',
    canSort: true,
  },
];

export const USER_REQUEST_DETAILS_COLUMNS: ItemDetailsColumns[] = [
  {
    key: 'id',
    display_name: 'ID položky'
  },
  {
    key: 'thema',
    display_name: 'Téma'
  },
  {
    key: 'contact_email',
    display_name: 'Kontaktní Email'
  },
  {
    key: 'contact_phone',
    display_name: 'Kontaktní Telefon'
  },
  {
    key: 'order_description',
    display_name: 'Popip Požadavku'
  },
  {
    key: 'status',
    display_name: 'Status'
  },
  {
    key: 'priority',
    display_name: 'Priorita'
  },
  {
    key: 'created_at',
    display_name: 'Datum Vytvoření'
  },
  {
    key: 'updated_at',
    display_name: 'Poslední Datum Změny'
  },
  {
    key: 'note',
    display_name: 'Interní Poznámka'
  },

];