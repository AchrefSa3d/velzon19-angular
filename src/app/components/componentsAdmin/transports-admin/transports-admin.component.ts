import { Component, OnInit } from '@angular/core';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

@Component({
  selector: 'app-transports-admin',
  standalone: false,
  template: `
<app-breadcrumbs title="Transporteurs" [breadcrumbItems]="breadcrumbItems"></app-breadcrumbs>

<div class="card border-0 shadow-sm">
  <div class="card-header bg-transparent d-flex align-items-center gap-3 py-3">
    <h6 class="mb-0 fw-semibold flex-grow-1">
      <i class="ri-truck-line me-2 text-primary"></i>Transporteurs
      <span class="badge bg-primary-subtle text-primary ms-2">{{ items.length }}</span>
    </h6>
    <button class="btn btn-sm btn-primary rounded-pill px-3" (click)="openForm()">
      <i class="ri-add-line me-1"></i>Nouveau transporteur
    </button>
  </div>
  <div class="card-body p-0">
    @if (loading) { <div class="text-center py-5"><div class="spinner-border text-primary"></div></div> }
    @else if (items.length === 0) { <div class="text-center py-5 text-muted">Aucun transporteur.</div> }
    @else {
      <table class="table table-hover align-middle mb-0">
        <thead class="table-light">
          <tr>
            <th class="ps-3">Nom</th>
            <th>Téléphone</th>
            <th class="text-end">Frais (TND)</th>
            <th class="text-end">Gratuit dès (TND)</th>
            <th>Zones</th>
            <th class="text-center">Statut</th>
            <th class="text-end pe-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          @for (t of items; track t.idTransport) {
            <tr>
              <td class="ps-3">
                <div class="fw-semibold fs-13">{{ t.name }}</div>
                <div class="fs-11 text-muted">{{ t.email || '—' }}</div>
              </td>
              <td class="fs-13">{{ t.phone || '—' }}</td>
              <td class="text-end fw-semibold">{{ t.deliveryFee }}</td>
              <td class="text-end">{{ t.freeFrom || '—' }}</td>
              <td class="fs-12 text-muted">{{ t.zones || '—' }}</td>
              <td class="text-center">
                <span class="badge rounded-pill"
                      [class.bg-success-subtle]="t.active" [class.text-success]="t.active"
                      [class.bg-danger-subtle]="!t.active" [class.text-danger]="!t.active">
                  {{ t.active ? 'Actif' : 'Inactif' }}
                </span>
              </td>
              <td class="text-end pe-3">
                <button class="btn btn-sm btn-light" (click)="edit(t)"><i class="ri-edit-line"></i></button>
                <button class="btn btn-sm btn-light ms-1" (click)="toggle(t)"><i class="ri-toggle-line"></i></button>
                <button class="btn btn-sm btn-light ms-1" (click)="remove(t)"><i class="ri-delete-bin-line text-danger"></i></button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    }
  </div>
</div>

@if (showForm) {
  <div class="modal fade show d-block" style="background:rgba(0,0,0,.5)" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content border-0 shadow-lg">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">{{ editing ? 'Modifier' : 'Nouveau' }} transporteur</h5>
          <button class="btn-close btn-close-white" (click)="showForm=false"></button>
        </div>
        <div class="modal-body">
          <div class="row g-3">
            <div class="col-md-6"><label class="form-label">Nom *</label><input class="form-control" [(ngModel)]="form.name"></div>
            <div class="col-md-6"><label class="form-label">Téléphone</label><input class="form-control" [(ngModel)]="form.phone"></div>
            <div class="col-md-6"><label class="form-label">Email</label><input class="form-control" [(ngModel)]="form.email"></div>
            <div class="col-md-6"><label class="form-label">Logo URL</label><input class="form-control" [(ngModel)]="form.logo"></div>
            <div class="col-md-6"><label class="form-label">Frais (TND) *</label><input type="number" class="form-control" [(ngModel)]="form.deliveryFee"></div>
            <div class="col-md-6"><label class="form-label">Livraison gratuite dès (TND)</label><input type="number" class="form-control" [(ngModel)]="form.freeFrom"></div>
            <div class="col-12"><label class="form-label">Zones desservies</label><input class="form-control" [(ngModel)]="form.zones"></div>
            <div class="col-12"><div class="form-check form-switch"><input type="checkbox" class="form-check-input" [(ngModel)]="form.active"><label class="form-check-label ms-2">Transporteur actif</label></div></div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-light" (click)="showForm=false">Annuler</button>
          <button class="btn btn-primary" (click)="submit()">{{ editing ? 'Enregistrer' : 'Créer' }}</button>
        </div>
      </div>
    </div>
  </div>
}
`,
})
export class TransportsAdminComponent implements OnInit {
  breadcrumbItems = [{ label: 'Admin', active: false }, { label: 'Transporteurs', active: true }];

  items: any[] = [];
  loading = true;
  showForm = false;
  editing: any = null;
  form: any = {};

  constructor(private api: TijaraApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.getTransports().subscribe({
      next: (r: any[]) => {
        this.items = (r || []).map((t: any) => ({
          idTransport: t.idTransport ?? t.IdTransport,
          name:        t.name        ?? t.Name,
          logo:        t.logo        ?? t.Logo,
          phone:       t.phone       ?? t.Phone,
          email:       t.email       ?? t.Email,
          deliveryFee: t.deliveryFee ?? t.DeliveryFee,
          freeFrom:    t.freeFrom    ?? t.FreeFrom,
          zones:       t.zones       ?? t.Zones,
          active:      !!(t.active   ?? t.Active),
        }));
        this.loading = false;
      },
      error: () => { this.items = []; this.loading = false; }
    });
  }

  openForm(): void {
    this.editing = null;
    this.form = { name: '', deliveryFee: 0, active: true };
    this.showForm = true;
  }

  edit(t: any): void { this.editing = t; this.form = { ...t }; this.showForm = true; }

  submit(): void {
    if (!this.form.name?.trim()) { alert('Nom requis'); return; }
    const call = this.editing
      ? this.api.updateTransport(this.editing.idTransport, this.form)
      : this.api.createTransport(this.form);
    call.subscribe({ next: () => { this.showForm = false; this.load(); } });
  }

  toggle(t: any): void { this.api.toggleTransport(t.idTransport).subscribe({ next: () => this.load() }); }
  remove(t: any): void {
    if (!confirm(`Supprimer "${t.name}" ?`)) return;
    this.api.deleteTransport(t.idTransport).subscribe({ next: () => this.load() });
  }
}
