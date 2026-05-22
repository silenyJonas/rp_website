import * as Core from '../../../shared/imports/core-providers';

export const TOOLBAR_BUTTONS: Core.Button[] = [
  {
    action: 'toggleFilters',
    label: 'Filtry',
    icon: '🔍',
    class: 'btn-filter',
    isActive: false
  },
  {
    action: 'handleCreateFormOpened',
    label: 'Nový produkt',
    icon: '➕',
    class: 'btn-create',
    showIf: true
  },
  {
    action: 'exportActiveTable',
    label: 'Export CSV',
    icon: '📥',
    class: 'btn-export',
    showIf: true
  },
  {
    action: 'toggleTable',
    label: 'Koš',
    icon: '🗑️',
    class: 'btn-trash',
    permission: 'shop-products-delete'
  }
];

export const PRODUCT_BUTTONS: Core.TableButtons[] = [
  { display_name: '🔎', header_name: 'Detaily', isActive: true, type: 'info_button', action: 'details' },
  { display_name: '✒️', header_name: 'Edit', isActive: true, type: 'neutral_button', action: 'edit' },
  { display_name: '⚙️', header_name: 'Varianty', isActive: true, type: 'neutral_button', action: 'custom_prod_var' },
  { display_name: '🖼️', header_name: 'Obrázky', isActive: true, type: 'neutral_button', action: 'custom_prod_img' },
  { display_name: '🗑️', header_name: 'Smazat', isActive: true, type: 'delete_button', action: 'delete' },
];

export const PRODUCT_FORM_FIELDS: Core.InputDefinition[] = [
  {
    column_name: 'name',
    label: 'Název produktu',
    placeholder: 'Např. iPhone 15 Pro',
    type: 'text',
    required: true,
    errorMessage: 'Název produktu je povinný.',
    editable: true,
    show_in_edit: true,
    show_in_create: true,
  },
  {
    column_name: 'sku',
    label: 'SKU (Kód)',
    placeholder: 'APPLE-I15P-BLK',
    type: 'text',
    required: true,
    errorMessage: 'Kód produktu (SKU) je povinný.',
    editable: true,
    show_in_edit: true,
    show_in_create: true,
  },
  {
    column_name: 'category_id',
    label: 'Kategorie',
    type: 'select',
    options: [], // Dynamicky se plní z API /shop/categories
    required: true,
    errorMessage: 'Vyberte kategorii.',
    editable: true,
    show_in_edit: true,
    show_in_create: true,
  },
  {
    column_name: 'supplier_id',
    label: 'Dodavatel',
    type: 'select',
    options: [], // Dynamicky se plní z API /shop/suppliers
    required: false,
    editable: true,
    show_in_edit: true,
    show_in_create: true,
  },
  {
    column_name: 'price',
    label: 'Základní cena',
    type: 'number',
    required: true,
    errorMessage: 'Zadejte cenu.',
    editable: true,
    show_in_edit: true,
    show_in_create: true,
  },
  {
    column_name: 'stock_quantity',
    label: 'Skladové množství',
    type: 'number',
    required: false,
    editable: true,
    show_in_edit: true,
    show_in_create: true,
  },
  {
    column_name: 'description',
    label: 'Popis produktu',
    type: 'textarea',
    required: false,
    editable: true,
    show_in_edit: true,
    show_in_create: true,
  },
  {
    column_name: 'is_active',
    label: 'Aktivní',
    type: 'checkbox',
    editable: true,
    show_in_edit: true,
    show_in_create: true,
  },
  {
    column_name: 'is_featured',
    label: 'Doporučené',
    type: 'checkbox',
    editable: true,
    show_in_edit: true,
    show_in_create: true,
  }
];

export const PRODUCT_COLUMNS: Core.ColumnDefinition[] = [
  { key: 'id', header: 'ID', type: 'text' },
  { key: 'name', header: 'Produkt', type: 'text' },
  { key: 'sku', header: 'SKU', type: 'text' },
  { key: 'category.name', header: 'Kategorie', type: 'text' }, // Ověř podporu tečkové notace
  { key: 'price', header: 'Cena (s DPH)', type: 'currency' }, 
  { key: 'stock_quantity', header: 'Skladem', type: 'text' },
  { key: 'is_active', header: 'Aktivní', type: 'boolean' }
];

export const TRASH_PRODUCT_COLUMNS: Core.ColumnDefinition[] = [
  { key: 'id', header: 'ID', type: 'text' },
  { key: 'name', header: 'Produkt', type: 'text' },
  { key: 'sku', header: 'SKU', type: 'text' },
  { key: 'deleted_at', header: 'Smazáno', type: 'date', format: 'short' }
];

export const FILTER_COLUMNS: Core.FilterColumns[] = [
  { key: 'id', header: 'ID', type: 'text', placeholder: 'ID', canSort: true },
  { key: 'search', header: 'Hledat', type: 'text', placeholder: 'Název, SKU, popis...', canSort: false },
  { key: 'category_id', header: 'Kategorie', type: 'select', options: [], placeholder: '-- Kategorie --', canSort: true },
  { key: 'supplier_id', header: 'Dodavatel', type: 'select', options: [], placeholder: '-- Dodavatel --', canSort: true },
  { key: 'low_stock', header: 'Nízký sklad', type: 'checkbox', canSort: false, placeholder: ''},
  { key: 'is_active', header: 'Pouze aktivní', type: 'checkbox', canSort: true, placeholder: '' }
];

export const PRODUCT_DETAILS_COLUMNS: Core.ItemDetailsColumns[] = [
  { key: 'id', displayName: 'ID produktu', type: 'text' },
  { key: 'name', displayName: 'Název', type: 'text' },
  { key: 'slug', displayName: 'Slug (URL)', type: 'text' },
  { key: 'sku', displayName: 'SKU kód', type: 'text' },
  { key: 'category.name', displayName: 'Kategorie', type: 'text' },
  { key: 'supplier.name', displayName: 'Dodavatel', type: 'text' },
  { key: 'price', displayName: 'Základní cena', type: 'currency' }, // Opraveno z 'text' na 'currency'
  { key: 'stock_quantity', displayName: 'Celkový sklad', type: 'text' }, // Opraveno z 'text' na 'number'
  { key: 'description', displayName: 'Popis', type: 'text' },
  { key: 'is_active', displayName: 'Stav aktivace', type: 'boolean' },
  { key: 'is_featured', displayName: 'Doporučený produkt', type: 'boolean' },
  { key: 'created_at', displayName: 'Vytvořeno', type: 'date', format: 'medium' },
  { key: 'updated_at', displayName: 'Naposledy upraveno', type: 'date', format: 'medium' }
];