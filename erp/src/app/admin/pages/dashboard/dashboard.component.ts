import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { AuthService } from '../../../core/auth/auth.service';
import { DataHandler } from '../../../core/services/data-handler.service';
import { GenericTableService } from '../../../core/services/generic-table.service';
import { UserLogin } from '../../../shared/interfaces/user';
import { BaseDataComponent } from '../../components/base-data/base-data.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent extends BaseDataComponent<UserLogin> implements OnInit {
  // apiEndpoint je nutný pro BaseDataComponent metody
  override apiEndpoint = 'user_login';
  
  // userData budeme držet v proměnné pro snadný přístup v šabloně
  userData: UserLogin | null = null;

  constructor(
    protected override dataHandler: DataHandler,
    protected override cd: ChangeDetectorRef,
    protected override genericTableService: GenericTableService, // Přidáno pro BaseDataComponent
    private authService: AuthService
  ) {
    super(dataHandler, cd, genericTableService);
  }

  override ngOnInit(): void {
    // Nepoužíváme super.ngOnInit(), protože dashboard nepotřebuje loadovat seznam (refreshData)
    this.loadUserProfile();
  }

  /**
   * Načte detaily přihlášeného uživatele
   */
  private loadUserProfile(): void {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.isLoading = true;
    this.getItemDetails(parseInt(userId, 10))
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cd.markForCheck();
        })
      )
      .subscribe({
        next: (data) => {
          this.userData = data;
          this.cd.markForCheck();
        },
        error: (err) => {
          this.errorMessage = 'Nepodařilo se načíst profil uživatele.';
          console.error(err);
        }
      });
  }

  /**
   * Pomocná metoda pro formátování jména
   */
  get welcomeMessage(): string {
    return this.userData ? `Vítejte zpět, ${this.userData.user_email}!` : 'Vítejte v systému!';
  }
}