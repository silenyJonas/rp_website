// 1. Angular Core & Common
export { ChangeDetectorRef, ChangeDetectionStrategy, inject, Component } from '@angular/core';
export { CommonModule } from '@angular/common';
export { RouterModule, ActivatedRoute } from '@angular/router';

// 2. Forms
export { FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';

// 3. RxJS
export { Subject, Observable, of } from 'rxjs';
export { takeUntil, finalize, delay, tap, catchError } from 'rxjs/operators';

// 4. Služby
export { LocalizationService } from '../../public/services/localization.service';
export { PublicDataService } from '../../public/services/public-data.service';
export { LoadingService } from '../../core/services/loading.service';

// 5. Typy - VŠECHNY export type MUSÍ být pohromadě a oddělené
export type { OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
export type { FormGroup } from '@angular/forms';
export type { HttpErrorResponse } from '@angular/common/http';
export type { FormFieldConfig } from '../interfaces/form-field-config';