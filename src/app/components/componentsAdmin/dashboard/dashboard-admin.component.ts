import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

interface Kpi {
  label: string; value: number; raw: number; icon: string;
  color: string; link: string; isMoney?: boolean;
}

@Component({
  selector: 'app-dashboard-admin',
  standalone: false,
  template: `
<app-breadcrumbs title="Tableau de bord" [breadcrumbItems]="breadCrumbItems"></app-breadcrumbs>

<!-- ═════ Banner ═════ -->
<div class="card border-0 shadow-sm mb-4 overflow-hidden"
     style="background:linear-gradient(135deg,#405189 0%,#0ab39c 100%)">
  <div class="card-body text-white py-4">
    <div class="d-flex flex-wrap align-items-center gap-3">
      <div class="avatar-lg rounded-3 d-flex align-items-center justify-content-center"
           style="background:rgba(255,255,255,.18)">
        <i class="ri-shield-user-line fs-1"></i>
      </div>
      <div class="flex-grow-1">
        <h3 class="text-white mb-1">Bienvenue, Administrateur</h3>
        <p class="text-white-50 mb-0">{{ today }} — pilotez la marketplace en temps réel.</p>
      </div>
      <div class="text-end">
        <div class="fs-12 text-white-50">Année</div>
        <div class="fs-22 fw-bold">{{ currentYear }}</div>
      </div>
    </div>
  </div>
</div>

<!-- ═════ KPIs principaux ═════ -->
<div class="row g-3 mb-4">
  @for (k of kpis; track k.label) {
    <div class="col-6 col-md-4 col-xl-3">
      <a [routerLink]="k.link" class="text-decoration-none">
        <div class="card border-0 shadow-sm h-100 kpi-card"
             [style.borderLeft]="'4px solid ' + k.color">
          <div class="card-body d-flex align-items-center gap-3 py-3">
            <div class="avatar-md rounded-3 d-flex align-items-center justify-content-center"
                 [style.background]="k.color + '22'">
              <i class="fs-22" [class]="k.icon" [style.color]="k.color"></i>
            </div>
            <div class="flex-grow-1">
              <h3 class="mb-0 fw-bold" [style.color]="k.color">
                {{ k.value | number:'1.0-0' }}
                @if (k.isMoney) { <span class="fs-13 text-muted ms-1">TND</span> }
              </h3>
              <p class="mb-0 fs-12 text-muted">{{ k.label }}</p>
            </div>
          </div>
        </div>
      </a>
    </div>
  }
</div>

<!-- ═════ Pending badges + actions ═════ -->
<div class="row g-3 mb-4">
  @for (b of pendingBadges; track b.label) {
    <div class="col-md-4">
      <a [routerLink]="b.link" class="text-decoration-none">
        <div class="card border-0 shadow-sm h-100" [class]="'border-' + b.color + ' border-opacity-25'">
          <div class="card-body d-flex align-items-center gap-3">
            <div class="avatar-md rounded-circle d-flex align-items-center justify-content-center"
                 [class]="'bg-' + b.color + '-subtle'">
              <i class="fs-22" [class]="b.icon + ' text-' + b.color"></i>
            </div>
            <div class="flex-grow-1">
              <h4 class="mb-0 fw-bold" [class]="'text-' + b.color">{{ b.value }}</h4>
              <p class="mb-0 fs-12 text-muted">{{ b.label }} en attente de validation</p>
            </div>
            <i class="ri-arrow-right-line fs-22 text-muted"></i>
          </div>
        </div>
      </a>
    </div>
  }
</div>

<!-- ═════ Charts row ═════ -->
<div class="row g-3 mb-4">
  <!-- Bar chart commandes -->
  <div class="col-xl-8">
    <div class="card border-0 shadow-sm h-100">
      <div class="card-header bg-transparent d-flex align-items-center py-3">
        <h6 class="mb-0 fw-semibold flex-grow-1">
          <i class="ri-bar-chart-2-line me-2 text-primary"></i>
          Commandes par mois — {{ currentYear }}
        </h6>
        <span class="badge bg-primary-subtle text-primary">Total : {{ ordersTotal }}</span>
      </div>
      <div class="card-body">
        <div class="d-flex align-items-end justify-content-between gap-2" style="height:240px">
          @for (m of monthlyData; track $index) {
            <div class="d-flex flex-column align-items-center flex-grow-1" style="min-width:0">
              <div class="text-center fs-11 fw-semibold text-muted mb-1">{{ m.value }}</div>
              <div class="w-100 rounded-top"
                   [style.height.%]="m.value > 0 ? Math.max(5, (m.value / maxMonth) * 100) : 2"
                   [style.background]="m.value > 0 ? 'linear-gradient(180deg,#405189,#0ab39c)' : '#eee'"
                   [style.minHeight.px]="2"></div>
              <div class="fs-11 text-muted mt-1">{{ m.label }}</div>
            </div>
          }
        </div>
      </div>
    </div>
  </div>

  <!-- Donut statuts -->
  <div class="col-xl-4">
    <div class="card border-0 shadow-sm h-100">
      <div class="card-header bg-transparent py-3">
        <h6 class="mb-0 fw-semibold">
          <i class="ri-pie-chart-line me-2 text-info"></i>Répartition des commandes
        </h6>
      </div>
      <div class="card-body">
        @if (statusList.length === 0) {
          <p class="text-center text-muted fs-13 py-4">Aucune donnée.</p>
        } @else {
          <div class="d-flex flex-column gap-2">
            @for (s of statusList; track s.key) {
              <div>
                <div class="d-flex justify-content-between fs-12 mb-1">
                  <span><i class="ri-circle-fill me-1" [style.color]="s.color"></i> {{ s.label }}</span>
                  <span class="fw-semibold">{{ s.value }} ({{ s.pct }}%)</span>
                </div>
                <div class="progress" style="height:8px">
                  <div class="progress-bar" [style.width.%]="s.pct" [style.background]="s.color"></div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  </div>
</div>

<!-- ═════ Pending vendors + Recent orders ═════ -->
<div class="row g-3 mb-4">
  <div class="col-xl-5">
    <div class="card border-0 shadow-sm h-100">
      <div class="card-header bg-transparent d-flex align-items-center py-3">
        <h6 class="mb-0 fw-semibold flex-grow-1">
          <i class="ri-user-add-line me-2 text-warning"></i>Vendeurs à approuver
        </h6>
        <a routerLink="/admin/vendors" class="btn btn-sm btn-light">Voir tout</a>
      </div>
      <div class="card-body p-0">
        @if (pendingVendors.length === 0) {
          <p class="text-center text-muted fs-13 py-4 mb-0">Aucun vendeur en attente.</p>
        } @else {
          <div class="list-group list-group-flush">
            @for (v of pendingVendors; track v.id) {
              <div class="list-group-item d-flex align-items-center gap-3 py-3">
                <div class="avatar-sm rounded-circle bg-primary-subtle text-primary
                            d-flex align-items-center justify-content-center fw-bold fs-13">
                  {{ getInitials(v.name) }}
                </div>
                <div class="flex-grow-1 min-w-0">
                  <div class="fs-13 fw-semibold text-truncate">{{ v.name }}</div>
                  <div class="fs-11 text-muted text-truncate">{{ v.email }}</div>
                </div>
                <span class="badge bg-warning-subtle text-warning fs-10">{{ v.date }}</span>
                <a [routerLink]="['/admin/vendor-detail', v.id]"
                   class="btn btn-sm btn-outline-primary rounded-pill">
                  <i class="ri-eye-line"></i>
                </a>
              </div>
            }
          </div>
        }
      </div>
    </div>
  </div>

  <div class="col-xl-7">
    <div class="card border-0 shadow-sm h-100">
      <div class="card-header bg-transparent d-flex align-items-center py-3">
        <h6 class="mb-0 fw-semibold flex-grow-1">
          <i class="ri-shopping-bag-3-line me-2 text-primary"></i>Commandes récentes
        </h6>
        <a routerLink="/admin/orders" class="btn btn-sm btn-light">Voir tout</a>
      </div>
      <div class="card-body p-0">
        @if (recentOrders.length === 0) {
          <p class="text-center text-muted fs-13 py-4 mb-0">Aucune commande.</p>
        } @else {
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th class="ps-3">N°</th>
                  <th>Client</th>
                  <th>Vendeur</th>
                  <th>Total</th>
                  <th class="text-center">Statut</th>
                  <th class="pe-3">Date</th>
                </tr>
              </thead>
              <tbody>
                @for (o of recentOrders; track o.id) {
                  <tr>
                    <td class="ps-3 fw-semibold text-primary fs-13">#{{ o.id }}</td>
                    <td class="fs-13">{{ o.client }}</td>
                    <td class="fs-12 text-muted">{{ o.vendor }}</td>
                    <td class="fs-13 fw-semibold">{{ o.total | number:'1.0-2' }} TND</td>
                    <td class="text-center">
                      <span class="badge" [class]="getStatusClass(o.api_status)">{{ getStatusLabel(o.api_status) }}</span>
                    </td>
                    <td class="pe-3 fs-12 text-muted">{{ o.date }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  </div>
</div>

<!-- ═════ Top vendeurs ═════ -->
@if (topVendors.length > 0) {
  <div class="card border-0 shadow-sm">
    <div class="card-header bg-transparent py-3">
      <h6 class="mb-0 fw-semibold">
        <i class="ri-trophy-line me-2 text-warning"></i>Top vendeurs (chiffre d'affaires)
      </h6>
    </div>
    <div class="card-body">
      <div class="row g-3">
        @for (v of topVendors; track v.id; let idx = $index) {
          <div class="col-md-6 col-xl-4">
            <div class="d-flex align-items-center gap-3 p-3 rounded bg-light">
              <div class="position-relative">
                <div class="avatar-md rounded-circle bg-primary-subtle text-primary
                            d-flex align-items-center justify-content-center fw-bold">
                  {{ getInitials(v.name) }}
                </div>
                <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning fs-10">
                  #{{ idx + 1 }}
                </span>
              </div>
              <div class="flex-grow-1 min-w-0">
                <div class="fw-semibold fs-13 text-truncate">{{ v.name || '—' }}</div>
                <div class="fs-11 text-muted">{{ v.invoices }} facture(s)</div>
              </div>
              <div class="text-end">
                <div class="fw-bold text-success">{{ v.revenue | number:'1.0-0' }}</div>
                <div class="fs-10 text-muted">TND</div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  </div>
}
`,
  styles: [`.kpi-card { transition: transform .15s, box-shadow .15s; }
            .kpi-card:hover { transform: translateY(-2px); box-shadow: 0 .5rem 1.25rem rgba(0,0,0,.1) !important; }`]
})
export class DashboardAdminComponent implements OnInit {
  Math = Math;

