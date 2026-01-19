import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { DataHandler } from '../../../core/services/data-handler.service';
import { UserLogin } from '../../../shared/interfaces/user';
import { BaseDataComponent } from '../../components/base-data/base-data.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent extends BaseDataComponent<UserLogin> implements OnInit {
  userData: UserLogin | null = null;
  apiEndpoint = 'user_login';

  constructor(
    protected override dataHandler: DataHandler,
    protected override cd: ChangeDetectorRef,
    private authService: AuthService
  ) {
    super(dataHandler, cd);
  }

  override ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.getItemDetails(parseInt(userId, 10)).subscribe(data => {
        this.userData = data;
        this.cd.markForCheck();
      });
    }
  }
}