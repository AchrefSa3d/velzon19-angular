import { Component, OnInit } from '@angular/core';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

@Component({
  selector: 'app-orders-user',
  templateUrl: './orders-user.component.html',
  standalone: false
})
export class OrdersUserComponent implements OnInit {

  activeTab = 'Toutes';
  searchTerm = '';
  selectedOrder: any | null = null;
  loading = true;

  breadcrumbItems = [
    { label: 'Mon Espace' },
    { label: 'Mes Commandes', active: true }
  ];

  tabs = ['Toutes', 'En attente', 'Confirmée', 'Expédiée', 'Livrée', 'Annulée'];

  allOrders: any[] = [];

  constructor(private api: TijaraApiService) {}

  ngOnInit(): void {
    this.loading = true;
    this.api.getOrders().subscribe({
      next: (data: any[]) => {
        this.allOrders = data.map(o => ({
          id:      `#${o.id}`,
          date:    new Date(o.created_at).toLocaleDateString('fr-FR'),
          vendor:  'Tijara',
          items:   [],
          total:   o.total_amount || 0,
          status:  this.mapStatus(o.status),
          address: o.shipping_address || '',
          payment: 'Paiement à la livraison',
        }));
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  private mapStatus(s: string): string {
    const map: Record<string, string> = {
      pending: 'En attente', confirmed: 'Confirmée',
      shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée'
    };
    return map[s] || s;
  }

  get filteredOrders(): any[] {
    return this.allOrders.filter(o => {
      const matchTab = this.activeTab === 'Toutes' || o.status === this.activeTab;
      const matchSearch = !this.searchTerm ||
        o.id.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        o.vendor.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchTab && matchSearch;
    });
  }

  countByStatus(status: string): number {
    if (status === 'Toutes') return this.allOrders.length;
    return this.allOrders.filter(o => o.status === status).length;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Livrée':    'badge bg-success-subtle text-success',
      'Expédiée':  'badge bg-info-subtle text-info',
      'Confirmée': 'badge bg-primary-subtle text-primary',
      'En attente':'badge bg-warning-subtle text-warning',
      'Annulée':   'badge bg-danger-subtle text-danger',
    };
    return map[status] || 'badge bg-secondary-subtle text-secondary';
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      'Livrée': 'success', 'Expédiée': 'info', 'Confirmée': 'primary',
      'En attente': 'warning', 'Annulée': 'danger',
    };
    return map[status] || 'secondary';
  }

  getTimelineSteps(status: string): { label: string; icon: string; done: boolean }[] {
    const steps = [
      { label: 'Commandé',  icon: 'ri-shopping-bag-3-line' },
      { label: 'Confirmée', icon: 'ri-check-double-line' },
      { label: 'Expédiée',  icon: 'ri-truck-line' },
      { label: 'Livrée',    icon: 'ri-home-2-line' },
    ];
    const statusIdx: Record<string, number> = {
      'En attente': 0, 'Confirmée': 1, 'Expédiée': 2, 'Livrée': 3
    };
    const currentIdx = statusIdx[status] ?? -1;
    return steps.map((s, i) => ({ ...s, done: i <= currentIdx }));
  }

  toggleOrder(order: any): void {
    this.selectedOrder = this.selectedOrder?.id === order.id ? null : order;
  }

  getOrderTotal(order: any): number {
    return order.items.reduce((sum: number, i: any) => sum + i.price * i.qty, 0) || order.total;
  }
}
