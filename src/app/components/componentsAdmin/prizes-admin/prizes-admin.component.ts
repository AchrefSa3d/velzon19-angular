import { Component, OnInit } from '@angular/core';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

interface PrizeRow {
  id: number;
  title: string;
  description: string;
  image: string;
  datePrize: string;
  idUser: number | null;
  active: boolean;
}

@Component({
  selector: 'app-prizes-admin',
  standalone: false,
  template: `
<app-breadcrumbs title="Prix & cadeaux" [breadcrumbItems]="breadCrumbItems"></app-breadcrumbs>

<div class="row g-3 mb-4">
  <div class="col-md-4">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid #f7b84b">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-warning-subtle d-flex align-items-center justify-content-center">
          <i class="ri-gift-line fs-22 text-warning"></i>
        </div>
        <div><h3 class="mb-0 fw-bold text-warning">{{ items.length }}</h3>
        <p class="mb-0 fs-12 text-muted">Total prix</p></div>
      </div>
    </div>
  </div>
  <div class="col-md-4">
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
  <div class="col-md-4">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid #564ab1">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 d-flex align-items-center justify-content-center" style="background:#564ab120">
          <i class="ri-trophy-line fs-22" style="color:#564ab1"></i>
        </div>
        <div><h3 class="mb-0 fw-bold" style="color:#564ab1">{{ assignedCount }}</h3>
        <p class="mb-0 fs-12 text-muted">Attribués</p></div>
      </div>
    </div>
  </div>
</div>

<div class="card border-0 shadow-sm">
  <div class="card-header bg-transparent d-flex flex-wrap align-items-center gap-2 py-3">
    <h6 class="mb-0 fw-semibold flex-grow-1">
      <i class="ri-gift-line me-2 text-warning"></i>Liste des prix
      <span class="badge bg-warning-subtle text-warning ms-2">{{ filtered.length }}</span>
    </h6>
    <div class="input-group input-group-sm" style="max-width:240px">
      <span class="input-group-text bg-white border-end-0"><i class="ri-search-line"></i></span>
      <input type="text" class="form-control border-start-0" placeholder="Titre, description…"
             [(ngModel)]="search" (input)="applyFilter()" />
    </div>
    <button class="btn btn-sm btn-warning" (click)="openAdd()">
      <i class="ri-add-line me-1"></i>Nouveau prix
    </button>
  </div>

  <div class="card-body p-0">
    @if (loading) { <div class="text-center py-5"><div class="spinner-border text-warning"></div></div> }
    @else if (filtered.length === 0) {
      <div class="text-center py-5">
        <i class="ri-gift-line display-3 text-muted opacity-50"></i>
        <p class="text-muted mt-2 mb-3">Aucun prix.</p>
        <button class="btn btn-warning" (click)="openAdd()"><i class="ri-add-line"></i> Créer le premier</button>
      </div>
    } @else {
      <div class="row g-3 p-3">
        @for (p of filtered; track p.id) {
          <div class="col-md-6 col-xl-4">
            <div class="card border-0 shadow-sm h-100">
              <div class="position-relative">
                @if (p.image) {
                  <img [src]="p.image" alt="" class="card-img-top"
                       style="height:160px;object-fit:cover" (error)="p.image=''" />
                } @else {
                  <div class="card-img-top bg-warning-subtle d-flex align-items-center justify-content-center"
                       style="height:160px">
                    <i class="ri-gift-line text-warning" style="font-size:48px"></i>
                  </div>
                }
                <div class="position-absolute top-0 end-0 m-2">
                  @if (p.active) { <span class="badge bg-success">Actif</span> }
                  @else { <span class="badge bg-secondary">Inactif</span> }
                </div>
              </div>
              <div class="card-body">
                <h6 class="fw-semibold text-truncate mb-1">{{ p.title || '—' }}</h6>
                <p class="text-muted fs-11 mb-2 text-truncate">{{ p.description || '—' }}</p>
                <div class="d-flex justify-content-between fs-12 mb-2">
                  <span class="text-muted"><i class="ri-calendar-line"></i> {{ formatDate(p.datePrize) }}</span>
                  @if (p.idUser) {
                    <span class="badge bg-success-subtle text-success"><i class="ri-trophy-line"></i> Attribué</span>
                  } @else {
                    <span class="badge bg-light text-muted">Disponible</span>
                  }
                </div>
              </div>
              <div class="card-footer bg-white border-top d-flex gap-2">
                <button class="btn btn-sm btn-light flex-fill" (click)="openEdit(p)">
                  <i class="ri-edit-2-line text-info"></i> Modifier
                </button>
                <button class="btn btn-sm btn-light" (click)="toggleActive(p)" [title]="p.active ? 'Désactiver' : 'Activer'">
                  <i [class]="p.active ? 'ri-pause-circle-line text-warning' : 'ri-play-circle-line text-success'"></i>
                </button>
                <button class="btn btn-sm btn-light" (click)="remove(p)" title="Supprimer">
                  <i class="ri-delete-bin-line text-danger"></i>
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    }
  </div>
</div>

@if (showForm) {
  <div class="modal fade show d-block" tabindex="-1" style="background:rgba(0,0,0,.5)" (click)="cancel($event)">
    <div class="modal-dialog modal-lg modal-dialog-centered" (click)="$event.stopPropagation()">
      <div class="modal-content border-0 shadow-lg">
        <div class="modal-header bg-warning-subtle">
          <h5 class="modal-title fw-bold text-warning">
            <i class="ri-gift-line me-2"></i>{{ editingId ? 'Modifier le prix' : 'Nouveau prix' }}
          </h5>
          <button type="button" class="btn-close" (click)="cancel()"></button>
        </div>
        <div class="modal-body">
          @if (saveError) {
            <div class="alert alert-danger fs-13"><i class="ri-error-warning-line me-2"></i>{{ saveError }}</div>
          }
          <div class="row g-3">
            <div class="col-md-8">
              <label class="form-label fs-12 fw-semibold">Titre *</label>
              <input class="form-control form-control-sm" [(ngModel)]="form.title" placeholder="Ex : iPhone 15 Pro" />
            </div>
            <div class="col-md-4">
              <label class="form-label fs-12 fw-semibold">Date du prix</label>
              <input type="date" class="form-control form-control-sm" [(ngModel)]="form.datePrize" />
            </div>
            <div class="col-12">
              <label class="form-label fs-12 fw-semibold">Description</label>
              <textarea class="form-control form-control-sm" rows="2" [(ngModel)]="form.description"></textarea>
            </div>
            <div class="col-md-9">
              <label class="form-label fs-12 fw-semibold">URL image</label>
              <input class="form-control form-control-sm" [(ngModel)]="form.image" placeholder="https://…" />
            </div>
            <div class="col-md-3 d-flex align-items-end">
              @if (form.image) {
                <img [src]="form.image" alt="" class="rounded" width="60" height="60" style="object-fit:cover" (error)="$any($event.target).src=''" />
              }
            </div>
            <div class="col-md-6">
              <label class="form-label fs-12 fw-semibold">ID utilisateur gagnant (optionnel)</label>
              <input type="number" min="0" class="form-control form-control-sm" [(ngModel)]="form.idUser" />
            </div>
            <div class="col-md-6 d-flex align-items-end">
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="prize-active" [(ngModel)]="form.active" />
                <label class="form-check-label fs-13" for="prize-active">Actif</label>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-light" (click)="cancel()" [disabled]="saving">Annuler</button>
          <button class="btn btn-warning" (click)="save()" [disabled]="saving">
            @if (saving) { <span class="spinner-border spinner-border-sm me-1"></span> }
            <i class="ri-save-line me-1"></i> Enregistrer
          </button>
        </div>
      </div>
    </div>
  </div>
}
`,
})
export class PrizesAdminComponent implements OnInit {
  breadCrumbItems = [{ label: 'Admin' }, { label: 'Prix', active: true }];

