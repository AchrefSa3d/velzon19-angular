import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

interface MonthData { month: string; revenue: number; orders: number; }
interface TopProduct { id: number; title: string; price: number; sold: number; image?: string; }
interface StatusBucket { key: string; label: string; color: string; icon: string; count: number; pct: number; }

@Component({
  selector: 'app-dashboard-ent',
  templateUrl: './dashboard-ent.component.html',
  styleUrls: ['./dashboard-ent.component.scss'],
  standalone: false,
})
export class DashboardEntComponent implements OnInit {

  breadCrumbItems = [
    { label: 'Vendeur' },
    { label: 'Tableau de bord', active: true },
  ];

  // ─── Identité vendeur ─────────────────────────────────────────
  vendorName = '';
  shopName   = '';
  today      = new Date();

  // ─── KPI principaux (8 cartes cliquables) ─────────────────────
  kpis: Array<{ key: string; label: string; value: string; raw: number; icon: string; color: string; link: string; trend?: number }> = [
    { key: 'orders',     label: 'Commandes',         value: '0',      raw: 0, icon: 'ri-shopping-bag-3-line',     color: 'primary',   link: '/ent/orders'     },
    { key: 'delivered',  label: 'Livrées',           value: '0',      raw: 0, icon: 'ri-check-double-line',       color: 'success',   link: '/ent/deliveries' },
    { key: 'pending',    label: 'En cours',          value: '0',      raw: 0, icon: 'ri-time-line',               color: 'warning',   link: '/ent/orders'     },
    { key: 'revenue',    label: 'Revenus (TND)',     value: '0',      raw: 0, icon: 'ri-money-dollar-circle-line',color: 'info',      link: '/ent/invoices'   },
    { key: 'paid',       label: 'Encaissé (TND)',    value: '0',      raw: 0, icon: 'ri-bank-card-line',          color: 'success',   link: '/ent/invoices'   },
    { key: 'products',   label: 'Annonces actives',  value: '0',      raw: 0, icon: 'ri-store-2-line',            color: 'secondary', link: '/ent/products'   },
    { key: 'invoices',   label: 'Factures émises',   value: '0',      raw: 0, icon: 'ri-file-text-line',          color: 'dark',      link: '/ent/invoices'   },
    { key: 'reclam',     label: 'Réclamations',      value: '0',      raw: 0, icon: 'ri-customer-service-2-line', color: 'danger',    link: '/ent/reclamations' },
  ];

  // ─── Données analytiques (ex-Rapports) ────────────────────────
  sales: MonthData[] = [];
  topProducts: TopProduct[] = [];
  statusDist: StatusBucket[] = [];
  recentOrders: any[] = [];

  chartMode: 'revenue' | 'orders' = 'revenue';

  // ─── Insights ─────────────────────────────────────────────────
  conversionRate = 0;
  avgBasket      = 0;
  bestMonth      = '—';
  uniqueClients  = 0;
  monthRevenue   = 0;
  monthOrders    = 0;

  loading = true;

  constructor(private api: TijaraApiService) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.vendorName = [user.firstName, user.lastName].filter(Boolean).join(' ')
                   || user.first_name || user.email || 'Vendeur';
    this.shopName   = user.shopName || user.shop_name || this.vendorName;

