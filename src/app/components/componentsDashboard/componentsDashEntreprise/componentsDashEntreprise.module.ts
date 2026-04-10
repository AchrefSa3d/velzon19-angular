import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import {
  NgbToastModule, NgbProgressbarModule, NgbDropdownModule, NgbTooltipModule
} from '@ng-bootstrap/ng-bootstrap';
import { NgApexchartsModule } from 'ng-apexcharts';
import { SharedModule } from 'src/app/shared/shared.module';

import { DashboardEntComponent }  from './dashboard/dashboard-ent.component';
import { ProductsEntComponent }   from './products/products-ent.component';
import { OrdersEntComponent }     from './orders/orders-ent.component';
import { ProfileEntComponent }    from './profile/profile-ent.component';
import { MessagesEntComponent }   from './messages/messages-ent.component';
import { AnnoncesEntComponent }   from './annonces/annonces-ent.component';
import { DealsEntComponent }      from './deals/deals-ent.component';

const routes: Routes = [
  { path: '',           redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard',  component: DashboardEntComponent  },
  { path: 'products',   component: ProductsEntComponent   },
  { path: 'orders',     component: OrdersEntComponent     },
  { path: 'profile',    component: ProfileEntComponent    },
  { path: 'messages',   component: MessagesEntComponent   },
  { path: 'annonces',   component: AnnoncesEntComponent   },
  { path: 'deals',      component: DealsEntComponent      },
  {
    path: 'reclamations',
    loadChildren: () => import('../commonComponentsDash/reclamations/reclamations.module').then(m => m.ReclamationsModule),
  },
];

@NgModule({
  declarations: [
    DashboardEntComponent,
    ProductsEntComponent,
    OrdersEntComponent,
    ProfileEntComponent,
    MessagesEntComponent,
    AnnoncesEntComponent,
    DealsEntComponent,
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
export class ComponentsDashEntrepriseModule {}
