import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  NgbToastModule, NgbProgressbarModule
} from '@ng-bootstrap/ng-bootstrap';

import { FlatpickrModule } from 'angularx-flatpickr';
import { CountUpModule } from 'ngx-countup';
import { NgApexchartsModule } from 'ng-apexcharts';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { SimplebarAngularModule } from 'simplebar-angular';

// Swiper Slider
import { SlickCarouselModule } from 'ngx-slick-carousel';

import { LightboxModule } from 'ngx-lightbox';

// Load Icons
import { defineElement } from "@lordicon/element";
import lottie from 'lottie-web';
import { RouterModule, Routes } from '@angular/router';

// Pages Routing
// import { PagesRoutingModule } from "./pages-routing.module";

const routes: Routes = [
  {
        path: 'reclamations',
        //component: AdduserComponent,
        loadChildren: () => import('../commonComponentsDash/reclamations/reclamations.module').then(m => m.ReclamationsModule),
  },
  // {
  //     path: '',
  //     //component: AdduserComponent,
  //     data: {
  //         title: 'users'
  //     }, 
  //     children: [ 
  //         {
  //             path: 'add',
  //             component: AddUserComponent,
  //             data: {
  //                 title: 'Add user'
  //             }
  //         },
  //         {
  //             path: 'edit/:id',
  //             component: EdituserComponent,
  //             data: {
  //                 title: 'Edit user'
  //             }
  //         },
  //         {
  //             path: 'view/:id',
  //             component: ViewusersComponent,
  //             data: {
  //                 title: 'View user'
  //             }
  //         }
           
   ] 


@NgModule({
  declarations: [
   
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgbToastModule,
    NgbProgressbarModule,
    RouterModule.forChild(routes),
    FlatpickrModule.forRoot(),
    CountUpModule,
    NgApexchartsModule,
    LeafletModule,
    NgbDropdownModule,
    SimplebarAngularModule,
    SlickCarouselModule,
    LightboxModule,
    
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ComponentsDashEntrepriseModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}