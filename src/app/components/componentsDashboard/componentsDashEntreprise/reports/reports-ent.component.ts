import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

interface MonthData { month: string; revenue: number; orders: number; }
interface TopProduct { id: number; title: string; price: number; sold: number; image?: string; }

@Component({
  selector: 'app-reports-ent',
  standalone: false,
  template: `
<app-breadcrumbs title="Rapports" [breadcrumbItems]="breadcrumbItems"></app-breadcrumbs>

<!-- ═════ KPI cards ═════ -->
<div class="row g-3 mb-4">
  @for (k of kpis; track k.key) {
    <div class="col-6 col-md-3">
      <div class="card border-0 shadow-sm h-100"
           [style.border-left]="'4px solid var(--vz-' + k.color + ')'">
        <div class="card-body d-flex align-items-center gap-3 py-3">
          <div class="avatar-md rounded-3 d-flex align-items-center justify-content-center"
               [class]="'bg-' + k.color + '-subtle'">
            <i class="fs-22" [class]="k.icon + ' text-' + k.color"></i>
          </div>
          <div class="flex-grow-1 min-width-0">
            <h3 class="mb-0 fw-bold" [class]="'text-' + k.color">{{ k.value }}</h3>
            <p class="mb-0 text-muted fs-12 text-truncate">{{ k.label }}</p>
            @if (k.trend !== undefined) {
              <small [class.text-success]="k.trend >= 0" [class.text-danger]="k.trend < 0" class="fs-11">
                <i [class]="k.trend >= 0 ? 'ri-arrow-up-line' : 'ri-arrow-down-line'"></i>
                {{ k.trend }}% vs mois précédent
              </small>
            }
          </div>
        </div>
      </div>
    </div>
  }
</div>

<!-- ═════ Main charts ═════ -->
<div class="row g-4 mb-4">
  <!-- Sales chart -->
  <div class="col-xl-8">
    <div class="card border-0 shadow-sm h-100">
      <div class="card-header bg-transparent d-flex flex-wrap align-items-center gap-2 py-3">
        <h6 class="mb-0 fw-semibold flex-grow-1">
          <i class="ri-line-chart-line me-2 text-primary"></i>Évolution des ventes
        </h6>
        <div class="btn-group btn-group-sm">
          <button class="btn" [class.btn-primary]="chartMode==='revenue'" [class.btn-light]="chartMode!=='revenue'"
                  (click)="chartMode='revenue'">Revenus</button>
          <button class="btn" [class.btn-primary]="chartMode==='orders'"  [class.btn-light]="chartMode!=='orders'"
                  (click)="chartMode='orders'">Commandes</button>
        </div>
      </div>
      <div class="card-body">
        @if (sales.length === 0) {
          <div class="text-center py-5">
            <i class="ri-line-chart-line display-4 text-muted opacity-50 d-block"></i>
            <p class="text-muted mt-2 mb-0">Aucune donnée de vente disponible</p>
            <small class="text-muted">Les statistiques apparaîtront dès vos premières commandes.</small>
          </div>
        } @else {
          <div class="d-flex align-items-end gap-2" style="height:280px">
            @for (m of sales; track m.month) {
              <div class="flex-grow-1 d-flex flex-column align-items-center h-100 justify-content-end"
                   [title]="monthLabel(m.month) + ' — ' + (chartMode==='revenue' ? (m.revenue + ' TND') : (m.orders + ' cmd'))">
                <div class="fs-11 fw-semibold" [class.text-primary]="chartMode==='revenue'" [class.text-success]="chartMode==='orders'">
                  {{ chartMode === 'revenue' ? (m.revenue | number:'1.0-0') : m.orders }}
                </div>
                <div class="w-100 rounded-top mt-1"
                     [style.height.%]="barHeight(m)"
                     [style.background]="chartMode==='revenue' ? 'linear-gradient(180deg,#405189,#0ab39c)' : 'linear-gradient(180deg,#0ab39c,#5cb85c)'"
                     style="min-height:8px;transition:all .3s"></div>
                <div class="fs-10 text-muted mt-1">{{ m.month.slice(-2) }}/{{ m.month.slice(2,4) }}</div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  </div>

  <!-- Top products -->
  <div class="col-xl-4">
    <div class="card border-0 shadow-sm h-100">
      <div class="card-header bg-transparent py-3">
        <h6 class="mb-0 fw-semibold">
          <i class="ri-star-line me-2 text-warning"></i>Top produits
        </h6>
      </div>
      <div class="card-body p-0">
        @if (topProducts.length === 0) {
          <div class="text-center py-5">
            <i class="ri-trophy-line display-4 text-muted opacity-50 d-block"></i>
            <p class="text-muted mt-2 mb-0 fs-13">Aucune vente pour le moment</p>
          </div>
        } @else {
          <ul class="list-group list-group-flush">
            @for (p of topProducts; track p.id; let i = $index) {
              <li class="list-group-item d-flex align-items-center gap-3 py-3">
                <div class="avatar-xs rounded-circle d-flex align-items-center justify-content-center fw-bold"
                     [class.bg-warning]="i===0" [class.text-white]="i===0"
                     [class.bg-secondary-subtle]="i!==0" [class.text-secondary]="i!==0">
                  {{ i + 1 }}
                </div>
                @if (p.image) {
                  <img [src]="p.image" width="32" height="32" class="rounded" style="object-fit:cover" alt="">
                }
                <div class="flex-grow-1 min-width-0">
                  <div class="fw-semibold fs-13 text-truncate">{{ p.title }}</div>
                  <div class="fs-11 text-muted">{{ p.price | number:'1.2-2' }} TND</div>
                </div>
                <span class="badge bg-success-subtle text-success rounded-pill">
                  <i class="ri-shopping-cart-2-line me-1"></i>{{ p.sold }}
                </span>
              </li>
            }
          </ul>
        }
      </div>
    </div>
  </div>
</div>

<!-- ═════ Status distribution + Insights ═════ -->
<div class="row g-4">
  <div class="col-md-6">
    <div class="card border-0 shadow-sm h-100">
      <div class="card-header bg-transparent py-3">
        <h6 class="mb-0 fw-semibold">
          <i class="ri-pie-chart-line me-2 text-info"></i>Répartition des commandes
        </h6>
      </div>
      <div class="card-body">
        @if (statusDist.length === 0) {
          <p class="text-muted text-center py-4 mb-0">Aucune donnée.</p>
        } @else {
          @for (s of statusDist; track s.label) {
            <div class="mb-3">
              <div class="d-flex justify-content-between fs-13 mb-1">
                <span><i [class]="s.icon + ' me-1 text-' + s.color"></i>{{ s.label }}</span>
                <span class="fw-semibold">{{ s.count }} ({{ s.pct }}%)</span>
              </div>
              <div class="progress" style="height:8px">
                <div class="progress-bar" [class]="'bg-' + s.color" [style.width.%]="s.pct"></div>
              </div>
            </div>
          }
        }
      </div>
    </div>
  </div>

  <div class="col-md-6">
    <div class="card border-0 shadow-sm h-100">
      <div class="card-header bg-transparent py-3">
        <h6 class="mb-0 fw-semibold">
          <i class="ri-lightbulb-flash-line me-2 text-success"></i>Insights & recommandations
        </h6>
      </div>
      <div class="card-body">
        <div class="d-flex gap-3 mb-3">
          <div class="avatar-sm bg-success-subtle text-success rounded-circle d-flex align-items-center justify-content-center flex-shrink-0">
            <i class="ri-line-chart-line"></i>
          </div>
          <div>
            <div class="fs-13 fw-semibold">Taux de conversion</div>
            <div class="fs-11 text-muted">{{ conversionRate }}% des commandes sont livrées avec succès</div>
          </div>
        </div>
        <div class="d-flex gap-3 mb-3">
          <div class="avatar-sm bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0">
            <i class="ri-exchange-dollar-line"></i>
          </div>
          <div>
            <div class="fs-13 fw-semibold">Panier moyen</div>
            <div class="fs-11 text-muted">{{ avgBasket | number:'1.2-2' }} TND par commande</div>
          </div>
        </div>
        <div class="d-flex gap-3 mb-3">
          <div class="avatar-sm bg-warning-subtle text-warning rounded-circle d-flex align-items-center justify-content-center flex-shrink-0">
            <i class="ri-calendar-check-line"></i>
          </div>
          <div>
            <div class="fs-13 fw-semibold">Meilleur mois</div>
            <div class="fs-11 text-muted">{{ bestMonth }}</div>
          </div>
        </div>
        <div class="d-flex gap-3">
          <div class="avatar-sm bg-info-subtle text-info rounded-circle d-flex align-items-center justify-content-center flex-shrink-0">
            <i class="ri-user-star-line"></i>
          </div>
          <div>
            <div class="fs-13 fw-semibold">Clients uniques</div>
            <div class="fs-11 text-muted">{{ uniqueClients }} acheteurs différents</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
`,
})
export class ReportsEntComponent implements OnInit {
  breadcrumbItems = [{ label: 'Vendor', active: false }, { label: 'Rapports', active: true }];

