import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

type ViewMode = 'grid' | 'list';
type StatusFilter = '' | 'active' | 'inactive' | 'out';

@Component({
  selector: 'app-my-products-user',
  standalone: false,
  template: `
<app-breadcrumbs title="Mes annonces" [breadcrumbItems]="breadcrumbItems"></app-breadcrumbs>

<div class="alert alert-info border-0 d-flex align-items-center gap-2 mb-4 py-2 px-3" style="background:#e7f1ff">
  <i class="ri-information-line text-primary fs-18"></i>
  <div class="fs-13">
    <strong>À noter :</strong> en tant que client, vous publiez des <strong>annonces</strong> (revente, occasion, services).
    Pour vendre en tant que professionnel avec gestion de stock et facturation, demandez votre compte <a routerLink="/auth/signup" class="fw-semibold">Vendeur</a>.
  </div>
</div>

<!-- ─── KPI cards ───────────────────────────────────────────── -->
<div class="row g-3 mb-4">
  <div class="col-6 col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid var(--vz-primary)">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-primary-subtle d-flex align-items-center justify-content-center">
          <i class="ri-store-2-line fs-22 text-primary"></i>
        </div>
        <div>
          <h3 class="mb-0 fw-bold text-primary">{{ items.length }}</h3>
          <p class="mb-0 fs-12 text-muted">Annonces publiées</p>
        </div>
      </div>
    </div>
  </div>
  <div class="col-6 col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid var(--vz-success)">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-success-subtle d-flex align-items-center justify-content-center">
          <i class="ri-check-double-line fs-22 text-success"></i>
        </div>
        <div>
          <h3 class="mb-0 fw-bold text-success">{{ activeCount }}</h3>
          <p class="mb-0 fs-12 text-muted">Actifs</p>
        </div>
      </div>
    </div>
  </div>
  <div class="col-6 col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid var(--vz-warning)">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-warning-subtle d-flex align-items-center justify-content-center">
          <i class="ri-alert-line fs-22 text-warning"></i>
        </div>
        <div>
          <h3 class="mb-0 fw-bold text-warning">{{ outOfStockCount }}</h3>
          <p class="mb-0 fs-12 text-muted">Rupture stock</p>
        </div>
      </div>
    </div>
  </div>
  <div class="col-6 col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid var(--vz-info)">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-info-subtle d-flex align-items-center justify-content-center">
          <i class="ri-money-dollar-circle-line fs-22 text-info"></i>
        </div>
        <div>
          <h3 class="mb-0 fw-bold text-info">{{ totalValue | number:'1.0-0' }}</h3>
          <p class="mb-0 fs-12 text-muted">Valeur annoncée (TND)</p>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ─── Toolbar ─────────────────────────────────────────────── -->
<div class="card border-0 shadow-sm">
  <div class="card-header bg-transparent py-3">
    <div class="d-flex flex-wrap align-items-center gap-2">
      <h6 class="mb-0 fw-semibold flex-grow-1">
        <i class="ri-megaphone-line me-2 text-primary"></i>Mes annonces
        <span class="badge bg-primary-subtle text-primary ms-2">{{ filtered.length }}</span>
      </h6>

      <!-- Search -->
      <div class="input-group input-group-sm" style="max-width:260px">
        <span class="input-group-text bg-white border-end-0"><i class="ri-search-line"></i></span>
        <input type="text" class="form-control border-start-0"
               placeholder="Rechercher une annonce…"
               [(ngModel)]="search" (input)="applyFilter()" />
      </div>

      <!-- Status filter -->
      <select class="form-select form-select-sm" style="max-width:160px"
              [(ngModel)]="statusFilter" (change)="applyFilter()">
        <option value="">Tous les statuts</option>
        <option value="active">Actifs</option>
        <option value="inactive">Inactifs</option>
        <option value="out">Rupture stock</option>
      </select>

      <!-- Sort -->
      <select class="form-select form-select-sm" style="max-width:160px"
              [(ngModel)]="sortBy" (change)="applyFilter()">
        <option value="recent">Plus récents</option>
        <option value="title">Nom (A→Z)</option>
        <option value="priceAsc">Prix croissant</option>
        <option value="priceDesc">Prix décroissant</option>
      </select>

      <!-- View toggle -->
      <div class="btn-group btn-group-sm" role="group">
        <button type="button" class="btn"
                [class.btn-primary]="view==='grid'" [class.btn-light]="view!=='grid'"
                (click)="view='grid'"><i class="ri-grid-line"></i></button>
        <button type="button" class="btn"
                [class.btn-primary]="view==='list'" [class.btn-light]="view!=='list'"
                (click)="view='list'"><i class="ri-list-check-2"></i></button>
      </div>

      <button class="btn btn-sm btn-success rounded-pill px-3" (click)="goCreate()">
        <i class="ri-add-line me-1"></i>Publier une annonce
      </button>
    </div>
  </div>

  <div class="card-body p-0">
    @if (loading) {
      <div class="text-center py-5"><div class="spinner-border text-primary"></div>
        <p class="text-muted mt-2 mb-0 fs-13">Chargement de vos annonces…</p>
      </div>
    } @else if (filtered.length === 0) {
      <div class="text-center py-5">
        <i class="ri-inbox-line display-3 text-muted opacity-50 d-block"></i>
        <h5 class="mt-3 mb-1">Aucune annonce trouvée</h5>
        <p class="text-muted mb-3">
          @if (items.length === 0) { Vous n'avez encore publié aucune annonce. }
          @else { Modifiez vos filtres pour voir plus de résultats. }
        </p>
        @if (items.length === 0) {
          <button class="btn btn-primary" (click)="goCreate()">
            <i class="ri-add-line me-1"></i>Publier ma première annonce
          </button>
        }
      </div>
    }
    @else if (view === 'grid') {
      <!-- ─── GRID view ──────────────────────────── -->
      <div class="p-3">
        <div class="row g-3">
          @for (p of filtered; track p.id) {
            <div class="col-6 col-md-4 col-xl-3">
              <div class="card h-100 border product-card" style="transition:all .25s">
                <div class="position-relative">
                  @if (p.image) {
                    <img [src]="p.image" class="card-img-top" alt=""
                         style="height:160px;object-fit:cover;border-radius:.4rem .4rem 0 0">
                  } @else {
                    <div class="d-flex align-items-center justify-content-center bg-light"
                         style="height:160px;border-radius:.4rem .4rem 0 0">
                      <i class="ri-image-line display-5 text-muted opacity-50"></i>
                    </div>
                  }
                  <span class="badge position-absolute top-0 end-0 m-2 rounded-pill"
                        [class.bg-success]="p.active && !isOut(p)"
                        [class.bg-warning]="isOut(p)"
                        [class.bg-secondary]="!p.active && !isOut(p)">
                    {{ isOut(p) ? 'Rupture' : (p.active ? 'Actif' : 'Inactif') }}
                  </span>
                </div>
                <div class="card-body p-3">
                  <h6 class="fs-13 fw-semibold text-truncate mb-1" [title]="p.title">{{ p.title }}</h6>
                  <div class="fs-11 text-muted mb-2">{{ p.category || 'Non catégorisé' }}</div>
                  <div class="d-flex align-items-center justify-content-between">
                    <span class="fw-bold text-primary fs-15">{{ p.price | number:'1.2-2' }} TND</span>
                    <span class="fs-11 text-muted">Stock: {{ p.stock ?? '—' }}</span>
                  </div>
                </div>
                <div class="card-footer bg-transparent d-flex gap-1 p-2">
                  <a [routerLink]="['/landing/produits', p.id]" class="btn btn-sm btn-light flex-grow-1" title="Voir">
                    <i class="ri-eye-line"></i>
                  </a>
                  <button class="btn btn-sm btn-light flex-grow-1" (click)="edit(p)" title="Modifier">
                    <i class="ri-pencil-line text-primary"></i>
                  </button>
                  <button class="btn btn-sm btn-light flex-grow-1" (click)="remove(p)" title="Supprimer">
                    <i class="ri-delete-bin-line text-danger"></i>
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    }
    @else {
      <!-- ─── LIST view ──────────────────────────── -->
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-3">Produit</th>
              <th>Catégorie</th>
              <th class="text-end">Prix</th>
              <th class="text-center">Stock</th>
              <th class="text-center">Statut</th>
              <th class="text-end pe-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (p of filtered; track p.id) {
              <tr>
                <td class="ps-3">
                  <div class="d-flex align-items-center gap-2">
                    @if (p.image) {
                      <img [src]="p.image" class="rounded" width="44" height="44" style="object-fit:cover" alt="">
                    } @else {
                      <div class="bg-light rounded d-flex align-items-center justify-content-center"
                           style="width:44px;height:44px">
                        <i class="ri-image-line text-muted"></i>
                      </div>
                    }
                    <div>
                      <div class="fw-semibold fs-13">{{ p.title }}</div>
                      <div class="fs-11 text-muted">Réf. #{{ p.id }}</div>
                    </div>
                  </div>
                </td>
                <td class="fs-13">{{ p.category || '—' }}</td>
                <td class="text-end fw-bold text-primary fs-13">{{ p.price | number:'1.2-2' }} TND</td>
                <td class="text-center fs-13">
                  <span [class.text-danger]="isOut(p)" [class.fw-bold]="isOut(p)">{{ p.stock ?? '—' }}</span>
                </td>
                <td class="text-center">
                  <span class="badge rounded-pill"
                        [class.bg-success-subtle]="p.active && !isOut(p)" [class.text-success]="p.active && !isOut(p)"
                        [class.bg-warning-subtle]="isOut(p)"              [class.text-warning]="isOut(p)"
                        [class.bg-secondary-subtle]="!p.active && !isOut(p)" [class.text-secondary]="!p.active && !isOut(p)">
                    {{ isOut(p) ? 'Rupture' : (p.active ? 'Actif' : 'Inactif') }}
                  </span>
                </td>
                <td class="text-end pe-3">
                  <a [routerLink]="['/landing/produits', p.id]" class="btn btn-sm btn-light" title="Voir">
                    <i class="ri-eye-line"></i>
                  </a>
                  <button class="btn btn-sm btn-light ms-1" (click)="edit(p)" title="Modifier">
                    <i class="ri-pencil-line text-primary"></i>
                  </button>
                  <button class="btn btn-sm btn-light ms-1" (click)="remove(p)" title="Supprimer">
                    <i class="ri-delete-bin-line text-danger"></i>
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

<style>
.product-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,.08) !important; }
</style>
`,
})
export class MyProductsUserComponent implements OnInit {
  breadcrumbItems = [
    { label: 'Tijara', active: false },
    { label: 'Mes annonces', active: true },
  ];

