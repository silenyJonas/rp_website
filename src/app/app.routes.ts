import { Routes } from '@angular/router';
import { LoginComponent } from './admin/auth/login/login.component'; // Import LoginComponent

export const routes: Routes = [
  // 1. Veřejná část - routy pro návštěvníky, používají PublicHeader/Footer
  {
    path: '',
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () => import('./public/pages/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'services',
        loadComponent: () => import('./public/pages/services/services.component').then(m => m.ServicesComponent)
      },
      {
        path: 'shop',
        loadComponent: () => import('./public/pages/shop/shop.component').then(m => m.ShopComponent)
      },
      {
        path: 'academy',
        loadComponent: () => import('./public/pages/academy/academy.component').then(m => m.AcademyComponent)
      },
      {
        path: 'tos',
        loadComponent: () => import('./public/pages/tos/tos.component').then(m => m.TosComponent)
      },
      {
        path: 'privacy-policy',
        loadComponent: () => import('./public/pages/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent)
      },
      {
        path: 'references',
        loadComponent: () => import('./public/pages/references/references.component').then(m => m.ReferencesComponent)
      },
    ]
  },
  // 2. Login stránka - samostatná, bez public/admin layoutu
  {
    path: 'auth/login', // Cesta pro login stránku
    component: LoginComponent, // Login komponenta je zde samostatně načtena
  },
  // 3. Administrační část - použije AdminLayoutComponent jako rodičovskou komponentu
  // Tato část se načítá, JAKMILE JSME NA CESTĚ /admin/*
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin-routing.module').then(m => m.AdminRoutingModule)
    // Tady už není component: AdminLayoutComponent přímo, ale je to řešeno přes lazy loading modulu.
    // AdminLayoutComponent se načte, protože je v admin-routing.module.ts jako rodičovská komponenta pro prázdnou cestu ''.
  },
  // Catch-all route pro 404 stránku
  // { path: '**', loadComponent: () => import('./public/pages/not-found/not-found.component').then(m => m.NotFoundComponent) }
];