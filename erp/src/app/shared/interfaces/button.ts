// shared/interfaces/button.ts
export interface Button {
  action: string;
  label: string;
  icon?: string;
  class: string;
  isActive?: boolean; 
  disabled?: boolean;  // <--- TENTO ŘÁDEK MUSÍŠ PŘIDAT SEM
  showIf?: boolean;   
  permission?: string; 
  toggleStates?: {     
    activeLabel: string;
    activeIcon: string;
    activeClass: string;
  };
}