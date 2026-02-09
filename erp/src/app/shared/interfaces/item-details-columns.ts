//rozhraní které se používá v configach stranek a pri zobrazeni jednoho radku detailu v a adminu
export interface ItemDetailsColumns {
  key: string;
  displayName: string;
  type: 'text' | 'file' | 'currency' | 'date' | 'boolean' | 'image' | 'array' | 'object';
  format?: string;
}
