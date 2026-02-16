import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';

import { DataHandler } from '../../../core/services/data-handler.service';
import { BaseDataComponent } from '../../components/base-data/base-data.component';
import { AuthService } from '../../../core/auth/auth.service';
import { AlertDialogService } from '../../../core/services/alert-dialog.service';
import { UserLogin } from '../../../shared/interfaces/user';
import { GenericTableService } from '../../../core/services/generic-table.service'; // Import přidán

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
  passwordForm: FormGroup;
  override apiEndpoint = 'users'; // Použito override pro konzistenci
  userData: UserLogin | null = null;

  constructor(
    protected override dataHandler: DataHandler,
    protected override cd: ChangeDetectorRef,
    protected override genericTableService: GenericTableService, // Přidáno pro rodiče
    private fb: FormBuilder,
    private authService: AuthService,
    private alertDialogService: AlertDialogService
  ) {
    // Předáme genericTableService do super()
    super(dataHandler, cd, genericTableService);

    this.passwordForm = this.fb.group({
      old_password: ['', [Validators.required]],
      new_password: ['', [Validators.required, Validators.minLength(8)]],
      new_password_confirmation: ['', [Validators.required]]
    }, {
      validator: this.passwordsMatchValidator
    });
  }

  override ngOnInit(): void {
    super.ngOnInit(); // Volá prázdné ngOnInit z rodiče
    this.loadCurrentUserData();
  }

  private loadCurrentUserData(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.isLoading = true;
      // Používáme metodu z BaseDataComponent
      this.getItemDetails(parseInt(userId, 10))
        .pipe(finalize(() => {
          this.isLoading = false;
          this.cd.markForCheck();
        }))
        .subscribe({
          next: (data: UserLogin) => { // Přidán typ pro opravu Implicit Any
            this.userData = data;
          },
          error: (err) => {
            console.error('Chyba při načítání dat uživatele:', err);
          }
        });
    }
  }

  private passwordsMatchValidator(group: FormGroup): { [key: string]: any } | null {
    const newPassword = group.get('new_password');
    const newPasswordConfirmation = group.get('new_password_confirmation');
    if (!newPassword || !newPasswordConfirmation) return null;

    if (newPassword.value !== newPasswordConfirmation.value) {
      newPasswordConfirmation.setErrors({ passwordsNotMatching: true });
      return { passwordsNotMatching: true };
    } else {
      newPasswordConfirmation.setErrors(null);
      return null;
    }
  }

  onSubmit(): void {
    if (this.passwordForm.invalid) return;

    const userId = this.authService.getUserId();
    if (!userId) return;

    const passwordData = {
      old_password: this.passwordForm.get('old_password')?.value,
      new_password: this.passwordForm.get('new_password')?.value,
      new_password_confirmation: this.passwordForm.get('new_password_confirmation')?.value,
    };

    // Využíváme metodu updatePassword, kterou jsme právě vrátili do BaseDataComponent
    this.updatePassword(parseInt(userId, 10), passwordData)
      .subscribe({
        next: () => {
          this.passwordForm.reset();
          this.alertDialogService.open('Změna hesla', 'Heslo bylo úspěšně změněno.', 'success');
          this.errorMessage = null;
        },
        error: (err) => {
          this.errorMessage = 'Chyba při změně hesla. Zkontrolujte prosím původní heslo.';
          this.cd.markForCheck();
        }
      });
  }
}