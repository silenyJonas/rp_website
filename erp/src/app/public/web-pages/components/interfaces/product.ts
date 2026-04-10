//rozhraní pro produkt v sekci /shop na webu 
//MOZNA SE NEPOUZIVA JESTE VYZKOUMAT
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