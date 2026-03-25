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
import { AddReclamationUser } from './addreclamation/addreclamationuser';
import { Editreclamation } from 'src/app/components/componentsDashboard/commonComponentsDash/reclamations/editreclamation/editreclamation';
import { ViewreclamationsExtern } from 'src/app/components/componentsDashboard/commonComponentsDash/reclamations/viewreclamations/viewreclamations';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { ReactiveFormsModule } from '@angular/forms';
import { createTranslateLoader } from 'src/app/app.module';
import { HttpClient } from '@angular/common/http';
import { LanguageService } from 'src/app/core/services/language.service';

// Pages Routing
// import { PagesRoutingModule } from "./pages-routing.module";
 const routes: Routes = [
  {
      path: '',
      //component: AdduserComponent,
      data: {
          title: 'reclamations'
      }, 
      children: [ 
          {
              path: 'add',
              component: AddReclamationUser,
              data: {
                  title: 'Add reclamation'
              }
          },
          {
              path: 'edit/:id',
              component: Editreclamation,
              data: {
                  title: 'Edit rec'
              }
          },
          {
              path: 'view/:id',
              component: ViewreclamationsExtern,
              data: {
                  title: 'View reclam'
              }
          }
          
        ]
 } 
]

@NgModule({
  declarations: [
     AddReclamationUser,
     

  ],
  imports: [
    CommonModule,
    FormsModule,
    NgbToastModule,
    NgbProgressbarModule,
    FlatpickrModule.forRoot(),
    RouterModule,
    RouterModule.forChild(routes),
    CountUpModule,
    NgApexchartsModule,
    LeafletModule,
    NgbDropdownModule,
    SimplebarAngularModule,
    SlickCarouselModule,
    LightboxModule,
    TranslateModule,
    ReactiveFormsModule
    
  ],
  exports: [RouterModule],
  providers: [LanguageService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ReclamationsModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}