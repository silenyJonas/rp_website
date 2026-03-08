import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Import tvého Core namespace
import * as Core from '../../../shared/imports/core-providers';

// Importy specifické pro tuto komponentu
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
// OPRAVA: Používáme Core.OnInit přímo v implements. 
// Pokud chyba přetrvává, ujisti se, že v core-providers.ts máš: export type { OnInit ... }
export class DashboardComponent extends BaseDataComponent<UserLogin> implements Core.OnInit {
  
  // Přístup k loading stavu pro šablonu (pomocí async pipe)
  public override loadingService = inject(LoadingService);
  
  override apiEndpoint = 'users';
  userData: UserLogin | null = null;

  constructor(
    protected override dataHandler: Core.DataHandler,
    protected override cd: Core.ChangeDetectorRef,
    protected override genericTableService: Core.GenericTableService, 
    // AuthService je třída, takže Core.AuthService funguje správně
    private authService: Core.AuthService
  ) {
    super(dataHandler, cd, genericTableService);
  }

  override ngOnInit(): void {
    // Voláme init z BaseDataComponent pokud je potřeba, jinak vlastní logiku
    this.loadUserProfile();
  }

  private loadUserProfile(): void {
    const userId = this.authService.getUserId();
    if (!userId) return;

    // Snapshot kontrola proti double-clicku během 300ms prodlevy interceptoru
    if (this.loadingService.isLoadingSnapshot) return;

    this.getItemDetails(parseInt(userId, 10))
      .subscribe({
        next: (data) => {
          this.userData = data;
          this.cd.markForCheck();
        },
        error: (err) => {
          this.errorMessage = 'Nepodařilo se načíst profil uživatele.';
          this.cd.markForCheck();
          console.error('Dashboard Error:', err);
        }
      });
  }

  get welcomeMessage(): string {
    return this.userData ? `Vítejte zpět, ${this.userData.user_email}!` : 'Vítejte v systému!';
  }
}