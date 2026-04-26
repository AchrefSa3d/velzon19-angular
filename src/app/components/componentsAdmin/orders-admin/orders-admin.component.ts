import { Component, OnInit } from '@angular/core';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

interface OrderRow {
  id: number;
  client: string;
  email: string;
  vendor: string;
  product: string;
  total: number;
  date: string;
  apiStatus: string;
}

@Component({
  selector: 'app-orders-admin',
  standalone: false,
  template: `
<app-breadcrumbs title="Commandes" [breadcrumbItems]="breadCrumbItems"></app-breadcrumbs>

<div class="row g-3 mb-4">
  <div class="col-6 col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid #299cdb">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-info-subtle d-flex align-items-center justify-content-center">
          <i class="ri-shopping-bag-3-line fs-22 text-info"></i>
        </div>
        <div><h3 class="mb-0 fw-bold text-info">{{ orders.length }}</h3>
        <p class="mb-0 fs-12 text-muted">Total commandes</p></div>
      </div>
    </div>
  </div>
  <div class="col-6 col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid #f7b84b">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-warning-subtle d-flex align-items-center justify-content-center">
          <i class="ri-time-line fs-22 text-warning"></i>
        </div>
        <div><h3 class="mb-0 fw-bold text-warning">{{ countOf('pending') + countOf('confirmed') }}</h3>
        <p class="mb-0 fs-12 text-muted">En cours</p></div>
      </div>
    </div>
  </div>
  <div class="col-6 col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid #0ab39c">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-success-subtle d-flex align-items-center justify-content-center">
          <i class="ri-check-double-line fs-22 text-success"></i>
        </div>
        <div><h3 class="mb-0 fw-bold text-success">{{ countOf('delivered') }}</h3>
        <p class="mb-0 fs-12 text-muted">Livrées</p></div>
      </div>
    </div>
  </div>
  <div class="col-6 col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid #0ab39c">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-success-subtle d-flex align-items-center justify-content-center">
          <i class="ri-money-dollar-circle-line fs-22 text-success"></i>
        </div>
        <div><h3 class="mb-0 fw-bold text-success">{{ totalRevenue | number:'1.0-0' }}</h3>
        <p class="mb-0 fs-12 text-muted">Total (TND)</p></div>
      </div>
    </div>
  </div>
</div>

<div class="card border-0 shadow-sm">
  <div class="card-header bg-transparent d-flex flex-wrap align-items-center gap-2 py-3">
    <h6 class="mb-0 fw-semibold flex-grow-1">
      <i class="ri-shopping-bag-3-line me-2 text-info"></i>Toutes les commandes
      <span class="badge bg-info-subtle text-info ms-2">{{ filtered.length }}</span>
    </h6>
    <div class="input-group input-group-sm" style="max-width:240px">
      <span class="input-group-text bg-white border-end-0"><i class="ri-search-line"></i></span>
      <input type="text" class="form-control border-start-0" placeholder="N°, client, vendeur, produit…"
             [(ngModel)]="search" (input)="applyFilter()" />
    </div>
    <select class="form-select form-select-sm" style="max-width:160px"
            [(ngModel)]="filter" (change)="applyFilter()">
      <option value="">Tous les statuts</option>
      <option value="pending">En attente</option>
      <option value="confirmed">Confirmée</option>
      <option value="shipped">Expédiée</option>
      <option value="delivered">Livrée</option>
      <option value="cancelled">Annulée</option>
    </select>
    <button class="btn btn-sm btn-light" (click)="exportCSV()" title="Export CSV">
      <i class="ri-file-excel-2-line text-success me-1"></i>Export
    </button>
  </div>

  <div class="card-body p-0">
    @if (loading) {
      <div class="text-center py-5"><div class="spinner-border text-info"></div></div>
    } @else if (filtered.length === 0) {
      <div class="text-center py-5">
        <i class="ri-shopping-bag-line display-3 text-muted opacity-50"></i>
        <p class="text-muted mt-2 mb-0">Aucune commande ne correspond.</p>
      </div>
    } @else {
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-3">N°</th>
              <th>Client</th>
              <th>Vendeur</th>
              <th>Produit</th>
              <th class="text-end">Total</th>
              <th class="text-center">Statut</th>
              <th>Date</th>
              <th class="text-end pe-3">Action</th>
            </tr>
          </thead>
          <tbody>
            @for (o of filtered; track o.id) {
              <tr>
                <td class="ps-3 fw-semibold text-info fs-13">#{{ o.id }}</td>
                <td>
                  <div class="fs-13 fw-semibold">{{ o.client }}</div>
                  @if (o.email) { <div class="fs-11 text-muted">{{ o.email }}</div> }
                </td>
                <td class="fs-12 text-muted">{{ o.vendor }}</td>
                <td class="fs-13 text-truncate" style="max-width:220px">{{ o.product }}</td>
                <td class="text-end fw-semibold">{{ o.total | number:'1.2-3' }} TND</td>
                <td class="text-center">
                  <select class="form-select form-select-sm border-0"
                          [class]="'bg-' + statusColor(o.apiStatus) + '-subtle text-' + statusColor(o.apiStatus)"
                          [ngModel]="o.apiStatus" (ngModelChange)="changeStatus(o, $event)"
                          style="font-weight:600;min-width:130px">
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmée</option>
                    <option value="shipped">Expédiée</option>
                    <option value="delivered">Livrée</option>
                    <option value="cancelled">Annulée</option>
                  </select>
                </td>
                <td class="fs-12 text-muted">{{ o.date }}</td>
                <td class="text-end pe-3">
                  <button class="btn btn-sm btn-light" title="Détails">
                    <i class="ri-eye-line text-info"></i>
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  </div>
</div>
`,
})
export class OrdersAdminComponent implements OnInit {
  breadCrumbItems = [{ label: 'Admin' }, { label: 'Commandes', active: true }];

