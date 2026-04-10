import { Component, OnInit } from '@angular/core';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

@Component({
  selector: 'app-vendors-admin',
  templateUrl: './vendors-admin.component.html',
  styleUrls: ['./vendors-admin.component.scss'],
  standalone: false
})
export class VendorsAdminComponent implements OnInit {

  breadCrumbItems = [
    { label: 'Admin' },
    { label: 'Gestion Vendeurs', active: true }
  ];

  filterStatus  = 'tous';
  searchTerm    = '';
  loading       = true;

  allVendors: any[]      = [];
  filteredVendors: any[] = [];

  constructor(private api: TijaraApiService) {}

  ngOnInit(): void { this.loadVendors(); }

  loadVendors(): void {
    this.loading = true;
    this.api.getAllVendors().subscribe({
      next: (data: any[]) => {
        this.allVendors = data.map(v => ({
          id:     v.id,
          owner:  `${v.first_name || ''} ${v.last_name || ''}`.trim(),
          email:  v.email,
          phone:  v.phone || '-',
          ville:  v.city  || '-',
          status: !v.is_active  ? 'suspendu'
                : !v.is_approved ? 'en attente'
                : 'actif',
          joined: new Date(v.created_at).toLocaleDateString('fr-FR'),
          avatar: `${v.first_name?.[0] || ''}${v.last_name?.[0] || ''}`.toUpperCase(),
        }));
        this.loading = false;
        this.applyFilter();
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilter(): void {
    let list = [...this.allVendors];
    if (this.filterStatus !== 'tous')
      list = list.filter(v => v.status === this.filterStatus);
    if (this.searchTerm.trim()) {
      const t = this.searchTerm.toLowerCase();
      list = list.filter(v =>
        v.owner.toLowerCase().includes(t) ||
        v.email.toLowerCase().includes(t) ||
        v.ville.toLowerCase().includes(t)
      );
    }
    this.filteredVendors = list;
  }

  approve(vendor: any): void {
    this.api.approveVendor(vendor.id).subscribe({
      next: () => {
        vendor.status = 'actif';
        this.applyFilter();
      }
    });
  }

  reject(vendor: any): void {
    if (!confirm(`Rejeter le compte de ${vendor.owner} ?`)) return;
    this.api.rejectVendor(vendor.id, 'Demande refusée par l\'administrateur.').subscribe({
      next: () => {
        this.allVendors = this.allVendors.filter(v => v.id !== vendor.id);
        this.applyFilter();
      }
    });
  }

  suspend(vendor: any): void {
    vendor.status = vendor.status === 'actif' ? 'suspendu' : 'actif';
    this.applyFilter();
  }

  getStatusBadge(status: string): string {
    switch (status) {
      case 'actif':      return 'bg-success-subtle text-success';
      case 'en attente': return 'bg-warning-subtle text-warning';
      case 'suspendu':   return 'bg-danger-subtle text-danger';
      default:           return 'bg-secondary-subtle text-secondary';
    }
  }

  get counts() {
    return {
      total:    this.allVendors.length,
      actif:    this.allVendors.filter(v => v.status === 'actif').length,
      attente:  this.allVendors.filter(v => v.status === 'en attente').length,
      suspendu: this.allVendors.filter(v => v.status === 'suspendu').length,
    };
  }
}
