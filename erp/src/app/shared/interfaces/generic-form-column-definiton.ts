//rozhraní pro jeden sloupeček v tabulce v adminu
export interface ColumnDefinition {
  key: string;
  header: string;
  hidden?: boolean;
  type?: 'text' | 'number' | 'currency' | 'date' | 'boolean' | 'link' | 'image' | 'array' | 'object';
  format?: string;
}