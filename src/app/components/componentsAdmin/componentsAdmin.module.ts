import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import {
  NgbToastModule, NgbProgressbarModule, NgbDropdownModule, NgbTooltipModule
} from '@ng-bootstrap/ng-bootstrap';
import { NgApexchartsModule } from 'ng-apexcharts';
import { SharedModule } from 'src/app/shared/shared.module';

import { DashboardAdminComponent }    from './dashboard/dashboard-admin.component';
import { UsersAdminComponent }        from './users-admin/users-admin.component';
import { CategoriesAdminComponent }   from './categories-admin/categories-admin.component';
import { OrdersAdminComponent }       from './orders-admin/orders-admin.component';
import { VendorsAdminComponent }      from './vendors-admin/vendors-admin.component';
import { AnnoncesAdminComponent }     from './annonces-admin/annonces-admin.component';
import { ProductsAdminComponent }     from './products-admin/products-admin.component';

const routes: Routes = [
  { path: '',              redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard',     component: DashboardAdminComponent },
  { path: 'users',         component: UsersAdminComponent },
  { path: 'categories',    component: CategoriesAdminComponent },
  { path: 'orders',        component: OrdersAdminComponent },
  { path: 'vendors',       component: VendorsAdminComponent },
  { path: 'annonces',      component: AnnoncesAdminComponent },
  { path: 'products',      component: ProductsAdminComponent },
  {
    path: 'reclamations',
    loadChildren: () => import('./reclamations/reclamations.module').then(m => m.ReclamationsModule),
  },
];

@NgModule({
  declarations: [
    DashboardAdminComponent,
    UsersAdminComponent,
    CategoriesAdminComponent,
    OrdersAdminComponent,
    VendorsAdminComponent,
    AnnoncesAdminComponent,
    ProductsAdminComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbToastModule,
    NgbProgressbarModule,
    NgbDropdownModule,
    NgbTooltipModule,
    NgApexchartsModule,
    SharedModule,
    RouterModule.forChild(routes),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ComponentsAdminModule {}
