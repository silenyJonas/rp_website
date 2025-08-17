export interface ItemDetailsColumns {
  key: string;
  displayName: string;
  type: 'text' | 'currency' | 'date' | 'boolean' | 'image' | 'array' | 'object';
  format?: string;
}
