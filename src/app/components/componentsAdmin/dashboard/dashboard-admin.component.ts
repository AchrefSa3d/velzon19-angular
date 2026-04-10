import { Component, OnInit } from '@angular/core';
import {
  ApexAxisChartSeries, ApexChart, ApexXAxis, ApexDataLabels,
  ApexStroke, ApexTooltip, ApexFill, ApexNonAxisChartSeries,
  ApexPlotOptions, ApexLegend
} from 'ng-apexcharts';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

@Component({
  selector: 'app-dashboard-admin',
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.scss'],
  standalone: false
})
export class DashboardAdminComponent implements OnInit {

  breadCrumbItems = [
    { label: 'Admin' },
    { label: 'Dashboard', active: true }
  ];

  stats = [
    { label: 'Utilisateurs',        value: 0,     icon: 'ri-user-3-line',             color: 'primary', trend: '' },
    { label: 'Vendeurs',            value: 0,     icon: 'ri-store-2-line',             color: 'info',    trend: '' },
    { label: 'Commandes',           value: 0,     icon: 'ri-shopping-bag-3-line',      color: 'success', trend: '' },
    { label: 'Vendeurs en attente', value: 0,     icon: 'ri-time-line',               color: 'warning', trend: '' },
  ];

  recentOrders: any[] = [];
  pendingVendors: any[] = [];

  salesSeries: ApexAxisChartSeries = [{
    name: 'Commandes', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  }];

  salesChart: ApexChart = { type: 'area', height: 280, toolbar: { show: false }, zoom: { enabled: false } };
  salesXAxis: ApexXAxis = {
    categories: ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'],
    axisBorder: { show: false }, axisTicks: { show: false }
  };
  salesStroke: ApexStroke = { curve: 'smooth', width: 2 };
  salesFill: ApexFill = { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1 } };
  salesDataLabels: ApexDataLabels = { enabled: false };
  salesTooltip: ApexTooltip = { x: { format: 'MMM' } };

  catSeries: ApexNonAxisChartSeries = [1];
  catChart: ApexChart = { type: 'donut', height: 260 };
  catLabels = ['Chargement...'];
  catLegend: ApexLegend = { position: 'bottom' };
  catPlotOptions: ApexPlotOptions = { pie: { donut: { size: '65%' } } };

  constructor(private api: TijaraApiService) {}

  ngOnInit(): void {
    this.api.getAdminStats().subscribe({
      next: (s: any) => {
        this.stats[0].value = s.users        || 0;
        this.stats[1].value = s.vendors      || 0;
        this.stats[2].value = s.orders       || 0;
        this.stats[3].value = s.pendingVendors || 0;
      }
    });

    this.api.getPendingVendors().subscribe({
      next: (data: any[]) => {
        this.pendingVendors = data.slice(0, 5).map(v => ({
          name:  v.shop_name || `${v.first_name} ${v.last_name}`,
          owner: `${v.first_name} ${v.last_name}`,
          date:  new Date(v.created_at).toLocaleDateString('fr-FR'),
        }));
      }
    });

    this.api.getOrders().subscribe({
      next: (data: any[]) => {
        this.recentOrders = data.slice(0, 5).map(o => ({
          id:     `#${o.id}`,
          client: o.client_name || o.email || 'Client',
          total:  o.total_amount || 0,
          status: this.mapOrderStatus(o.status),
          date:   new Date(o.created_at).toLocaleDateString('fr-FR'),
        }));
      }
    });
  }

  private mapOrderStatus(s: string): string {
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