  breadCrumbItems = [{ label: 'Admin' }, { label: 'Dashboard', active: true }];
  today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  currentYear = new Date().getFullYear();

  kpis: Kpi[] = [
    { label: 'Utilisateurs',     value: 0, raw: 0, icon: 'ri-user-3-line',              color: '#405189', link: '/admin/users' },
    { label: 'Vendeurs actifs',  value: 0, raw: 0, icon: 'ri-store-2-line',             color: '#0ab39c', link: '/admin/vendors' },
    { label: 'Produits actifs',  value: 0, raw: 0, icon: 'ri-box-3-line',               color: '#f7b84b', link: '/admin/products' },
    { label: 'Commandes',        value: 0, raw: 0, icon: 'ri-shopping-bag-3-line',      color: '#299cdb', link: '/admin/orders' },
    { label: 'Livraisons',       value: 0, raw: 0, icon: 'ri-truck-line',               color: '#564ab1', link: '/admin/deliveries' },
    { label: 'Factures',         value: 0, raw: 0, icon: 'ri-file-text-line',           color: '#3577f1', link: '/admin/invoices' },
    { label: "Chiffre d'affaires",value:0, raw: 0, icon: 'ri-money-dollar-circle-line', color: '#0ab39c', link: '/admin/invoices', isMoney: true },
    { label: 'Réclamations',     value: 0, raw: 0, icon: 'ri-customer-service-2-line',  color: '#f06548', link: '/admin/reclamations' },
  ];

