// src/app/shared/interfaces/column-definition.ts

export interface ColumnDefinition {
  /** Klíč vlastnosti v datovém objektu (podporuje tečkovou notaci pro vnořené vlastnosti, např. 'user.name'). */
  key: string;
  /** Popisek sloupce zobrazený v hlavičce tabulky. */
  header: string;
  /** Volitelné: Určuje, zda je sloupec skrytý. Výchozí je false. */
  hidden?: boolean;
  /** Volitelné: Typ zobrazení dat (např. 'currency', 'date', 'image', 'text'). Umožňuje specifické formátování. */
  type?: 'text' | 'number' | 'currency' | 'date' | 'boolean' | 'link' | 'image' | 'array' | 'object';
  /** Volitelné: Formátovací řetězec pro typy 'currency' nebo 'date'. */
  format?: string;
}

/**
 * Rozhraní pro akční tlačítka v tabulce.
 * Pro tuto RAW verzi je zatím nevyužijeme, ale necháme si je pro budoucí rozšíření.
 */
export interface ActionButton {
  label: string;
  action: string;
  display?: (item: any) => boolean;
  class?: string;
}