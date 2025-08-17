// import { Component, Input, Output, EventEmitter } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ItemDetailsColumns } from '../../../shared/interfaces/item-details-columns';

// @Component({
//   selector: 'app-generic-details',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './generic-details.component.html',
//   styleUrl: './generic-details.component.css'
// })
// export class GenericDetailsComponent {
//   // Vstupní property pro příjem dat k zobrazení
//   @Input() itemData: any;
//   @Input() itemDetailColumns: ItemDetailsColumns[] = [];
//   // Výstupní událost pro signalizaci zavření
//   @Output() closeDetails = new EventEmitter<void>();

//   /**
//    * Metoda pro zavření detailů. Emituje událost `closeDetails`.
//    */
//   onClose(): void {
//     this.closeDetails.emit();
//   }

//   /**
//    * Metoda pro obsluhu kliknutí na overlay.
//    * Zavře okno pouze, pokud bylo kliknuto přímo na pozadí, ne na obsah uvnitř.
//    * @param event Událost kliknutí.
//    */
//   onOverlayClick(event: MouseEvent): void {
//     // Ověří, zda cíl události je samotný overlay, ne jeho vnořené elementy.
//     // To zabrání zavření, pokud uživatel klikne na formulář a přejede myší s drženým tlačítkem na pozadí.
//     if (event.target === event.currentTarget) {
//       this.onClose();
//     }
//   }
// }
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemDetailsColumns } from '../../../shared/interfaces/item-details-columns';

@Component({
  selector: 'app-generic-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './generic-details.component.html',
  styleUrl: './generic-details.component.css'
})
export class GenericDetailsComponent {
  @Input() itemData: any;
  @Input() itemDetailColumns: ItemDetailsColumns[] = [];
  @Output() closeDetails = new EventEmitter<void>();

  onClose(): void {
    this.closeDetails.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  /**
   * Získává hodnotu z objektu pomocí cesty s tečkami.
   * Např. 'roles.0.role_name'
   */
  getValueByPath(obj: any, path: string): any {
    if (!obj || !path) {
      return '';
    }

    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (current === null || current === undefined) {
        return '';
      }
      current = current[key];
    }
    return current;
  }
}