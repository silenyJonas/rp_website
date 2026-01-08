import { Routes } from '@angular/router';
import { LoginComponent } from './admin/auth/login/login.component';

export const routes: Routes = [
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
      {
        path: 'faq',
        loadComponent: () => import('./public/pages/faq/faq.component').then(m => m.FaqComponent)
      },
      {
        path: 'about-us',
        loadComponent: () => import('./public/pages/about-us/about-us.component').then(m => m.AboutUsComponent)
      },
      {
        path: 'jobs',
        loadComponent: () => import('./public/pages/jobs/jobs-list/jobs-list.component').then(m => m.JobsListComponent)
      },
      {
        path: 'jobs/:id',
        loadComponent: () => import('./public/pages/jobs/job-item/job-item.component').then(m => m.JobItemComponent)
      }
    ]
  },
  {
    path: 'auth/login',
    component: LoginComponent,
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin-routing.module').then(m => m.AdminRoutingModule),
  },
  {
    path: '404',
    loadComponent: () => import('./public/pages/not-found/not-found.component').then(m => m.NotFoundComponent)
  },
  {
    path: '**', 
    redirectTo: '404'
  }
];