// src/app/admin/pages/user-request/user-request.component.ts

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
// Předpoklad: GenericTableComponent je v 'src/app/components'

import { GenericTableComponent } from '../../components/generic-table/generic-table.component';
// Předpoklad: BaseDataComponent je v 'src/app/components'
import { BaseDataComponent } from '../../components/base-data/base-data.component';
// Předpoklad: DataHandler je v 'src/app/core/services'
import { DataHandler } from '../../../core/services/data-handler.service';
// Předpoklad: ColumnDefinition je v 'src/app/shared/interfaces'
import { ColumnDefinition } from '../../../shared/interfaces/generic-form-column-definiton';

export interface RawRequestCommission {
  id?: number;
  thema: string;
  contact_email: string;
  contact_phone: string;
  order_description: string;
  status: string;
  priority: string;
  created_at?: string;
  last_changed_at?: string;
  deleted_at?: string | null;
  is_deleted?: boolean;
}

@Component({
  selector: 'app-user-request',
  standalone: true,
  imports: [
    CommonModule,
    GenericTableComponent
  ],
  templateUrl: './user-request.component.html',
  styleUrl: './user-request.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserRequestComponent extends BaseDataComponent<RawRequestCommission> implements OnInit {
  override apiEndpoint: string = '/api/raw_request_commissions';

userRequestColumns: ColumnDefinition[] = [
  { key: 'id', header: 'ID' },
  { key: 'thema', header: 'Téma' },
  { key: 'contact_email', header: 'Email'},
  { key: 'contact_phone', header: 'Telefon' },
  { key: 'status', header: 'Stav'},
  { key: 'priority', header: 'Priorita'},
  { key: 'created_at', header: 'Vytvořeno' },
  { key: 'order_description', header: 'Popis objednávky' },
  { key: 'deleted_at', header: 'Smazáno', type: 'date' },
  { key: 'is_deleted', header: 'Smazané?' },
  { key: 'last_changed_at', header: 'Změněno' }
];

  constructor(
    protected override dataHandler: DataHandler,
    protected override cd: ChangeDetectorRef,
  ) {
    super(dataHandler, cd);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    console.log('UserRequestComponent inicializována. Data se načítají...');
  }
}