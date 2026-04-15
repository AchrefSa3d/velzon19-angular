import { Component, OnInit } from '@angular/core';
import {
  ApexAxisChartSeries, ApexChart, ApexXAxis, ApexDataLabels,
  ApexStroke, ApexTooltip, ApexFill, ApexNonAxisChartSeries,
  ApexPlotOptions, ApexLegend
} from 'ng-apexcharts';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

@Component({
  selector: 'app-dashboard-ent',
  templateUrl: './dashboard-ent.component.html',
  styleUrls: ['./dashboard-ent.component.scss'],
  standalone: false
})
export class DashboardEntComponent implements OnInit {

  breadCrumbItems = [
    { label: 'Vendeur' },
    { label: 'Tableau de bord', active: true }
  ];

  vendorName = '';
  shopName   = '';

  stats = [
    { label: 'Commandes du mois',  value: 0,    icon: 'ri-shopping-bag-3-line',      color: 'primary', trend: '' },
    { label: 'Revenus du mois',    value: '0 DT', icon: 'ri-money-dollar-circle-line', color: 'success', trend: '' },
    { label: 'Produits en ligne',  value: 0,    icon: 'ri-store-2-line',              color: 'info',    trend: '' },
    { label: 'Réclamations ouvertes', value: 0, icon: 'ri-message-3-line',            color: 'warning', trend: '' },
  ];

  recentOrders: any[] = [];
  topProducts: any[] = [];

  areaSeries: ApexAxisChartSeries = [{
    name: 'Commandes', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  }];

  areaChart: ApexChart = { type: 'area', height: 260, toolbar: { show: false }, zoom: { enabled: false } };
  areaXAxis: ApexXAxis = {
    categories: ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'],
    axisBorder: { show: false }, axisTicks: { show: false }
  };
  areaStroke: ApexStroke  = { curve: 'smooth', width: 2 };
  areaFill: ApexFill      = { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05 } };
  areaDataLabels: ApexDataLabels = { enabled: false };
  areaTooltip: ApexTooltip = { x: { format: 'MMM' } };

  donutSeries: ApexNonAxisChartSeries = [1];
  donutChart: ApexChart = { type: 'donut', height: 240 };
  donutLabels = ['Chargement...'];
  donutLegend: ApexLegend = { position: 'bottom' };
  donutPlotOptions: ApexPlotOptions = { pie: { donut: { size: '65%' } } };

  constructor(private api: TijaraApiService) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.vendorName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Vendeur';
    this.shopName   = user.shopName || this.vendorName;

    this.api.getOrders().subscribe({
      next: (data: any[]) => {
        const total  = data.length;
        const revenue = data.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.total_amount || 0), 0);
        this.stats[0].value = total;
        this.stats[1].value = revenue.toLocaleString('fr-FR') + ' DT';

        this.recentOrders = data.slice(0, 5).map(o => ({
          id:      `#${o.id}`,
          client:  o.client_name || o.email || 'Client',
          product: '—',
          total:   o.total_amount || 0,
          status:  this.mapStatus(o.status),
          date:    new Date(o.created_at).toLocaleDateString('fr-FR'),
        }));
      }
    });

    this.api.getMyProducts().subscribe({
      next: (data: any[]) => {
        const active = data.filter(p => p.is_active);
        this.stats[2].value = active.length;
        this.topProducts = active.slice(0, 4).map((p, i) => ({
          name:     p.name,
          sales:    0,
          revenue:  0,
          progress: Math.max(10, 100 - i * 20),
        }));
        if (active.length > 0) {
          this.donutSeries = active.slice(0, 4).map(() => 1);
          this.donutLabels = active.slice(0, 4).map(p => p.name);
        }
      }
    });

    this.api.getReclamations().subscribe({
      next: (data: any[]) => {
        this.stats[3].value = data.filter(r => r.status === 'open').length;
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
    switch (status) {
      case 'En attente': return 'bg-warning-subtle text-warning';
      case 'Confirmée':  return 'bg-info-subtle text-info';
      case 'Livrée':     return 'bg-success-subtle text-success';
      case 'Annulée':    return 'bg-danger-subtle text-danger';
      default:           return 'bg-secondary-subtle text-secondary';
    }
  }
}
