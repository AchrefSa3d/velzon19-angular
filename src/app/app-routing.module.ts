import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LayoutComponent } from './layouts/layout.component';
import { LayoutUsersComponent } from './layoutsUsers/layoutusers.component';
import { LayoutEntreprisesComponent } from './layoutsEntreprises/layoutEntreprises.component';

// Guards
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard'; // à créer

const routes: Routes = [

  // ─── Redirect racine ────────────────────────────────────────────
  { path: '', redirectTo: '/landing', pathMatch: 'full' },

  // ─── Auth (login, register, reset) ─────────────────────────────
  // GARDER — vider AccountModule et réécrire avec tes formulaires Tijara
  {
    path: 'auth',
    loadChildren: () =>
      import('./account/account.module').then(m => m.AccountModule)
  },

  // ─── Admin Dashboard ────────────────────────────────────────────
  // GARDER — ajouter AdminGuard + AuthGuard
  {
    path: 'admin',
    component: LayoutComponent,
    canActivate: [AuthGuard, AdminGuard],
    loadChildren: () =>
      import('./components/componentsAdmin/componentsAdmin.module')
        .then(m => m.ComponentsAdminModule)
  },

  // ─── Dashboard Utilisateur (Tijara : espace abonné) ───────────────
  // ADAPTER — c'est ton espace utilisateur connecté
  {
    path: 'users',
    component: LayoutUsersComponent,
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./components/componentsDashboard/componentDashUser/componentsDashUser.module')
        .then(m => m.ComponentsDashUserModule)
  },

  // ─── Dashboard Entreprise (Tijara : espace annonceur/vendeur) ─────
  // ADAPTER — espace pour les annonceurs / boutiques
  {
    path: 'ent',
    component: LayoutEntreprisesComponent,
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./components/componentsDashboard/componentsDashEntreprise/componentsDashEntreprise.module')
        .then(m => m.ComponentsDashEntrepriseModule)
  },

  // ─── E-Commerce / Shop (Tijara) ────────────────────────────────────
  {
    path: 'shop',
    component: LayoutUsersComponent,
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./pages/ecommerce/ecommerce.module')
        .then(m => m.EcommerceModule)
  },

  // ─── Landing / Site public (optionnel) ──────────────────────────
  // GARDER si tu veux une page vitrine publique
  {
    path: 'landing',
    loadChildren: () =>
      import('./landing/landing.module').then(m => m.LandingModule)
  },

  // ─── Pages extras (404, maintenance) ────────────────────────────
  // GARDER juste pour la page 404
  {
    path: 'pages',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./extraspages/extraspages.module').then(m => m.ExtraspagesModule)
  },

  // ─── Wildcard ────────────────────────────────────────────────────
  { path: '**', redirectTo: '/auth/login' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
