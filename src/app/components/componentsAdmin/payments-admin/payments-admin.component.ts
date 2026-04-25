import { Component, OnInit } from '@angular/core';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

@Component({
  selector: 'app-payments-admin',
  standalone: false,
  template: `
<app-breadcrumbs title="Paiements" [breadcrumbItems]="breadcrumbItems"></app-breadcrumbs>

<div class="row g-3 mb-4">
  <div class="col-md-4">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid var(--vz-success) !important">
      <div class="card-body d-flex align-items-center gap-3">
        <div class="avatar-md rounded-3 bg-success-subtle d-flex align-items-center justify-content-center">
          <i class="ri-money-dollar-circle-line fs-22 text-success"></i>
        </div>
        <div>
          <h3 class="mb-0 fw-bold text-success">{{ totalPaid | number:'1.2-2' }} TND</h3>
          <p class="mb-0 text-muted fs-13">Total encaissé</p>
        </div>
      </div>
    </div>
  </div>
  <div class="col-md-4">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid var(--vz-primary) !important">
      <div class="card-body d-flex align-items-center gap-3">
        <div class="avatar-md rounded-3 bg-primary-subtle d-flex align-items-center justify-content-center">
          <i class="ri-bank-card-line fs-22 text-primary"></i>
        </div>
        <div>
          <h3 class="mb-0 fw-bold text-primary">{{ items.length }}</h3>
          <p class="mb-0 text-muted fs-13">Transactions</p>
        </div>
      </div>
    </div>
  </div>
  <div class="col-md-4">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid var(--vz-danger) !important">
      <div class="card-body d-flex align-items-center gap-3">
        <div class="avatar-md rounded-3 bg-danger-subtle d-flex align-items-center justify-content-center">
          <i class="ri-refund-line fs-22 text-danger"></i>
        </div>
        <div>
          <h3 class="mb-0 fw-bold text-danger">{{ refundCount }}</h3>
          <p class="mb-0 text-muted fs-13">Remboursements</p>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="card border-0 shadow-sm">
  <div class="card-header bg-transparent d-flex flex-wrap align-items-center gap-2 py-3">
    <h6 class="mb-0 fw-semibold flex-grow-1"><i class="ri-bank-card-line me-2 text-primary"></i>Historique des paiements</h6>
    <div class="btn-group btn-group-sm">
      <button class="btn" [class.btn-primary]="filter===''"         [class.btn-light]="filter!==''"         (click)="setFilter('')">Tous</button>
      <button class="btn" [class.btn-primary]="filter==='paid'"     [class.btn-light]="filter!=='paid'"     (click)="setFilter('paid')">Payés</button>
      <button class="btn" [class.btn-primary]="filter==='pending'"  [class.btn-light]="filter!=='pending'"  (click)="setFilter('pending')">En attente</button>
      <button class="btn" [class.btn-primary]="filter==='refunded'" [class.btn-light]="filter!=='refunded'" (click)="setFilter('refunded')">Remboursés</button>
    </div>
  </div>
  <div class="card-body p-0">
    @if (loading) { <div class="text-center py-5"><div class="spinner-border text-primary"></div></div> }
    @else if (filtered.length === 0) { <div class="text-center py-5 text-muted">Aucun paiement.</div> }
    @else {
      <table class="table table-hover align-middle mb-0">
        <thead class="table-light">
          <tr>
            <th class="ps-3">Référence</th>
            <th>Client</th>
            <th>Commande</th>
            <th>Méthode</th>
            <th class="text-end">Montant</th>
            <th class="text-center">Statut</th>
            <th>Date</th>
            <th class="text-end pe-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          @for (p of filtered; track p.idPayment) {
            <tr>
              <td class="ps-3">
                <div class="fw-semibold text-primary fs-13">{{ p.reference }}</div>
                <div class="fs-11 text-muted">{{ p.transactionId }}</div>
              </td>
              <td class="fs-13">{{ p.userName }}<br><span class="fs-11 text-muted">{{ p.email }}</span></td>
              <td class="fs-13">{{ p.idOrder ? '#' + p.idOrder : '—' }}</td>
              <td class="fs-13">
                <span class="badge bg-info-subtle text-info">{{ methodLabel(p.method) }}</span>
              </td>
              <td class="text-end fw-bold text-success">{{ p.amount | number:'1.2-2' }} TND</td>
              <td class="text-center">
                <span class="badge rounded-pill" [class]="statusClass(p.status)">{{ statusLabel(p.status) }}</span>
              </td>
              <td class="fs-12 text-muted">{{ formatDate(p.createdAt) }}</td>
              <td class="text-end pe-3">
                @if (p.status === 'paid') {
                  <button class="btn btn-sm btn-outline-danger" (click)="refund(p)">
                    <i class="ri-refund-line"></i>
                  </button>
                }
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
export class PaymentsAdminComponent implements OnInit {
  breadcrumbItems = [{ label: 'Admin', active: false }, { label: 'Paiements', active: true }];

  items: any[] = [];
  filtered: any[] = [];
  loading = true;
  filter = '';

  get totalPaid(): number { return this.items.filter(p => p.status === 'paid').reduce((s, p) => s + (+p.amount || 0), 0); }
  get refundCount(): number { return this.items.filter(p => p.status === 'refunded').length; }

  constructor(private api: TijaraApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.getAllPayments().subscribe({
      next: (r: any[]) => {
        this.items = (r || []).map((p: any) => ({
          idPayment:     p.idPayment     ?? p.IdPayment,
          idOrder:       p.idOrder       ?? p.IdOrder,
          amount:        p.amount        ?? p.Amount,
          method:        p.method        ?? p.Method,
          status:        p.status        ?? p.Status,
          reference:     p.reference     ?? p.Reference,
          transactionId: p.transactionId ?? p.TransactionId,
          createdAt:     p.createdAt     ?? p.CreatedAt,
          email:         p.email         ?? p.Email,
          userName:      p.userName      ?? p.UserName,
        }));
        this.applyFilter();
        this.loading = false;
      },
      error: () => { this.items = []; this.filtered = []; this.loading = false; }
    });
  }

  setFilter(f: string): void { this.filter = f; this.applyFilter(); }
  applyFilter(): void { this.filtered = !this.filter ? [...this.items] : this.items.filter(p => p.status === this.filter); }

  refund(p: any): void {
    if (!confirm(`Rembourser ${p.amount} TND ?`)) return;
    this.api.refundPayment(p.idPayment).subscribe({ next: () => this.load() });
  }

  methodLabel(m: string): string {
    return m === 'card' ? 'Carte' : m === 'cod' ? 'À la livraison' : m === 'wallet' ? 'Portefeuille' : m;
  }
  statusLabel(s: string): string {
    return s === 'paid' ? 'Payé' : s === 'pending' ? 'En attente' : s === 'refunded' ? 'Remboursé' : s;
  }
  statusClass(s: string): string {
    return s === 'paid' ? 'bg-success-subtle text-success'
         : s === 'refunded' ? 'bg-danger-subtle text-danger'
         : 'bg-warning-subtle text-warning';
  }
  formatDate(d: string): string {
    if (!d) return '';
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? d : dt.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
  }
}
