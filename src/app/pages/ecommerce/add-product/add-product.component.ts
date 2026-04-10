import { Component } from '@angular/core';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss'],
  standalone: false
})
export class AddProductComponent {
  breadCrumbItems = [{ label: 'Vendeur' }, { label: 'Ajouter un produit', active: true }];
}
