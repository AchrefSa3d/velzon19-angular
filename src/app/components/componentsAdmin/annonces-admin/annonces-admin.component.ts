import { Component, OnInit } from '@angular/core';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

@Component({
  selector: 'app-annonces-admin',
  templateUrl: './annonces-admin.component.html',
  standalone: false
})
export class AnnoncesAdminComponent implements OnInit {

  breadCrumbItems = [
    { label: 'Admin' },
    { label: 'Modération Annonces', active: true }
  ];

  allAnnonces: any[]      = [];
  filteredAnnonces: any[] = [];
  filterStatus = 'pending';
  searchTerm   = '';
  loading      = true;
  selectedAnn: any = null;
  rejectReason = '';

  constructor(private api: TijaraApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.getAdminAnnonces().subscribe({
      next: (data: any[]) => {
        this.allAnnonces = data;
        this.loading = false;
        this.applyFilter();
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilter(): void {
    let list = [...this.allAnnonces];
    if (this.filterStatus !== 'tous') list = list.filter(a => a.status === this.filterStatus);
    if (this.searchTerm.trim()) {
      const t = this.searchTerm.toLowerCase();
      list = list.filter(a =>
        a.title.toLowerCase().includes(t) ||
        a.author_name.toLowerCase().includes(t)
      );
    }
    this.filteredAnnonces = list;
  }

  approve(ann: any): void {
    this.api.approveAnnonce(ann.id).subscribe({
      next: () => { ann.status = 'approved'; this.applyFilter(); }
    });
  }

  reject(ann: any): void {
    const reason = prompt('Raison du rejet (optionnel):', 'Non conforme aux règles.');
    if (reason === null) return;
    this.api.rejectAnnonce(ann.id, reason).subscribe({
      next: () => { ann.status = 'rejected'; ann.rejection_reason = reason; this.applyFilter(); }
    });
  }

  showDetail(ann: any): void { this.selectedAnn = ann; }
  closeDetail(): void        { this.selectedAnn = null; }

  get counts() {
    return {
      pending:  this.allAnnonces.filter(a => a.status === 'pending').length,
      approved: this.allAnnonces.filter(a => a.status === 'approved').length,
      rejected: this.allAnnonces.filter(a => a.status === 'rejected').length,
    };
  }

  getStatusClass(s: string): string {
    switch (s) {
      case 'approved': return 'bg-success-subtle text-success';
      case 'pending':  return 'bg-warning-subtle text-warning';
      case 'rejected': return 'bg-danger-subtle text-danger';
      default:         return 'bg-secondary-subtle text-secondary';
    }
  }

  getStatusLabel(s: string): string {
    switch (s) {
      case 'approved': return 'Approuvée';
      case 'pending':  return 'En attente';
      case 'rejected': return 'Rejetée';
      default:         return s;
    }
  }
}
