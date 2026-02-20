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
import { KnowledgeBaseComponent } from './intranet/knowledge-base/knowledge-base.component';
import { KbArticleComponent } from './intranet/knowledge-base/kb-article/kb-article.component';
import { IntroductionsComponent } from './intranet/knowledge-base/pages/introductions/introductions.component';
import { SalesRepComponent } from './intranet/knowledge-base/pages/sales-rep/sales-rep.component';
import { SalesLeadsComponent } from './pages/sales-leads/sales-leads.component';
import { NewsComponent } from './intranet/knowledge-base/pages/news/news.component';
import { SecurityComponent } from './intranet/knowledge-base/pages/security/security.component';
import { ContactsComponent } from './intranet/knowledge-base/pages/contacts/contacts.component';
import { EditNewsComponent } from './pages/edit-news/edit-news.component';
import { SalesOrdersComponent } from './pages/sales-orders/sales-orders.component';
import { SupportFormComponent } from './intranet/knowledge-base/pages/support-form/support-form.component';
import { SupportTicketsComponent } from './pages/support-tickets/support-tickets.component';
import { JobApplicationsComponent } from './pages/job-applications/job-applications.component';
const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent, data: { permission: 'view-dashboard' } },
      { path: 'user-request', component: UserRequestComponent, data: { permission: 'view-user-requests' } },
      { path: 'administrators', component: AdministratorsComponent, data: { permission: 'manage-administrators' } },
      { path: 'business-logs', component: BusinessLogsComponent, data: { permission: 'view-business-logs' } },
      { path: 'personal-info', component: PersonalInfoComponent, data: { permission: 'view-personal-info' } },
      { path: 'edit-website', component: EditWebsiteComponent, data: { permission: 'view-edit-website' } },
      { path: 'sales-leads', component: SalesLeadsComponent, data: { permission: 'view-sales-leads' } },
      { path: 'edit-news', component: EditNewsComponent, data: { permission: 'view-news' } },
      { path: 'sales-orders', component: SalesOrdersComponent, data: { permission: 'view-sales-orders' } },
      { path: 'support-tickets', component: SupportTicketsComponent, data: { permission: 'view-support-tickets' } },
      { path: 'job-applications', component: JobApplicationsComponent, data: { permission: 'view-job-applications' } },
    ]
  },
  {
    path: 'intranet',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'knowledge-base',
        component: KnowledgeBaseComponent,
        children: [
          { path: 'introductions', component: IntroductionsComponent },
          { path: 'sales-rep', component: SalesRepComponent },
          { path: 'news', component: NewsComponent },
          { path: 'security', component: SecurityComponent },
          { path: 'contacts', component: ContactsComponent },
          { path: 'support-form', component: SupportFormComponent },
          { path: '', redirectTo: 'introductions', pathMatch: 'full' }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }