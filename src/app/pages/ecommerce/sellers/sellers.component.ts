import { Component } from '@angular/core';

@Component({
  selector: 'app-sellers',
  templateUrl: './sellers.component.html',
  styleUrls: ['./sellers.component.scss'],
  standalone: false
})
export class SellersComponent {
  breadCrumbItems = [{ label: 'Admin' }, { label: 'Vendeurs', active: true }];
}