  overview: any = {};
  sales: MonthData[] = [];
  topProducts: TopProduct[] = [];
  statusDist: Array<{ label: string; count: number; pct: number; color: string; icon: string }> = [];
  chartMode: 'revenue' | 'orders' = 'revenue';

  avgBasket = 0;
  conversionRate = 0;
  bestMonth = '—';
  uniqueClients = 0;

  get maxVal(): number {
    return Math.max(1, ...this.sales.map(m => this.chartMode === 'revenue' ? m.revenue : m.orders));
  }

  barHeight(m: MonthData): number {
    const val = this.chartMode === 'revenue' ? m.revenue : m.orders;
    return (val / this.maxVal) * 100;
  }

  get kpis() {
    const trendOf = (key: string): number | undefined => {
      if (this.sales.length < 2) return undefined;
      const last = this.sales[this.sales.length - 1] as any;
      const prev = this.sales[this.sales.length - 2] as any;
      if (!prev?.[key]) return undefined;
      return Math.round(((last[key] - prev[key]) / prev[key]) * 100);
    };
    return [
      { key: 'orders',    label: 'Commandes',       value: this.overview.totalOrders     ?? 0,                                  color: 'primary', icon: 'ri-shopping-bag-3-line',      trend: trendOf('orders')  },
      { key: 'delivered', label: 'Livrées',         value: this.overview.deliveredOrders ?? 0,                                  color: 'success', icon: 'ri-check-double-line',         trend: undefined  },
      { key: 'revenue',   label: 'Revenus (TND)',   value: (+(this.overview.totalRevenue ?? 0)).toLocaleString('fr-FR'),        color: 'info',    icon: 'ri-money-dollar-circle-line',  trend: trendOf('revenue') },
      { key: 'paid',      label: 'Encaissé (TND)',  value: (+(this.overview.paidRevenue  ?? 0)).toLocaleString('fr-FR'),        color: 'warning', icon: 'ri-bank-card-line',            trend: undefined  },
    ];
  }

