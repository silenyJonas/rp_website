import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
// import { LoginComponent } from './auth/login/login.component'; // TOTO ODSTRANÍME
import { DashboardComponent } from './pages/dashboard/dashboard.component';

const routes: Routes = [
  // Cesta pro login stránku bude definována v app.routes.ts, ne zde.
  // Proto zde nebude žádná rouda pro auth/login.
  {
    path: '', // Toto je root pro admin sekci PO PŘIHLÁŠENÍ, obalí celý admin panel
    component: AdminLayoutComponent, // AdminLayoutComponent se zobrazí až zde
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent // Komponenta, která se zobrazí uvnitř AdminLayoutComponent
      },
      {
        path: 'products',
        loadComponent: () => import('./pages/products/products.component').then(m => m.ProductsComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent)
      },
      // Zde budou další admin stránky
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }