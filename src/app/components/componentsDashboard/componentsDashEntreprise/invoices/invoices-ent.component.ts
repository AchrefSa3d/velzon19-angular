import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

interface InvoiceRow {
  idInvoice: number | null;
  number: string;
  idOrder: number;
  clientName: string;
  clientEmail?: string;
  dealTitle?: string;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  status: string;
  issuedAt: string | null;
  virtual: boolean;
}

@Component({
  selector: 'app-invoices-ent',
  standalone: false,
  template: `
<app-breadcrumbs title="Factures" [breadcrumbItems]="breadcrumbItems"></app-breadcrumbs>

<!-- ═════ KPI ═════ -->
<div class="row g-3 mb-4">
  <div class="col-6 col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid var(--vz-primary)">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-primary-subtle d-flex align-items-center justify-content-center">
          <i class="ri-file-text-line fs-22 text-primary"></i>
        </div>
        <div>
          <h3 class="mb-0 fw-bold text-primary">{{ items.length }}</h3>
          <p class="mb-0 fs-12 text-muted">Total factures</p>
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
          <h3 class="mb-0 fw-bold text-success">{{ paidTotal | number:'1.0-0' }}</h3>
          <p class="mb-0 fs-12 text-muted">Encaissé (TND)</p>
        </div>
      </div>
    </div>
  </div>
  <div class="col-6 col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid var(--vz-warning)">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-warning-subtle d-flex align-items-center justify-content-center">
          <i class="ri-time-line fs-22 text-warning"></i>
        </div>
        <div>
          <h3 class="mb-0 fw-bold text-warning">{{ pendingTotal | number:'1.0-0' }}</h3>
          <p class="mb-0 fs-12 text-muted">En attente (TND)</p>
        </div>
      </div>
    </div>
  </div>
  <div class="col-6 col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid var(--vz-info)">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-info-subtle d-flex align-items-center justify-content-center">
          <i class="ri-money-dollar-circle-line fs-22 text-info"></i>
        </div>
        <div>
          <h3 class="mb-0 fw-bold text-info">{{ grandTotal | number:'1.0-0' }}</h3>
          <p class="mb-0 fs-12 text-muted">Chiffre d'affaires (TND)</p>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ═════ Toolbar ═════ -->
<div class="card border-0 shadow-sm">
  <div class="card-header bg-transparent d-flex flex-wrap align-items-center gap-2 py-3">
    <h6 class="mb-0 fw-semibold flex-grow-1">
      <i class="ri-file-text-line me-2 text-primary"></i>Factures émises
      <span class="badge bg-primary-subtle text-primary ms-2">{{ filtered.length }}</span>
    </h6>
    <div class="input-group input-group-sm" style="max-width:240px">
      <span class="input-group-text bg-white border-end-0"><i class="ri-search-line"></i></span>
      <input type="text" class="form-control border-start-0"
             placeholder="N° facture, commande ou client…"
             [(ngModel)]="search" (input)="applyFilter()" />
    </div>
    <select class="form-select form-select-sm" style="max-width:160px"
            [(ngModel)]="statusFilter" (change)="applyFilter()">
      <option value="">Tous les statuts</option>
      <option value="paid">Payées</option>
      <option value="issued">Émises</option>
      <option value="pending">En attente</option>
      <option value="cancelled">Annulées</option>
    </select>
    <button class="btn btn-sm btn-light" (click)="exportCSV()" title="Exporter CSV">
      <i class="ri-file-excel-2-line text-success me-1"></i>Export
    </button>
  </div>

  <div class="card-body p-0">
    @if (loading) {
      <div class="text-center py-5"><div class="spinner-border text-primary"></div>
        <p class="text-muted mt-2 mb-0 fs-13">Chargement…</p>
      </div>
    }
    @else if (filtered.length === 0 && items.length === 0) {
      <div class="text-center py-5">
        <i class="ri-file-list-line display-3 text-muted opacity-50 d-block"></i>
        <h5 class="mt-3 mb-1">Aucune facture émise</h5>
        <p class="text-muted mb-3">Les factures s'affichent ici dès qu'un client paie une de vos commandes.</p>
        <a routerLink="/ent/orders" class="btn btn-primary">
          <i class="ri-file-list-3-line me-1"></i>Voir mes commandes
        </a>
      </div>
    }
    @else if (filtered.length === 0) {
      <div class="text-center py-5">
        <i class="ri-search-line display-5 text-muted opacity-50"></i>
        <p class="text-muted mt-2">Aucun résultat avec ces filtres.</p>
      </div>
    }
    @else {
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-3">N° Facture</th>
              <th>Commande</th>
              <th>Client</th>
              <th>Date</th>
              <th class="text-end">Sous-total</th>
              <th class="text-end">TVA</th>
              <th class="text-end">Total</th>
              <th class="text-center">Statut</th>
              <th class="text-end pe-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (i of filtered; track i.idOrder) {
              <tr>
                <td class="ps-3">
                  <div class="fw-semibold text-primary fs-13">{{ i.number }}</div>
                  @if (i.virtual) {
                    <span class="badge bg-warning-subtle text-warning fs-10">À émettre</span>
                  }
                </td>
                <td class="fs-13">#{{ i.idOrder }}</td>
                <td class="fs-13">{{ i.clientName || '—' }}</td>
                <td class="fs-12 text-muted">{{ formatDate(i.issuedAt) }}</td>
                <td class="text-end fs-13">{{ i.subtotal | number:'1.2-2' }}</td>
                <td class="text-end fs-12 text-muted">{{ i.tax | number:'1.2-2' }}</td>
                <td class="text-end fw-bold text-success">{{ i.total | number:'1.2-2' }} TND</td>
                <td class="text-center">
                  <span class="badge rounded-pill" [class]="statusClass(i.status)">{{ statusLabel(i.status) }}</span>
                </td>
                <td class="text-end pe-3">
                  @if (i.virtual) {
                    <button class="btn btn-sm btn-outline-primary rounded-pill" (click)="generate(i)"
                            [disabled]="generatingId === i.idOrder">
                      @if (generatingId === i.idOrder) { <span class="spinner-border spinner-border-sm me-1"></span> }
                      @else { <i class="ri-file-add-line me-1"></i> }
                      Générer
                    </button>
                  } @else {
                    <button class="btn btn-sm btn-light" (click)="print(i)" title="Imprimer">
                      <i class="ri-printer-line text-primary"></i>
                    </button>
                    @if (i.status !== 'paid' && i.status !== 'cancelled') {
                      <button class="btn btn-sm btn-light ms-1" (click)="markPaid(i)" title="Marquer payée">
                        <i class="ri-check-line text-success"></i>
                      </button>
                    }
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  </div>
</div>
`,
})
export class InvoicesEntComponent implements OnInit {
  breadcrumbItems = [{ label: 'Vendor', active: false }, { label: 'Factures', active: true }];

