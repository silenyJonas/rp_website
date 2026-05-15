import { Routes } from '@angular/router';
import { LoginComponent } from './admin/auth/login/login.component';

export const routes: Routes = [
  // --- 1. HLAVNÍ WEB (Původní stránky s webovým headerem) ---
  {
    path: '',
    loadComponent: () => import('./public/web-pages/web-layout/web-layout.component').then(m => m.WebLayoutComponent),
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () => import('./public/web-pages/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'services',
        loadComponent: () => import('./public/web-pages/services/services.component').then(m => m.ServicesComponent)
      },
      {
        path: 'academy',
        loadComponent: () => import('./public/web-pages/academy/academy.component').then(m => m.AcademyComponent)
      },
      {
        path: 'tos',
        loadComponent: () => import('./public/web-pages/tos/tos.component').then(m => m.TosComponent)
      },
      {
        path: 'privacy-policy',
        loadComponent: () => import('./public/web-pages/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent)
      },
      {
        path: 'references',
        loadComponent: () => import('./public/web-pages/references/references.component').then(m => m.ReferencesComponent)
      },
      {
        path: 'faq',
        loadComponent: () => import('./public/web-pages/faq/faq.component').then(m => m.FaqComponent)
      },
      {
        path: 'about-us',
        loadComponent: () => import('./public/web-pages/about-us/about-us.component').then(m => m.AboutUsComponent)
      },
      {
        path: 'jobs',
        loadComponent: () => import('./public/web-pages/jobs/jobs-list/jobs-list.component').then(m => m.JobsListComponent)
      },
      {
        path: 'jobs/:id',
        loadComponent: () => import('./public/web-pages/jobs/job-item/job-item.component').then(m => m.JobItemComponent)
      },
      {
        path: 'order_form/:leadParam',
        loadComponent: () => import('./public/web-pages/order-form/order-form.component').then(m => m.OrderFormComponent)
      },
    ]
  },

  // --- 2. E-SHOP SEKCE ---
  {
    path: 'shop',
    loadComponent: () => import('./public/shop-pages/shop-layout/shop-layout.component').then(m => m.ShopLayoutComponent),
    children: [
      { path: '', redirectTo: 'catalog', pathMatch: 'full' },
      {
        path: 'catalog',
        loadComponent: () => import('./public/shop-pages/catalog/catalog.component').then(m => m.CatalogComponent)
      },
      {
        path: 'products/:slugOrId', // Sjednoceno na 'product' podle tvého servisu
        loadComponent: () => import('./public/shop-pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
      },
      {
        path: 'cart',
        loadComponent: () => import('./public/shop-pages/cart/cart.component').then(m => m.CartComponent)
      },
      {
        path: 'checkout',
        loadComponent: () => import('./public/shop-pages/checkout/checkout.component').then(m => m.CheckoutComponent)
      }
    ]
  },

  // --- 3. ADMIN & AUTH (Vlastní layouty / Sidebar) ---
  {
    path: 'auth/login',
    component: LoginComponent,
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin-routing.module').then(m => m.AdminRoutingModule),
  },

  // --- 4. ERROR PAGES ---
  {
    path: '404',
    loadComponent: () => import('./public/web-pages/not-found/not-found.component').then(m => m.NotFoundComponent)
  },
  // {
    //toto se musi fixnout nekdy se to kvuli lazy loading vyvolava na mistech kde nema - fixne se to pozdeji
    // path: '**',
    // redirectTo: '404', 
    // pathMatch: 'full'
  // }
];