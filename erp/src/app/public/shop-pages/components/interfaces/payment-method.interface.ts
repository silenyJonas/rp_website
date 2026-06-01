export interface PaymentMethod {
  id: number;
  name: string;
  code: string;
  provider: string;
  price: number;              // 👈 Přidáno kvůli zobrazení ceny (+ 39 Kč / Zdarma)
  image_url: string | null;   // 👈 Přidáno pro dynamické načítání loga z backendu
  description?: string;       // 👈 Dobré mít jako volitelné, pokud zobrazuješ popisky
  is_active?: boolean;        // 👈 Volitelné
}