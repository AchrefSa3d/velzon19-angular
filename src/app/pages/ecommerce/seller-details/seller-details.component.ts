import { Component } from '@angular/core';

@Component({
  selector: 'app-seller-details',
  templateUrl: './seller-details.component.html',
  styleUrls: ['./seller-details.component.scss'],
  standalone: false
})
export class SellerDetailsComponent {
  breadCrumbItems = [{ label: 'Admin' }, { label: 'Détail vendeur', active: true }];
}
