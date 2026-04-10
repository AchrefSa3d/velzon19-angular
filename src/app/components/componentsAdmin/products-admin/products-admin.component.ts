import { Component, OnInit } from '@angular/core';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

@Component({
  selector: 'app-products-admin',
  templateUrl: './products-admin.component.html',
  standalone: false
})
export class ProductsAdminComponent implements OnInit {

  breadCrumbItems = [
    { label: 'Admin' },
    { label: 'Gestion Produits', active: true }
  ];

  allProducts: any[]      = [];
  filteredProducts: any[] = [];
  activeFilter = 'all';
  searchTerm   = '';
  loading      = true;

  filters = [
    { key: 'all',      label: 'Tous',         class: 'btn-primary' },
    { key: 'pending',  label: 'En attente',   class: 'btn-warning' },
    { key: 'approved', label: 'Approuvés',    class: 'btn-success' },
    { key: 'rejected', label: 'Rejetés',      class: 'btn-danger'  },
  ];

  constructor(private api: TijaraApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.getAdminAllProducts().subscribe({
      next: (data: any[]) => {
        this.allProducts = data;
        this.loading = false;
        this.applyFilter();
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilter(): void {
    let list = [...this.allProducts];
    if (this.activeFilter !== 'all') {
      list = list.filter(p => p.approval_status === this.activeFilter);
    }
    if (this.searchTerm.trim()) {
      const t = this.searchTerm.toLowerCase();
      list = list.filter(p =>
        p.name?.toLowerCase().includes(t) ||
        p.vendor_name?.toLowerCase().includes(t) ||
        p.shop_name?.toLowerCase().includes(t) ||
        p.category_name?.toLowerCase().includes(t)
      );
    }
    this.filteredProducts = list;
  }

  setFilter(key: string): void {
    this.activeFilter = key;
    this.applyFilter();
  }

  countByStatus(key: string): number {
    if (key === 'all') return this.allProducts.length;
    return this.allProducts.filter(p => p.approval_status === key).length;
  }

  approve(p: any): void {
    this.api.approveProduct(p.id).subscribe({
      next: () => {
        p.approval_status = 'approved';
        p.is_active = true;
        this.applyFilter();
      }
    });
  }

  reject(p: any): void {
    const reason = prompt('Raison du rejet :', 'Produit non conforme aux règles.');
    if (reason === null) return;
    this.api.rejectProductAdmin(p.id, reason).subscribe({
      next: () => {
        p.approval_status = 'rejected';
        p.is_active = false;
        this.applyFilter();
      }
    });
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
      case 'approved': return 'Approuvé';
      case 'pending':  return 'En attente';
      case 'rejected': return 'Rejeté';
      default:         return s;
    }
  }
}