  items: InvoiceRow[] = [];
  filtered: InvoiceRow[] = [];
  search = '';
  statusFilter = '';
  loading = true;
  generatingId: number | null = null;

  get paidTotal(): number    { return this.items.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0); }
  get pendingTotal(): number { return this.items.filter(i => i.status !== 'paid' && i.status !== 'cancelled').reduce((s, i) => s + i.total, 0); }
  get grandTotal(): number   { return this.items.filter(i => i.status !== 'cancelled').reduce((s, i) => s + i.total, 0); }

  constructor(private api: TijaraApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    forkJoin({
      invoices: this.api.getInvoices().pipe(catchError(() => of([] as any[]))),
      orders:   this.api.getOrders().pipe(catchError(() => of([] as any[]))),
    }).subscribe(({ invoices, orders }) => {
      const invs: InvoiceRow[] = (invoices || []).map((i: any) => {
        const idInv = i.idInvoice ?? i.IdInvoice ?? i.id_invoice ?? null;
        return {
          idInvoice:   idInv,
          number:      i.number       ?? i.Number ?? `FAC-${idInv ?? ''}`,
          idOrder:     +(i.idOrder    ?? i.IdOrder    ?? i.id_order    ?? 0),
          clientName:  i.clientName   ?? i.ClientName ?? i.client_name ?? '',
          clientEmail: i.clientEmail  ?? i.ClientEmail ?? i.client_email ?? '',
          dealTitle:   i.dealTitle    ?? i.DealTitle   ?? i.deal_title  ?? '',
          subtotal:    +(i.subtotal   ?? i.Subtotal   ?? 0),
          tax:         +(i.tax        ?? i.Tax        ?? 0),
          deliveryFee: +(i.deliveryFee?? i.DeliveryFee?? i.delivery_fee?? 0),
          total:       +(i.total      ?? i.Total      ?? 0),
          status:      i.status       ?? i.Status     ?? 'issued',
          issuedAt:    i.issuedAt     ?? i.IssuedAt   ?? i.issued_at   ?? null,
          virtual:     false,
        };
      });

      const covered = new Set(invs.map(i => i.idOrder));
      const virtuals: InvoiceRow[] = (orders || [])
        .filter((o: any) => !covered.has(+o.id))
        .map((o: any) => {
          const subtotal = +(o.total_amount || o.totalAmount || 0);
          const tax = +(subtotal * 0.07).toFixed(3);
          return {
            idInvoice:   null,
            number:      `PRÉ-${String(o.id).padStart(4, '0')}`,
            idOrder:     +o.id,
            clientName:  o.client_name || `${o.first_name || ''} ${o.last_name || ''}`.trim(),
            subtotal, tax, deliveryFee: 0,
            total:       +(subtotal + tax).toFixed(3),
            status:      o.status === 'cancelled' ? 'cancelled' : 'pending',
            issuedAt:    o.created_at || null,
            virtual:     true,
          };
        });

      this.items = [...invs, ...virtuals]
        .sort((a, b) => new Date(b.issuedAt || 0).getTime() - new Date(a.issuedAt || 0).getTime());
      this.applyFilter();
      this.loading = false;
    });
  }

  applyFilter(): void {
    const s = this.search.trim().toLowerCase();
    this.filtered = this.items.filter(i => {
      if (s && !`${i.number} ${i.idOrder} ${i.clientName}`.toLowerCase().includes(s)) return false;
      if (this.statusFilter && i.status !== this.statusFilter) return false;
      return true;
    });
  }

  generate(i: InvoiceRow): void {
    this.generatingId = i.idOrder;
    this.api.generateInvoiceFromOrder(i.idOrder).subscribe({
      next: () => { this.generatingId = null; this.load(); },
      error: (err) => {
        this.generatingId = null;
        const msg = err?.error?.message || err?.message || `HTTP ${err?.status || '?'}`;
        console.error('[generate invoice]', err);
        alert(`Génération impossible : ${msg}`);
      },
    });
  }

  markPaid(i: InvoiceRow): void {
    if (!i.idInvoice) return;
    this.api.markInvoicePaid(i.idInvoice).subscribe({
      next: () => { i.status = 'paid'; this.applyFilter(); },
      error: () => alert('Mise à jour impossible.'),
    });
  }

  print(i: InvoiceRow): void {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Facture ${i.number}</title>
<style>body{font-family:Arial;padding:40px;color:#333;max-width:820px;margin:auto}
.header{display:flex;justify-content:space-between;border-bottom:3px solid #405189;padding-bottom:20px;margin-bottom:30px}
.logo{font-size:32px;font-weight:bold;color:#405189}.logo span{color:#0ab39c}
h2{color:#405189}table{width:100%;border-collapse:collapse}
th,td{padding:12px;border-bottom:1px solid #eee;text-align:left;font-size:13px}
th{background:#f5f7fb;color:#405189;text-transform:uppercase;font-size:11px}
.grand td{font-size:20px;font-weight:bold;color:#0ab39c;border-top:2px solid #405189;padding-top:14px}
</style></head><body>
<div class="header">
  <div class="logo">🛍️ Tijara<span>.tn</span></div>
  <div style="text-align:right;font-size:13px">
    <strong>Facture ${i.number}</strong><br>
    Émise le ${this.formatDate(i.issuedAt) || '—'}<br>
    Statut : <strong>${this.statusLabel(i.status)}</strong>
  </div>
</div>
<h2>Commande #${i.idOrder}</h2>
<p><strong>Client :</strong> ${i.clientName || '—'}${i.clientEmail ? ' &lt;'+i.clientEmail+'&gt;' : ''}</p>
${i.dealTitle ? `<p><strong>Article :</strong> ${i.dealTitle}</p>` : ''}
<table>
  <thead><tr><th>Description</th><th style="text-align:right">Montant</th></tr></thead>
  <tbody>
    <tr><td>${i.dealTitle || 'Sous-total'}</td><td style="text-align:right">${i.subtotal.toFixed(3)} TND</td></tr>
    <tr><td>TVA (7%)</td><td style="text-align:right">${i.tax.toFixed(3)} TND</td></tr>
    <tr><td>Livraison</td><td style="text-align:right">${i.deliveryFee.toFixed(3)} TND</td></tr>
    <tr class="grand"><td>TOTAL</td><td style="text-align:right">${i.total.toFixed(3)} TND</td></tr>
  </tbody>
</table>
${i.total === 0 ? '<p style="margin-top:30px;padding:12px;background:#fff3cd;border-left:4px solid #ffc107;color:#664d03;font-size:12px">⚠️ Le prix de cette annonce n&rsquo;a pas été renseigné en base. Pour générer une facture avec le bon montant, mettez à jour le champ <strong>PriceDeal</strong> de l&rsquo;annonce dans la table Deals.</p>' : ''}
</body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 300);
  }

  exportCSV(): void {
    const header = 'N°,Commande,Client,Date,Sous-total,TVA,Total,Statut\n';
    const rows = this.filtered.map(i =>
      [i.number, i.idOrder, `"${i.clientName}"`, this.formatDate(i.issuedAt), i.subtotal, i.tax, i.total, i.status].join(',')
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `factures-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  formatDate(d: string | null): string {
    if (!d) return '';
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? '' : dt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  statusLabel(s: string): string {
    return s === 'paid' ? 'Payée' : s === 'cancelled' ? 'Annulée' : s === 'pending' ? 'En attente' : 'Émise';
  }
  statusClass(s: string): string {
    return s === 'paid' ? 'bg-success-subtle text-success'
         : s === 'cancelled' ? 'bg-danger-subtle text-danger'
         : s === 'pending' ? 'bg-warning-subtle text-warning'
         : 'bg-info-subtle text-info';
  }
}