  items: any[] = [];
  filtered: any[] = [];
  search = '';
  statusFilter: StatusFilter = '';
  sortBy: 'recent' | 'title' | 'priceAsc' | 'priceDesc' = 'recent';
  view: ViewMode = 'grid';
  loading = true;

  get activeCount(): number { return this.items.filter(p => p.active && !this.isOut(p)).length; }
  get outOfStockCount(): number { return this.items.filter(p => this.isOut(p)).length; }
  get totalValue(): number {
    return this.items.reduce((s, p) => s + (p.price * (p.stock || 0)), 0);
  }

  isOut(p: any): boolean { return p.stock !== null && p.stock !== undefined && +p.stock <= 0; }

  constructor(private api: TijaraApiService, private router: Router) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.getMyProducts().subscribe({
      next: (r: any) => {
        const raw: any[] = Array.isArray(r) ? r : (r?.data || r?.products || []);
        this.items = raw.map(x => ({
          id:        x.id || x.IdDeal || x.IdProduct,
          title:     x.title || x.titleDeal || x.name || 'Sans titre',
          category:  x.category || x.category_name || '',
          price:     parseFloat(x.price || x.priceDeal || '0') || 0,
          stock:     x.quantity ?? x.qte ?? x.stock ?? null,
          image:     x.image || x.imageDeal || x.image_url || null,
          active:    (x.active ?? x.Active ?? 1) === 1,
          createdAt: x.createdAt || x.created_at || x.CreatedAt || null,
        }));
        this.applyFilter();
        this.loading = false;
      },
      error: () => { this.items = []; this.filtered = []; this.loading = false; },
    });
  }

  applyFilter(): void {
    const s = this.search.trim().toLowerCase();
    let list = this.items.filter(p => {
      if (s && !(`${p.title} ${p.category}`).toLowerCase().includes(s)) return false;
      if (this.statusFilter === 'active'   && !(p.active && !this.isOut(p))) return false;
      if (this.statusFilter === 'inactive' && p.active) return false;
      if (this.statusFilter === 'out'      && !this.isOut(p)) return false;
      return true;
    });

    switch (this.sortBy) {
      case 'title':     list.sort((a, b) => (a.title || '').localeCompare(b.title || '')); break;
      case 'priceAsc':  list.sort((a, b) => a.price - b.price); break;
      case 'priceDesc': list.sort((a, b) => b.price - a.price); break;
      case 'recent':    list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()); break;
    }
    this.filtered = list;
  }

  goCreate(): void { this.router.navigate(['/users/annonces']); }
  edit(p: any): void { this.router.navigate(['/users/annonces'], { queryParams: { edit: p.id } }); }

  remove(p: any): void {
    if (!confirm(`Supprimer "${p.title}" ?`)) return;
    this.api.deleteAnnonce(p.id).subscribe({
      next: () => { this.items = this.items.filter(x => x.id !== p.id); this.applyFilter(); },
      error: () => alert('Suppression impossible.'),
    });
  }
}
