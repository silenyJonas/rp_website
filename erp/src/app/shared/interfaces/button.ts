// shared/interfaces/button.ts
export interface Button {
  action: string;
  label: string;
  icon?: string;
  class: string;
  isActive?: boolean; // Pro přepínače (např. filtr je otevřený)
  showIf?: boolean;   // Podmínka zobrazení (např. !showTrashTable)
  permission?: string; // Pro direktivu *appHasPermission
  toggleStates?: {     // Pro tlačítka co se mění (Koš vs Aktivní)
    activeLabel: string;
    activeIcon: string;
    activeClass: string;
  };
}