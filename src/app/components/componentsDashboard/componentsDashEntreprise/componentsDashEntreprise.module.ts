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
import { FollowersEntComponent }  from './followers/followers-ent.component';
import { DeliveriesEntComponent } from './deliveries/deliveries-ent.component';
import { ReportsEntComponent }    from './reports/reports-ent.component';
import { InvoicesEntComponent }   from './invoices/invoices-ent.component';

const routes: Routes = [
  { path: '',           redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard',  component: DashboardEntComponent  },
  { path: 'products',   component: ProductsEntComponent   },
  { path: 'orders',     component: OrdersEntComponent     },
  { path: 'profile',    component: ProfileEntComponent    },
  { path: 'messages',   component: MessagesEntComponent   },
  { path: 'annonces',   component: AnnoncesEntComponent   },
  { path: 'deals',      component: DealsEntComponent      },
  { path: 'followers',  component: FollowersEntComponent  },
  { path: 'deliveries', component: DeliveriesEntComponent },
  // Reports retiré du menu — toutes les statistiques sont fusionnées dans le Tableau de bord
  { path: 'reports',    redirectTo: 'dashboard' },
  { path: 'invoices',   component: InvoicesEntComponent   },
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
    FollowersEntComponent,
    DeliveriesEntComponent,
    ReportsEntComponent,
    InvoicesEntComponent,
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
