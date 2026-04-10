import { Component } from '@angular/core';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss'],
  standalone: false
})
export class CustomersComponent {
  breadCrumbItems = [{ label: 'Admin' }, { label: 'Clients', active: true }];
}
