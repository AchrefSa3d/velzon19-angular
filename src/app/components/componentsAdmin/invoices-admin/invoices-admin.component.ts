import { Component, OnInit } from '@angular/core';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

@Component({
  selector: 'app-invoices-admin',
  standalone: false,
  template: `
<app-breadcrumbs title="Factures" [breadcrumbItems]="breadcrumbItems"></app-breadcrumbs>

<div class="card border-0 shadow-sm">
  <div class="card-header bg-transparent d-flex align-items-center gap-2 py-3">
    <h6 class="mb-0 fw-semibold flex-grow-1"><i class="ri-file-text-line me-2 text-primary"></i>Toutes les factures</h6>
    <input class="form-control form-control-sm" style="max-width:240px" placeholder="Rechercher…"
           [(ngModel)]="search" (input)="applyFilter()">
  </div>
  <div class="card-body p-0">
    @if (loading) { <div class="text-center py-5"><div class="spinner-border text-primary"></div></div> }
    @else if (filtered.length === 0) { <div class="text-center py-5 text-muted">Aucune facture.</div> }
    @else {
      <table class="table table-hover align-middle mb-0">
        <thead class="table-light">
          <tr>
            <th class="ps-3">N° Facture</th>
            <th>Commande</th>
            <th>Client</th>
            <th class="text-end">Sous-total</th>
            <th class="text-end">TVA</th>
            <th class="text-end">Livraison</th>
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
              <td class="fs-13">{{ i.userName || 'Client #' + i.idUser }}</td>
              <td class="text-end">{{ i.subtotal | number:'1.2-2' }}</td>
              <td class="text-end">{{ i.tax | number:'1.2-2' }}</td>
              <td class="text-end">{{ i.deliveryFee | number:'1.2-2' }}</td>
              <td class="text-end fw-bold text-success">{{ i.total | number:'1.2-2' }} TND</td>
              <td class="text-center">
                <span class="badge rounded-pill" [class]="statusClass(i.status)">{{ statusLabel(i.status) }}</span>
              </td>
              <td class="text-end pe-3">
                @if (i.status !== 'paid') {
                  <button class="btn btn-sm btn-outline-success" (click)="markPaid(i)"><i class="ri-check-line"></i></button>
                }
                <button class="btn btn-sm btn-light ms-1" (click)="print(i)"><i class="ri-printer-line"></i></button>
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
export class InvoicesAdminComponent implements OnInit {
  breadcrumbItems = [{ label: 'Admin', active: false }, { label: 'Factures', active: true }];

  items: any[] = [];
  filtered: any[] = [];
  loading = true;
  search = '';

  constructor(private api: TijaraApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.getInvoices().subscribe({
      next: (r: any[]) => {
        this.items = (r || []).map((i: any) => ({
          idInvoice:   i.idInvoice   ?? i.IdInvoice,
          number:      i.number      ?? i.Number,
          idOrder:     i.idOrder     ?? i.IdOrder,
          idUser:      i.idUser      ?? i.IdUser,
          userName:    i.userName    ?? i.UserName,
          subtotal:    +(i.subtotal   ?? i.Subtotal ?? 0),
          tax:         +(i.tax        ?? i.Tax ?? 0),
          deliveryFee: +(i.deliveryFee?? i.DeliveryFee ?? 0),
          total:       +(i.total      ?? i.Total ?? 0),
          status:      i.status      ?? i.Status,
          issuedAt:    i.issuedAt    ?? i.IssuedAt,
        }));
        this.applyFilter();
        this.loading = false;
      },
      error: () => { this.items = []; this.filtered = []; this.loading = false; }
    });
  }

  applyFilter(): void {
    const s = this.search.trim().toLowerCase();
    this.filtered = !s ? [...this.items]
      : this.items.filter(i => (i.number || '').toLowerCase().includes(s)
                             || (i.userName || '').toLowerCase().includes(s)
                             || ('' + i.idOrder).includes(s));
  }

  markPaid(i: any): void {
    this.api.markInvoicePaid(i.idInvoice).subscribe({ next: () => this.load() });
  }

  print(i: any): void {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <html><head><title>Facture ${i.number}</title>
      <style>body{font-family:Arial;padding:40px;color:#333}
        h1{color:#405189}
        table{width:100%;border-collapse:collapse;margin-top:20px}
        th,td{padding:10px;border-bottom:1px solid #ddd;text-align:left}
        .total{font-size:20px;font-weight:bold;color:#0ab39c}
      </style></head><body>
        <h1>🛒 TIJARA</h1>
        <h2>Facture ${i.number}</h2>
        <p><strong>Commande:</strong> #${i.idOrder}<br>
           <strong>Client:</strong> ${i.userName || '#' + i.idUser}</p>
        <table>
          <tr><th>Sous-total</th><td>${i.subtotal.toFixed(2)} TND</td></tr>
          <tr><th>TVA (7%)</th><td>${i.tax.toFixed(2)} TND</td></tr>
          <tr><th>Frais livraison</th><td>${i.deliveryFee.toFixed(2)} TND</td></tr>
          <tr><th class="total">Total</th><td class="total">${i.total.toFixed(2)} TND</td></tr>
        </table>
        <p style="margin-top:30px;color:#888">Statut : ${i.status}</p>
      </body></html>`);
    w.print();
  }

  statusLabel(s: string): string { return s === 'paid' ? 'Payée' : s === 'cancelled' ? 'Annulée' : 'Émise'; }
  statusClass(s: string): string { return s === 'paid' ? 'bg-success-subtle text-success' : s === 'cancelled' ? 'bg-danger-subtle text-danger' : 'bg-warning-subtle text-warning'; }
}
