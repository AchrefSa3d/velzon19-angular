import { Component, OnInit } from '@angular/core';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

interface CategoryRow {
  id: number;
  nameFr: string;
  nameEn: string;
  nameAr: string;
  description: string;
  image: string;
  active: boolean;
}

@Component({
  selector: 'app-categories-admin',
  standalone: false,
  template: `
<app-breadcrumbs title="Catégories" [breadcrumbItems]="breadCrumbItems"></app-breadcrumbs>

<div class="row g-3 mb-4">
  <div class="col-6 col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid #405189">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-primary-subtle d-flex align-items-center justify-content-center">
          <i class="ri-folder-3-line fs-22 text-primary"></i>
        </div>
        <div><h3 class="mb-0 fw-bold text-primary">{{ items.length }}</h3>
        <p class="mb-0 fs-12 text-muted">Total catégories</p></div>
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
        <p class="mb-0 fs-12 text-muted">Actives</p></div>
      </div>
    </div>
  </div>
  <div class="col-6 col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid #f06548">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-danger-subtle d-flex align-items-center justify-content-center">
          <i class="ri-close-circle-line fs-22 text-danger"></i>
        </div>
        <div><h3 class="mb-0 fw-bold text-danger">{{ items.length - activeCount }}</h3>
        <p class="mb-0 fs-12 text-muted">Désactivées</p></div>
      </div>
    </div>
  </div>
  <div class="col-6 col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid #f7b84b">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-warning-subtle d-flex align-items-center justify-content-center">
          <i class="ri-image-2-line fs-22 text-warning"></i>
        </div>
        <div><h3 class="mb-0 fw-bold text-warning">{{ withImageCount }}</h3>
        <p class="mb-0 fs-12 text-muted">Avec image</p></div>
      </div>
    </div>
  </div>
</div>

<div class="card border-0 shadow-sm">
  <div class="card-header bg-transparent d-flex flex-wrap align-items-center gap-2 py-3">
    <h6 class="mb-0 fw-semibold flex-grow-1">
      <i class="ri-folder-3-line me-2 text-primary"></i>Liste des catégories
      <span class="badge bg-primary-subtle text-primary ms-2">{{ filtered.length }}</span>
    </h6>
    <div class="input-group input-group-sm" style="max-width:240px">
      <span class="input-group-text bg-white border-end-0"><i class="ri-search-line"></i></span>
      <input type="text" class="form-control border-start-0" placeholder="Nom (FR/EN/AR)…"
             [(ngModel)]="search" (input)="applyFilter()" />
    </div>
    <button class="btn btn-sm btn-primary" (click)="openAdd()">
      <i class="ri-add-line me-1"></i>Nouvelle catégorie
    </button>
  </div>

  <div class="card-body p-0">
    @if (loading) {
      <div class="text-center py-5"><div class="spinner-border text-primary"></div></div>
    } @else if (filtered.length === 0) {
      <div class="text-center py-5">
        <i class="ri-folder-line display-3 text-muted opacity-50"></i>
        <p class="text-muted mt-2 mb-3">Aucune catégorie.</p>
        <button class="btn btn-primary" (click)="openAdd()"><i class="ri-add-line"></i> Créer la première</button>
      </div>
    } @else {
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-3" style="width:80px">Image</th>
              <th>Nom (FR)</th>
              <th>Nom (EN)</th>
              <th>Nom (AR)</th>
              <th class="text-center">Statut</th>
              <th class="text-end pe-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (c of filtered; track c.id) {
              <tr>
                <td class="ps-3">
                  @if (c.image) {
                    <img [src]="c.image" alt="" class="rounded" width="48" height="48"
                         style="object-fit:cover" (error)="c.image=''" />
                  } @else {
                    <div class="rounded bg-primary-subtle text-primary
                                d-flex align-items-center justify-content-center"
                         style="width:48px;height:48px">
                      <i class="ri-folder-3-line fs-20"></i>
                    </div>
                  }
                </td>
                <td class="fs-13 fw-semibold">{{ c.nameFr || '—' }}</td>
                <td class="fs-12 text-muted">{{ c.nameEn || '—' }}</td>
                <td class="fs-12 text-muted" dir="rtl">{{ c.nameAr || '—' }}</td>
                <td class="text-center">
                  @if (c.active) {
                    <span class="badge bg-success-subtle text-success">Active</span>
                  } @else {
                    <span class="badge bg-secondary-subtle text-secondary">Inactive</span>
                  }
                </td>
                <td class="text-end pe-3">
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-light" (click)="openEdit(c)" title="Modifier">
                      <i class="ri-edit-2-line text-info"></i>
                    </button>
                    <button class="btn btn-light" (click)="toggleActive(c)" [title]="c.active ? 'Désactiver' : 'Activer'">
                      <i [class]="c.active ? 'ri-pause-circle-line text-warning' : 'ri-play-circle-line text-success'"></i>
                    </button>
                    <button class="btn btn-light" (click)="remove(c)" title="Supprimer">
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

<!-- Modal -->
@if (showForm) {
  <div class="modal fade show d-block" tabindex="-1" style="background:rgba(0,0,0,.5)" (click)="cancel($event)">
    <div class="modal-dialog modal-lg modal-dialog-centered" (click)="$event.stopPropagation()">
      <div class="modal-content border-0 shadow-lg">
        <div class="modal-header bg-primary-subtle">
          <h5 class="modal-title fw-bold text-primary">
            <i class="ri-folder-3-line me-2"></i>
            {{ editingId ? 'Modifier la catégorie' : 'Nouvelle catégorie' }}
          </h5>
          <button type="button" class="btn-close" (click)="cancel()"></button>
        </div>
        <div class="modal-body">
          @if (saveError) {
            <div class="alert alert-danger fs-13"><i class="ri-error-warning-line me-2"></i>{{ saveError }}</div>
          }
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label fs-12 fw-semibold">Nom (FR) *</label>
              <input class="form-control form-control-sm" [(ngModel)]="form.nameFr" />
            </div>
            <div class="col-md-4">
              <label class="form-label fs-12 fw-semibold">Nom (EN)</label>
              <input class="form-control form-control-sm" [(ngModel)]="form.nameEn" />
            </div>
            <div class="col-md-4">
              <label class="form-label fs-12 fw-semibold">Nom (AR)</label>
              <input class="form-control form-control-sm" [(ngModel)]="form.nameAr" dir="rtl" />
            </div>
            <div class="col-12">
              <label class="form-label fs-12 fw-semibold">Description</label>
              <textarea class="form-control form-control-sm" rows="2" [(ngModel)]="form.description"></textarea>
            </div>
            <div class="col-md-9">
              <label class="form-label fs-12 fw-semibold">URL de l'image</label>
              <input class="form-control form-control-sm" [(ngModel)]="form.image" placeholder="https://…" />
            </div>
            <div class="col-md-3 d-flex align-items-end">
              @if (form.image) {
                <img [src]="form.image" alt="" class="rounded" width="60" height="60"
                     style="object-fit:cover" (error)="$any($event.target).src=''" />
              }
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-light" (click)="cancel()" [disabled]="saving">Annuler</button>
          <button class="btn btn-primary" (click)="save()" [disabled]="saving">
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
export class CategoriesAdminComponent implements OnInit {
  breadCrumbItems = [{ label: 'Admin' }, { label: 'Catégories', active: true }];

  items: CategoryRow[]    = [];
  filtered: CategoryRow[] = [];
  search = '';
  loading = true;

  showForm = false;
  saving   = false;
  saveError = '';
  editingId: number | null = null;
  form = { nameFr: '', nameEn: '', nameAr: '', description: '', image: '' };

  get activeCount(): number     { return this.items.filter(c => c.active).length; }
  get withImageCount(): number  { return this.items.filter(c => !!c.image).length; }

  constructor(private api: TijaraApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    const handle = (data: any[]) => {
      this.items = (data || []).map((c: any) => ({
        id:         +(c.id ?? c.id_categ ?? c.IdCateg ?? 0),
        nameFr:      c.name_fr ?? c.name ?? c.title_fr ?? c.TitleFr ?? '',
        nameEn:      c.name_en ?? c.title_en ?? c.TitleEn ?? '',
        nameAr:      c.name_ar ?? c.title_ar ?? c.TitleAr ?? '',
        description: c.description ?? '',
        image:       c.image ?? '',
        active:     !!(c.active ?? c.Active ?? true),
      }));
      this.applyFilter();
      this.loading = false;
    };
    this.api.getCategoriesAdmin().subscribe({
      next: handle,
      error: () => this.api.getCategories().subscribe({ next: handle, error: () => this.loading = false })
    });
  }

  applyFilter(): void {
    const s = this.search.trim().toLowerCase();
    this.filtered = this.items.filter(c =>
      !s || `${c.nameFr} ${c.nameEn} ${c.nameAr}`.toLowerCase().includes(s));
  }

  openAdd(): void {
    this.editingId = null; this.saveError = '';
    this.form = { nameFr: '', nameEn: '', nameAr: '', description: '', image: '' };
    this.showForm = true;
  }
  openEdit(c: CategoryRow): void {
    this.editingId = c.id; this.saveError = '';
    this.form = { nameFr: c.nameFr, nameEn: c.nameEn, nameAr: c.nameAr, description: c.description, image: c.image };
    this.showForm = true;
  }
  cancel(_ev?: Event): void { this.showForm = false; this.saving = false; this.saveError = ''; }

  save(): void {
    if (!this.form.nameFr.trim()) { this.saveError = 'Le nom (FR) est requis.'; return; }
    this.saving = true; this.saveError = '';
    const payload = {
      name_fr: this.form.nameFr,
      name_en: this.form.nameEn || this.form.nameFr,
      name_ar: this.form.nameAr,
      description: this.form.description,
      image: this.form.image,
    };
    const op = this.editingId
      ? this.api.updateCategory(this.editingId, payload)
      : this.api.createCategory(payload);
    op.subscribe({
      next: () => { this.saving = false; this.showForm = false; this.load(); },
      error: (err) => { this.saving = false; this.saveError = err?.error?.message || 'Erreur d\'enregistrement.'; },
    });
  }

  toggleActive(c: CategoryRow): void {
    this.api.toggleCategory(c.id).subscribe({
      next: (res: any) => { c.active = res?.active ?? !c.active; this.applyFilter(); }
    });
  }

  remove(c: CategoryRow): void {
    if (!confirm(`Supprimer la catégorie "${c.nameFr}" ?`)) return;
    this.api.deleteCategory(c.id).subscribe({
      next: () => { this.items = this.items.filter(x => x.id !== c.id); this.applyFilter(); },
      error: () => alert('Suppression impossible (catégorie peut-être référencée).'),
    });
  }
}
