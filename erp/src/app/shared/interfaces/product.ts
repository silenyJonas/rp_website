//rozhraní pro produkt v sekci /shop na webu 
export interface Product {
  id: string;
  name: string;
  shortDescription: string;
  priceCZK: number;
  priceEUR: number;
  price?: string;
  imageUrl: string;
  popupType: string;
  details: any;
}