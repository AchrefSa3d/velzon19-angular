import { Component, OnInit } from '@angular/core';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

interface InvoiceRow {
  idInvoice: number;
  number: string;
  idOrder: number;
  clientName: string;
  clientEmail: string;
  vendorName: string;
  dealTitle: string;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  issuedAt: string | null;
  paidAt: string | null;
}

@Component({
  selector: 'app-invoices-admin',
  standalone: false,
  template: `
<app-breadcrumbs title="Factures" [breadcrumbItems]="breadcrumbItems"></app-breadcrumbs>

<div class="row g-3 mb-4">
  <div class="col-6 col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid #3577f1">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-primary-subtle d-flex align-items-center justify-content-center">
          <i class="ri-file-text-line fs-22 text-primary"></i>
        </div>
        <div><h3 class="mb-0 fw-bold text-primary">{{ items.length }}</h3>
        <p class="mb-0 fs-12 text-muted">Total factures</p></div>
      </div>
    </div>
  </div>
  <div class="col-6 col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid #0ab39c">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-success-subtle d-flex align-items-center justify-content-center">
          <i class="ri-check-double-line fs-22 text-success"></i>
        </div>
        <div><h3 class="mb-0 fw-bold text-success">{{ paidTotal | number:'1.0-0' }}</h3>
        <p class="mb-0 fs-12 text-muted">Encaissé (TND)</p></div>
      </div>
    </div>
  </div>
  <div class="col-6 col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid #f7b84b">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-warning-subtle d-flex align-items-center justify-content-center">
          <i class="ri-time-line fs-22 text-warning"></i>
        </div>
        <div><h3 class="mb-0 fw-bold text-warning">{{ pendingTotal | number:'1.0-0' }}</h3>
        <p class="mb-0 fs-12 text-muted">En attente (TND)</p></div>
      </div>
    </div>
  </div>
  <div class="col-6 col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid #299cdb">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-info-subtle d-flex align-items-center justify-content-center">
          <i class="ri-money-dollar-circle-line fs-22 text-info"></i>
        </div>
        <div><h3 class="mb-0 fw-bold text-info">{{ grandTotal | number:'1.0-0' }}</h3>
        <p class="mb-0 fs-12 text-muted">CA total (TND)</p></div>
      </div>
    </div>
  </div>
</div>

<div class="card border-0 shadow-sm">
  <div class="card-header bg-transparent d-flex flex-wrap align-items-center gap-2 py-3">
    <h6 class="mb-0 fw-semibold flex-grow-1">
      <i class="ri-file-text-line me-2 text-primary"></i>Toutes les factures
      <span class="badge bg-primary-subtle text-primary ms-2">{{ filtered.length }}</span>
    </h6>
    <div class="input-group input-group-sm" style="max-width:240px">
      <span class="input-group-text bg-white border-end-0"><i class="ri-search-line"></i></span>
      <input type="text" class="form-control border-start-0" placeholder="N°, client, vendeur…"
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
    <button class="btn btn-sm btn-light" (click)="exportCSV()" title="Export CSV">
      <i class="ri-file-excel-2-line text-success me-1"></i>Export
    </button>
  </div>

  <div class="card-body p-0">
    @if (loading) {
      <div class="text-center py-5"><div class="spinner-border text-primary"></div></div>
    } @else if (filtered.length === 0) {
      <div class="text-center py-5">
        <i class="ri-file-list-line display-3 text-muted opacity-50"></i>
        <p class="text-muted mt-2 mb-0">Aucune facture ne correspond.</p>
      </div>
    } @else {
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-3">N° Facture</th>
              <th>Commande</th>
              <th>Client</th>
              <th>Vendeur</th>
              <th>Date</th>
              <th class="text-end">Sous-total</th>
              <th class="text-end">TVA</th>
              <th class="text-end">Total</th>
              <th class="text-center">Statut</th>
              <th class="text-end pe-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (i of filtered; track i.idInvoice) {
              <tr>
                <td class="ps-3 fw-semibold text-primary fs-13">{{ i.number }}</td>
                <td class="fs-13">#{{ i.idOrder }}</td>
                <td>
                  <div class="fs-13">{{ i.clientName || '—' }}</div>
                  @if (i.clientEmail) { <div class="fs-11 text-muted">{{ i.clientEmail }}</div> }
                </td>
                <td class="fs-12 text-muted">{{ i.vendorName || '—' }}</td>
                <td class="fs-12 text-muted">{{ formatDate(i.issuedAt) }}</td>
                <td class="text-end fs-13">{{ i.subtotal | number:'1.2-2' }}</td>
                <td class="text-end fs-12 text-muted">{{ i.tax | number:'1.2-2' }}</td>
                <td class="text-end fw-bold text-success">{{ i.total | number:'1.2-2' }} TND</td>
                <td class="text-center">
                  <span class="badge rounded-pill" [class]="statusClass(i.status)">{{ statusLabel(i.status) }}</span>
                </td>
                <td class="text-end pe-3">
                  <button class="btn btn-sm btn-light" (click)="print(i)" title="Imprimer">
                    <i class="ri-printer-line text-primary"></i>
                  </button>
                  @if (i.status !== 'paid' && i.status !== 'cancelled') {
                    <button class="btn btn-sm btn-light ms-1" (click)="markPaid(i)" title="Marquer payée">
                      <i class="ri-check-line text-success"></i>
                    </button>
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
export class InvoicesAdminComponent implements OnInit {
  breadcrumbItems = [{ label: 'Admin' }, { label: 'Factures', active: true }];

  items: InvoiceRow[]    = [];
  filtered: InvoiceRow[] = [];
  search = '';
  statusFilter = '';
  loading = true;

  get paidTotal(): number    { return this.items.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0); }
  get pendingTotal(): number { return this.items.filter(i => i.status !== 'paid' && i.status !== 'cancelled').reduce((s, i) => s + i.total, 0); }
  get grandTotal(): number   { return this.items.filter(i => i.status !== 'cancelled').reduce((s, i) => s + i.total, 0); }

  constructor(private api: TijaraApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.getInvoices().subscribe({
      next: (data: any[]) => {
        this.items = (data || []).map((i: any) => ({
          idInvoice:   +(i.id_invoice    ?? i.idInvoice    ?? 0),
          number:        i.number        ?? `FAC-${i.id_invoice ?? ''}`,
          idOrder:     +(i.id_order      ?? i.idOrder      ?? 0),
          clientName:    i.client_name   ?? i.clientName   ?? '',
          clientEmail:   i.client_email  ?? i.clientEmail  ?? '',
          vendorName:    i.vendor_name   ?? i.vendorName   ?? '',
          dealTitle:     i.deal_title    ?? i.dealTitle    ?? '',
          subtotal:    +(i.subtotal      ?? 0),
          tax:         +(i.tax           ?? 0),
          total:       +(i.total         ?? 0),
          status:        i.status        ?? 'issued',
          issuedAt:      i.issued_at     ?? i.issuedAt     ?? null,
          paidAt:        i.paid_at       ?? i.paidAt       ?? null,
        }));
        this.applyFilter();
        this.loading = false;
      },
      error: () => { this.loading = false; alert('Chargement impossible.'); }
    });
  }

  applyFilter(): void {
    const s = this.search.trim().toLowerCase();
    this.filtered = this.items.filter(i => {
      if (s && !`${i.number} ${i.idOrder} ${i.clientName} ${i.vendorName}`.toLowerCase().includes(s)) return false;
      if (this.statusFilter && i.status !== this.statusFilter) return false;
      return true;
    });
  }

  markPaid(i: InvoiceRow): void {
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
.grand td{font-size:20px;font-weight:bold;color:#0ab39c;border-top:2px solid #405189;padding-top:14px}</style>
</head><body>
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
<p><strong>Vendeur :</strong> ${i.vendorName || '—'}</p>
<table>
  <thead><tr><th>Description</th><th style="text-align:right">Montant</th></tr></thead>
  <tbody>
    <tr><td>${i.dealTitle || 'Sous-total'}</td><td style="text-align:right">${i.subtotal.toFixed(3)} TND</td></tr>
    <tr><td>TVA (7%)</td><td style="text-align:right">${i.tax.toFixed(3)} TND</td></tr>
    <tr class="grand"><td>TOTAL</td><td style="text-align:right">${i.total.toFixed(3)} TND</td></tr>
  </tbody>
</table>
</body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 300);
  }

  exportCSV(): void {
    const header = 'N°,Commande,Client,Vendeur,Date,Sous-total,TVA,Total,Statut\n';
    const rows = this.filtered.map(i =>
      [i.number, i.idOrder, `"${i.clientName}"`, `"${i.vendorName}"`,
       this.formatDate(i.issuedAt), i.subtotal, i.tax, i.total, i.status].join(',')
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
    return isNaN(dt.getTime()) ? '' : dt.toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' });
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
