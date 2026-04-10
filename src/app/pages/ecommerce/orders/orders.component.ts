import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
  standalone: false
})
export class OrdersComponent implements OnInit {

  breadCrumbItems = [
    { label: 'Boutique', link: '/shop/products' },
    { label: 'Mes Commandes', active: true }
  ];

  orders: any[] = [];
  selectedOrder: any = null;
  filterStatus = 'tous';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders() {
    const saved = sessionStorage.getItem('tijara_orders');
    this.orders = saved ? JSON.parse(saved) : [];
  }

  get filteredOrders(): any[] {
    if (this.filterStatus === 'tous') return this.orders;
    return this.orders.filter(o => o.status === this.filterStatus);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'En attente': return 'bg-warning-subtle text-warning';
      case 'Confirmée':  return 'bg-info-subtle text-info';
      case 'Livrée':     return 'bg-success-subtle text-success';
      case 'Annulée':    return 'bg-danger-subtle text-danger';
      default:           return 'bg-secondary-subtle text-secondary';
    }
  }

  showDetail(order: any) {
    this.selectedOrder = order;
  }

  closeDetail() {
    this.selectedOrder = null;
  }

  goShop() { this.router.navigate(['/shop/products']); }
}
