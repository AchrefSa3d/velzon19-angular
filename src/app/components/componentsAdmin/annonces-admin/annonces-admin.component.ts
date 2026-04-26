import { Component, OnInit } from '@angular/core';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

interface AnnonceRow {
  id: number;
  title: string;
  description: string;
  price: string;
  image: string;
  category: string;
  authorName: string;
  active: boolean;
  date: string | null;
}

@Component({
  selector: 'app-annonces-admin',
  standalone: false,
  template: `
<app-breadcrumbs title="Annonces" [breadcrumbItems]="breadCrumbItems"></app-breadcrumbs>

<div class="row g-3 mb-4">
  <div class="col-6 col-md-4">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid #299cdb">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-info-subtle d-flex align-items-center justify-content-center">
          <i class="ri-megaphone-line fs-22 text-info"></i>
        </div>
        <div><h3 class="mb-0 fw-bold text-info">{{ items.length }}</h3>
        <p class="mb-0 fs-12 text-muted">Total annonces</p></div>
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
        <p class="mb-0 fs-12 text-muted">Approuvées</p></div>
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
      <i class="ri-megaphone-line me-2 text-info"></i>Modération des annonces
      <span class="badge bg-info-subtle text-info ms-2">{{ filtered.length }}</span>
    </h6>
    <div class="input-group input-group-sm" style="max-width:240px">
      <span class="input-group-text bg-white border-end-0"><i class="ri-search-line"></i></span>
      <input type="text" class="form-control border-start-0" placeholder="Titre, auteur, catégorie…"
             [(ngModel)]="search" (input)="applyFilter()" />
    </div>
    <div class="btn-group btn-group-sm">
      <button class="btn" [class.btn-info]="filter===''"         [class.btn-light]="filter!==''"         (click)="setFilter('')">Toutes</button>
      <button class="btn" [class.btn-info]="filter==='pending'"  [class.btn-light]="filter!=='pending'"  (click)="setFilter('pending')">En attente</button>
      <button class="btn" [class.btn-info]="filter==='approved'" [class.btn-light]="filter!=='approved'" (click)="setFilter('approved')">Approuvées</button>
    </div>
  </div>

  <div class="card-body p-0">
    @if (loading) {
      <div class="text-center py-5"><div class="spinner-border text-info"></div></div>
    } @else if (filtered.length === 0) {
      <div class="text-center py-5">
        <i class="ri-megaphone-line display-3 text-muted opacity-50"></i>
        <p class="text-muted mt-2 mb-0">Aucune annonce ne correspond.</p>
      </div>
    } @else {
      <div class="row g-3 p-3">
        @for (a of filtered; track a.id) {
          <div class="col-md-6 col-xl-4">
            <div class="card border-0 shadow-sm h-100">
              <div class="position-relative">
                @if (a.image) {
                  <img [src]="a.image" alt="" class="card-img-top"
                       style="height:160px;object-fit:cover" (error)="a.image=''" />
                } @else {
                  <div class="card-img-top bg-info-subtle d-flex align-items-center justify-content-center"
                       style="height:160px">
                    <i class="ri-megaphone-line text-info" style="font-size:48px"></i>
                  </div>
                }
                <div class="position-absolute top-0 end-0 m-2">
                  @if (a.active) {
                    <span class="badge bg-success">Approuvée</span>
                  } @else {
                    <span class="badge bg-warning">En attente</span>
                  }
                </div>
              </div>
              <div class="card-body">
                <h6 class="fw-semibold text-truncate mb-1">{{ a.title || '—' }}</h6>
                <p class="text-muted fs-11 mb-2 text-truncate">{{ a.description || '—' }}</p>
                <div class="d-flex justify-content-between fs-12 text-muted mb-2">
                  <span><i class="ri-user-line"></i> {{ a.authorName || '—' }}</span>
                  <span class="fw-bold text-success">{{ a.price }} TND</span>
                </div>
                @if (a.category) {
                  <span class="badge bg-light text-dark fs-10 mb-2"><i class="ri-folder-line"></i> {{ a.category }}</span>
                }
              </div>
              <div class="card-footer bg-white border-top d-flex gap-2">
                @if (!a.active) {
                  <button class="btn btn-sm btn-success flex-fill" (click)="approve(a)">
                    <i class="ri-check-line"></i> Approuver
                  </button>
                  <button class="btn btn-sm btn-outline-danger" (click)="reject(a)" title="Rejeter">
                    <i class="ri-close-line"></i>
                  </button>
                } @else {
                  <button class="btn btn-sm btn-outline-warning flex-fill" (click)="reject(a)">
                    <i class="ri-close-line"></i> Désapprouver
                  </button>
                }
              </div>
            </div>
          </div>
        }
      </div>
    }
  </div>
</div>
`,
})
export class AnnoncesAdminComponent implements OnInit {
  breadCrumbItems = [{ label: 'Admin' }, { label: 'Annonces', active: true }];

  items: AnnonceRow[]    = [];
  filtered: AnnonceRow[] = [];
  search = '';
  filter = '';
  loading = true;

  get approvedCount(): number { return this.items.filter(a => a.active).length; }
  get pendingCount(): number  { return this.items.filter(a => !a.active).length; }

  constructor(private api: TijaraApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.getAdminAnnonces().subscribe({
      next: (data: any[]) => {
        this.items = (data || []).map((a: any) => ({
          id:          +a.id,
          title:        a.title       ?? '—',
          description:  a.description ?? '',
          price:        String(a.price ?? '0'),
          image:        a.image       ?? '',
          category:     a.category    ?? '',
          authorName:   a.author_name ?? '',
          active:    !!(a.active     ?? (a.status === 'approved')),
          date:         a.date        ?? null,
        }));
        this.applyFilter();
        this.loading = false;
      },
      error: () => { this.loading = false; alert('Chargement impossible.'); }
    });
  }

  applyFilter(): void {
    const s = this.search.trim().toLowerCase();
    this.filtered = this.items.filter(a => {
      if (s && !`${a.title} ${a.authorName} ${a.category}`.toLowerCase().includes(s)) return false;
      if (this.filter === 'approved' && !a.active) return false;
      if (this.filter === 'pending'  &&  a.active) return false;
      return true;
    });
  }
  setFilter(f: string): void { this.filter = f; this.applyFilter(); }

  approve(a: AnnonceRow): void {
    this.api.approveAnnonce(a.id).subscribe({
      next: () => { a.active = true; this.applyFilter(); },
      error: () => alert('Approbation impossible.'),
    });
  }
  reject(a: AnnonceRow): void {
    if (!confirm(`Rejeter l'annonce "${a.title}" ?`)) return;
    this.api.rejectAnnonce(a.id).subscribe({
      next: () => { a.active = false; this.applyFilter(); },
      error: () => alert('Action impossible.'),
    });
  }
}
