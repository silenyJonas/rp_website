import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ColumnDefinition } from '../../../../shared/interfaces/generic-form-column-definiton';
import { BaseDataComponent } from '../../base-data/base-data.component';
import { DataHandler } from '../../../../core/services/data-handler.service';
import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';
import { AlertDialogService } from '../../../../core/services/alert-dialog.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { GenericTableService } from '../../../../core/services/generic-table.service';
import { Buttons } from '../../../../shared/interfaces/buttons';


@Component({
  selector: 'app-table-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './table-builder.component.html',
  styleUrls: ['../table-style.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableBuilderComponent extends BaseDataComponent<any> implements OnInit, OnChanges {
  @Input() override data: any[] = [];
  @Input('columns') columnDefinitions: ColumnDefinition[] = [];
  @Input() tableCaption?: string;
  @Input() override apiEndpoint: string = '';
  @Input() uploadsBaseUrl: string = '';
  @Input() buttons: Buttons[] = [];
  @Input() isAdminTable: boolean = false;
  @Input() isFullWidth: boolean = true;
  @Input() currentFilters: any = {};

  @Output() itemDeleted = new EventEmitter<any>();
  @Output() createFormOpened = new EventEmitter<void>();
  @Output() editFormOpened = new EventEmitter<any>();
  @Output() viewDetailsOpened = new EventEmitter<any>();
  @Output() generateFormOpened = new EventEmitter<any>();
  @Output() resetPasswordFormOpened = new EventEmitter<any>(); 

  constructor(
    protected override dataHandler: DataHandler,
    protected override cd: ChangeDetectorRef,
    protected override genericTableService: GenericTableService,
    private confirmDialogService: ConfirmDialogService,
    private alertDialogService: AlertDialogService,
    public authService: AuthService 
  ) {
    super(dataHandler, cd, genericTableService);
  }

  override ngOnInit(): void { super.ngOnInit(); }
  override ngOnChanges(changes: SimpleChanges): void { super.ngOnChanges(changes); }

  getCellValue(item: any, column: ColumnDefinition): any {
    const keys = column.key.split('.');
    const value = keys.reduce((obj, key) => obj?.[key], item);
    switch (column.type) {
      case 'currency':
        return value ? (new CurrencyPipe('cs-CZ')).transform(value, 'CZK', 'symbol-narrow', '1.2-2') : '';
      case 'date':
        return value ? (new DatePipe('cs-CZ')).transform(value, column.format || 'd.M.yyyy') : '';
      case 'boolean':
        return value ? 'Ano' : 'Ne';
      case 'image':
        return value ? `${this.uploadsBaseUrl}${value}` : '';
      default:
        return value;
    }
  }

  handleAction(item: any, buttonAction: string): void {
    switch (buttonAction) {
      case 'generate_form': this.generateFormOpened.emit(item); break;
      case 'details': this.viewDetailsOpened.emit(item); break;
      case 'edit': this.editFormOpened.emit(item); break;
      case 'delete': this.onDeleteAction(item); break;
      case 'password_reset': this.resetPasswordFormOpened.emit(item); break; 
      default: console.warn('Neznámý typ akce:', buttonAction);
    }
  }

  public onDeleteAction(item: any): void {
    this.confirmDialogService.open('Potvrzení smazání', 'Opravdu si přejete smazat tuto položku?')
      .then(result => {
        if (result) {
          this.deleteData(item.id).subscribe({
            next: () => {
              this.removeItemFromLocal(item.id);
              this.itemDeleted.emit(item);
              this.alertDialogService.open('Úspěch', 'Položka byla smazána.', 'success');
            }
          });
        }
      });
  }

  private removeItemFromLocal(id: any): void {
    const index = this.data.findIndex(d => d.id === id);
    if (index > -1) {
      this.data.splice(index, 1);
      this.cd.markForCheck();
    }
  }

  async exportToCSV() {
    try {
      this.cd.markForCheck();
      
      const responseData = await firstValueFrom(this.loadDataAsCollection());
      const allData: any[] = Array.isArray(responseData) ? responseData : [];
      
      if (allData.length > 0) {
        let csv = this.columnDefinitions.map(col => col.header || col.key).join(';') + '\n';
        allData.forEach(item => {
          csv += this.columnDefinitions.map(col => `"${String(this.getCellValue(item, col) || '').replace(/"/g, '""')}"`).join(';') + '\n';
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${this.tableCaption || 'export'}.csv`;
        link.click();

        this.logExportActivity(allData.length);

      } else {
        this.alertDialogService.open('Export', 'Žádná data k exportu.', 'warning');
      }
    } catch (error) {
      console.error('Export error:', error);
      this.alertDialogService.open('Chyba', 'Při exportu nastala chyba.', 'danger');
    } finally {
      this.cd.markForCheck();
    }
  }

  private logExportActivity(rowCount: number): void {
    const logData = {
      origin: 'GenericTable',
      event_type: 'DATA_EXPORT',
      module: this.apiEndpoint,
      description: `Uživatel exportoval ${rowCount} záznamů z tabulky: ${this.tableCaption || this.apiEndpoint}.`,
      affected_entity_type: 'collection',
      user_id_plain: this.authService.getUserId()?.toString(),
      user_email_plain: this.authService.getUserEmail()
    };

    this.dataHandler.post('business_logs', logData).subscribe({
      error: (err) => console.error('Nepodařilo se zalogovat export:', err)
    });
  }

  private loadDataAsCollection() {
    const params = { ...this.currentFilters, no_pagination: 'true' };
    if (!params.sort_by) params.sort_by = 'id';
    if (!params.sort_direction) params.sort_direction = 'desc';
    return this.dataHandler.getCollection<any>(this.apiEndpoint, params);
  }

  get colspanValue(): number {
    return this.columnDefinitions.length + (this.buttons?.filter(b => b.isActive).length || 0);
  }
}