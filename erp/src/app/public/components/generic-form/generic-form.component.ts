
import {
  Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ChangeDetectionStrategy,
  ChangeDetectorRef, OnChanges, SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { FormFieldConfig, FormFieldOption } from '../../../shared/interfaces/form-field-config';
import { LocalizationService } from '../../services/localization.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RouterModule } from '@angular/router'; // Důležité: Přidán import RouterModule

@Component({
  selector: 'app-generic-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule // Důležité: Přidán RouterModule do imports
  ],
  templateUrl: './generic-form.component.html',
  styleUrl: './generic-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenericFormComponent implements OnInit, OnDestroy, OnChanges {
  @Input() form_header: string = '';
  @Input() form_description: string = '';
  @Input() form_button: string = '';
  @Input() formConfig: FormFieldConfig[] = [];
  @Output() formSubmitted = new EventEmitter<any>();
  @Output() formReset = new EventEmitter<void>();

  @Input() isOpen: boolean = true;
  @Input() closedMessage: string = '';
  @Input() closedTitle: string = '';

  formData: { [key: string]: any } = {};
  @ViewChild('dynamicForm') dynamicForm!: NgForm;

  isLoading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  private destroy$ = new Subject<void>();
  internal_success_title: string = '';
  internal_success_message: string = '';
  internal_reset_button_text: string = '';
  internal_sending_text: string = '';
  internal_error_submit_generic: string = '';
  internal_error_validation_generic: string = '';
  internal_select_default_option: string = '';
  internal_closed_title: string = '';
  consent: string = '';
  privacy_policy_link: string = '';



  closed_form_icon_link: string = 'assets/images/icons/closed-form-icon.png';

  validation_required: string = '';
  validation_email: string = '';
  validation_pattern: string = '';
  validation_minlength_prefix: string = '';
  validation_minlength_suffix: string = '';
  validation_maxlength_prefix: string = '';
  validation_maxlength_suffix: string = '';
  validation_min_prefix: string = '';
  validation_min_suffix: string = '';
  validation_max_prefix: string = '';
  validation_max_suffix: string = '';
  validation_invalid_value: string = '';

  translatedFormConfig: FormFieldConfig[] = [];

  constructor(private cd: ChangeDetectorRef, private localizationService: LocalizationService) {}

  ngOnInit(): void {
    this.localizationService.currentTranslations$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadTranslatedTexts();
        this.translateFormConfig();
        this.initializeFormData();
        this.cd.detectChanges();
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
      if (changes['isOpen'] || changes['closedMessage']) {
          this.cd.detectChanges();
      }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTranslatedTexts(): void {
    this.consent = this.localizationService.getText('form.consent');
    this.privacy_policy_link = this.localizationService.getText('form.privacy_policy_link');
    this.internal_success_title = this.localizationService.getText('form.success_title');
    this.internal_success_message = this.localizationService.getText('form.success_message');
    this.internal_reset_button_text = this.localizationService.getText('form.reset_button_text');
    this.internal_sending_text = this.localizationService.getText('form.sending_text');
    this.internal_error_submit_generic = this.localizationService.getText('form.error_submit_generic');
    this.internal_error_validation_generic = this.localizationService.getText('form.error_validation_generic');
    this.internal_select_default_option = this.localizationService.getText('form.select_default_option');
    this.internal_closed_title = this.localizationService.getText('form.closed_title');

    this.validation_required = this.localizationService.getText('form.validation_required');
    this.validation_email = this.localizationService.getText('form.validation_email');
    this.validation_pattern = this.localizationService.getText('form.validation_pattern');
    this.validation_minlength_prefix = this.localizationService.getText('form.validation_minlength_prefix');
    this.validation_minlength_suffix = this.localizationService.getText('form.validation_minlength_suffix');
    this.validation_maxlength_prefix = this.localizationService.getText('form.validation_maxlength_prefix');
    this.validation_maxlength_suffix = this.localizationService.getText('form.validation_maxlength_suffix');
    this.validation_min_prefix = this.localizationService.getText('form.validation_min_prefix');
    this.validation_min_suffix = this.localizationService.getText('form.validation_min_suffix');
    this.validation_max_prefix = this.localizationService.getText('form.validation_max_prefix');
    this.validation_max_suffix = this.localizationService.getText('form.validation_max_suffix');
    this.validation_invalid_value = this.localizationService.getText('form.validation_invalid_value');
  }

  private translateFormConfig(): void {
    this.translatedFormConfig = this.formConfig.map(field => {
      const translatedField: FormFieldConfig = { ...field };
      if (field.isLocalizedLabel) {
        translatedField.label = this.localizationService.getText(field.label);
      }
      if (field.isLocalizedPlaceholder && field.placeholder) {
        translatedField.placeholder = this.localizationService.getText(field.placeholder);
      }
      if (field.options && field.options.length > 0) {
        translatedField.options = field.options.map(option => {
          const translatedOption: FormFieldOption = { ...option };
          if (option.isLocalizedLabel) {
            translatedOption.label = this.localizationService.getText(option.label);
          }
          return translatedOption;
        });
      }
      return translatedField;
    });
  }

  private initializeFormData(): void {
    this.formData = {};
    this.translatedFormConfig.forEach(field => {
      this.formData[field.name] = field.value ?? null;
      if (field.type === 'checkbox' && field.value === undefined) {
        this.formData[field.name] = false;
      }
    });
    this.formData['dataProcessingAgreement'] = false;
  }

  onSubmit(): void {
    if (!this.isOpen) return;

    if (this.dynamicForm.valid) {
      this.isLoading = true;
      this.errorMessage = null;
      this.successMessage = null;

      // console.log('Odesílám data formuláře:', this.formData);

      setTimeout(() => {
        this.isLoading = false;
        const success = Math.random() > 0.2;

        if (success) {
          this.successMessage = this.internal_success_message;
          this.formSubmitted.emit(this.formData);
          this.initializeFormData();
        } else {
          this.errorMessage = this.internal_error_submit_generic;
        }
        this.cd.detectChanges();
      }, 1500);
    } else {
      this.errorMessage = this.internal_error_validation_generic;
      this.cd.detectChanges();
    }
  }

  onReset(): void {
    this.initializeFormData();
    if (this.dynamicForm) {
      this.dynamicForm.resetForm(this.formData);
    }
    this.errorMessage = null;
    this.successMessage = null;
    this.isLoading = false;
    this.formReset.emit();
    this.cd.detectChanges();
  }

  getValidationErrors(fieldName: string): string | null {
    const control = this.dynamicForm?.controls[fieldName];
    if (control && control.invalid && (control.dirty || control.touched)) {
      if (control.errors?.['required']) {
        return this.validation_required;
      }
      if (control.errors?.['email']) {
        return this.validation_email;
      }
      if (control.errors?.['pattern']) {
        return this.validation_pattern;
      }
      if (control.errors?.['minlength']) {
        return `${this.validation_minlength_prefix} ${control.errors['minlength'].requiredLength} ${this.validation_minlength_suffix}`;
      }
      if (control.errors?.['maxlength']) {
        return `${this.validation_maxlength_prefix} ${control.errors['maxlength'].requiredLength} ${this.validation_maxlength_suffix}`;
      }
      if (control.errors?.['min']) {
        return `${this.validation_min_prefix} ${control.errors['min'].min}${this.validation_min_suffix}`;
      }
      if (control.errors?.['max']) {
        return `${this.validation_max_prefix} ${control.errors['max'].max}${this.validation_max_suffix}`;
      }
      return this.validation_invalid_value;
    }
    return null;
  }
}
// }