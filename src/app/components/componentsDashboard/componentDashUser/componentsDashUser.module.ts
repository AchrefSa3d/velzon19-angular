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
import { MessagesUserComponent }   from './messages/messages-user.component';
import { WishlistUserComponent }   from './wishlist/wishlist-user.component';
import { MyProductsUserComponent } from './my-products/my-products-user.component';
import { MyReviewsUserComponent }  from './my-reviews/my-reviews-user.component';
import { MyInvoicesUserComponent } from './my-invoices/my-invoices-user.component';
import { MyDeliveriesUserComponent } from './my-deliveries/my-deliveries-user.component';
import { PaymentUserComponent }    from './payment/payment-user.component';

const routes: Routes = [
  { path: '',             redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard',   component: DashboardUserComponent },
  { path: 'orders',      component: OrdersUserComponent },
  { path: 'profile',     component: ProfileUserComponent },
  { path: 'annonces',    component: AnnoncesUserComponent },
  { path: 'messages',    component: MessagesUserComponent },
  { path: 'wishlist',    component: WishlistUserComponent },
  { path: 'my-products',   component: MyProductsUserComponent },
  { path: 'my-reviews',    component: MyReviewsUserComponent },
  { path: 'my-invoices',   component: MyInvoicesUserComponent },
  { path: 'my-deliveries', component: MyDeliveriesUserComponent },
  { path: 'payment',       component: PaymentUserComponent },
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
    MessagesUserComponent,
    WishlistUserComponent,
    MyProductsUserComponent,
    MyReviewsUserComponent,
    MyInvoicesUserComponent,
    MyDeliveriesUserComponent,
    PaymentUserComponent,
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