    forkJoin({
      orders:       this.api.getOrders().pipe(catchError(() => of([] as any[]))),
      products:     this.api.getMyProducts().pipe(catchError(() => of([] as any[]))),
      reclamations: this.api.getReclamations().pipe(catchError(() => of([] as any[]))),
      invoices:     this.api.getInvoices().pipe(catchError(() => of([] as any[]))),
      sales:        this.api.getSalesByMonth().pipe(catchError(() => of([] as any[]))),
      top:          this.api.getTopProducts(5).pipe(catchError(() => of([] as any[]))),
    }).subscribe(({ orders, products, reclamations, invoices, sales, top }) => {
      this.computeKpis(orders, products, reclamations, invoices);
      this.computeAnalytics(orders, sales, top);
      this.loading = false;
    });
  }

  // ─── Calculs ──────────────────────────────────────────────────
  private computeKpis(orders: any[], products: any[], reclamations: any[], invoices: any[]): void {
    const os = orders || [];
    const totalOrders   = os.length;
    const delivered     = os.filter(o => o.status === 'delivered').length;
    const pending       = os.filter(o => ['pending', 'confirmed', 'shipped'].includes(o.status)).length;
    const totalRevenue  = os.reduce((s, o) => s + (+o.total_amount || 0), 0);

    const invs = invoices || [];
    const paidRevenue = invs
      .filter(i => (i.status ?? i.Status) === 'paid')
      .reduce((s, i) => s + (+(i.total ?? i.Total ?? 0)), 0);

    const activeProducts = (products || []).filter(p => p.is_active !== false && p.active !== 0).length;
    const openReclam     = (reclamations || []).filter(r => r.status === 'open').length;

    const vals: Record<string, number> = {
      orders: totalOrders, delivered, pending,
      revenue: totalRevenue, paid: paidRevenue,
      products: activeProducts, invoices: invs.length, reclam: openReclam,
    };

    this.kpis.forEach(k => {
      k.raw   = vals[k.key] ?? 0;
      k.value = ['revenue', 'paid'].includes(k.key)
                  ? this.formatNumber(k.raw)
                  : String(k.raw);
    });

    // 5 dernières commandes pour le panneau "Commandes récentes"
    this.recentOrders = os.slice(0, 5).map(o => ({
      id:      `#${o.id}`,
      client:  o.client_name || o.email || '—',
      total:   +o.total_amount || 0,
      status:  this.mapStatus(o.status),
      rawStatus: o.status,
      date:    o.created_at ? new Date(o.created_at).toLocaleDateString('fr-FR') : '—',
    }));
  }

  private computeAnalytics(orders: any[], sales: any[], top: any[]): void {
    // Sales par mois
    this.sales = (sales || []).map((x: any) => ({
      month:   String(x.month   ?? x.Month   ?? ''),
      revenue: +(x.revenue      ?? x.Revenue ?? 0),
      orders:  +(x.orders       ?? x.Orders  ?? 0),
    }));

    // Top produits
    this.topProducts = (top || []).map((x: any) => ({
      id:    +(x.id    ?? x.Id    ?? 0),
      title:  x.title  ?? x.Title  ?? 'Annonce',
      price: +(x.price ?? x.Price ?? 0),
      sold:  +(x.sold  ?? x.Sold  ?? 0),
      image:  x.image  ?? x.Image ?? null,
    }));

    // Insights depuis orders
    const os = orders || [];
    const totalOrders = os.length;
    const delivered   = os.filter(o => o.status === 'delivered').length;
    const totalRev    = os.reduce((s, o) => s + (+o.total_amount || 0), 0);

    this.conversionRate = totalOrders > 0 ? Math.round((delivered / totalOrders) * 100) : 0;
    this.avgBasket      = totalOrders > 0 ? +(totalRev / totalOrders).toFixed(2) : 0;

    const best = [...this.sales].sort((a, b) => b.revenue - a.revenue)[0];
    this.bestMonth = best && best.revenue > 0
      ? `${this.monthLabel(best.month)} (${best.revenue.toFixed(0)} TND)`
      : '—';

    this.uniqueClients = new Set(os.map((o: any) => o.client_email || o.user_id).filter(Boolean)).size;

    // KPIs du mois en cours
    const now = new Date();
    const ym  = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const cur = this.sales.find(s => s.month === ym);
    this.monthRevenue = cur?.revenue ?? 0;
    this.monthOrders  = cur?.orders  ?? 0;

    // Répartition des statuts
    const statuses = [
      { key: 'delivered', label: 'Livrées',    color: 'success', icon: 'ri-check-double-line' },
      { key: 'shipped',   label: 'Expédiées',  color: 'info',    icon: 'ri-send-plane-line' },
      { key: 'confirmed', label: 'Confirmées', color: 'primary', icon: 'ri-checkbox-circle-line' },
      { key: 'pending',   label: 'En attente', color: 'warning', icon: 'ri-time-line' },
      { key: 'cancelled', label: 'Annulées',   color: 'danger',  icon: 'ri-close-circle-line' },
    ];
    this.statusDist = statuses
      .map(s => {
        const count = os.filter((o: any) => o.status === s.key).length;
        const pct = totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0;
        return { ...s, count, pct };
      })
      .filter(s => s.count > 0);
  }

  // ─── Helpers ──────────────────────────────────────────────────
  get maxChartVal(): number {
    return Math.max(1, ...this.sales.map(m => this.chartMode === 'revenue' ? m.revenue : m.orders));
  }

  barHeight(m: MonthData): number {
    const v = this.chartMode === 'revenue' ? m.revenue : m.orders;
    return Math.max(4, (v / this.maxChartVal) * 100);
  }

  monthLabel(m: string): string {
    if (!m || m.length < 6) return m;
    const months = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
    const mIdx = parseInt(m.slice(-2), 10) - 1;
    return `${months[mIdx] || ''} ${m.slice(0, 4)}`;
  }

  formatNumber(n: number): string {
    return n.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
  }

  private mapStatus(s: string): string {
    const map: Record<string, string> = {
      pending: 'En attente', confirmed: 'Confirmée',
      shipped: 'Expédiée',   delivered: 'Livrée',  cancelled: 'Annulée',
    };
    return map[s] || s || '—';
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Livrée':     'badge bg-success-subtle text-success',
      'Expédiée':   'badge bg-info-subtle text-info',
      'Confirmée':  'badge bg-primary-subtle text-primary',
      'En attente': 'badge bg-warning-subtle text-warning',
      'Annulée':    'badge bg-danger-subtle text-danger',
    };
    return map[status] || 'badge bg-secondary-subtle text-secondary';
  }
}
