
// import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnChanges, SimpleChanges } from '@angular/core';
// import { CommonModule, CurrencyPipe, KeyValuePipe, DatePipe } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { firstValueFrom } from 'rxjs';
// import { ColumnDefinition } from '../../../shared/interfaces/generic-form-column-definiton';
// import { BaseDataComponent } from '../base-data/base-data.component';
// import { DataHandler } from '../../../core/services/data-handler.service';
// import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service'; // <-- Importuj novou službu
// import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
// export interface Buttons {
//   display_name: string;
//   isActive: boolean;
//   type: 'info_button' | 'create_button' | 'delete_button' | 'neutral_button'
// }

// @Component({
//   selector: 'app-generic-table',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     CurrencyPipe,
//     KeyValuePipe,
//     DatePipe,
//     ConfirmDialogComponent // <-- Přidej do imports
//   ],
//   templateUrl: './generic-table.component.html',
//   styleUrls: ['./generic-table.component.css'],
//   changeDetection: ChangeDetectionStrategy.OnPush
// })
// export class GenericTableComponent extends BaseDataComponent<any> implements OnInit, OnChanges {
//   @Input() override data: any[] = [];
//   @Input('columns') columnDefinitions: ColumnDefinition[] = [];
//   @Input() tableCaption?: string;
//   @Input() override apiEndpoint: string = '';
//   @Input() override isLoading: boolean = false;
//   @Input() uploadsBaseUrl: string = '';
//   @Input() buttons: Buttons[] = [];

//   public isFullWidth: boolean = true;

//   constructor(
//     protected override dataHandler: DataHandler,
//     protected override cd: ChangeDetectorRef,
//     private confirmDialogService: ConfirmDialogService // <-- Injektuj službu
//   ) {
//     super(dataHandler, cd);
//   }

//   override ngOnChanges(changes: SimpleChanges): void {
//     super.ngOnChanges(changes);
//   }

//   override ngOnInit(): void {
//     super.ngOnInit();
//   }

//   getCellValue(item: any, column: ColumnDefinition): any {
//     const keys = column.key.split('.');
//     const value = keys.reduce((obj, key) => obj?.[key], item);
//     switch (column.type) {
//       case 'currency':
//         return value ? (new CurrencyPipe('cs-CZ')).transform(value, 'CZK', 'symbol-narrow', '1.2-2') : '';
//       case 'date':
//         return value ? (new DatePipe('cs-CZ')).transform(value, column.format || 'shortDate') : '';
//       case 'boolean':
//         return value ? 'Ano' : 'Ne';
//       case 'image':
//         return value ? `${this.uploadsBaseUrl}${value}` : '';
//       case 'array':
//         return Array.isArray(value) ? value.join(', ') : value;
//       case 'object':
//         return this.isObject(value) ? JSON.stringify(value) : value;
//       default:
//         return value;
//     }
//   }

//   isObject(value: any): boolean {
//     return typeof value === 'object' && value !== null && !Array.isArray(value);
//   }

//   handleAction(item: any, buttonType: string): void {
//     switch (buttonType) {
//       case 'info_button':
//         console.log('Zavolána metoda info() pro položku:', item);
//         break;
//       case 'create_button':
//         console.log('Zavolána metoda create() pro položku:', item);
//         break;
//       case 'delete_button':
//         this.confirmDialogService.open('Potvrzení smazání', 'Opravdu si přejete smazat tuto položku?').then(result => {
//           if (result) {
//             console.log('Uživatel potvrdil smazání pro položku:', item);
//             // Implement your actual deletion logic here.
//           } else {
//             console.log('Uživatel zrušil smazání pro položku:', item);
//           }
//         });
//         break;
//       case 'neutral_button':
//         console.log('Zavolána metoda neutral() pro položku:', item);
//         break;
//       default:
//         console.warn('Neznámý typ tlačítka:', buttonType);
//     }
//   }

//   get colspanValue(): number {
//     const activeButtonsCount = this.buttons?.filter(b => b.isActive).length || 0;
//     return this.columnDefinitions.length + (activeButtonsCount > 0 ? 1 : 0);
//   }


