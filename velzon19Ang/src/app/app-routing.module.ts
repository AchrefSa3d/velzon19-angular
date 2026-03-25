import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LayoutComponent } from './layouts/layout.component';

// Auth
import { AuthGuard } from './core/guards/auth.guard';
import { LayoutUsersComponent } from './layoutsUsers/layoutusers.component';
import { LayoutEntreprisesComponent } from './layoutsEntreprises/layoutEntreprises.component';

const routes: Routes = [
  
  { path: '', component: LayoutComponent, loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule), canActivate: [AuthGuard] },
  { path: 'auth', loadChildren: () => import('./account/account.module').then(m => m.AccountModule)  },
  { path: 'pages', loadChildren: () => import('./extraspages/extraspages.module').then(m => m.ExtraspagesModule), canActivate: [AuthGuard] },
  { path: 'landing', loadChildren: () => import('./landing/landing.module').then(m => m.LandingModule)},
  // NEW MSK
  { path: 'admin', component: LayoutComponent, loadChildren: () => import('./components/componentsAdmin/componentsAdmin.module').then(m => m.ComponentsAdminModule) },
  { path: 'users',component: LayoutUsersComponent , loadChildren: () => import('./components/componentsDashboard/componentDashUser/componentsDashUser.module').then(m => m.ComponentsDashUserModule)  },
  { path: 'ent',component: LayoutEntreprisesComponent , loadChildren: () => import('./components/componentsDashboard/componentsDashEntreprise/componentsDashEntreprise.module').then(m => m.ComponentsDashEntrepriseModule )  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
