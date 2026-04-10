import { Component, OnInit } from '@angular/core';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

@Component({
  selector: 'app-users-admin',
  templateUrl: './users-admin.component.html',
  styleUrls: ['./users-admin.component.scss'],
  standalone: false
})
export class UsersAdminComponent implements OnInit {

  breadCrumbItems = [
    { label: 'Admin' },
    { label: 'Utilisateurs', active: true }
  ];

  searchTerm = '';
  filterRole = 'tous';
  loading    = true;

  allUsers: any[]      = [];
  filteredUsers: any[] = [];

  constructor(private api: TijaraApiService) {}

  ngOnInit(): void { this.loadUsers(); }

  loadUsers(): void {
    this.loading = true;
    this.api.getAdminUsers().subscribe({
      next: (data: any[]) => {
        this.allUsers = data.map(u => ({
          id:     u.id,
          name:   `${u.first_name || ''} ${u.last_name || ''}`.trim(),
          email:  u.email,
          phone:  u.phone || '-',
          city:   u.city  || '-',
          role:   u.role,
          status: !u.is_active ? 'bloqué'
                : (u.role === 'vendor' && !u.is_approved) ? 'en attente'
                : 'actif',
          joined: new Date(u.created_at).toLocaleDateString('fr-FR'),
          avatar: `${u.first_name?.[0] || ''}${u.last_name?.[0] || ''}`.toUpperCase(),
        }));
        this.loading = false;
        this.applyFilter();
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilter(): void {
    let list = [...this.allUsers];
    if (this.filterRole !== 'tous')
      list = list.filter(u => u.role === this.filterRole);
    if (this.searchTerm.trim()) {
      const t = this.searchTerm.toLowerCase();
      list = list.filter(u =>
        u.name.toLowerCase().includes(t)  ||
        u.email.toLowerCase().includes(t) ||
        (u.city || '').toLowerCase().includes(t)
      );
    }
    this.filteredUsers = list;
  }

  toggleStatus(user: any): void {
    user.status = user.status === 'actif' ? 'bloqué' : 'actif';
    this.applyFilter();
  }

  deleteUser(user: any): void {
    if (!confirm(`Supprimer le compte de ${user.name} ?`)) return;
    this.allUsers = this.allUsers.filter(u => u.id !== user.id);
    this.applyFilter();
  }

  getRoleBadge(role: string): string {
    switch (role) {
      case 'admin':  return 'bg-danger-subtle text-danger';
      case 'vendor': return 'bg-info-subtle text-info';
      default:       return 'bg-primary-subtle text-primary';
    }
  }

  getStatusBadge(status: string): string {
    switch (status) {
      case 'actif':      return 'bg-success-subtle text-success';
      case 'bloqué':     return 'bg-danger-subtle text-danger';
      case 'en attente': return 'bg-warning-subtle text-warning';
      default:           return 'bg-secondary-subtle text-secondary';
    }
  }

  get counts() {
    return {
      total:   this.allUsers.length,
      users:   this.allUsers.filter(u => u.role === 'user').length,
      vendors: this.allUsers.filter(u => u.role === 'vendor').length,
      pending: this.allUsers.filter(u => u.status === 'en attente').length,
      blocked: this.allUsers.filter(u => u.status === 'bloqué').length,
    };
  }
}
