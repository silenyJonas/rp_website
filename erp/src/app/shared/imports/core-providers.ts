// 1. EXPORTY HODNOT (Dekorátory, Třídy, Observable)
// Tyto prvky existují i v běžícím JavaScriptu.
export { 
  Component, 
  ChangeDetectionStrategy, 
  ChangeDetectorRef, 
  ViewChild, 
  Directive 
} from '@angular/core';

export { Router } from '@angular/router';

export { 
  Subject, 
  Observable, 
  throwError, 
  of, 
  forkJoin 
} from 'rxjs';

export { 
  finalize, 
  takeUntil, 
  catchError, 
  tap, 
  retry 
} from 'rxjs/operators';

export { HttpErrorResponse } from '@angular/common/http';

export { DataHandler } from '../../core/services/data-handler.service';
export { GenericTableService } from '../../core/services/generic-table.service';
export { AuthService } from '../../core/auth/auth.service';
export { AlertDialogService } from '../../core/services/alert-dialog.service';


// 2. EXPORTY TYPŮ (Interfaces, Type Aliases)
// Tyto prvky TypeScript při kompilaci odstraní. MUSÍ mít klíčové slovo "type".
export type { 
  OnInit, 
  OnDestroy, 
  OnChanges, 
  SimpleChanges 
} from '@angular/core';

export type { 
  FilterParams, 
  PaginatedResponse 
} from '../../core/services/generic-table.service';