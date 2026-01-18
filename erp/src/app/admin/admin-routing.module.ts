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
import { WorkflowComponent } from './intranet/knowledge-base/pages/workflow/workflow.component';
import { SalesRepComponent } from './intranet/knowledge-base/pages/sales-rep/sales-rep.component';
import { UiDesignerComponent } from './intranet/knowledge-base/pages/ui-designer/ui-designer.component';
import { SalesLeadsComponent } from './pages/sales-leads/sales-leads.component';
const routes: Routes = [
  // SEKCE 1: Klasický Admin se sidebarem
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
    ]
  },

  // SEKCE 2: Knowledge Base - Samostatná úroveň (Full-screen)
  {
    path: 'intranet',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'knowledge-base',
        component: KnowledgeBaseComponent,
        children: [
          { path: 'introductions', component: IntroductionsComponent },
          { path: 'workflow', component: WorkflowComponent },
          { path: 'sales-rep', component: SalesRepComponent },
          { path: 'ui-designer', component: UiDesignerComponent },
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