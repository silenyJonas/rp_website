// src/app/admin/admin-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UserRequestComponent } from './pages/user-request/user-request.component';
import { AuthGuard } from '../core/auth/guards/auth.guard';
import { AdministratorsComponent } from './pages/administrators/administrators.component';
import { BusinessLogsComponent } from './pages/business-logs/business-logs.component';
import { PersonalInfoComponent } from './pages/personal-info/personal-info.component';


const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard], // Apply the guard here!
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'user-request',
        component: UserRequestComponent
      },
      {
        path: 'administratos',
        component: AdministratorsComponent
      },
      {
        path: 'business-logs',
        component: BusinessLogsComponent
      },
      {
        path: 'personal-info',
        component: PersonalInfoComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }