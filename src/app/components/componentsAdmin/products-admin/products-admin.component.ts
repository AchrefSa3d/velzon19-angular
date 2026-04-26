import { Component, OnInit } from '@angular/core';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

interface ProductRow {
  id: number;
  name: string;
  price: string;
  image: string;
  category: string;
  vendorName: string;
  shopName: string;
  isActive: boolean;
}

@Component({
  selector: 'app-products-admin',
  standalone: false,
  template: `
<app-breadcrumbs title="Produits" [breadcrumbItems]="breadCrumbItems"></app-breadcrumbs>

<div class="row g-3 mb-4">
  <div class="col-6 col-md-4">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid #f7b84b">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-warning-subtle d-flex align-items-center justify-content-center">
          <i class="ri-box-3-line fs-22 text-warning"></i>
        </div>
        <div><h3 class="mb-0 fw-bold text-warning">{{ items.length }}</h3>
        <p class="mb-0 fs-12 text-muted">Total produits</p></div>
      </div>
    </div>
  </div>
  <div class="col-6 col-md-4">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid #0ab39c">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-success-subtle d-flex align-items-center justify-content-center">
          <i class="ri-checkbox-circle-line fs-22 text-success"></i>
        </div>
        <div><h3 class="mb-0 fw-bold text-success">{{ approvedCount }}</h3>
        <p class="mb-0 fs-12 text-muted">Approuvés</p></div>
      </div>
    </div>
  </div>
  <div class="col-12 col-md-4">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid #f7b84b">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-warning-subtle d-flex align-items-center justify-content-center">
          <i class="ri-time-line fs-22 text-warning"></i>
        </div>
        <div><h3 class="mb-0 fw-bold text-warning">{{ pendingCount }}</h3>
        <p class="mb-0 fs-12 text-muted">À valider</p></div>
      </div>
    </div>
  </div>
</div>

<div class="card border-0 shadow-sm">
  <div class="card-header bg-transparent d-flex flex-wrap align-items-center gap-2 py-3">
    <h6 class="mb-0 fw-semibold flex-grow-1">
      <i class="ri-box-3-line me-2 text-warning"></i>Modération des produits
      <span class="badge bg-warning-subtle text-warning ms-2">{{ filtered.length }}</span>
    </h6>
    <div class="input-group input-group-sm" style="max-width:240px">
      <span class="input-group-text bg-white border-end-0"><i class="ri-search-line"></i></span>
      <input type="text" class="form-control border-start-0" placeholder="Nom, vendeur, catégorie…"
             [(ngModel)]="search" (input)="applyFilter()" />
    </div>
    <div class="btn-group btn-group-sm">
      <button class="btn" [class.btn-warning]="filter===''"         [class.btn-light]="filter!==''"         (click)="setFilter('')">Tous</button>
      <button class="btn" [class.btn-warning]="filter==='pending'"  [class.btn-light]="filter!=='pending'"  (click)="setFilter('pending')">En attente</button>
      <button class="btn" [class.btn-warning]="filter==='approved'" [class.btn-light]="filter!=='approved'" (click)="setFilter('approved')">Approuvés</button>
    </div>
  </div>

  <div class="card-body p-0">
    @if (loading) {
      <div class="text-center py-5"><div class="spinner-border text-warning"></div></div>
    } @else if (filtered.length === 0) {
      <div class="text-center py-5">
        <i class="ri-box-3-line display-3 text-muted opacity-50"></i>
        <p class="text-muted mt-2 mb-0">Aucun produit ne correspond.</p>
      </div>
    } @else {
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-3" style="width:80px">Image</th>
              <th>Produit</th>
              <th>Vendeur</th>
              <th>Catégorie</th>
              <th class="text-end">Prix</th>
              <th class="text-center">Statut</th>
              <th class="text-end pe-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (p of filtered; track p.id) {
              <tr>
                <td class="ps-3">
                  @if (p.image) {
                    <img [src]="p.image" alt="" class="rounded" width="48" height="48"
                         style="object-fit:cover" (error)="p.image=''" />
                  } @else {
                    <div class="rounded bg-warning-subtle text-warning
                                d-flex align-items-center justify-content-center"
                         style="width:48px;height:48px">
                      <i class="ri-image-2-line fs-20"></i>
                    </div>
                  }
                </td>
                <td>
                  <div class="fs-13 fw-semibold text-truncate" style="max-width:280px">{{ p.name }}</div>
                  <div class="fs-11 text-muted">ID #{{ p.id }}</div>
                </td>
                <td class="fs-12">
                  <div class="fw-semibold">{{ p.vendorName || '—' }}</div>
                  @if (p.shopName) { <div class="text-muted">{{ p.shopName }}</div> }
                </td>
                <td class="fs-12 text-muted">{{ p.category || '—' }}</td>
                <td class="text-end fw-semibold fs-13">{{ p.price }} TND</td>
                <td class="text-center">
                  @if (p.isActive) {
                    <span class="badge bg-success-subtle text-success"><i class="ri-shield-check-line me-1"></i>Approuvé</span>
                  } @else {
                    <span class="badge bg-warning-subtle text-warning"><i class="ri-time-line me-1"></i>En attente</span>
                  }
                </td>
                <td class="text-end pe-3">
                  <div class="btn-group btn-group-sm">
                    @if (!p.isActive) {
                      <button class="btn btn-success" (click)="approve(p)" title="Approuver">
                        <i class="ri-check-line"></i> Approuver
                      </button>
                    } @else {
                      <button class="btn btn-light" (click)="reject(p)" title="Désapprouver">
                        <i class="ri-close-line text-danger"></i>
                      </button>
                    }
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
export class ProductsAdminComponent implements OnInit {
  breadCrumbItems = [{ label: 'Admin' }, { label: 'Produits', active: true }];

  items: ProductRow[]    = [];
  filtered: ProductRow[] = [];
  search = '';
  filter = '';
  loading = true;

  get approvedCount(): number { return this.items.filter(p => p.isActive).length; }
  get pendingCount(): number  { return this.items.filter(p => !p.isActive).length; }

  constructor(private api: TijaraApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.getAdminAllProducts().subscribe({
      next: (data: any[]) => {
        this.items = (data || []).map((p: any) => ({
          id:          +p.id,
          name:         p.name        ?? p.title       ?? '—',
          price:        p.price       ?? '0',
          image:        p.image_url   ?? p.image       ?? '',
          category:     p.category    ?? '',
          vendorName:   p.vendor_name ?? '',
          shopName:     p.shop_name   ?? '',
          isActive:    !!(p.is_active ?? (p.approval_status === 'approved')),
        }));
        this.applyFilter();
        this.loading = false;
      },
      error: () => { this.loading = false; alert('Chargement impossible.'); }
    });
  }

  applyFilter(): void {
    const s = this.search.trim().toLowerCase();
    this.filtered = this.items.filter(p => {
      if (s && !`${p.name} ${p.vendorName} ${p.shopName} ${p.category}`.toLowerCase().includes(s)) return false;
      if (this.filter === 'approved' && !p.isActive) return false;
      if (this.filter === 'pending'  &&  p.isActive) return false;
      return true;
    });
  }
  setFilter(f: string): void { this.filter = f; this.applyFilter(); }

  approve(p: ProductRow): void {
    this.api.approveProduct(p.id).subscribe({
      next: () => { p.isActive = true; this.applyFilter(); },
      error: () => alert('Approbation impossible.'),
    });
  }
  reject(p: ProductRow): void {
    if (!confirm(`Désapprouver le produit "${p.name}" ?`)) return;
    this.api.rejectProductAdmin(p.id).subscribe({
      next: () => { p.isActive = false; this.applyFilter(); },
      error: () => alert('Action impossible.'),
    });
  }
}
