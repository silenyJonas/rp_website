import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable, throwError } from 'rxjs';
import { catchError, takeUntil, finalize } from 'rxjs/operators';
import { DataHandler } from '../../../core/services/data-handler.service';
import { Router } from '@angular/router';
import { BaseDataComponent } from '../../components/base-data/base-data.component';
import { UserLogin } from '../../../shared/interfaces/user';
import { AuthService } from '../../../core/auth/auth.service';
@Component({
  selector: 'app-personal-info',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './personal-info.component.html',
  styleUrl: './personal-info.component.css'
})
export class PersonalInfoComponent extends BaseDataComponent<UserLogin> implements OnInit, OnDestroy {
  // A strongly-typed form group for password change
  passwordForm: FormGroup;
  // TODO: This value should be obtained from an authenticated user, for example from an Auth service.
  // For now, it's hardcoded as a placeholder.
  userId: number = 1;

  apiEndpoint = 'user_login';

  constructor(
    protected override dataHandler: DataHandler,
    protected override cd: ChangeDetectorRef,
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    super(dataHandler, cd);
    this.passwordForm = this.fb.group({
      old_password: ['', [Validators.required]],
      new_password: ['', [Validators.required, Validators.minLength(8)]],
      new_password_confirmation: ['', [Validators.required]]
    }, {
      validator: this.passwordsMatchValidator // Custom validator for password matching
    });
  }

  override ngOnInit(): void {
    super.ngOnInit();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  /**
   * Custom validator that checks if the new password and its confirmation match.
   * @param group The form group containing the passwords.
   * @returns An error object or null if the passwords match.
   */
  private passwordsMatchValidator(group: FormGroup): { [key: string]: any } | null {
    const newPassword = group.get('new_password');
    const newPasswordConfirmation = group.get('new_password_confirmation');

    if (!newPassword || !newPasswordConfirmation) {
      return null;
    }

    if (newPasswordConfirmation.errors && !newPasswordConfirmation.errors['passwordsNotMatching']) {
      // If there's already another error, don't return this one
      return null;
    }

    if (newPassword.value !== newPasswordConfirmation.value) {
      newPasswordConfirmation.setErrors({ passwordsNotMatching: true });
      return { passwordsNotMatching: true };
    } else {
      newPasswordConfirmation.setErrors(null);
      return null;
    }
  }

  /**
   * Submits the password change form.
   */
  onSubmit(): void {
    if (this.passwordForm.invalid) {
      console.error('The form is invalid.');
      return;
    }

    const passwordData = {
      old_password: this.passwordForm.get('old_password')?.value,
      new_password: this.passwordForm.get('new_password')?.value,
      new_password_confirmation: this.passwordForm.get('new_password_confirmation')?.value,
    };

    // ZDE SE ZALOGUJE OBJEKT PŘED ODESLÁNÍM
    console.log('Odesílaná data formuláře:', passwordData);

    // Call the new updatePassword method from BaseDataComponent
    this.updatePassword(parseInt(this.authService.getUserId()!, 10), passwordData)
      .subscribe({
        next: () => {
          this.passwordForm.reset();
          console.log('Password successfully changed.');
          // TODO: Add logic to display a success notification to the user
          this.errorMessage = null; // Clear any previous error messages
          this.cd.markForCheck();
        },
        error: (err) => {
          console.error('Error changing password:', err);
          this.errorMessage = 'Chyba při změně hesla. Zkontrolujte prosím původní heslo.';
          this.cd.markForCheck();
        }
      });
  }
}
