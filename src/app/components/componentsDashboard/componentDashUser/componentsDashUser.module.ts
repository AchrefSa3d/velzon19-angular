import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule }      from 'src/app/shared/shared.module';
import { TranslateModule }   from '@ngx-translate/core';

import { DashboardUserComponent }  from './dashboard/dashboard-user.component';
import { OrdersUserComponent }     from './orders/orders-user.component';
import { ProfileUserComponent }    from './profile/profile-user.component';
import { AnnoncesUserComponent }   from './annonces/annonces-user.component';

const routes: Routes = [
  { path: '',             redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard',   component: DashboardUserComponent },
  { path: 'orders',      component: OrdersUserComponent },
  { path: 'profile',     component: ProfileUserComponent },
  { path: 'annonces',    component: AnnoncesUserComponent },
  {
    path: 'reclamations',
    loadChildren: () =>
      import('../commonComponentsDash/reclamations/reclamations.module')
        .then(m => m.ReclamationsModule),
  },
];

@NgModule({
  declarations: [
    DashboardUserComponent,
    OrdersUserComponent,
    ProfileUserComponent,
    AnnoncesUserComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    NgbDropdownModule,
    SharedModule,
    TranslateModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ComponentsDashUserModule {}
