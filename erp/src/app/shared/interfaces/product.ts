// src/shared/interfaces/product.ts

export interface Product {
  id: string;
  name: string;
  shortDescription: string;
  priceCZK: number;
  priceEUR: number;
  price?: string; // Změna: Otazník (?) dělá vlastnost volitelnou
  imageUrl: string;
  popupType: string;
  details: any;
}