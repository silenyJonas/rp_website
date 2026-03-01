// src/app/shared/imports/shared-config.ts

// Přímé re-exporty existujících interfaců pro čisté cesty
export type { Buttons } from '../interfaces/buttons';
export type { InputDefinition } from '../interfaces/input-definiton';
export type { ColumnDefinition } from '../interfaces/generic-form-column-definiton';
export type { FilterColumns } from '../interfaces/filter-columns';
export type { ItemDetailsColumns } from '../interfaces/item-details-columns';

// Zde můžeš přidat i společné konstanty, které se opakují v konfiguracích
export const COMMON_DATE_FORMATS = {
  short: 'dd.MM.yyyy',
  full: 'dd.MM.yyyy HH:mm',
} as const;