  items: PrizeRow[]    = [];
  filtered: PrizeRow[] = [];
  search = '';
  loading = true;

  showForm = false;
  saving   = false;
  saveError = '';
  editingId: number | null = null;
  form = { title: '', description: '', image: '', datePrize: '', idUser: null as number | null, active: true };

  get activeCount(): number   { return this.items.filter(p => p.active).length; }
  get assignedCount(): number { return this.items.filter(p => !!p.idUser).length; }

  constructor(private api: TijaraApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.adminList('prizes').subscribe({
      next: (data: any[]) => {
        this.items = (data || []).map((p: any) => ({
          id:        +(p.id_prize ?? p.IdPrize ?? p.id ?? 0),
          title:      p.title       ?? p.Title       ?? '',
          description:p.description ?? p.Description ?? '',
          image:      p.image       ?? p.Image       ?? '',
          datePrize:  this.toDateInput(p.date_prize ?? p.DatePrize),
          idUser:    (p.id_user     ?? p.IdUser     ?? null) as number | null,
          active:   !!(p.active     ?? p.Active     ?? true),
        }));
        this.applyFilter();
        this.loading = false;
      },
      error: () => { this.loading = false; alert('Chargement impossible.'); }
    });
  }

  applyFilter(): void {
    const s = this.search.trim().toLowerCase();
    this.filtered = this.items.filter(p => !s || `${p.title} ${p.description}`.toLowerCase().includes(s));
  }

