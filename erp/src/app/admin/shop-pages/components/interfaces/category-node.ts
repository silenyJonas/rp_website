export interface CategoryNode {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  is_active: boolean;
  sort_order: number;
  image_path?: string | null;
  description?: string | null;
  children: CategoryNode[]; // Rekurzivní vazba pro podstrom
  products_count?: number;
  // --- UI STAVY (neukládají se do DB) ---
  isEditing?: boolean;       // Přepíná mezi textem a inputem
  isExpanded?: boolean;      // Řídí, zda jsou vidět děti (rolování)
  isLoading?: boolean;       // Volitelné: pro indikaci načítání konkrétní větve
  directChildrenCount?: number;
  totalRecursiveCount?: number;
}