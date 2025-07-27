
export interface Product {
  id: string;
  name: string;
  shortDescription: string;
  price: string; // Může být i number, ale pro formátování je string flexibilnější
  imageUrl: string;
  popupType: string; // Změněno na obecný string pro dynamické typy popupů
  details: any; // Objekt pro detailní data specifická pro daný typ popupu
}
