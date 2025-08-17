
import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule, CurrencyPipe, KeyValuePipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ColumnDefinition } from '../../../shared/interfaces/generic-form-column-definiton';
import { BaseDataComponent } from '../base-data/base-data.component';
import { DataHandler } from '../../../core/services/data-handler.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { AlertDialogService } from '../../../core/services/alert-dialog.service';

/**
 * Původní rozhraní Buttons, které jasně definuje typ tlačítka.
 */
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
    DatePipe
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
  @Input() isLogsTable: boolean = false;

  // Nové události pro komunikaci s nadřazenou komponentou
  @Output() itemDeleted = new EventEmitter<any>();
  @Output() createFormOpened = new EventEmitter<void>();
  @Output() editFormOpened = new EventEmitter<any>();
  // Událost pro zobrazení detailů, kterou vyvoláme při info_button
  @Output() viewDetailsOpened = new EventEmitter<any>();

  public isFullWidth: boolean = true;
  
  constructor(
    protected override dataHandler: DataHandler,
    protected override cd: ChangeDetectorRef,
    private confirmDialogService: ConfirmDialogService,
    private alertDialogService: AlertDialogService
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
  
  /**
   * Zpracovává akce tlačítek na základě jejich 'type'.
   * @param item Data řádku, na který se kliklo.
   * @param buttonType Typ tlačítka (např. 'info_button', 'delete_button').
   */
  handleAction(item: any, buttonType: string): void {
    switch (buttonType) {
      case 'info_button':
        // Volá událost pro zobrazení detailů
        this.viewDetailsOpened.emit(item);
        break;
      case 'create_button':
        // Toto tlačítko se normálně nepoužívá na řádku, ale pro jistotu to tu nechám
        this.createFormOpened.emit();
        break;
      case 'delete_button':
        this.confirmDialogService.open('Potvrzení smazání', 'Opravdu si přejete smazat tuto položku?').then(result => {
          if (result) {
            this.deleteData(item.id).subscribe({
              next: () => {
                this.alertDialogService.open('Úspěch', 'Položka byla úspěšně smazána.', 'success');
                const index = this.data.findIndex(dataItem => dataItem.id === item.id);
                if (index > -1) {
                  this.data.splice(index, 1);
                  this.cd.markForCheck();
                  this.itemDeleted.emit(item);
                }
              },
              error: (err) => {
                // this.alertDialogService.open('Chyba', 'Při mazání položky nastala chyba.', 'danger');
                console.error('Soft delete error:', err);
              }
            });
          } else {
            this.alertDialogService.open('Zrušeno', 'Smazání položky bylo zrušeno.', 'warning');
          }
        }).catch(error => {
          this.alertDialogService.open('Chyba', 'Při pokusu o smazání nastala chyba.', 'danger');
          console.error('Dialog error:', error);
        });
        break;
      case 'neutral_button':
        // Volá událost pro editaci a předání dat
        this.editFormOpened.emit(item);
        break;
      default:
        console.warn('Neznámý typ tlačítka:', buttonType);
    }
  }

  get colspanValue(): number {
    const activeButtonsCount = this.buttons?.filter(b => b.isActive).length || 0;
    return this.columnDefinitions.length + (activeButtonsCount > 0 ? 1 : 0);
  }

  async exportToCSV() {
    try {
      this.isLoading = true;
      this.cd.markForCheck();
      
      const responseData = await firstValueFrom(this.loadAllData());
    
      const allData: any[] = Array.isArray(responseData) ? responseData : [];
      
      if (allData.length > 0) {
        let csv = '';
        const headers = this.columnDefinitions.map(col => col.header || col.key).join(';');
        csv += headers + '\n';
        
        allData.forEach(item => {
          const row = this.columnDefinitions.map(column => {
            let value = this.getCellValue(item, column);
            if (value === null || value === undefined) {
              value = '';
            }
            return `"${String(value).replace(/"/g, '""')}"`;
          }).join(';');
          csv += row + '\n';
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', `${this.tableCaption || 'export'}.csv`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          this.alertDialogService.open('Upozornění', 'Váš prohlížeč nepodporuje automatické stažení. Zkopírujte data ručně.', 'info');
        }
      } else {
        this.alertDialogService.open('Export', 'Žádná data k exportu.', 'warning');
      }
    } catch (error: any) {
      this.alertDialogService.open('Chyba', 'Při exportu dat nastala chyba. Více informací v konzoli pro vývojáře.', 'danger');
      console.error('Export error:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
    } finally {
      this.isLoading = false;
      this.cd.markForCheck();
    }
  }

  openCreateForm(){
    this.createFormOpened.emit();
  }
}
