import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

interface DeliveryRow {
  idDelivery: number;
  idOrder: number;
  clientName: string;
  clientEmail: string;
  dealTitle: string;
  idTransport: number | null;
  transportName: string;
  trackingNumber: string;
  status: string;
  addressLine: string;
  city: string;
  postalCode: string;
  phone: string;
  deliveryFee: number;
  createdAt: string | null;
}

interface TransportOpt { id: number; name: string; fee: number; }

@Component({
  selector: 'app-deliveries-admin',
  standalone: false,
  template: `
<app-breadcrumbs title="Livraisons" [breadcrumbItems]="breadcrumbItems"></app-breadcrumbs>

<div class="row g-3 mb-4">
  <div class="col-6 col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid #564ab1">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3" style="background:#564ab120">
          <i class="ri-truck-line fs-22 d-flex align-items-center justify-content-center w-100 h-100" style="color:#564ab1"></i>
        </div>
        <div><h3 class="mb-0 fw-bold" style="color:#564ab1">{{ items.length }}</h3>
        <p class="mb-0 fs-12 text-muted">Total livraisons</p></div>
      </div>
    </div>
  </div>
  <div class="col-6 col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid #f7b84b">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-warning-subtle d-flex align-items-center justify-content-center">
          <i class="ri-archive-line fs-22 text-warning"></i>
        </div>
        <div><h3 class="mb-0 fw-bold text-warning">{{ countOf('pending') + countOf('preparing') }}</h3>
        <p class="mb-0 fs-12 text-muted">À préparer</p></div>
      </div>
    </div>
  </div>
  <div class="col-6 col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid #299cdb">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-info-subtle d-flex align-items-center justify-content-center">
          <i class="ri-send-plane-line fs-22 text-info"></i>
        </div>
        <div><h3 class="mb-0 fw-bold text-info">{{ countOf('shipped') }}</h3>
        <p class="mb-0 fs-12 text-muted">En transit</p></div>
      </div>
    </div>
  </div>
  <div class="col-6 col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid #0ab39c">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-success-subtle d-flex align-items-center justify-content-center">
          <i class="ri-check-double-line fs-22 text-success"></i>
        </div>
        <div><h3 class="mb-0 fw-bold text-success">{{ countOf('delivered') }}</h3>
        <p class="mb-0 fs-12 text-muted">Livrées</p></div>
      </div>
    </div>
  </div>
</div>

<div class="card border-0 shadow-sm">
  <div class="card-header bg-transparent d-flex flex-wrap align-items-center gap-2 py-3">
    <h6 class="mb-0 fw-semibold flex-grow-1">
      <i class="ri-truck-line me-2" style="color:#564ab1"></i>Toutes les livraisons
      <span class="badge bg-primary-subtle text-primary ms-2">{{ filtered.length }}</span>
    </h6>
    <div class="input-group input-group-sm" style="max-width:240px">
      <span class="input-group-text bg-white border-end-0"><i class="ri-search-line"></i></span>
      <input type="text" class="form-control border-start-0" placeholder="Commande, client, tracking…"
             [(ngModel)]="search" (input)="applyFilter()" />
    </div>
    <select class="form-select form-select-sm" style="max-width:160px"
            [(ngModel)]="filter" (change)="applyFilter()">
      <option value="">Tous les statuts</option>
      <option value="pending">En attente</option>
      <option value="preparing">Préparation</option>
      <option value="shipped">Expédiée</option>
      <option value="delivered">Livrée</option>
      <option value="cancelled">Annulée</option>
    </select>
  </div>

  <div class="card-body p-0">
    @if (loading) {
      <div class="text-center py-5"><div class="spinner-border text-primary"></div></div>
    } @else if (filtered.length === 0) {
      <div class="text-center py-5">
        <i class="ri-truck-line display-3 text-muted opacity-50"></i>
        <p class="text-muted mt-2 mb-0">Aucune livraison ne correspond.</p>
      </div>
    } @else {
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-3">Commande</th>
              <th>Client</th>
              <th>Transporteur / Tracking</th>
              <th>Adresse</th>
              <th class="text-end">Frais</th>
              <th class="text-center">Statut</th>
              <th class="text-end pe-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (d of filtered; track d.idDelivery) {
              <tr>
                <td class="ps-3">
                  <div class="fw-semibold text-primary fs-13">#{{ d.idOrder }}</div>
                  <div class="fs-11 text-muted">{{ formatDate(d.createdAt) }}</div>
                </td>
                <td>
                  <div class="fs-13 fw-semibold">{{ d.clientName || '—' }}</div>
                  @if (d.phone) { <div class="fs-11 text-muted"><i class="ri-phone-line"></i> {{ d.phone }}</div> }
                </td>
                <td>
                  @if (d.transportName) {
                    <div class="fs-13"><i class="ri-truck-line text-info me-1"></i>{{ d.transportName }}</div>
                  } @else {
                    <span class="badge bg-light text-muted fs-11">Non affecté</span>
                  }
                  @if (d.trackingNumber) {
                    <div class="fs-11 text-primary fw-semibold mt-1">{{ d.trackingNumber }}</div>
                  }
                </td>
                <td class="fs-12">
                  @if (d.addressLine) {
                    <div>{{ d.addressLine }}</div>
                    @if (d.city) { <div class="text-muted">{{ d.city }} {{ d.postalCode }}</div> }
                  } @else { <span class="text-muted">—</span> }
                </td>
                <td class="text-end fw-semibold fs-13">{{ d.deliveryFee | number:'1.2-2' }} TND</td>
                <td class="text-center">
                  <select class="form-select form-select-sm border-0"
                          [class]="'bg-' + statusColor(d.status) + '-subtle text-' + statusColor(d.status)"
                          [ngModel]="d.status" (ngModelChange)="changeStatus(d, $event)"
                          style="font-weight:600;min-width:130px">
                    <option value="pending">En attente</option>
                    <option value="preparing">Préparation</option>
                    <option value="shipped">Expédiée</option>
                    <option value="delivered">Livrée</option>
                    <option value="cancelled">Annulée</option>
                  </select>
                </td>
                <td class="text-end pe-3">
                  <button class="btn btn-sm btn-outline-primary rounded-pill" (click)="openEdit(d)">
                    <i class="ri-edit-2-line"></i> Gérer
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

<!-- Edit modal -->
@if (editing) {
  <div class="modal fade show d-block" tabindex="-1" style="background:rgba(0,0,0,.5)" (click)="closeEdit($event)">
    <div class="modal-dialog modal-lg modal-dialog-centered" (click)="$event.stopPropagation()">
      <div class="modal-content border-0 shadow-lg">
        <div class="modal-header bg-primary-subtle">
          <h5 class="modal-title fw-bold text-primary">
            <i class="ri-truck-line me-2"></i>Livraison de la commande #{{ editing.idOrder }}
          </h5>
          <button type="button" class="btn-close" (click)="closeEdit()"></button>
        </div>
        <div class="modal-body">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fs-12 fw-semibold">Transporteur</label>
              <select class="form-select form-select-sm" [(ngModel)]="form.idTransport" (change)="onTransportChange()">
                <option [ngValue]="null">— Aucun —</option>
                @for (t of transports; track t.id) {
                  <option [ngValue]="t.id">{{ t.name }} ({{ t.fee | number:'1.2-2' }} TND)</option>
                }
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label fs-12 fw-semibold">N° de tracking</label>
              <input type="text" class="form-control form-control-sm" [(ngModel)]="form.trackingNumber" />
            </div>
            <div class="col-md-8">
              <label class="form-label fs-12 fw-semibold">Adresse</label>
              <input type="text" class="form-control form-control-sm" [(ngModel)]="form.addressLine" />
            </div>
            <div class="col-md-4">
              <label class="form-label fs-12 fw-semibold">Téléphone</label>
              <input type="text" class="form-control form-control-sm" [(ngModel)]="form.phone" />
            </div>
            <div class="col-md-6">
              <label class="form-label fs-12 fw-semibold">Ville</label>
              <input type="text" class="form-control form-control-sm" [(ngModel)]="form.city" />
            </div>
            <div class="col-md-3">
              <label class="form-label fs-12 fw-semibold">Code postal</label>
              <input type="text" class="form-control form-control-sm" [(ngModel)]="form.postalCode" />
            </div>
            <div class="col-md-3">
              <label class="form-label fs-12 fw-semibold">Frais (TND)</label>
              <input type="number" min="0" step="0.001" class="form-control form-control-sm" [(ngModel)]="form.deliveryFee" />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-light" (click)="closeEdit()" [disabled]="saving">Annuler</button>
          <button class="btn btn-primary" (click)="saveEdit()" [disabled]="saving">
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
export class DeliveriesAdminComponent implements OnInit {
  breadcrumbItems = [{ label: 'Admin' }, { label: 'Livraisons', active: true }];

  items: DeliveryRow[]    = [];
  filtered: DeliveryRow[] = [];
  search = '';
  filter = '';
  loading = true;

  transports: TransportOpt[] = [];

  editing: DeliveryRow | null = null;
  saving = false;
  form = {
    idTransport: null as number | null,
    trackingNumber: '',
    addressLine: '',
    city: '',
    postalCode: '',
    phone: '',
    deliveryFee: 0,
  };

  constructor(private api: TijaraApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    forkJoin({
      deliveries: this.api.getDeliveries().pipe(catchError(() => of([] as any[]))),
      transports: this.api.getTransports(true).pipe(catchError(() => of([] as any[]))),
    }).subscribe(({ deliveries, transports }) => {
      this.transports = (transports || []).map((t: any) => ({
        id:   +(t.id_transport ?? t.idTransport ?? 0),
        name:  (t.name         ?? 'Transport'),
        fee:  +(t.delivery_fee ?? t.deliveryFee ?? 0),
      })).filter((t: TransportOpt) => t.id > 0);

      this.items = (deliveries || []).map((x: any) => ({
        idDelivery:    +(x.id_delivery     ?? x.idDelivery     ?? 0),
        idOrder:       +(x.id_order        ?? x.idOrder        ?? 0),
        clientName:     (x.client_name     ?? x.clientName     ?? ''),
        clientEmail:    (x.client_email    ?? x.clientEmail    ?? ''),
        dealTitle:      (x.deal_title      ?? x.dealTitle      ?? ''),
        idTransport:    (x.id_transport    ?? x.idTransport    ?? null),
        transportName:  (x.transport_name  ?? x.transportName  ?? ''),
        trackingNumber: (x.tracking_number ?? x.trackingNumber ?? ''),
        status:         (x.status          ?? 'pending'),
        addressLine:    (x.address_line    ?? x.addressLine    ?? ''),
        city:           (x.city            ?? ''),
        postalCode:     (x.postal_code     ?? x.postalCode     ?? ''),
        phone:          (x.phone           ?? ''),
        deliveryFee:   +(x.delivery_fee    ?? x.deliveryFee    ?? 0),
        createdAt:      (x.created_at      ?? x.createdAt      ?? null),
      })).sort((a: DeliveryRow, b: DeliveryRow) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

      this.applyFilter();
      this.loading = false;
    });
  }

  applyFilter(): void {
    const s = this.search.trim().toLowerCase();
    this.filtered = this.items.filter(d => {
      if (s && !`${d.idOrder} ${d.clientName} ${d.trackingNumber}`.toLowerCase().includes(s)) return false;
      if (this.filter && d.status !== this.filter) return false;
      return true;
    });
  }
  countOf(s: string): number { return this.items.filter(d => d.status === s).length; }

  changeStatus(d: DeliveryRow, newStatus: string): void {
    const old = d.status;
    d.status = newStatus;
    this.api.updateDeliveryStatus(d.idDelivery, newStatus).subscribe({
      next: () => this.applyFilter(),
      error: () => { d.status = old; alert('Mise à jour impossible.'); },
    });
  }

  openEdit(d: DeliveryRow): void {
    this.editing = d;
    this.form = {
      idTransport:    d.idTransport,
      trackingNumber: d.trackingNumber,
      addressLine:    d.addressLine,
      city:           d.city,
      postalCode:     d.postalCode,
      phone:          d.phone,
      deliveryFee:    d.deliveryFee,
    };
  }
  closeEdit(_ev?: Event): void { this.editing = null; this.saving = false; }
  onTransportChange(): void {
    const t = this.transports.find(x => x.id === this.form.idTransport);
    if (t && (!this.form.deliveryFee || this.form.deliveryFee === 0)) this.form.deliveryFee = t.fee;
  }
  saveEdit(): void {
    if (!this.editing) return;
    const d = this.editing;
    this.saving = true;
    this.api.updateDelivery(d.idDelivery, {
      id_transport:    this.form.idTransport,
      tracking_number: this.form.trackingNumber,
      address_line:    this.form.addressLine,
      city:            this.form.city,
      postal_code:     this.form.postalCode,
      phone:           this.form.phone,
      delivery_fee:    +this.form.deliveryFee || 0,
    }).subscribe({
      next: () => { this.saving = false; this.closeEdit(); this.load(); },
      error: (err) => { this.saving = false; alert('Enregistrement impossible : ' + (err?.error?.message || err?.message || '')); },
    });
  }

  formatDate(d: string | null): string {
    if (!d) return '—';
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? '—' : dt.toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' });
  }
  statusColor(s: string): string {
    return s === 'delivered' ? 'success' : s === 'shipped' ? 'info'
         : s === 'cancelled' ? 'danger'  : s === 'preparing' ? 'primary' : 'warning';
  }
}
