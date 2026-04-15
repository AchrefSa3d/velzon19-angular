import { Component, OnInit } from '@angular/core';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

@Component({
  selector: 'app-dashboard-user',
  templateUrl: './dashboard-user.component.html',
  standalone: false
})
export class DashboardUserComponent implements OnInit {

  userName = '';
  today = new Date();

  totalOrders    = 0;
  deliveredOrders = 0;
  reclamationsCount = 0;

  breadcrumbItems = [
    { label: 'Mon Espace' },
    { label: 'Tableau de bord', active: true }
  ];

  stats = [
    { icon: 'ri-shopping-bag-3-line',     label: 'Total Commandes',   value: '0', color: 'primary' },
    { icon: 'ri-check-double-line',        label: 'Commandes livrées', value: '0', color: 'success' },
    { icon: 'ri-heart-3-line',             label: 'Liste de souhaits', value: '0', color: 'danger'  },
    { icon: 'ri-customer-service-2-line',  label: 'Réclamations',      value: '0', color: 'warning' },
  ];

  recentOrders: any[] = [];

  categories = [
    { icon: 'ri-computer-line',   label: 'Électronique', color: 'primary',   count: '—' },
    { icon: 'ri-t-shirt-line',    label: 'Mode',         color: 'info',      count: '—' },
    { icon: 'ri-run-line',        label: 'Sport',        color: 'success',   count: '—' },
    { icon: 'ri-home-2-line',     label: 'Maison',       color: 'warning',   count: '—' },
    { icon: 'ri-leaf-line',       label: 'Bien-être',    color: 'danger',    count: '—' },
    { icon: 'ri-restaurant-line', label: 'Alimentation', color: 'secondary', count: '—' },
  ];

  constructor(private api: TijaraApiService) {}

  ngOnInit(): void {
    // Nom depuis localStorage (instantané)
    const stored = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.userName = stored.firstName || stored.email || 'Utilisateur';

    // Commandes réelles
    this.api.getOrders().subscribe({
      next: (data: any[]) => {
        this.totalOrders     = data.length;
        this.deliveredOrders = data.filter(o => o.status === 'delivered').length;

        this.stats[0].value = String(this.totalOrders);
        this.stats[1].value = String(this.deliveredOrders);

        this.recentOrders = data.slice(0, 5).map(o => ({
          id:     `#${o.id}`,
          date:   new Date(o.created_at).toLocaleDateString('fr-FR'),
          vendor: 'Tijara',
          items:  '—',
          total:  o.total_amount || 0,
          status: this.mapStatus(o.status),
        }));
      }
    });

    // Réclamations réelles
    this.api.getReclamations().subscribe({
      next: (data: any[]) => {
        this.reclamationsCount = data.length;
        this.stats[3].value    = String(data.length);
      }
    });

    // Catégories depuis l'API
    this.api.getCategories().subscribe({
      next: (data: any[]) => {
        data.slice(0, 6).forEach((cat, i) => {
          if (this.categories[i]) {
            this.categories[i].label = cat.name;
            this.categories[i].count = String(cat.product_count || 0);
          }
        });
      }
    });
  }

  private mapStatus(s: string): string {
    const map: Record<string, string> = {
      pending: 'En attente', confirmed: 'Confirmée',
      shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée'
    };
    return map[s] || s;
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
}