  pendingBadges = [
    { label: 'Vendeurs',  value: 0, icon: 'ri-store-2-line',   color: 'warning', link: '/admin/vendors' },
    { label: 'Produits',  value: 0, icon: 'ri-box-3-line',     color: 'primary', link: '/admin/products' },
    { label: 'Annonces',  value: 0, icon: 'ri-megaphone-line', color: 'info',    link: '/admin/annonces' },
  ];

  monthlyData: { label: string; value: number }[] = [];
  maxMonth = 1;
  ordersTotal = 0;

  statusList: { key: string; label: string; color: string; value: number; pct: number }[] = [];
  recentOrders: any[]   = [];
  pendingVendors: any[] = [];
  topVendors: any[]     = [];

  constructor(private api: TijaraApiService, private router: Router) {}

  ngOnInit(): void {
    forkJoin({
      stats:    this.api.getAdminStats().pipe(catchError(() => of({} as any))),
      pending:  this.api.getPendingVendors().pipe(catchError(() => of([] as any[]))),
      orders:   this.api.getAdminOrders().pipe(catchError(() => of([] as any[]))),
    }).subscribe(({ stats, pending, orders }) => {
      this.applyStats(stats);
      this.applyPending(pending);
      this.applyOrders(orders);
    });
  }

  private applyStats(s: any): void {
    const v = (k: string) => +(s?.[k] ?? 0);

    this.kpis[0].value = v('users');
    this.kpis[1].value = v('vendors');
    this.kpis[2].value = v('products');
    this.kpis[3].value = v('orders');
    this.kpis[4].value = v('deliveries');
    this.kpis[5].value = v('invoices');
    this.kpis[6].value = +(s?.revenue ?? 0);
    this.kpis[7].value = v('open_reclamations');

    this.pendingBadges[0].value = v('pending_vendors');
    this.pendingBadges[1].value = v('pending_products');
    this.pendingBadges[2].value = v('pending_annonces');

    // Monthly
    const labels = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
    const arr: number[] = Array.isArray(s?.orders_by_month) ? s.orders_by_month : Array(12).fill(0);
    this.monthlyData = labels.map((l, i) => ({ label: l, value: +(arr[i] || 0) }));
    this.maxMonth = Math.max(1, ...this.monthlyData.map(m => m.value));
    this.ordersTotal = this.monthlyData.reduce((a, m) => a + m.value, 0);

    // Status
    const sb = s?.orders_by_status || {};
    const total = Object.values(sb).reduce((a: number, n: any) => a + (+n || 0), 0) as number;
    const def = [
      { key: 'pending',   label: 'En attente', color: '#f7b84b' },
      { key: 'confirmed', label: 'Confirmée',  color: '#299cdb' },
      { key: 'shipped',   label: 'Expédiée',   color: '#405189' },
      { key: 'delivered', label: 'Livrée',     color: '#0ab39c' },
      { key: 'cancelled', label: 'Annulée',    color: '#f06548' },
    ];
    this.statusList = def
      .map(d => ({ ...d, value: +(sb[d.key] || 0), pct: total > 0 ? Math.round(((+sb[d.key] || 0) / total) * 100) : 0 }))
      .filter(d => d.value > 0);

    // Top vendors
    this.topVendors = (s?.top_vendors || []).map((v: any) => ({
      id: v.id, name: v.name || '—',
      invoices: +(v.invoices || 0),
      revenue:  +(v.revenue  || 0),
    }));
  }

