import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IndexComponent } from './index/index.component';

import { NgbCarouselModule, NgbTooltipModule, NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { LandingRoutingModule } from './landing-routing.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [IndexComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NgbCarouselModule,
    NgbTooltipModule,
    NgbCollapseModule,
    LandingRoutingModule,
    SharedModule,
    ScrollToModule.forRoot(),
  ]
})
export class LandingModule {}