  orders: OrderRow[]   = [];
  filtered: OrderRow[] = [];
  search = '';
  filter = '';
  loading = true;

  get totalRevenue(): number {
    return this.orders.filter(o => o.apiStatus !== 'cancelled')
                      .reduce((s, o) => s + o.total, 0);
  }

  constructor(private api: TijaraApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.getAdminOrders().subscribe({
      next: (data: any[]) => {
        this.orders = (data || []).map((o: any) => ({
          id:        +o.id,
          client:    o.client_name || o.client || '—',
          email:     o.email || '',
          vendor:    o.vendor || o.vendor_name || '—',
          product:   o.product || o.deal_title || '—',
          total:     +(o.total || o.total_amount || 0),
          date:      o.date || (o.created_at ? new Date(o.created_at).toLocaleDateString('fr-FR') : '—'),
          apiStatus: o.api_status || o.status || 'pending',
        }));
        this.applyFilter();
        this.loading = false;
      },
      error: () => { this.loading = false; alert('Chargement impossible.'); }
    });
  }

  applyFilter(): void {
    const s = this.search.trim().toLowerCase();
    this.filtered = this.orders.filter(o => {
      if (s && !`${o.id} ${o.client} ${o.vendor} ${o.product}`.toLowerCase().includes(s)) return false;
      if (this.filter && o.apiStatus !== this.filter) return false;
      return true;
    });
  }

  countOf(s: string): number {
    return this.orders.filter(o => o.apiStatus === s).length;
  }

  changeStatus(o: OrderRow, newStatus: string): void {
    const old = o.apiStatus;
    o.apiStatus = newStatus;
    this.api.updateAdminOrderStatus(o.id, newStatus).subscribe({
      next: () => this.applyFilter(),
      error: () => { o.apiStatus = old; alert('Mise à jour impossible.'); },
    });
  }

  exportCSV(): void {
    const header = 'N°,Client,Email,Vendeur,Produit,Total,Statut,Date\n';
    const rows = this.filtered.map(o =>
      [o.id, `"${o.client}"`, o.email, `"${o.vendor}"`, `"${o.product}"`,
       o.total, o.apiStatus, o.date].join(',')
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `commandes-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  statusColor(s: string): string {
    return s === 'delivered' ? 'success' : s === 'shipped' ? 'primary'
         : s === 'confirmed' ? 'info'    : s === 'cancelled' ? 'danger' : 'warning';
  }
}