  private applyPending(data: any[]): void {
    this.pendingVendors = (data || []).slice(0, 6).map(v => ({
      id:    v.id,
      name:  v.shop_name || `${v.first_name || ''} ${v.last_name || ''}`.trim() || v.email,
      email: v.email,
      date:  v.created_at ? new Date(v.created_at).toLocaleDateString('fr-FR') : '—',
    }));
  }

  private applyOrders(data: any[]): void {
    this.recentOrders = (data || []).slice(0, 7).map(o => ({
      id:        o.id,
      client:    o.client_name || o.client || '—',
      vendor:    o.vendor || o.vendor_name || '—',
      total:     +(o.total || o.total_amount || 0),
      api_status: o.api_status || o.status,
      date:      o.date || (o.created_at ? new Date(o.created_at).toLocaleDateString('fr-FR') : '—'),
    }));
  }

  getStatusClass(status: string): string {
    const m: Record<string,string> = {
      pending:'bg-warning-subtle text-warning', confirmed:'bg-info-subtle text-info',
      shipped:'bg-primary-subtle text-primary', delivered:'bg-success-subtle text-success',
      cancelled:'bg-danger-subtle text-danger',
    };
    return m[status] || 'bg-secondary-subtle text-secondary';
  }
  getStatusLabel(status: string): string {
    const m: Record<string,string> = {
      pending:'En attente', confirmed:'Confirmée', shipped:'Expédiée',
      delivered:'Livrée',  cancelled:'Annulée',
    };
    return m[status] || status;
  }
  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').filter(Boolean).map(w => w[0]).join('').substring(0, 2).toUpperCase();
  }
  navigate(link: string): void { this.router.navigate([link]); }
}