  openAdd(): void {
    this.editingId = null; this.saveError = '';
    this.form = { title: '', description: '', image: '', datePrize: '', idUser: null, active: true };
    this.showForm = true;
  }
  openEdit(p: PrizeRow): void {
    this.editingId = p.id; this.saveError = '';
    this.form = { title: p.title, description: p.description, image: p.image, datePrize: p.datePrize, idUser: p.idUser, active: p.active };
    this.showForm = true;
  }
  cancel(_ev?: Event): void { this.showForm = false; this.saving = false; this.saveError = ''; }

  save(): void {
    if (!this.form.title.trim()) { this.saveError = 'Le titre est requis.'; return; }
    this.saving = true; this.saveError = '';
    const payload = {
      Title: this.form.title, Description: this.form.description, Image: this.form.image,
      DatePrize: this.form.datePrize || null, IdUser: this.form.idUser || null, Active: this.form.active,
    };
    const op = this.editingId
      ? this.api.adminUpdate('prizes', this.editingId, payload)
      : this.api.adminCreate('prizes', payload);
    op.subscribe({
      next: () => { this.saving = false; this.showForm = false; this.load(); },
      error: (err) => { this.saving = false; this.saveError = err?.error?.message || 'Erreur d\'enregistrement.'; },
    });
  }

  toggleActive(p: PrizeRow): void {
    this.api.adminUpdate('prizes', p.id, {
      Title: p.title, Description: p.description, Image: p.image,
      DatePrize: p.datePrize || null, IdUser: p.idUser || null, Active: !p.active,
    }).subscribe({
      next: () => { p.active = !p.active; this.applyFilter(); },
      error: () => alert('Action impossible.'),
    });
  }
  remove(p: PrizeRow): void {
    if (!confirm(`Supprimer le prix "${p.title}" ?`)) return;
    this.api.adminDelete('prizes', p.id).subscribe({
      next: () => { this.items = this.items.filter(x => x.id !== p.id); this.applyFilter(); },
      error: () => alert('Suppression impossible.'),
    });
  }

  formatDate(d: string | null): string {
    if (!d) return '—';
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? '—' : dt.toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' });
  }
  private toDateInput(d: any): string {
    if (!d) return '';
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? '' : dt.toISOString().slice(0, 10);
  }
}
