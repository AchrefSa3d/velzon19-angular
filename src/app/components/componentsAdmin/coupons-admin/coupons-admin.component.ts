import { Component, OnInit } from '@angular/core';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

interface CouponRow {
  id: number;
  title: string;
  description: string;
  price: number;
  dateStart: string;
  dateEnd: string;
  numberOfCoupon: number;
  used: number;
  active: boolean;
}

@Component({
  selector: 'app-coupons-admin',
  standalone: false,
  template: `
<app-breadcrumbs title="Coupons" [breadcrumbItems]="breadCrumbItems"></app-breadcrumbs>

<div class="row g-3 mb-4">
  <div class="col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid #f06548">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-danger-subtle d-flex align-items-center justify-content-center">
          <i class="ri-coupon-2-line fs-22 text-danger"></i>
        </div>
        <div><h3 class="mb-0 fw-bold text-danger">{{ items.length }}</h3>
        <p class="mb-0 fs-12 text-muted">Total coupons</p></div>
      </div>
    </div>
  </div>
  <div class="col-md-3">
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
  <div class="col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid #299cdb">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-info-subtle d-flex align-items-center justify-content-center">
          <i class="ri-bar-chart-line fs-22 text-info"></i>
        </div>
        <div><h3 class="mb-0 fw-bold text-info">{{ totalUsed }}</h3>
        <p class="mb-0 fs-12 text-muted">Utilisations</p></div>
      </div>
    </div>
  </div>
  <div class="col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid #f7b84b">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-warning-subtle d-flex align-items-center justify-content-center">
          <i class="ri-time-line fs-22 text-warning"></i>
        </div>
        <div><h3 class="mb-0 fw-bold text-warning">{{ expiredCount }}</h3>
        <p class="mb-0 fs-12 text-muted">Expirés</p></div>
      </div>
    </div>
  </div>
</div>

<div class="card border-0 shadow-sm">
  <div class="card-header bg-transparent d-flex flex-wrap align-items-center gap-2 py-3">
    <h6 class="mb-0 fw-semibold flex-grow-1">
      <i class="ri-coupon-2-line me-2 text-danger"></i>Liste des coupons
      <span class="badge bg-danger-subtle text-danger ms-2">{{ filtered.length }}</span>
    </h6>
    <div class="input-group input-group-sm" style="max-width:240px">
      <span class="input-group-text bg-white border-end-0"><i class="ri-search-line"></i></span>
      <input type="text" class="form-control border-start-0" placeholder="Titre, description…"
             [(ngModel)]="search" (input)="applyFilter()" />
    </div>
    <button class="btn btn-sm btn-danger" (click)="openAdd()">
      <i class="ri-add-line me-1"></i>Nouveau coupon
    </button>
  </div>

  <div class="card-body p-0">
    @if (loading) { <div class="text-center py-5"><div class="spinner-border text-danger"></div></div> }
    @else if (filtered.length === 0) {
      <div class="text-center py-5">
        <i class="ri-coupon-line display-3 text-muted opacity-50"></i>
        <p class="text-muted mt-2 mb-3">Aucun coupon.</p>
        <button class="btn btn-danger" (click)="openAdd()"><i class="ri-add-line"></i> Créer le premier</button>
      </div>
    } @else {
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-3">Titre</th>
              <th class="text-end">Prix</th>
              <th class="text-center">Stock / Utilisés</th>
              <th>Validité</th>
              <th class="text-center">Statut</th>
              <th class="text-end pe-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (c of filtered; track c.id) {
              <tr>
                <td class="ps-3">
                  <div class="fs-13 fw-semibold">{{ c.title || '—' }}</div>
                  <div class="fs-11 text-muted text-truncate" style="max-width:280px">{{ c.description || '' }}</div>
                </td>
                <td class="text-end fw-semibold text-success">{{ c.price | number:'1.2-2' }} TND</td>
                <td class="text-center">
                  <div class="d-flex flex-column align-items-center gap-1">
                    <span class="fs-12 fw-semibold">{{ c.used }} / {{ c.numberOfCoupon || '∞' }}</span>
                    @if (c.numberOfCoupon > 0) {
                      <div class="progress" style="height:5px;width:80px">
                        <div class="progress-bar bg-success" [style.width.%]="usagePercent(c)"></div>
                      </div>
                    }
                  </div>
                </td>
                <td class="fs-12">
                  <div>Du {{ formatDate(c.dateStart) }}</div>
                  <div class="text-muted">au {{ formatDate(c.dateEnd) }}</div>
                </td>
                <td class="text-center">
                  @if (isExpired(c)) { <span class="badge bg-warning-subtle text-warning">Expiré</span> }
                  @else if (c.active) { <span class="badge bg-success-subtle text-success">Actif</span> }
                  @else { <span class="badge bg-secondary-subtle text-secondary">Inactif</span> }
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

@if (showForm) {
  <div class="modal fade show d-block" tabindex="-1" style="background:rgba(0,0,0,.5)" (click)="cancel($event)">
    <div class="modal-dialog modal-lg modal-dialog-centered" (click)="$event.stopPropagation()">
      <div class="modal-content border-0 shadow-lg">
        <div class="modal-header bg-danger-subtle">
          <h5 class="modal-title fw-bold text-danger">
            <i class="ri-coupon-2-line me-2"></i>{{ editingId ? 'Modifier le coupon' : 'Nouveau coupon' }}
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
              <input class="form-control form-control-sm" [(ngModel)]="form.title" placeholder="Ex : Coupon -20%" />
            </div>
            <div class="col-md-4">
              <label class="form-label fs-12 fw-semibold">Prix (TND)</label>
              <input type="number" min="0" step="0.01" class="form-control form-control-sm" [(ngModel)]="form.price" />
            </div>
            <div class="col-12">
              <label class="form-label fs-12 fw-semibold">Description</label>
              <textarea class="form-control form-control-sm" rows="2" [(ngModel)]="form.description"></textarea>
            </div>
            <div class="col-md-4">
              <label class="form-label fs-12 fw-semibold">Date début</label>
              <input type="date" class="form-control form-control-sm" [(ngModel)]="form.dateStart" />
            </div>
            <div class="col-md-4">
              <label class="form-label fs-12 fw-semibold">Date fin</label>
              <input type="date" class="form-control form-control-sm" [(ngModel)]="form.dateEnd" />
            </div>
            <div class="col-md-4">
              <label class="form-label fs-12 fw-semibold">Nombre total</label>
              <input type="number" min="0" class="form-control form-control-sm" [(ngModel)]="form.numberOfCoupon" />
            </div>
            <div class="col-12">
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="coupon-active" [(ngModel)]="form.active" />
                <label class="form-check-label fs-13" for="coupon-active">Actif</label>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-light" (click)="cancel()" [disabled]="saving">Annuler</button>
          <button class="btn btn-danger" (click)="save()" [disabled]="saving">
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
export class CouponsAdminComponent implements OnInit {
  breadCrumbItems = [{ label: 'Admin' }, { label: 'Coupons', active: true }];

  items: CouponRow[]    = [];
  filtered: CouponRow[] = [];
  search = '';
  loading = true;

  showForm = false;
  saving   = false;
  saveError = '';
  editingId: number | null = null;
  form = { title: '', description: '', price: 0, dateStart: '', dateEnd: '', numberOfCoupon: 0, active: true };

  get activeCount(): number  { return this.items.filter(c => c.active && !this.isExpired(c)).length; }
  get expiredCount(): number { return this.items.filter(c => this.isExpired(c)).length; }
  get totalUsed(): number    { return this.items.reduce((s, c) => s + (+c.used || 0), 0); }

  constructor(private api: TijaraApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.adminList('coupons').subscribe({
      next: (data: any[]) => {
        this.items = (data || []).map((c: any) => ({
          id:             +(c.id_coupon ?? c.IdCoupon ?? c.id ?? 0),
          title:           c.title         ?? c.Title         ?? '',
          description:     c.description   ?? c.Description   ?? '',
          price:          +(c.price        ?? c.Price        ?? 0),
          dateStart:       this.toDateInput(c.date_start ?? c.DateStart),
          dateEnd:         this.toDateInput(c.date_end   ?? c.DateEnd),
          numberOfCoupon:+(c.number_of_coupon ?? c.NumberOfCoupon ?? 0),
          used:           +(c.used         ?? c.Used         ?? 0),
          active:       !!(c.active        ?? c.Active        ?? true),
        }));
        this.applyFilter();
        this.loading = false;
      },
      error: () => { this.loading = false; alert('Chargement impossible.'); }
    });
  }

  applyFilter(): void {
    const s = this.search.trim().toLowerCase();
    this.filtered = this.items.filter(c => !s || `${c.title} ${c.description}`.toLowerCase().includes(s));
  }

  isExpired(c: CouponRow): boolean {
    if (!c.dateEnd) return false;
    const dt = new Date(c.dateEnd);
    return !isNaN(dt.getTime()) && dt < new Date();
  }
  usagePercent(c: CouponRow): number {
    return c.numberOfCoupon > 0 ? Math.min(100, Math.round((c.used / c.numberOfCoupon) * 100)) : 0;
  }

  openAdd(): void {
    this.editingId = null; this.saveError = '';
    this.form = { title: '', description: '', price: 0, dateStart: '', dateEnd: '', numberOfCoupon: 0, active: true };
    this.showForm = true;
  }
  openEdit(c: CouponRow): void {
    this.editingId = c.id; this.saveError = '';
    this.form = { title: c.title, description: c.description, price: c.price,
      dateStart: c.dateStart, dateEnd: c.dateEnd, numberOfCoupon: c.numberOfCoupon, active: c.active };
    this.showForm = true;
  }
  cancel(_ev?: Event): void { this.showForm = false; this.saving = false; this.saveError = ''; }

  save(): void {
    if (!this.form.title.trim()) { this.saveError = 'Le titre est requis.'; return; }
    this.saving = true; this.saveError = '';
    const payload = {
      Title: this.form.title, Description: this.form.description, Price: +this.form.price || 0,
      DateStart: this.form.dateStart || null, DateEnd: this.form.dateEnd || null,
      NumberOfCoupon: +this.form.numberOfCoupon || 0, Used: 0, Active: this.form.active,
    };
    const op = this.editingId
      ? this.api.adminUpdate('coupons', this.editingId, payload)
      : this.api.adminCreate('coupons', payload);
    op.subscribe({
      next: () => { this.saving = false; this.showForm = false; this.load(); },
      error: (err) => { this.saving = false; this.saveError = err?.error?.message || 'Erreur d\'enregistrement.'; },
    });
  }

  toggleActive(c: CouponRow): void {
    this.api.adminUpdate('coupons', c.id, {
      Title: c.title, Description: c.description, Price: c.price,
      DateStart: c.dateStart || null, DateEnd: c.dateEnd || null,
      NumberOfCoupon: c.numberOfCoupon, Used: c.used, Active: !c.active,
    }).subscribe({
      next: () => { c.active = !c.active; this.applyFilter(); },
      error: () => alert('Action impossible.'),
    });
  }
  remove(c: CouponRow): void {
    if (!confirm(`Supprimer le coupon "${c.title}" ?`)) return;
    this.api.adminDelete('coupons', c.id).subscribe({
      next: () => { this.items = this.items.filter(x => x.id !== c.id); this.applyFilter(); },
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
