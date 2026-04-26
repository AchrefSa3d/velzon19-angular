import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

interface VendorRow {
  id: number;
  shopName: string;
  ownerName: string;
  email: string;
  phone: string;
  isActive: boolean;
  isApproved: boolean;
  createdAt: string | null;
}

@Component({
  selector: 'app-vendors-admin',
  standalone: false,
  template: `
<app-breadcrumbs title="Gestion Vendeurs" [breadcrumbItems]="breadCrumbItems"></app-breadcrumbs>

<div class="row g-3 mb-4">
  <div class="col-6 col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid #0ab39c">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-success-subtle d-flex align-items-center justify-content-center">
          <i class="ri-store-2-line fs-22 text-success"></i>
        </div>
        <div><h3 class="mb-0 fw-bold text-success">{{ vendors.length }}</h3>
        <p class="mb-0 fs-12 text-muted">Total vendeurs</p></div>
      </div>
    </div>
  </div>
  <div class="col-6 col-md-3">
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
  <div class="col-6 col-md-3">
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
  <div class="col-6 col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid #f06548">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-danger-subtle d-flex align-items-center justify-content-center">
          <i class="ri-shield-cross-line fs-22 text-danger"></i>
        </div>
        <div><h3 class="mb-0 fw-bold text-danger">{{ vendors.length - activeCount }}</h3>
        <p class="mb-0 fs-12 text-muted">Bloqués</p></div>
      </div>
    </div>
  </div>
</div>

<div class="card border-0 shadow-sm">
  <div class="card-header bg-transparent d-flex flex-wrap align-items-center gap-2 py-3">
    <h6 class="mb-0 fw-semibold flex-grow-1">
      <i class="ri-store-2-line me-2 text-success"></i>Liste des vendeurs
      <span class="badge bg-success-subtle text-success ms-2">{{ filtered.length }}</span>
    </h6>
    <div class="input-group input-group-sm" style="max-width:240px">
      <span class="input-group-text bg-white border-end-0"><i class="ri-search-line"></i></span>
      <input type="text" class="form-control border-start-0" placeholder="Boutique, propriétaire, email…"
             [(ngModel)]="search" (input)="applyFilter()" />
    </div>
    <div class="btn-group btn-group-sm">
      <button class="btn" [class.btn-primary]="filter===''"         [class.btn-light]="filter!==''"         (click)="setFilter('')">Tous</button>
      <button class="btn" [class.btn-primary]="filter==='approved'" [class.btn-light]="filter!=='approved'" (click)="setFilter('approved')">Approuvés</button>
      <button class="btn" [class.btn-primary]="filter==='pending'"  [class.btn-light]="filter!=='pending'"  (click)="setFilter('pending')">À valider</button>
      <button class="btn" [class.btn-primary]="filter==='blocked'"  [class.btn-light]="filter!=='blocked'"  (click)="setFilter('blocked')">Bloqués</button>
    </div>
  </div>

  <div class="card-body p-0">
    @if (loading) {
      <div class="text-center py-5"><div class="spinner-border text-success"></div></div>
    } @else if (filtered.length === 0) {
      <div class="text-center py-5">
        <i class="ri-store-line display-3 text-muted opacity-50"></i>
        <p class="text-muted mt-2 mb-0">Aucun vendeur ne correspond.</p>
      </div>
    } @else {
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-3">#</th>
              <th>Boutique</th>
              <th>Propriétaire</th>
              <th>Téléphone</th>
              <th class="text-center">Validation</th>
              <th class="text-center">Statut</th>
              <th>Inscrit le</th>
              <th class="text-end pe-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (v of filtered; track v.id) {
              <tr>
                <td class="ps-3 fs-12 text-muted">#{{ v.id }}</td>
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <div class="avatar-sm rounded-3 bg-success-subtle text-success
                                d-flex align-items-center justify-content-center fw-bold fs-13">
                      {{ getInitials(v.shopName) }}
                    </div>
                    <div class="min-w-0">
                      <div class="fs-13 fw-semibold text-truncate">{{ v.shopName || '—' }}</div>
                      <div class="fs-11 text-muted text-truncate">{{ v.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="fs-13">{{ v.ownerName }}</td>
                <td class="fs-13">{{ v.phone || '—' }}</td>
                <td class="text-center">
                  @if (v.isApproved) {
                    <span class="badge bg-success-subtle text-success"><i class="ri-shield-check-line me-1"></i>Validé</span>
                  } @else {
                    <span class="badge bg-warning-subtle text-warning">En attente</span>
                  }
                </td>
                <td class="text-center">
                  @if (v.isActive) {
                    <span class="badge bg-success-subtle text-success">Actif</span>
                  } @else {
                    <span class="badge bg-danger-subtle text-danger">Bloqué</span>
                  }
                </td>
                <td class="fs-12 text-muted">{{ formatDate(v.createdAt) }}</td>
                <td class="text-end pe-3">
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-light" (click)="view(v)" title="Détails">
                      <i class="ri-eye-line text-info"></i>
                    </button>
                    @if (!v.isApproved) {
                      <button class="btn btn-light" (click)="approve(v)" title="Approuver">
                        <i class="ri-check-line text-success"></i>
                      </button>
                    }
                    <button class="btn btn-light" (click)="toggleActive(v)" [title]="v.isActive ? 'Bloquer' : 'Activer'">
                      <i [class]="v.isActive ? 'ri-lock-line text-warning' : 'ri-shield-check-line text-success'"></i>
                    </button>
                    <button class="btn btn-light" (click)="reject(v)" title="Rejeter / Supprimer">
                      <i class="ri-close-line text-danger"></i>
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
export class VendorsAdminComponent implements OnInit {
  breadCrumbItems = [{ label: 'Admin' }, { label: 'Gestion Vendeurs', active: true }];

  vendors: VendorRow[]  = [];
  filtered: VendorRow[] = [];
  search = '';
  filter = '';
  loading = true;

  get approvedCount(): number { return this.vendors.filter(v => v.isApproved).length; }
  get pendingCount(): number  { return this.vendors.filter(v => !v.isApproved).length; }
  get activeCount(): number   { return this.vendors.filter(v => v.isActive).length; }

  constructor(private api: TijaraApiService, private router: Router) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.getAllVendors().subscribe({
      next: (data: any[]) => {
        this.vendors = (data || []).map((v: any) => ({
          id:         +v.id,
          shopName:   v.shop_name || `${v.first_name || ''} ${v.last_name || ''}`.trim() || v.email,
          ownerName:  `${v.first_name || ''} ${v.last_name || ''}`.trim() || '—',
          email:      v.email || '',
          phone:      v.phone || '',
          isActive:   !!v.is_active,
          isApproved: !!v.is_approved,
          createdAt:  v.created_at || null,
        }));
        this.applyFilter();
        this.loading = false;
      },
      error: () => { this.loading = false; alert('Chargement impossible.'); }
    });
  }

  applyFilter(): void {
    const s = this.search.trim().toLowerCase();
    this.filtered = this.vendors.filter(v => {
      if (s && !`${v.shopName} ${v.ownerName} ${v.email} ${v.phone}`.toLowerCase().includes(s)) return false;
      if (this.filter === 'approved' && !v.isApproved) return false;
      if (this.filter === 'pending'  &&  v.isApproved) return false;
      if (this.filter === 'blocked'  &&  v.isActive)   return false;
      return true;
    });
  }
  setFilter(f: string): void { this.filter = f; this.applyFilter(); }

  view(v: VendorRow): void { this.router.navigate(['/admin/vendor-detail', v.id]); }

  approve(v: VendorRow): void {
    this.api.approveVendor(v.id).subscribe({
      next: () => { v.isApproved = true; v.isActive = true; this.applyFilter(); },
      error: () => alert('Approbation impossible.'),
    });
  }
  reject(v: VendorRow): void {
    if (!confirm(`Rejeter / supprimer le vendeur ${v.shopName} ?`)) return;
    this.api.rejectVendor(v.id).subscribe({
      next: () => { v.isApproved = false; v.isActive = false; this.applyFilter(); },
      error: () => alert('Action impossible.'),
    });
  }
  toggleActive(v: VendorRow): void {
    this.api.toggleAdminUser(v.id).subscribe({
      next: () => { v.isActive = !v.isActive; this.applyFilter(); },
      error: () => alert('Action impossible.'),
    });
  }

  formatDate(d: string | null): string {
    if (!d) return '—';
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? '—' : dt.toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' });
  }
  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').filter(Boolean).map(w => w[0]).join('').substring(0, 2).toUpperCase();
  }
}
