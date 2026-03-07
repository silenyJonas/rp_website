import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { DataHandler } from '../../../core/services/data-handler.service';
import { GenericTableService } from '../../../core/services/generic-table.service';
import { UserLogin } from '../../../shared/interfaces/user';
import { BaseDataComponent } from '../../components/base-data/base-data.component';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent extends BaseDataComponent<UserLogin> implements OnInit {
  // Přidáno pro přístup k loading stavu v HTML
  public override loadingService = inject(LoadingService);
  
  override apiEndpoint = 'users';
  
  userData: UserLogin | null = null;

  constructor(
    protected override dataHandler: DataHandler,
    protected override cd: ChangeDetectorRef,
    protected override genericTableService: GenericTableService, 
    private authService: AuthService
  ) {
    super(dataHandler, cd, genericTableService);
  }

  override ngOnInit(): void {
    this.loadUserProfile();
  }

  private loadUserProfile(): void {
    const userId = this.authService.getUserId();
    if (!userId) return;

    // Odstraněno ruční isLoading = true (řeší interceptor)
    this.getItemDetails(parseInt(userId, 10))
      .subscribe({
        next: (data) => {
          this.userData = data;
          this.cd.markForCheck();
        },
        error: (err) => {
          this.errorMessage = 'Nepodařilo se načíst profil uživatele.';
          this.cd.markForCheck();
          console.error(err);
        }
      });
  }

  get welcomeMessage(): string {
    return this.userData ? `Vítejte zpět, ${this.userData.user_email}!` : 'Vítejte v systému!';
  }
}