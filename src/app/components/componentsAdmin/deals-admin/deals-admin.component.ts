import { Component, OnInit } from '@angular/core';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

interface DealRow {
  id: number;
  title: string;
  description: string;
  price: string;
  discount: number;
  image: string;
  category: string;
  vendorName: string;
  shopName: string;
  isActive: boolean;
  date: string | null;
  quantity: number;
}

@Component({
  selector: 'app-deals-admin',
  standalone: false,
  template: `
<app-breadcrumbs title="Deals & Promotions" [breadcrumbItems]="breadCrumbItems"></app-breadcrumbs>

<div class="row g-3 mb-4">
  <div class="col-6 col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid #f06548">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-danger-subtle d-flex align-items-center justify-content-center">
          <i class="ri-flashlight-line fs-22 text-danger"></i>
        </div>
        <div><h3 class="mb-0 fw-bold text-danger">{{ items.length }}</h3>
        <p class="mb-0 fs-12 text-muted">Total deals</p></div>
      </div>
    </div>
  </div>
  <div class="col-6 col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid #0ab39c">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-success-subtle d-flex align-items-center justify-content-center">
          <i class="ri-checkbox-circle-line fs-22 text-success"></i>
        </div>
        <div><h3 class="mb-0 fw-bold text-success">{{ activeCount }}</h3>
        <p class="mb-0 fs-12 text-muted">Actifs</p></div>
      </div>
    </div>
  </div>
  <div class="col-6 col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid #f7b84b">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-warning-subtle d-flex align-items-center justify-content-center">
          <i class="ri-time-line fs-22 text-warning"></i>
        </div>
        <div><h3 class="mb-0 fw-bold text-warning">{{ items.length - activeCount }}</h3>
        <p class="mb-0 fs-12 text-muted">En attente</p></div>
      </div>
    </div>
  </div>
  <div class="col-6 col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid #299cdb">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-info-subtle d-flex align-items-center justify-content-center">
          <i class="ri-percent-line fs-22 text-info"></i>
        </div>
        <div><h3 class="mb-0 fw-bold text-info">{{ avgDiscount | number:'1.0-0' }}%</h3>
        <p class="mb-0 fs-12 text-muted">Réduction moyenne</p></div>
      </div>
    </div>
  </div>
</div>

<div class="card border-0 shadow-sm">
  <div class="card-header bg-transparent d-flex flex-wrap align-items-center gap-2 py-3">
    <h6 class="mb-0 fw-semibold flex-grow-1">
      <i class="ri-flashlight-line me-2 text-danger"></i>Tous les deals
      <span class="badge bg-danger-subtle text-danger ms-2">{{ filtered.length }}</span>
    </h6>
    <div class="input-group input-group-sm" style="max-width:240px">
      <span class="input-group-text bg-white border-end-0"><i class="ri-search-line"></i></span>
      <input type="text" class="form-control border-start-0" placeholder="Titre, vendeur, catégorie…"
             [(ngModel)]="search" (input)="applyFilter()" />
    </div>
    <div class="btn-group btn-group-sm">
      <button class="btn" [class.btn-danger]="filter===''"        [class.btn-light]="filter!==''"        (click)="setFilter('')">Tous</button>
      <button class="btn" [class.btn-danger]="filter==='active'"  [class.btn-light]="filter!=='active'"  (click)="setFilter('active')">Actifs</button>
      <button class="btn" [class.btn-danger]="filter==='pending'" [class.btn-light]="filter!=='pending'" (click)="setFilter('pending')">En attente</button>
    </div>
  </div>

  <div class="card-body p-0">
    @if (loading) {
      <div class="text-center py-5"><div class="spinner-border text-danger"></div></div>
    } @else if (filtered.length === 0) {
      <div class="text-center py-5">
        <i class="ri-flashlight-line display-3 text-muted opacity-50"></i>
        <p class="text-muted mt-2 mb-0">Aucun deal ne correspond.</p>
      </div>
    } @else {
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-3" style="width:80px">Image</th>
              <th>Deal</th>
              <th>Vendeur</th>
              <th>Catégorie</th>
              <th class="text-end">Prix</th>
              <th class="text-center">Réduction</th>
              <th class="text-center">Stock</th>
              <th class="text-center">Statut</th>
              <th class="text-end pe-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (d of filtered; track d.id) {
              <tr>
                <td class="ps-3">
                  @if (d.image) {
                    <img [src]="d.image" alt="" class="rounded" width="48" height="48"
                         style="object-fit:cover" (error)="d.image=''" />
                  } @else {
                    <div class="rounded bg-danger-subtle text-danger
                                d-flex align-items-center justify-content-center"
                         style="width:48px;height:48px">
                      <i class="ri-flashlight-line fs-20"></i>
                    </div>
                  }
                </td>
                <td>
                  <div class="fs-13 fw-semibold text-truncate" style="max-width:240px">{{ d.title }}</div>
                  <div class="fs-11 text-muted">ID #{{ d.id }} · {{ formatDate(d.date) }}</div>
                </td>
                <td class="fs-12">
                  <div class="fw-semibold">{{ d.vendorName || '—' }}</div>
                  @if (d.shopName) { <div class="text-muted">{{ d.shopName }}</div> }
                </td>
                <td class="fs-12 text-muted">{{ d.category || '—' }}</td>
                <td class="text-end fw-semibold fs-13">{{ d.price }} TND</td>
                <td class="text-center">
                  @if (d.discount > 0) {
                    <span class="badge bg-danger">-{{ d.discount }}%</span>
                  } @else {
                    <span class="text-muted">—</span>
                  }
                </td>
                <td class="text-center fs-12">
                  @if (d.quantity > 0) {
                    <span class="badge bg-success-subtle text-success">{{ d.quantity }}</span>
                  } @else {
                    <span class="badge bg-secondary-subtle text-secondary">∞</span>
                  }
                </td>
                <td class="text-center">
                  @if (d.isActive) {
                    <span class="badge bg-success-subtle text-success">Actif</span>
                  } @else {
                    <span class="badge bg-warning-subtle text-warning">En attente</span>
                  }
                </td>
                <td class="text-end pe-3">
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-light" (click)="toggleActive(d)" [title]="d.isActive ? 'Désactiver' : 'Activer'">
                      <i [class]="d.isActive ? 'ri-pause-circle-line text-warning' : 'ri-play-circle-line text-success'"></i>
                    </button>
                    <button class="btn btn-light" (click)="remove(d)" title="Supprimer">
                      <i class="ri-delete-bin-line text-danger"></i>
                    </button>
                  </div>
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
export class DealsAdminComponent implements OnInit {
  breadCrumbItems = [{ label: 'Admin' }, { label: 'Deals', active: true }];

  items: DealRow[]    = [];
  filtered: DealRow[] = [];
  search = '';
  filter = '';
  loading = true;

  get activeCount(): number { return this.items.filter(d => d.isActive).length; }
  get avgDiscount(): number {
    const arr = this.items.filter(d => d.discount > 0);
    return arr.length ? arr.reduce((s, d) => s + d.discount, 0) / arr.length : 0;
  }

  constructor(private api: TijaraApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.getAdminDeals().subscribe({
      next: (data: any[]) => {
        this.items = (data || []).map((d: any) => ({
          id:          +d.id,
          title:        d.title       ?? '—',
          description:  d.description ?? '',
          price:        String(d.price ?? '0'),
          discount:    +(d.discount   ?? 0),
          image:        d.image       ?? '',
          category:     d.category    ?? '',
          vendorName:   d.vendor_name ?? '',
          shopName:     d.shop_name   ?? '',
          isActive:    !!d.is_active,
          date:         d.date        ?? null,
          quantity:    +(d.quantity   ?? 0),
        }));
        this.applyFilter();
        this.loading = false;
      },
      error: () => { this.loading = false; alert('Chargement impossible.'); }
    });
  }

  applyFilter(): void {
    const s = this.search.trim().toLowerCase();
    this.filtered = this.items.filter(d => {
      if (s && !`${d.title} ${d.vendorName} ${d.shopName} ${d.category}`.toLowerCase().includes(s)) return false;
      if (this.filter === 'active'  && !d.isActive) return false;
      if (this.filter === 'pending' &&  d.isActive) return false;
      return true;
    });
  }
  setFilter(f: string): void { this.filter = f; this.applyFilter(); }

  toggleActive(d: DealRow): void {
    this.api.adminPatch(`deals/${d.id}/toggle`).subscribe({
      next: () => { d.isActive = !d.isActive; this.applyFilter(); },
      error: () => alert('Action impossible.'),
    });
  }
  remove(d: DealRow): void {
    if (!confirm(`Supprimer le deal "${d.title}" ?`)) return;
    this.api.adminDelete('deals', d.id).subscribe({
      next: () => { this.items = this.items.filter(x => x.id !== d.id); this.applyFilter(); },
      error: () => alert('Suppression impossible.'),
    });
  }

  formatDate(d: string | null): string {
    if (!d) return '—';
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? '—' : dt.toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' });
  }
}
