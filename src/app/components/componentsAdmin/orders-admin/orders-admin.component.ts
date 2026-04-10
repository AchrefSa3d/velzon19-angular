import { Component, OnInit } from '@angular/core';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

@Component({
  selector: 'app-orders-admin',
  templateUrl: './orders-admin.component.html',
  styleUrls: ['./orders-admin.component.scss'],
  standalone: false
})
export class OrdersAdminComponent implements OnInit {

  breadCrumbItems = [
    { label: 'Admin' },
    { label: 'Toutes les Commandes', active: true }
  ];

  searchTerm = '';
  filterStatus = 'tous';
  statuses = ['En attente', 'Confirmée', 'Livrée', 'Annulée'];
  loading = true;

  allOrders: any[] = [];
  filteredOrders: any[] = [];

  constructor(private api: TijaraApiService) {}

  ngOnInit(): void { this.loadOrders(); }

  loadOrders(): void {
    this.loading = true;
    this.api.getAdminOrders().subscribe({
      next: (data: any[]) => {
        this.allOrders = data.map(o => ({
          id:      o.id,
          client:  o.client_name || o.client_email || 'Client',
          email:   o.client_email || '',
          phone:   o.client_phone || '',
          ville:   o.shipping_address || '—',
          total:   o.total_amount || 0,
          date:    new Date(o.created_at).toLocaleDateString('fr-FR'),
          status:  this.mapStatus(o.status),
          apiId:   o.id,
        }));
        this.loading = false;
        this.applyFilter();
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

  private statusToApi(s: string): string {
    const map: Record<string, string> = {
      'En attente': 'pending', 'Confirmée': 'confirmed',
      'Expédiée': 'shipped', 'Livrée': 'delivered', 'Annulée': 'cancelled'
    };
    return map[s] || s;
  }

  applyFilter() {
    let list = [...this.allOrders];
    if (this.filterStatus !== 'tous') list = list.filter(o => o.status === this.filterStatus);
    if (this.searchTerm.trim()) {
      const t = this.searchTerm.toLowerCase();
      list = list.filter(o =>
        String(o.id).includes(t) ||
        o.client.toLowerCase().includes(t) ||
        o.ville.toLowerCase().includes(t)
      );
    }
    this.filteredOrders = list;
  }

  changeStatus(order: any, status: string) {
    order.status = status;
    this.api.updateAdminOrderStatus(order.apiId, this.statusToApi(status)).subscribe();
    this.applyFilter();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'En attente': return 'bg-warning-subtle text-warning';
      case 'Confirmée':  return 'bg-info-subtle text-info';
      case 'Expédiée':   return 'bg-primary-subtle text-primary';
      case 'Livrée':     return 'bg-success-subtle text-success';
      case 'Annulée':    return 'bg-danger-subtle text-danger';
      default:           return 'bg-secondary-subtle text-secondary';
    }
  }

  get countByStatus() {
    return {
      attente:   this.allOrders.filter(o => o.status === 'En attente').length,
      confirmee: this.allOrders.filter(o => o.status === 'Confirmée').length,
      livree:    this.allOrders.filter(o => o.status === 'Livrée').length,
      annulee:   this.allOrders.filter(o => o.status === 'Annulée').length,
    };
  }

  get totalRevenue(): number {
    return this.allOrders.filter(o => o.status === 'Livrée').reduce((sum, o) => sum + o.total, 0);
  }
}