  constructor(private api: TijaraApiService) {}

  ngOnInit(): void {
    forkJoin({
      overview: this.api.getReportOverview().pipe(catchError(() => of({}))),
      sales:    this.api.getSalesByMonth().pipe(catchError(() => of([] as any[]))),
      top:      this.api.getTopProducts(5).pipe(catchError(() => of([] as any[]))),
      orders:   this.api.getOrders().pipe(catchError(() => of([] as any[]))),
    }).subscribe(({ overview, sales, top, orders }) => {
      this.overview = this.norm(overview);
      this.sales = (sales || []).map((x: any) => {
        const n = this.norm(x);
        return { month: String(n.month || ''), revenue: +(n.revenue || 0), orders: +(n.orders || 0) };
      });
      this.topProducts = (top || []).map((x: any) => {
        const n = this.norm(x);
        return { id: +n.id || 0, title: n.title || 'Produit', price: +(n.price || 0), sold: +(n.sold || 0), image: n.image || null };
      });

      // Compute insights from orders
      const os = orders || [];
      const totalOrders = os.length || (this.overview.totalOrders ?? 0);
      const delivered = os.filter((o: any) => o.status === 'delivered').length || (this.overview.deliveredOrders ?? 0);
      this.conversionRate = totalOrders > 0 ? Math.round((delivered / totalOrders) * 100) : 0;
      const totalRev = os.reduce((s: number, o: any) => s + (+o.total_amount || 0), 0) || (+(this.overview.totalRevenue ?? 0));
      this.avgBasket = totalOrders > 0 ? +(totalRev / totalOrders).toFixed(2) : 0;
      const best = [...this.sales].sort((a, b) => b.revenue - a.revenue)[0];
      this.bestMonth = best ? `${this.monthLabel(best.month)} (${best.revenue.toFixed(0)} TND)` : '—';
      this.uniqueClients = new Set(os.map((o: any) => o.client_email || o.user_id)).size;

      // Status distribution
      const statuses = [
        { key: 'delivered', label: 'Livrées',    color: 'success', icon: 'ri-check-double-line' },
        { key: 'shipped',   label: 'Expédiées',  color: 'info',    icon: 'ri-send-plane-line' },
        { key: 'confirmed', label: 'Confirmées', color: 'primary', icon: 'ri-checkbox-circle-line' },
        { key: 'pending',   label: 'En attente', color: 'warning', icon: 'ri-time-line' },
        { key: 'cancelled', label: 'Annulées',   color: 'danger',  icon: 'ri-close-circle-line' },
      ];
      this.statusDist = statuses.map(s => {
        const count = os.filter((o: any) => o.status === s.key).length;
        const pct = totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0;
        return { label: s.label, count, pct, color: s.color, icon: s.icon };
      }).filter(s => s.count > 0);
    });
  }

  monthLabel(m: string): string {
    if (!m || m.length < 6) return m;
    const months = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
    const mIdx = parseInt(m.slice(-2), 10) - 1;
    const year = m.slice(0, 4);
    return `${months[mIdx] || m} ${year}`;
  }

  private norm(o: any): any {
    if (!o) return {};
    const out: any = {};
    for (const k of Object.keys(o)) out[k.charAt(0).toLowerCase() + k.slice(1)] = o[k];
    return out;
  }
}
