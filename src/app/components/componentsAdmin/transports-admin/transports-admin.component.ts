import { Component, OnInit } from '@angular/core';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

interface TransportRow {
  idTransport: number;
  name: string;
  logo: string;
  phone: string;
  email: string;
  deliveryFee: number;
  freeFrom: number | null;
  zones: string;
  active: boolean;
  createdAt: string | null;
}

@Component({
  selector: 'app-transports-admin',
  standalone: false,
  template: `
<app-breadcrumbs title="Transporteurs" [breadcrumbItems]="breadcrumbItems"></app-breadcrumbs>

<div class="row g-3 mb-4">
  <div class="col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid #299cdb">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-info-subtle d-flex align-items-center justify-content-center">
          <i class="ri-truck-line fs-22 text-info"></i>
        </div>
        <div><h3 class="mb-0 fw-bold text-info">{{ items.length }}</h3>
        <p class="mb-0 fs-12 text-muted">Total transporteurs</p></div>
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
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid #f7b84b">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-warning-subtle d-flex align-items-center justify-content-center">
          <i class="ri-money-dollar-circle-line fs-22 text-warning"></i>
        </div>
        <div><h3 class="mb-0 fw-bold text-warning">{{ avgFee | number:'1.2-2' }}</h3>
        <p class="mb-0 fs-12 text-muted">Frais moyen (TND)</p></div>
      </div>
    </div>
  </div>
  <div class="col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid #564ab1">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 d-flex align-items-center justify-content-center" style="background:#564ab120">
          <i class="ri-gift-line fs-22" style="color:#564ab1"></i>
        </div>
        <div><h3 class="mb-0 fw-bold" style="color:#564ab1">{{ withFreeShippingCount }}</h3>
        <p class="mb-0 fs-12 text-muted">Avec livraison gratuite</p></div>
      </div>
    </div>
  </div>
</div>

<div class="card border-0 shadow-sm">
  <div class="card-header bg-transparent d-flex flex-wrap align-items-center gap-2 py-3">
    <h6 class="mb-0 fw-semibold flex-grow-1">
      <i class="ri-truck-line me-2 text-info"></i>Liste des transporteurs
      <span class="badge bg-info-subtle text-info ms-2">{{ filtered.length }}</span>
    </h6>
    <div class="input-group input-group-sm" style="max-width:240px">
      <span class="input-group-text bg-white border-end-0"><i class="ri-search-line"></i></span>
      <input type="text" class="form-control border-start-0" placeholder="Nom, zones, téléphone…"
             [(ngModel)]="search" (input)="applyFilter()" />
    </div>
    <button class="btn btn-sm btn-info text-white" (click)="openAdd()">
      <i class="ri-add-line me-1"></i>Nouveau transporteur
    </button>
  </div>

  <div class="card-body p-0">
    @if (loading) {
      <div class="text-center py-5"><div class="spinner-border text-info"></div></div>
    } @else if (filtered.length === 0) {
      <div class="text-center py-5">
        <i class="ri-truck-line display-3 text-muted opacity-50"></i>
        <p class="text-muted mt-2 mb-3">Aucun transporteur.</p>
        <button class="btn btn-info text-white" (click)="openAdd()"><i class="ri-add-line"></i> Ajouter le premier</button>
      </div>
    } @else {
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-3" style="width:80px">Logo</th>
              <th>Transporteur</th>
              <th>Contact</th>
              <th class="text-end">Frais</th>
              <th class="text-end">Gratuit dès</th>
              <th>Zones</th>
              <th class="text-center">Statut</th>
              <th class="text-end pe-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (t of filtered; track t.idTransport) {
              <tr>
                <td class="ps-3">
                  @if (t.logo) {
                    <img [src]="t.logo" alt="" class="rounded" width="48" height="48"
                         style="object-fit:contain;background:#f5f7fb" (error)="t.logo=''" />
                  } @else {
                    <div class="rounded bg-info-subtle text-info d-flex align-items-center justify-content-center"
                         style="width:48px;height:48px">
                      <i class="ri-truck-line fs-20"></i>
                    </div>
                  }
                </td>
                <td>
                  <div class="fs-13 fw-semibold">{{ t.name }}</div>
                  @if (t.email) { <div class="fs-11 text-muted">{{ t.email }}</div> }
                </td>
                <td class="fs-12">
                  @if (t.phone) {
                    <div><i class="ri-phone-line text-muted me-1"></i>{{ t.phone }}</div>
                  } @else { <span class="text-muted">—</span> }
                </td>
                <td class="text-end fw-semibold">{{ t.deliveryFee | number:'1.2-2' }} TND</td>
                <td class="text-end fs-12">
                  @if (t.freeFrom && t.freeFrom > 0) {
                    <span class="badge bg-success-subtle text-success">{{ t.freeFrom | number:'1.0-0' }} TND</span>
                  } @else { <span class="text-muted">—</span> }
                </td>
                <td class="fs-12 text-muted text-truncate" style="max-width:180px">{{ t.zones || '—' }}</td>
                <td class="text-center">
                  @if (t.active) { <span class="badge bg-success-subtle text-success">Actif</span> }
                  @else          { <span class="badge bg-secondary-subtle text-secondary">Inactif</span> }
                </td>
                <td class="text-end pe-3">
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-light" (click)="openEdit(t)" title="Modifier">
                      <i class="ri-edit-2-line text-info"></i>
                    </button>
                    <button class="btn btn-light" (click)="toggle(t)" [title]="t.active ? 'Désactiver' : 'Activer'">
                      <i [class]="t.active ? 'ri-pause-circle-line text-warning' : 'ri-play-circle-line text-success'"></i>
                    </button>
                    <button class="btn btn-light" (click)="remove(t)" title="Supprimer">
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
        <div class="modal-header bg-info-subtle">
          <h5 class="modal-title fw-bold text-info">
            <i class="ri-truck-line me-2"></i>{{ editingId ? 'Modifier le transporteur' : 'Nouveau transporteur' }}
          </h5>
          <button type="button" class="btn-close" (click)="cancel()"></button>
        </div>
        <div class="modal-body">
          @if (saveError) {
            <div class="alert alert-danger fs-13"><i class="ri-error-warning-line me-2"></i>{{ saveError }}</div>
          }
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fs-12 fw-semibold">Nom *</label>
              <input class="form-control form-control-sm" [(ngModel)]="form.name" placeholder="Ex : Aramex Tunisie" />
            </div>
            <div class="col-md-6">
              <label class="form-label fs-12 fw-semibold">Téléphone</label>
              <input class="form-control form-control-sm" [(ngModel)]="form.phone" placeholder="+216 71 100 100" />
            </div>
            <div class="col-md-6">
              <label class="form-label fs-12 fw-semibold">Email</label>
              <input type="email" class="form-control form-control-sm" [(ngModel)]="form.email" />
            </div>
            <div class="col-md-6">
              <label class="form-label fs-12 fw-semibold">URL logo</label>
              <input class="form-control form-control-sm" [(ngModel)]="form.logo" placeholder="https://…" />
            </div>
            <div class="col-md-6">
              <label class="form-label fs-12 fw-semibold">Frais (TND) *</label>
              <input type="number" min="0" step="0.001" class="form-control form-control-sm" [(ngModel)]="form.deliveryFee" />
            </div>
            <div class="col-md-6">
              <label class="form-label fs-12 fw-semibold">Livraison gratuite dès (TND)</label>
              <input type="number" min="0" step="0.001" class="form-control form-control-sm" [(ngModel)]="form.freeFrom" />
            </div>
            <div class="col-12">
              <label class="form-label fs-12 fw-semibold">Zones desservies</label>
              <input class="form-control form-control-sm" [(ngModel)]="form.zones" placeholder="Ex : Grand Tunis, Sfax, Sousse" />
            </div>
            <div class="col-12">
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="transp-active" [(ngModel)]="form.active" />
                <label class="form-check-label fs-13" for="transp-active">Transporteur actif</label>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-light" (click)="cancel()" [disabled]="saving">Annuler</button>
          <button class="btn btn-info text-white" (click)="save()" [disabled]="saving">
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
export class TransportsAdminComponent implements OnInit {
  breadcrumbItems = [{ label: 'Admin' }, { label: 'Transporteurs', active: true }];

  items: TransportRow[]    = [];
  filtered: TransportRow[] = [];
  search = '';
  loading = true;

  showForm = false;
  saving   = false;
  saveError = '';
  editingId: number | null = null;
  form = { name: '', phone: '', email: '', logo: '', deliveryFee: 0, freeFrom: 0, zones: '', active: true };

  get activeCount(): number { return this.items.filter(t => t.active).length; }
  get withFreeShippingCount(): number { return this.items.filter(t => (t.freeFrom || 0) > 0).length; }
  get avgFee(): number {
    return this.items.length ? this.items.reduce((s, t) => s + (+t.deliveryFee || 0), 0) / this.items.length : 0;
  }

  constructor(private api: TijaraApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.getTransports().subscribe({
      next: (r: any[]) => {
        this.items = (r || []).map((t: any) => ({
          idTransport: +(t.id_transport ?? t.idTransport ?? t.IdTransport ?? 0),
          name:         t.name          ?? t.Name          ?? '',
          logo:         t.logo          ?? t.Logo          ?? '',
          phone:        t.phone         ?? t.Phone         ?? '',
          email:        t.email         ?? t.Email         ?? '',
          deliveryFee: +(t.delivery_fee ?? t.deliveryFee  ?? t.DeliveryFee ?? 0),
          freeFrom:    (t.free_from     ?? t.freeFrom     ?? t.FreeFrom    ?? null) as number | null,
          zones:        t.zones         ?? t.Zones         ?? '',
          active:    !!(t.active        ?? t.Active        ?? true),
          createdAt:    t.created_at    ?? t.CreatedAt    ?? null,
        }));
        this.applyFilter();
        this.loading = false;
      },
      error: () => { this.items = []; this.loading = false; alert('Chargement impossible.'); }
    });
  }

  applyFilter(): void {
    const s = this.search.trim().toLowerCase();
    this.filtered = this.items.filter(t =>
      !s || `${t.name} ${t.zones} ${t.phone} ${t.email}`.toLowerCase().includes(s));
  }

  openAdd(): void {
    this.editingId = null; this.saveError = '';
    this.form = { name: '', phone: '', email: '', logo: '', deliveryFee: 0, freeFrom: 0, zones: '', active: true };
    this.showForm = true;
  }
  openEdit(t: TransportRow): void {
    this.editingId = t.idTransport; this.saveError = '';
    this.form = {
      name: t.name, phone: t.phone, email: t.email, logo: t.logo,
      deliveryFee: t.deliveryFee, freeFrom: t.freeFrom || 0, zones: t.zones, active: t.active,
    };
    this.showForm = true;
  }
  cancel(_ev?: Event): void { this.showForm = false; this.saving = false; this.saveError = ''; }

  save(): void {
    if (!this.form.name?.trim()) { this.saveError = 'Le nom est requis.'; return; }
    this.saving = true; this.saveError = '';
    const payload = {
      Name: this.form.name, Phone: this.form.phone, Email: this.form.email, Logo: this.form.logo,
      DeliveryFee: +this.form.deliveryFee || 0,
      FreeFrom: this.form.freeFrom > 0 ? +this.form.freeFrom : null,
      Zones: this.form.zones, Active: this.form.active,
    };
    const op = this.editingId
      ? this.api.updateTransport(this.editingId, payload)
      : this.api.createTransport(payload);
    op.subscribe({
      next: () => { this.saving = false; this.showForm = false; this.load(); },
      error: (err) => { this.saving = false; this.saveError = err?.error?.message || 'Erreur d\'enregistrement.'; },
    });
  }

  toggle(t: TransportRow): void {
    this.api.toggleTransport(t.idTransport).subscribe({
      next: () => { t.active = !t.active; this.applyFilter(); },
      error: () => alert('Action impossible.'),
    });
  }
  remove(t: TransportRow): void {
    if (!confirm(`Supprimer le transporteur "${t.name}" ?`)) return;
    this.api.deleteTransport(t.idTransport).subscribe({
      next: () => { this.items = this.items.filter(x => x.idTransport !== t.idTransport); this.applyFilter(); },
      error: () => alert('Suppression impossible (peut-être référencé par des livraisons).'),
    });
  }
}
