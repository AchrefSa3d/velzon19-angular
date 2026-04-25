import { Component, OnInit } from '@angular/core';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

@Component({
  selector: 'app-deliveries-admin',
  standalone: false,
  template: `
<app-breadcrumbs title="Livraisons" [breadcrumbItems]="breadcrumbItems"></app-breadcrumbs>

<div class="row g-3 mb-4">
  @for (s of statsData; track s.key) {
    <div class="col-6 col-xl-3">
      <div class="card border-0 shadow-sm h-100" [style.border-left]="'4px solid var(--vz-' + s.color + ')'">
        <div class="card-body d-flex align-items-center gap-3">
          <div class="avatar-md rounded-3 d-flex align-items-center justify-content-center"
               [class]="'bg-' + s.color + '-subtle'">
            <i class="fs-22" [class]="s.icon + ' text-' + s.color"></i>
          </div>
          <div>
            <h3 class="mb-0 fw-bold" [class]="'text-' + s.color">{{ s.value }}</h3>
            <p class="mb-0 text-muted fs-13">{{ s.label }}</p>
          </div>
        </div>
      </div>
    </div>
  }
</div>

<div class="card border-0 shadow-sm">
  <div class="card-header bg-transparent d-flex flex-wrap align-items-center gap-2 py-3">
    <h6 class="mb-0 fw-semibold flex-grow-1"><i class="ri-truck-line me-2 text-primary"></i>Toutes les livraisons</h6>
    <div class="btn-group btn-group-sm">
      <button class="btn" [class.btn-primary]="filter===''" [class.btn-light]="filter!==''" (click)="setFilter('')">Toutes</button>
      <button class="btn" [class.btn-primary]="filter==='pending'"   [class.btn-light]="filter!=='pending'"   (click)="setFilter('pending')">En attente</button>
      <button class="btn" [class.btn-primary]="filter==='shipped'"   [class.btn-light]="filter!=='shipped'"   (click)="setFilter('shipped')">Expédiées</button>
      <button class="btn" [class.btn-primary]="filter==='delivered'" [class.btn-light]="filter!=='delivered'" (click)="setFilter('delivered')">Livrées</button>
    </div>
  </div>
  <div class="card-body p-0">
    @if (loading) { <div class="text-center py-5"><div class="spinner-border text-primary"></div></div> }
    @else if (items.length === 0) { <div class="text-center py-5 text-muted">Aucune livraison.</div> }
    @else {
      <table class="table table-hover align-middle mb-0">
        <thead class="table-light">
          <tr>
            <th class="ps-3">N° / Tracking</th>
            <th>Commande</th>
            <th>Transporteur</th>
            <th>Adresse</th>
            <th class="text-end">Frais</th>
            <th class="text-center">Statut</th>
            <th class="text-end pe-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          @for (d of items; track d.idDelivery) {
            <tr>
              <td class="ps-3">
                <div class="fw-semibold text-primary fs-13">#{{ d.idDelivery }}</div>
                <div class="fs-11 text-muted">{{ d.trackingNumber || '—' }}</div>
              </td>
              <td class="fs-13">#{{ d.idOrder }}</td>
              <td class="fs-13">{{ d.transportName || '—' }}</td>
              <td class="fs-12">
                <div>{{ d.addressLine }}</div>
                <div class="text-muted">{{ d.city }} {{ d.postalCode }}</div>
              </td>
              <td class="text-end fw-semibold">{{ d.deliveryFee }} TND</td>
              <td class="text-center">
                <select class="form-select form-select-sm" [ngModel]="d.status" (ngModelChange)="changeStatus(d, $event)">
                  <option value="pending">En attente</option>
                  <option value="preparing">Préparation</option>
                  <option value="shipped">Expédiée</option>
                  <option value="delivered">Livrée</option>
                  <option value="cancelled">Annulée</option>
                </select>
              </td>
              <td class="text-end pe-3">
                <button class="btn btn-sm btn-light" title="Voir"><i class="ri-eye-line"></i></button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    }
  </div>
</div>
`,
})
export class DeliveriesAdminComponent implements OnInit {
  breadcrumbItems = [{ label: 'Admin', active: false }, { label: 'Livraisons', active: true }];

  items: any[] = [];
  all: any[] = [];
  loading = true;
  filter = '';

  get statsData() {
    return [
      { key: 'total',     label: 'Total',      value: this.all.length,                             color: 'primary', icon: 'ri-truck-line' },
      { key: 'pending',   label: 'En attente', value: this.all.filter(d => d.status === 'pending').length,   color: 'warning', icon: 'ri-time-line' },
      { key: 'shipped',   label: 'Expédiées',  value: this.all.filter(d => d.status === 'shipped').length,   color: 'info',    icon: 'ri-send-plane-line' },
      { key: 'delivered', label: 'Livrées',    value: this.all.filter(d => d.status === 'delivered').length, color: 'success', icon: 'ri-check-double-line' },
    ];
  }

  constructor(private api: TijaraApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.getDeliveries().subscribe({
      next: (r: any[]) => {
        this.all = (r || []).map(x => ({
          idDelivery:     x.idDelivery     ?? x.IdDelivery,
          idOrder:        x.idOrder        ?? x.IdOrder,
          idTransport:    x.idTransport    ?? x.IdTransport,
          transportName:  x.transportName  ?? x.TransportName,
          trackingNumber: x.trackingNumber ?? x.TrackingNumber,
          status:         (x.status ?? x.Status ?? 'pending'),
          addressLine:    x.addressLine ?? x.AddressLine,
          city:           x.city        ?? x.City,
          postalCode:     x.postalCode  ?? x.PostalCode,
          phone:          x.phone       ?? x.Phone,
          deliveryFee:    x.deliveryFee ?? x.DeliveryFee ?? 0,
        }));
        this.applyFilter();
        this.loading = false;
      },
      error: () => { this.all = []; this.items = []; this.loading = false; }
    });
  }

  setFilter(f: string): void { this.filter = f; this.applyFilter(); }
  applyFilter(): void {
    this.items = !this.filter ? [...this.all] : this.all.filter(d => d.status === this.filter);
  }

  changeStatus(d: any, status: string): void {
    this.api.updateDeliveryStatus(d.idDelivery, status).subscribe({
      next: () => { d.status = status; this.applyFilter(); }
    });
  }
}
