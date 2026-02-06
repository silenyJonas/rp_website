
import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule, CurrencyPipe, KeyValuePipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ColumnDefinition } from '../../../shared/interfaces/generic-form-column-definiton';
import { BaseDataComponent } from '../base-data/base-data.component';
import { DataHandler } from '../../../core/services/data-handler.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { AlertDialogService } from '../../../core/services/alert-dialog.service';

export interface Buttons {
  display_name: string;
  isActive: boolean;
  type: 'confirm_button' | 'delete_button' | 'info_button' | 'create_button' | 'delete_button' | 'neutral_button';
  header_name: string;
}

@Component({
  selector: 'app-generic-trash-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
],
  templateUrl: './generic-trash-table.component.html',
  styleUrls: ['./generic-trash-table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenericTrashTableComponent extends BaseDataComponent<any> implements OnInit, OnChanges {
  @Input() override data: any[] = [];
  @Input('columns') columnDefinitions: ColumnDefinition[] = [];
  @Input() tableCaption?: string;
  @Input() override apiEndpoint: string = '';
  @Input() override isLoading: boolean = false;
  @Input() uploadsBaseUrl: string = '';
  
  buttons: Buttons[] = [
    {display_name: '♻️', header_name: "Obnovit", isActive: true, type: 'confirm_button'},
    {display_name: '🧨', header_name: "Trvale smazat", isActive: true, type: 'delete_button'},
  ];

  public isFullWidth: boolean = true;

  @Output() itemRestored = new EventEmitter<void>();

  constructor(
    protected override dataHandler: DataHandler,
    protected override cd: ChangeDetectorRef,
    private confirmDialogService: ConfirmDialogService,
    private alertDialogService: AlertDialogService
  ) {
    super(dataHandler, cd);
  }

  override ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      console.log('Stav pole data v GenericTrashTableComponent po ngOnChanges:');
      console.table(this.data);
    }
    super.ngOnChanges(changes);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    console.log('Stav pole data po ngOnInit:');
    console.table(this.data);
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
      case 'confirm_button':
        this.confirmDialogService.open('Potvrzení obnovení', 'Opravdu chcete obnovit tuto položku?').then(result => {
          if (result) {
            this.restoreDataFromApi(item.id).subscribe({
              next: () => {
                this.alertDialogService.open('Úspěch', 'Položka byla úspěšně obnovena.', 'success');
                // Odebereme položku z tabulky, protože už není smazaná
                const index = this.data.findIndex(dataItem => dataItem.id === item.id);
                if (index > -1) {
                  this.data.splice(index, 1);
                  this.cd.markForCheck();
                  console.log('Stav pole data po odstranění obnovené položky:');
                  console.table(this.data);
                  // 🆕 Vyšle událost po úspěšné obnově, aby rodič mohl data znovu načíst
                  this.itemRestored.emit();
                }
              },
              error: (err) => {
                this.alertDialogService.open('Chyba', 'Při obnovení položky nastala chyba.', 'danger');
                console.error('Restore error:', err);
              }
            });
          } else {
            this.alertDialogService.open('Zrušeno', 'Obnovení položky bylo zrušeno.', 'warning');
          }
        }).catch(error => {
          this.alertDialogService.open('Chyba', 'Při pokusu o obnovení nastala chyba.', 'danger');
          console.error('Dialog error:', error);
        });
        break;
      case 'delete_button':
        this.confirmDialogService.open('Potvrzení trvalého smazání', 'Opravdu si přejete TRVALE smazat tuto položku? Tato akce je nevratná!').then(result => {
          if (result) {
            this.hardDeleteDataFromApi(item.id).subscribe({
              next: () => {
                this.alertDialogService.open('Úspěch', 'Položka byla trvale smazána.', 'success');
                // Odebereme položku z tabulky
                const index = this.data.findIndex(dataItem => dataItem.id === item.id);
                if (index > -1) {
                  this.data.splice(index, 1);
                  this.cd.markForCheck();
                  console.log('Stav pole data po trvalém odstranění položky:');
                  console.table(this.data);
                }
              },
              error: (err) => {
                this.alertDialogService.open('Chyba', 'Při trvalém mazání položky nastala chyba.', 'danger');
                console.error('Hard delete error:', err);
              }
            });
          } else {
            this.alertDialogService.open('Zrušeno', 'Trvalé smazání položky bylo zrušeno.', 'warning');
          }
        }).catch(error => {
          this.alertDialogService.open('Chyba', 'Při pokusu o smazání nastala chyba.', 'danger');
          console.error('Dialog error:', error);
        });
        break;
      default:
        // Ostatní typy tlačítek (pokud by se v budoucnu přidaly)
        break;
    }
  }

  deleteAll(): void {
    // Ověření, zda existují nějaká data ke smazání
    if (this.data.length === 0) {
      this.alertDialogService.open('Upozornění', 'Nejsou k dispozici žádné položky ke smazání.', 'warning');
      return;
    }
    
    // Zobrazení potvrzovacího dialogu
    this.confirmDialogService.open('Trvalé smazání všech položek', 'Opravdu si přejete TRVALE smazat VŠECHNY položky? Tato akce je nevratná!')
      .then(result => {
        if (result) {
          // Pokud uživatel potvrdí, zavoláme metodu pro smazání
          this.hardDeleteAllTrashedDataFromApi().subscribe({
            next: () => {
              this.alertDialogService.open('Úspěch', 'Všechny položky byly trvale smazány.', 'success');
              // Vyprázdníme lokální pole s daty, protože byly smazány
              this.data = [];
              this.cd.markForCheck();
            },
            error: (err) => {
              this.alertDialogService.open('Chyba', 'Při trvalém mazání položek nastala chyba.', 'danger');
              console.error('Hard delete all error:', err);
            }
          });
        } else {
          this.alertDialogService.open('Zrušeno', 'Trvalé smazání položek bylo zrušeno.', 'warning');
        }
      }).catch(error => {
        this.alertDialogService.open('Chyba', 'Při pokusu o smazání nastala chyba.', 'danger');
        console.error('Dialog error:', error);
      });
  }

  get colspanValue(): number {
    const activeButtonsCount = this.buttons?.filter(b => b.isActive).length || 0;
    return this.columnDefinitions.length + (activeButtonsCount > 0 ? 1 : 0);
  }
}