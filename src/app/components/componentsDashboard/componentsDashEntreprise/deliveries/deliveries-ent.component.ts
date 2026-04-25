import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

interface DeliveryRow {
  idDelivery: number | null;
  idOrder: number;
  clientName: string;
  clientEmail: string;
  dealTitle: string;
  dealPrice: number;
  idTransport: number | null;
  transportName: string;
  trackingNumber: string;
  status: string;
  addressLine: string;
  city: string;
  postalCode: string;
  phone: string;
  deliveryFee: number;
  note: string;
  createdAt: string | null;
  virtual: boolean;
}

interface TransportOpt { id: number; name: string; fee: number; }

@Component({
  selector: 'app-deliveries-ent',
  standalone: false,
  template: `
<app-breadcrumbs title="Livraisons" [breadcrumbItems]="breadcrumbItems"></app-breadcrumbs>

<!-- ═════ KPI ═════ -->
<div class="row g-3 mb-4">
  <div class="col-6 col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid var(--vz-primary)">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-primary-subtle d-flex align-items-center justify-content-center">
          <i class="ri-truck-line fs-22 text-primary"></i>
        </div>
        <div>
          <h3 class="mb-0 fw-bold text-primary">{{ items.length }}</h3>
          <p class="mb-0 fs-12 text-muted">Total livraisons</p>
        </div>
      </div>
    </div>
  </div>
  <div class="col-6 col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid var(--vz-warning)">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-warning-subtle d-flex align-items-center justify-content-center">
          <i class="ri-archive-line fs-22 text-warning"></i>
        </div>
        <div>
          <h3 class="mb-0 fw-bold text-warning">{{ preparingCount }}</h3>
          <p class="mb-0 fs-12 text-muted">À préparer</p>
        </div>
      </div>
    </div>
  </div>
  <div class="col-6 col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid var(--vz-info)">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-info-subtle d-flex align-items-center justify-content-center">
          <i class="ri-send-plane-line fs-22 text-info"></i>
        </div>
        <div>
          <h3 class="mb-0 fw-bold text-info">{{ shippedCount }}</h3>
          <p class="mb-0 fs-12 text-muted">En transit</p>
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
          <h3 class="mb-0 fw-bold text-success">{{ deliveredCount }}</h3>
          <p class="mb-0 fs-12 text-muted">Livrées</p>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ═════ Toolbar ═════ -->
<div class="card border-0 shadow-sm">
  <div class="card-header bg-transparent d-flex flex-wrap align-items-center gap-2 py-3">
    <h6 class="mb-0 fw-semibold flex-grow-1">
      <i class="ri-truck-line me-2 text-primary"></i>Mes livraisons
      <span class="badge bg-primary-subtle text-primary ms-2">{{ filtered.length }}</span>
    </h6>
    <div class="input-group input-group-sm" style="max-width:240px">
      <span class="input-group-text bg-white border-end-0"><i class="ri-search-line"></i></span>
      <input type="text" class="form-control border-start-0"
             placeholder="Commande, client ou tracking…"
             [(ngModel)]="search" (input)="applyFilter()" />
    </div>
    <div class="btn-group btn-group-sm">
      <button class="btn" [class.btn-primary]="filter===''"          [class.btn-light]="filter!==''"          (click)="setFilter('')">Toutes</button>
      <button class="btn" [class.btn-primary]="filter==='pending'"   [class.btn-light]="filter!=='pending'"   (click)="setFilter('pending')">En attente</button>
      <button class="btn" [class.btn-primary]="filter==='preparing'" [class.btn-light]="filter!=='preparing'" (click)="setFilter('preparing')">Préparation</button>
      <button class="btn" [class.btn-primary]="filter==='shipped'"   [class.btn-light]="filter!=='shipped'"   (click)="setFilter('shipped')">Expédiées</button>
      <button class="btn" [class.btn-primary]="filter==='delivered'" [class.btn-light]="filter!=='delivered'" (click)="setFilter('delivered')">Livrées</button>
    </div>
  </div>

  <div class="card-body p-0">
    @if (loading) {
      <div class="text-center py-5"><div class="spinner-border text-primary"></div>
        <p class="text-muted mt-2 mb-0 fs-13">Chargement…</p>
      </div>
    }
    @else if (filtered.length === 0 && items.length === 0) {
      <div class="text-center py-5">
        <i class="ri-truck-line display-3 text-muted opacity-50 d-block"></i>
        <h5 class="mt-3 mb-1">Aucune livraison pour le moment</h5>
        <p class="text-muted mb-3">Dès qu'un client passera commande, elle apparaîtra ici.</p>
        <a routerLink="/ent/products" class="btn btn-primary">
          <i class="ri-store-2-line me-1"></i>Gérer mes produits
        </a>
      </div>
    }
    @else if (filtered.length === 0) {
      <div class="text-center py-5">
        <i class="ri-search-line display-5 text-muted opacity-50"></i>
        <p class="text-muted mt-2">Aucune livraison ne correspond à ces filtres.</p>
      </div>
    }
    @else {
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
            @for (d of filtered; track $index) {
              <tr>
                <td class="ps-3">
                  <div class="fw-semibold text-primary fs-13">#{{ d.idOrder }}</div>
                  <div class="fs-11 text-muted">{{ formatDate(d.createdAt) }}</div>
                  @if (d.dealTitle) {
                    <div class="fs-11 text-muted text-truncate" style="max-width:160px">{{ d.dealTitle }}</div>
                  }
                </td>
                <td>
                  <div class="fs-13 fw-semibold">{{ d.clientName || '—' }}</div>
                  @if (d.clientEmail) { <div class="fs-11 text-muted">{{ d.clientEmail }}</div> }
                  @if (d.phone)       { <div class="fs-11 text-muted"><i class="ri-phone-line"></i> {{ d.phone }}</div> }
                </td>
                <td>
                  @if (d.transportName) {
                    <div class="fs-13"><i class="ri-truck-line text-info me-1"></i>{{ d.transportName }}</div>
                  } @else {
                    <span class="badge bg-light text-muted fs-11">Non affecté</span>
                  }
                  @if (d.trackingNumber) {
                    <div class="fs-11 text-primary fw-semibold mt-1">
                      <i class="ri-barcode-line"></i> {{ d.trackingNumber }}
                    </div>
                  }
                </td>
                <td class="fs-12">
                  @if (d.addressLine) {
                    <div>{{ d.addressLine }}</div>
                    @if (d.city || d.postalCode) {
                      <div class="text-muted">{{ d.city }} {{ d.postalCode }}</div>
                    }
                  } @else {
                    <span class="text-muted">—</span>
                  }
                </td>
                <td class="text-end fw-semibold fs-13">
                  @if (d.deliveryFee > 0) {
                    {{ d.deliveryFee | number:'1.2-2' }} TND
                  } @else {
                    <span class="text-muted fs-11">Gratuit</span>
                  }
                </td>
                <td class="text-center">
                  <select class="form-select form-select-sm"
                          [ngModel]="d.status"
                          (ngModelChange)="changeStatus(d, $event)"
                          [class]="'border-0 bg-' + statusColor(d.status) + '-subtle text-' + statusColor(d.status)"
                          style="font-weight:600;min-width:130px"
                          [disabled]="savingId === d.idOrder">
                    <option value="pending">En attente</option>
                    <option value="preparing">Préparation</option>
                    <option value="shipped">Expédiée</option>
                    <option value="delivered">Livrée</option>
                    <option value="cancelled">Annulée</option>
                  </select>
                </td>
                <td class="text-end pe-3">
                  <button class="btn btn-sm btn-outline-primary rounded-pill" (click)="openEdit(d)" title="Modifier">
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

<!-- ═════ Modal édition ═════ -->
@if (editing) {
  <div class="modal fade show d-block" tabindex="-1" style="background:rgba(0,0,0,.5)" (click)="closeEdit($event)">
    <div class="modal-dialog modal-lg modal-dialog-centered" (click)="$event.stopPropagation()">
      <div class="modal-content border-0 shadow-lg">
        <div class="modal-header bg-primary-subtle">
          <h5 class="modal-title fw-bold text-primary">
            <i class="ri-truck-line me-2"></i>
            Livraison de la commande #{{ editing.idOrder }}
          </h5>
          <button type="button" class="btn-close" (click)="closeEdit()"></button>
        </div>
        <div class="modal-body">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fs-12 fw-semibold">Transporteur</label>
              <select class="form-select form-select-sm" [(ngModel)]="form.idTransport"
                      (change)="onTransportChange()">
                <option [ngValue]="null">— Aucun —</option>
                @for (t of transports; track t.id) {
                  <option [ngValue]="t.id">{{ t.name }} ({{ t.fee | number:'1.2-2' }} TND)</option>
                }
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label fs-12 fw-semibold">N° de tracking</label>
              <input type="text" class="form-control form-control-sm"
                     [(ngModel)]="form.trackingNumber" placeholder="ex : ARX-123456789" />
            </div>
            <div class="col-md-8">
              <label class="form-label fs-12 fw-semibold">Adresse de livraison</label>
              <input type="text" class="form-control form-control-sm"
                     [(ngModel)]="form.addressLine" placeholder="Rue, immeuble…" />
            </div>
            <div class="col-md-4">
              <label class="form-label fs-12 fw-semibold">Téléphone client</label>
              <input type="text" class="form-control form-control-sm"
                     [(ngModel)]="form.phone" placeholder="+216 …" />
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
              <input type="number" min="0" step="0.001" class="form-control form-control-sm"
                     [(ngModel)]="form.deliveryFee" />
            </div>
            <div class="col-12">
              <label class="form-label fs-12 fw-semibold">Note interne</label>
              <textarea class="form-control form-control-sm" rows="2"
                        [(ngModel)]="form.note" placeholder="Instructions, créneau…"></textarea>
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
export class DeliveriesEntComponent implements OnInit {
  breadcrumbItems = [{ label: 'Vendor', active: false }, { label: 'Livraisons', active: true }];

  items: DeliveryRow[] = [];
  filtered: DeliveryRow[] = [];
  search = '';
  filter = '';
  loading = true;
  savingId: number | null = null;

  transports: TransportOpt[] = [];

  // Modal state
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
    note: '',
  };

  get preparingCount(): number { return this.items.filter(d => d.status === 'preparing' || d.status === 'pending').length; }
  get shippedCount(): number   { return this.items.filter(d => d.status === 'shipped').length; }
  get deliveredCount(): number { return this.items.filter(d => d.status === 'delivered').length; }

  constructor(private api: TijaraApiService) {}

  ngOnInit(): void { this.load(); }

  // ─── Load ─────────────────────────────────────────────────────
  load(): void {
    this.loading = true;
    forkJoin({
      deliveries: this.api.getDeliveries().pipe(catchError(() => of([] as any[]))),
      orders:     this.api.getOrders().pipe(catchError(() => of([] as any[]))),
      transports: this.api.getTransports(true).pipe(catchError(() => of([] as any[]))),
    }).subscribe(({ deliveries, orders, transports }) => {
      // Transports
      this.transports = (transports || []).map((t: any) => ({
        id:   +(t.id_transport ?? t.idTransport ?? t.IdTransport ?? 0),
        name:  (t.name         ?? t.Name        ?? 'Transport'),
        fee:  +(t.delivery_fee ?? t.deliveryFee ?? t.DeliveryFee ?? 0),
      })).filter((t: TransportOpt) => t.id > 0);

      // Real deliveries
      const ds: DeliveryRow[] = (deliveries || []).map((x: any) => this.mapDelivery(x));

      // Virtual (orders without delivery)
      const covered = new Set(ds.map(d => d.idOrder));
      const virtuals: DeliveryRow[] = (orders || [])
        .filter((o: any) => !covered.has(+o.id))
        .map((o: any) => ({
          idDelivery:     null,
          idOrder:        +o.id,
          clientName:     o.client_name || `${o.first_name || ''} ${o.last_name || ''}`.trim(),
          clientEmail:    o.client_email || o.email || '',
          dealTitle:      o.deal_title || '',
          dealPrice:      +(o.total_amount || 0),
          idTransport:    null,
          transportName:  '',
          trackingNumber: '',
          status:         this.mapOrder(o.status),
          addressLine:    o.shipping_address || o.address || '',
          city:           o.city || '',
          postalCode:     o.postal_code || '',
          phone:          o.phone || '',
          deliveryFee:    +(o.delivery_fee || 0),
          note:           '',
          createdAt:      o.created_at || null,
          virtual:        true,
        }));

      this.items = [...ds, ...virtuals]
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      this.applyFilter();
      this.loading = false;
    });
  }

  private mapDelivery(x: any): DeliveryRow {
    return {
      idDelivery:     +(x.id_delivery     ?? x.idDelivery     ?? x.IdDelivery     ?? 0) || null,
      idOrder:        +(x.id_order        ?? x.idOrder        ?? x.IdOrder        ?? 0),
      clientName:      (x.client_name     ?? x.clientName     ?? x.ClientName     ?? ''),
      clientEmail:     (x.client_email    ?? x.clientEmail    ?? x.ClientEmail    ?? ''),
      dealTitle:       (x.deal_title      ?? x.dealTitle      ?? x.DealTitle      ?? ''),
      dealPrice:      +(x.deal_price      ?? x.dealPrice      ?? x.DealPrice      ?? 0),
      idTransport:    (x.id_transport    ?? x.idTransport    ?? x.IdTransport    ?? null) as number | null,
      transportName:   (x.transport_name  ?? x.transportName  ?? x.TransportName  ?? ''),
      trackingNumber:  (x.tracking_number ?? x.trackingNumber ?? x.TrackingNumber ?? ''),
      status:          (x.status          ?? x.Status         ?? 'pending'),
      addressLine:     (x.address_line    ?? x.addressLine    ?? x.AddressLine    ?? ''),
      city:            (x.city            ?? x.City           ?? ''),
      postalCode:      (x.postal_code     ?? x.postalCode     ?? x.PostalCode     ?? ''),
      phone:           (x.phone           ?? x.Phone          ?? ''),
      deliveryFee:    +(x.delivery_fee    ?? x.deliveryFee    ?? x.DeliveryFee    ?? 0),
      note:            (x.note            ?? x.Note           ?? ''),
      createdAt:       (x.created_at      ?? x.createdAt      ?? x.CreatedAt      ?? null),
      virtual:         false,
    };
  }

  // ─── Filter ───────────────────────────────────────────────────
  applyFilter(): void {
    const s = this.search.trim().toLowerCase();
    this.filtered = this.items.filter(d => {
      if (s && !`${d.idOrder} ${d.clientName} ${d.trackingNumber}`.toLowerCase().includes(s)) return false;
      if (this.filter && d.status !== this.filter) return false;
      return true;
    });
  }
  setFilter(f: string): void { this.filter = f; this.applyFilter(); }

  // ─── Status change (auto-create if virtual) ───────────────────
  changeStatus(d: DeliveryRow, newStatus: string): void {
    this.savingId = d.idOrder;

    const finalize = (id: number) => {
      this.api.updateDeliveryStatus(id, newStatus).subscribe({
        next: () => {
          d.status = newStatus;
          d.idDelivery = id;
          d.virtual = false;
          this.savingId = null;
          this.applyFilter();
        },
        error: (err) => {
          this.savingId = null;
          alert('Mise à jour du statut impossible : ' + this.errMsg(err));
        }
      });
    };

    if (d.virtual || !d.idDelivery) {
      // Auto-create then update status
      this.api.createDelivery({
        id_order:     d.idOrder,
        status:       newStatus,
        address_line: d.addressLine,
        city:         d.city,
        postal_code:  d.postalCode,
        phone:        d.phone,
        delivery_fee: d.deliveryFee,
      }).subscribe({
        next: (res: any) => {
          const id = +(res?.id_delivery ?? res?.idDelivery ?? 0);
          if (id > 0) {
            d.idDelivery = id;
            d.virtual = false;
            d.status = newStatus;
            this.savingId = null;
            this.applyFilter();
          } else {
            this.savingId = null;
            alert('Création de la livraison impossible.');
          }
        },
        error: (err) => {
          this.savingId = null;
          alert('Création impossible : ' + this.errMsg(err));
        }
      });
    } else {
      finalize(d.idDelivery);
    }
  }

  // ─── Edit modal ───────────────────────────────────────────────
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
      note:           d.note,
    };
  }
  closeEdit(ev?: Event): void {
    if (ev && (ev.target as HTMLElement).classList.contains('modal')) { /* ok */ }
    this.editing = null;
    this.saving = false;
  }
  onTransportChange(): void {
    const t = this.transports.find(x => x.id === this.form.idTransport);
    if (t && (!this.form.deliveryFee || this.form.deliveryFee === 0)) {
      this.form.deliveryFee = t.fee;
    }
  }
  saveEdit(): void {
    if (!this.editing) return;
    const d = this.editing;
    this.saving = true;

    const payload: any = {
      id_order:        d.idOrder,
      status:          d.status,
      id_transport:    this.form.idTransport,
      tracking_number: this.form.trackingNumber,
      address_line:    this.form.addressLine,
      city:            this.form.city,
      postal_code:     this.form.postalCode,
      phone:           this.form.phone,
      delivery_fee:    +this.form.deliveryFee || 0,
      note:            this.form.note,
    };

    const after = () => { this.saving = false; this.closeEdit(); this.load(); };
    const onErr = (err: any) => { this.saving = false; alert('Enregistrement impossible : ' + this.errMsg(err)); };

    if (d.virtual || !d.idDelivery) {
      this.api.createDelivery(payload).subscribe({ next: after, error: onErr });
    } else {
      this.api.updateDelivery(d.idDelivery, payload).subscribe({ next: after, error: onErr });
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────
  formatDate(d: string | null): string {
    if (!d) return '—';
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? '—' : dt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  private mapOrder(s: string): string {
    return ({ pending:'pending', confirmed:'preparing', shipped:'shipped', delivered:'delivered', cancelled:'cancelled' } as any)[s] || 'pending';
  }
  statusColor(s: string): string {
    return s === 'delivered' ? 'success' : s === 'shipped' ? 'info' : s === 'cancelled' ? 'danger' : s === 'preparing' ? 'primary' : 'warning';
  }
  private errMsg(err: any): string {
    return err?.error?.message || err?.message || `HTTP ${err?.status || '?'}`;
  }
}
