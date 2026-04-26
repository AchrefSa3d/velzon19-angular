import { Component, OnInit } from '@angular/core';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

@Component({
  selector: 'app-reports-admin',
  standalone: false,
  template: `
<app-breadcrumbs title="Rapports & Analytics" [breadcrumbItems]="breadcrumbItems"></app-breadcrumbs>

<!-- KPI cards -->
<div class="row g-3 mb-4">
  @for (k of kpis; track k.key) {
    <div class="col-md-6 col-xl-3">
      <div class="card border-0 shadow-sm h-100" [style.border-left]="'4px solid var(--vz-' + k.color + ')'">
        <div class="card-body d-flex align-items-center gap-3">
          <div class="avatar-md rounded-3 d-flex align-items-center justify-content-center"
               [class]="'bg-' + k.color + '-subtle'">
            <i class="fs-22" [class]="k.icon + ' text-' + k.color"></i>
          </div>
          <div>
            <h3 class="mb-0 fw-bold" [class]="'text-' + k.color">{{ k.value }}</h3>
            <p class="mb-0 text-muted fs-13">{{ k.label }}</p>
          </div>
        </div>
      </div>
    </div>
  }
</div>

<div class="row g-4">
  <!-- Sales by month -->
  <div class="col-xl-7">
    <div class="card border-0 shadow-sm h-100">
      <div class="card-header bg-transparent">
        <h6 class="mb-0 fw-semibold"><i class="ri-line-chart-line me-2 text-primary"></i>Ventes des 12 derniers mois</h6>
      </div>
      <div class="card-body">
        @if (salesByMonth.length === 0) {
          <p class="text-muted text-center py-4">Aucune donnée de ventes.</p>
        } @else {
          <div class="d-flex align-items-end gap-2" style="height:280px">
            @for (m of salesByMonth; track m.month) {
              <div class="flex-grow-1 d-flex flex-column align-items-center" [title]="m.revenue + ' TND'">
                <div class="w-100 rounded-top"
                     [style.height.%]="(m.revenue / maxRevenue) * 100"
                     [style.background]="'linear-gradient(180deg, #405189, #0ab39c)'"
                     style="min-height:6px"></div>
                <div class="fs-10 text-muted mt-1 text-center">{{ m.month.slice(-2) }}/{{ m.month.slice(2, 4) }}</div>
                <div class="fs-11 fw-semibold text-primary">{{ m.revenue | number:'1.0-0' }}</div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  </div>

  <!-- Top products -->
  <div class="col-xl-5">
    <div class="card border-0 shadow-sm h-100">
      <div class="card-header bg-transparent">
        <h6 class="mb-0 fw-semibold"><i class="ri-star-line me-2 text-warning"></i>Top 10 produits</h6>
      </div>
      <div class="card-body p-0">
        @if (topProducts.length === 0) {
          <p class="text-muted text-center py-4">Aucune vente.</p>
        } @else {
          <ul class="list-group list-group-flush">
            @for (p of topProducts; track p.id; let i = $index) {
              <li class="list-group-item d-flex align-items-center gap-3">
                <div class="avatar-xs bg-primary-subtle rounded d-flex align-items-center justify-content-center fw-bold text-primary">
                  {{ i + 1 }}
                </div>
                @if (p.image) { <img [src]="p.image" width="32" height="32" class="rounded" style="object-fit:cover"> }
                <div class="flex-grow-1">
                  <div class="fw-semibold fs-13">{{ p.title }}</div>
                  <div class="fs-11 text-muted">{{ p.price }} TND</div>
                </div>
                <span class="badge bg-success-subtle text-success">{{ p.sold }} ventes</span>
              </li>
            }
          </ul>
        }
      </div>
    </div>
  </div>

  <!-- Top customers -->
  <div class="col-12">
    <div class="card border-0 shadow-sm">
      <div class="card-header bg-transparent">
        <h6 class="mb-0 fw-semibold"><i class="ri-user-star-line me-2 text-success"></i>Meilleurs clients</h6>
      </div>
      <div class="card-body p-0">
        @if (topCustomers.length === 0) {
          <p class="text-muted text-center py-4">Aucun client.</p>
        } @else {
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr><th class="ps-3">#</th><th>Client</th><th>Email</th><th class="text-center">Commandes</th><th class="text-end pe-3">Dépensé</th></tr>
            </thead>
            <tbody>
              @for (c of topCustomers; track c.idUser; let i = $index) {
                <tr>
                  <td class="ps-3 fw-bold text-primary">#{{ i + 1 }}</td>
                  <td>{{ c.name }}</td>
                  <td class="fs-12 text-muted">{{ c.email }}</td>
                  <td class="text-center"><span class="badge bg-primary-subtle text-primary">{{ c.orders }}</span></td>
                  <td class="text-end pe-3 fw-bold text-success">{{ c.totalSpent | number:'1.2-2' }} TND</td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>
  </div>
</div>
`,
})
export class ReportsAdminComponent implements OnInit {
  breadcrumbItems = [{ label: 'Admin', active: false }, { label: 'Rapports', active: true }];

  overview: any = {};
  salesByMonth: any[] = [];
  topProducts: any[] = [];
  topCustomers: any[] = [];

  get maxRevenue(): number { return Math.max(1, ...this.salesByMonth.map(m => +m.revenue || 0)); }

  get kpis() {
    return [
      { key: 'orders',   label: 'Commandes',    value: this.overview.totalOrders     ?? 0,                            color: 'primary', icon: 'ri-shopping-bag-3-line' },
      { key: 'revenue',  label: 'Revenus (TND)',value: (this.overview.totalRevenue   ?? 0).toLocaleString(),           color: 'success', icon: 'ri-money-dollar-circle-line' },
      { key: 'products', label: 'Produits',     value: this.overview.totalProducts   ?? 0,                            color: 'info',    icon: 'ri-box-3-line' },
      { key: 'users',    label: 'Utilisateurs', value: this.overview.activeUsers     ?? 0,                            color: 'warning', icon: 'ri-group-line' },
    ];
  }

  constructor(private api: TijaraApiService) {}

  ngOnInit(): void {
    this.api.getReportOverview().subscribe({ next: (r: any) => this.overview = this.normalize(r) });
    this.api.getSalesByMonth().subscribe({ next: (r: any[]) => this.salesByMonth = (r || []).map((x: any) => this.normalize(x)) });
    this.api.getTopProducts(10).subscribe({ next: (r: any[]) => this.topProducts = (r || []).map((x: any) => this.normalize(x)) });
    this.api.getTopCustomers(10).subscribe({ next: (r: any[]) => this.topCustomers = (r || []).map((x: any) => this.normalize(x)) });
  }

  private normalize(o: any): any {
    if (!o) return {};
    const out: any = { ...o };
    for (const k of Object.keys(o)) {
      // PascalCase → camelCase
      const camelP = k.charAt(0).toLowerCase() + k.slice(1);
      if (!(camelP in out)) out[camelP] = o[k];
      // snake_case → camelCase
      if (k.includes('_')) {
        const camelS = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
        if (!(camelS in out)) out[camelS] = o[k];
      }
    }
    return out;
  }
}
