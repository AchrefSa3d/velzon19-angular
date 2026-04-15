import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

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

  orders:        any[] = [];
  selectedOrder: any   = null;
  filterStatus         = 'tous';
  loading              = true;
  loadingDetail        = false;

  statuses = [
    { value: 'tous',      label: 'Toutes'     },
    { value: 'pending',   label: 'En attente' },
    { value: 'confirmed', label: 'Confirmées' },
    { value: 'shipped',   label: 'Expédiées'  },
    { value: 'delivered', label: 'Livrées'    },
    { value: 'cancelled', label: 'Annulées'   },
  ];

  countByStatus(status: string): number {
    return this.orders.filter(o => o.status === status).length;
  }

  constructor(private router: Router, private api: TijaraApiService) {}

  ngOnInit(): void { this.loadOrders(); }

  loadOrders(): void {
    this.loading = true;
    this.api.getOrders().subscribe({
      next: (data: any[]) => {
        this.orders  = data;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  get filteredOrders(): any[] {
    if (this.filterStatus === 'tous') return this.orders;
    return this.orders.filter(o => o.status === this.filterStatus);
  }

  showDetail(order: any): void {
    this.loadingDetail = true;
    this.selectedOrder = order; // afficher immédiatement
    this.api.getOrder(order.id).subscribe({
      next: (detail: any) => {
        this.selectedOrder = detail;
        this.loadingDetail = false;
      },
      error: () => { this.loadingDetail = false; }
    });
  }

  closeDetail(): void { this.selectedOrder = null; }

  orderLabel(id: number): string {
    return `#${String(id).padStart(4, '0')}`;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':   return 'bg-warning-subtle text-warning';
      case 'confirmed': return 'bg-info-subtle text-info';
      case 'shipped':   return 'bg-primary-subtle text-primary';
      case 'delivered': return 'bg-success-subtle text-success';
      case 'cancelled': return 'bg-danger-subtle text-danger';
      default:          return 'bg-secondary-subtle text-secondary';
    }
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      pending: 'En attente', confirmed: 'Confirmée',
      shipped: 'Expédiée',   delivered: 'Livrée', cancelled: 'Annulée'
    };
    return map[status] || status;
  }

  goShop(): void { this.router.navigate(['/shop/products']); }
}
