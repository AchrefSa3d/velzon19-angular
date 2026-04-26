import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

interface UserRow {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  isPremium: boolean;
  createdAt: string | null;
}

@Component({
  selector: 'app-users-admin',
  standalone: false,
  template: `
<app-breadcrumbs title="Utilisateurs" [breadcrumbItems]="breadCrumbItems"></app-breadcrumbs>

<div class="row g-3 mb-4">
  <div class="col-6 col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid #405189">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-primary-subtle d-flex align-items-center justify-content-center">
          <i class="ri-user-3-line fs-22 text-primary"></i>
        </div>
        <div><h3 class="mb-0 fw-bold text-primary">{{ users.length }}</h3>
        <p class="mb-0 fs-12 text-muted">Total utilisateurs</p></div>
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
          <i class="ri-vip-crown-line fs-22 text-warning"></i>
        </div>
        <div><h3 class="mb-0 fw-bold text-warning">{{ premiumCount }}</h3>
        <p class="mb-0 fs-12 text-muted">Premium</p></div>
      </div>
    </div>
  </div>
  <div class="col-6 col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid #f06548">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-danger-subtle d-flex align-items-center justify-content-center">
          <i class="ri-shield-cross-line fs-22 text-danger"></i>
        </div>
        <div><h3 class="mb-0 fw-bold text-danger">{{ users.length - activeCount }}</h3>
        <p class="mb-0 fs-12 text-muted">Bloqués</p></div>
      </div>
    </div>
  </div>
</div>

<div class="card border-0 shadow-sm">
  <div class="card-header bg-transparent d-flex flex-wrap align-items-center gap-2 py-3">
    <h6 class="mb-0 fw-semibold flex-grow-1">
      <i class="ri-user-3-line me-2 text-primary"></i>Liste des utilisateurs
      <span class="badge bg-primary-subtle text-primary ms-2">{{ filtered.length }}</span>
    </h6>
    <div class="input-group input-group-sm" style="max-width:240px">
      <span class="input-group-text bg-white border-end-0"><i class="ri-search-line"></i></span>
      <input type="text" class="form-control border-start-0" placeholder="Nom, email, téléphone…"
             [(ngModel)]="search" (input)="applyFilter()" />
    </div>
    <div class="btn-group btn-group-sm">
      <button class="btn" [class.btn-primary]="filter===''"        [class.btn-light]="filter!==''"        (click)="setFilter('')">Tous</button>
      <button class="btn" [class.btn-primary]="filter==='active'"  [class.btn-light]="filter!=='active'"  (click)="setFilter('active')">Actifs</button>
      <button class="btn" [class.btn-primary]="filter==='blocked'" [class.btn-light]="filter!=='blocked'" (click)="setFilter('blocked')">Bloqués</button>
      <button class="btn" [class.btn-primary]="filter==='premium'" [class.btn-light]="filter!=='premium'" (click)="setFilter('premium')">Premium</button>
    </div>
    <button class="btn btn-sm btn-light" (click)="exportCSV()" title="Export CSV">
      <i class="ri-file-excel-2-line text-success me-1"></i>Export
    </button>
  </div>

  <div class="card-body p-0">
    @if (loading) {
      <div class="text-center py-5"><div class="spinner-border text-primary"></div></div>
    } @else if (filtered.length === 0) {
      <div class="text-center py-5">
        <i class="ri-user-search-line display-3 text-muted opacity-50"></i>
        <p class="text-muted mt-2 mb-0">Aucun utilisateur ne correspond.</p>
      </div>
    } @else {
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-3">#</th>
              <th>Utilisateur</th>
              <th>Téléphone</th>
              <th class="text-center">Statut</th>
              <th class="text-center">Premium</th>
              <th>Inscrit le</th>
              <th class="text-end pe-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (u of filtered; track u.id) {
              <tr>
                <td class="ps-3 fs-12 text-muted">#{{ u.id }}</td>
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <div class="avatar-sm rounded-circle bg-primary-subtle text-primary
                                d-flex align-items-center justify-content-center fw-bold fs-13">
                      {{ getInitials(u.fullName) }}
                    </div>
                    <div class="min-w-0">
                      <div class="fs-13 fw-semibold text-truncate">{{ u.fullName || '—' }}</div>
                      <div class="fs-11 text-muted text-truncate">{{ u.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="fs-13">{{ u.phone || '—' }}</td>
                <td class="text-center">
                  @if (u.isActive) {
                    <span class="badge bg-success-subtle text-success">Actif</span>
                  } @else {
                    <span class="badge bg-danger-subtle text-danger">Bloqué</span>
                  }
                </td>
                <td class="text-center">
                  @if (u.isPremium) {
                    <i class="ri-vip-crown-fill text-warning fs-18"></i>
                  } @else {
                    <i class="ri-vip-crown-line text-muted fs-18 opacity-50"></i>
                  }
                </td>
                <td class="fs-12 text-muted">{{ formatDate(u.createdAt) }}</td>
                <td class="text-end pe-3">
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-light" (click)="view(u)" title="Détails">
                      <i class="ri-eye-line text-info"></i>
                    </button>
                    <button class="btn btn-light" (click)="togglePremium(u)" title="Premium">
                      <i class="ri-vip-crown-line" [class.text-warning]="u.isPremium" [class.text-muted]="!u.isPremium"></i>
                    </button>
                    <button class="btn btn-light" (click)="toggleActive(u)" [title]="u.isActive ? 'Bloquer' : 'Activer'">
                      <i [class]="u.isActive ? 'ri-lock-line text-warning' : 'ri-shield-check-line text-success'"></i>
                    </button>
                    <button class="btn btn-light" (click)="delete(u)" title="Supprimer">
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
export class UsersAdminComponent implements OnInit {
  breadCrumbItems = [{ label: 'Admin' }, { label: 'Utilisateurs', active: true }];

  users: UserRow[]    = [];
  filtered: UserRow[] = [];
  search = '';
  filter = '';
  loading = true;

  get activeCount(): number  { return this.users.filter(u => u.isActive).length; }
  get premiumCount(): number { return this.users.filter(u => u.isPremium).length; }

  constructor(private api: TijaraApiService, private router: Router) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.getAdminAllUsers('user').subscribe({
      next: (data: any[]) => {
        this.users = (data || []).map((u: any) => ({
          id:          +u.id,
          fullName:    `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username || '—',
          email:       u.email || '',
          phone:       u.phone || '',
          role:        u.role || 'user',
          isActive:    !!u.is_active,
          isVerified:  !!u.is_verified,
          isPremium:   !!u.is_premium,
          createdAt:   u.created_at || null,
        }));
        this.applyFilter();
        this.loading = false;
      },
      error: () => { this.loading = false; alert('Chargement impossible.'); }
    });
  }

  applyFilter(): void {
    const s = this.search.trim().toLowerCase();
    this.filtered = this.users.filter(u => {
      if (s && !`${u.fullName} ${u.email} ${u.phone}`.toLowerCase().includes(s)) return false;
      if (this.filter === 'active'  && !u.isActive)  return false;
      if (this.filter === 'blocked' &&  u.isActive)  return false;
      if (this.filter === 'premium' && !u.isPremium) return false;
      return true;
    });
  }
  setFilter(f: string): void { this.filter = f; this.applyFilter(); }

  view(u: UserRow): void { this.router.navigate(['/admin/user-detail', u.id]); }

  toggleActive(u: UserRow): void {
    this.api.toggleAdminUser(u.id).subscribe({
      next: () => { u.isActive = !u.isActive; this.applyFilter(); },
      error: () => alert('Action impossible.'),
    });
  }
  togglePremium(u: UserRow): void {
    this.api.toggleUserPremium(u.id).subscribe({
      next: () => { u.isPremium = !u.isPremium; this.applyFilter(); },
      error: () => alert('Action impossible.'),
    });
  }
  delete(u: UserRow): void {
    if (!confirm(`Supprimer définitivement ${u.fullName} ?`)) return;
    this.api.deleteAdminUser(u.id).subscribe({
      next: () => { this.users = this.users.filter(x => x.id !== u.id); this.applyFilter(); },
      error: (err) => alert('Suppression impossible : ' + (err?.error?.message || err?.message || '')),
    });
  }

  exportCSV(): void {
    const header = 'ID,Nom,Email,Téléphone,Statut,Premium,Inscription\n';
    const rows = this.filtered.map(u =>
      [u.id, `"${u.fullName}"`, u.email, u.phone, u.isActive ? 'Actif' : 'Bloqué',
       u.isPremium ? 'Oui' : 'Non', this.formatDate(u.createdAt)].join(',')
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `utilisateurs-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
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
