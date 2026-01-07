import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UserRequestComponent } from './pages/user-request/user-request.component';
import { AuthGuard } from '../core/auth/guards/auth.guard';
import { AdministratorsComponent } from './pages/administrators/administrators.component';
import { BusinessLogsComponent } from './pages/business-logs/business-logs.component';
import { PersonalInfoComponent } from './pages/personal-info/personal-info.component';
import { EditWebsiteComponent } from './pages/edit-website/edit-website.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard], // Přidáváme guard pro ověření oprávnění
        data: { permission: 'view-dashboard' }
      },
      {
        path: 'user-request',
        component: UserRequestComponent,
        canActivate: [AuthGuard], // Přidáváme guard pro ověření oprávnění
        data: { permission: 'view-user-requests' }
      },
      {
        path: 'administrators',
        component: AdministratorsComponent,
        canActivate: [AuthGuard], // Přidáváme guard pro ověření oprávnění
        data: { permission: 'manage-administrators' }
      },
      {
        path: 'business-logs',
        component: BusinessLogsComponent,
        canActivate: [AuthGuard], // Přidáváme guard pro ověření oprávnění
        data: { permission: 'view-business-logs' }
      },
      {
        path: 'personal-info',
        component: PersonalInfoComponent,
        canActivate: [AuthGuard], // Přidáváme guard pro ověření oprávnění
        data: { permission: 'view-personal-info' }
      },
      {
        path: 'edit-website',
        component: EditWebsiteComponent,
        canActivate: [AuthGuard], // Přidáváme guard pro ověření oprávnění
        data: { permission: 'view-edit-website' }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