// }
import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, CurrencyPipe, KeyValuePipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ColumnDefinition } from '../../../shared/interfaces/generic-form-column-definiton';
import { BaseDataComponent } from '../base-data/base-data.component';
import { DataHandler } from '../../../core/services/data-handler.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { AlertDialogService } from '../../../core/services/alert-dialog.service'; // <-- Importujte novou službu

export interface Buttons {
  display_name: string;
  isActive: boolean;
  type: 'info_button' | 'create_button' | 'delete_button' | 'neutral_button';
}

@Component({
  selector: 'app-generic-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe,
    KeyValuePipe,
    DatePipe,
    // Komponenty pro dialogy se již neimportují přímo, protože je vytvářejí služby
  ],
  templateUrl: './generic-table.component.html',
  styleUrls: ['./generic-table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenericTableComponent extends BaseDataComponent<any> implements OnInit, OnChanges {
  @Input() override data: any[] = [];
  @Input('columns') columnDefinitions: ColumnDefinition[] = [];
  @Input() tableCaption?: string;
  @Input() override apiEndpoint: string = '';
  @Input() override isLoading: boolean = false;
  @Input() uploadsBaseUrl: string = '';
  @Input() buttons: Buttons[] = [];

  public isFullWidth: boolean = true;

  constructor(
    protected override dataHandler: DataHandler,
    protected override cd: ChangeDetectorRef,
    private confirmDialogService: ConfirmDialogService,
    private alertDialogService: AlertDialogService // <-- Injektujte novou službu
  ) {
    super(dataHandler, cd);
  }

  override ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);
  }

  override ngOnInit(): void {
    super.ngOnInit();
  }

  getCellValue(item: any, column: ColumnDefinition): any {
    const keys = column.key.split('.');
    const value = keys.reduce((obj, key) => obj?.[key], item);
    switch (column.type) {
      case 'currency':
        return value ? (new CurrencyPipe('cs-CZ')).transform(value, 'CZK', 'symbol-narrow', '1.2-2') : '';
      case 'date':
        return value ? (new DatePipe('cs-CZ')).transform(value, column.format || 'shortDate') : '';
      case 'boolean':
        return value ? 'Ano' : 'Ne';
      case 'image':
        return value ? `${this.uploadsBaseUrl}${value}` : '';
      case 'array':
        return Array.isArray(value) ? value.join(', ') : value;
      case 'object':
        return this.isObject(value) ? JSON.stringify(value) : value;
      default:
        return value;
    }
  }

  isObject(value: any): boolean {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  
  handleAction(item: any, buttonType: string): void {
    switch (buttonType) {
      case 'info_button':
        // Použijeme AlertDialogService pro zobrazení informace
        this.alertDialogService.open('Informace o položce', 'Zde je detailní informace o vybrané položce.', 'info');
        break;
      case 'create_button':
        // Můžeme použít i pro informaci o úspěšném vytvoření
        this.alertDialogService.open('Vytvoření položky', 'Nová položka byla úspěšně vytvořena.', 'success');
        break;
      case 'delete_button':
        // Použijeme ConfirmDialogService pro potvrzení smazání
        this.confirmDialogService.open('Potvrzení smazání', 'Opravdu si přejete smazat tuto položku?').then(result => {
          if (result) {
            
          } else {
            console.log('Uživatel zrušil smazání pro položku:', item);
            this.alertDialogService.open('Zrušeno', 'Smazání položky bylo zrušeno.', 'warning');
          }
        }).catch(error => {
          this.alertDialogService.open('Chyba', 'Při pokusu o smazání nastala chyba.', 'danger');
        });
        break;
      case 'neutral_button':
        // Příklad použití pro neutrální akci
        this.alertDialogService.open('Neutrální akce', 'Byla provedena neutrální akce s položkou.', 'info');
        break;
      default:
        console.warn('Neznámý typ tlačítka:', buttonType);
    }
  }

  // ---

  get colspanValue(): number {
    const activeButtonsCount = this.buttons?.filter(b => b.isActive).length || 0;
    return this.columnDefinitions.length + (activeButtonsCount > 0 ? 1 : 0);
  }
}