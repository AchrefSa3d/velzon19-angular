import { Component, OnInit } from '@angular/core';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

@Component({
  selector: 'app-viewreclamations',
  standalone: false,
  templateUrl: './viewreclamations.html',
  styleUrl: './viewreclamations.scss',
})
export class Viewreclamations implements OnInit {

  breadCrumbItems = [
    { label: 'Admin' },
    { label: 'Réclamations', active: true }
  ];

  statuses = ['En attente', 'En cours', 'Résolue', 'Rejetée'];
  filterStatut = 'tous';
  searchTerm = '';
  loading = true;

  reclamations: any[] = [];
  filteredReclamations: any[] = [];
  selectedRec: any | null = null;

  constructor(private api: TijaraApiService) {}

  ngOnInit(): void { this.loadReclamations(); }

  loadReclamations(): void {
    this.loading = true;
    this.api.getReclamations().subscribe({
      next: (data: any[]) => {
        this.reclamations = data.map(r => ({
          id:      r.id,
          user:    r.client_name || 'Utilisateur',
          email:   r.email || '',
          role:    r.user_role === 'vendor' ? 'Vendeur' : 'Client',
          sujet:   r.subject,
          message: r.description,
          date:    new Date(r.created_at).toLocaleDateString('fr-FR'),
          statut:  this.mapStatus(r.status),
          apiId:   r.id,
        }));
        this.loading = false;
        this.applyFilter();
      },
      error: () => { this.loading = false; }
    });
  }

  private mapStatus(s: string): string {
    switch (s) {
      case 'open':        return 'En attente';
      case 'in_progress': return 'En cours';
      case 'resolved':    return 'Résolue';
      case 'closed':      return 'Rejetée';
      default:            return s;
    }
  }

  private statusToApi(s: string): string {
    switch (s) {
      case 'En attente': return 'open';
      case 'En cours':   return 'in_progress';
      case 'Résolue':    return 'resolved';
      case 'Rejetée':    return 'closed';
      default:           return s;
    }
  }

  applyFilter(): void {
    this.filteredReclamations = this.reclamations.filter(r => {
      const matchStatut = this.filterStatut === 'tous' || r.statut === this.filterStatut;
      const matchSearch = !this.searchTerm ||
        r.user.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        r.sujet.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        String(r.id).includes(this.searchTerm);
      return matchStatut && matchSearch;
    });
  }

  changeStatut(rec: any, statut: string): void {
    rec.statut = statut;
    this.api.updateReclamation(rec.apiId, { status: this.statusToApi(statut) }).subscribe();
    this.applyFilter();
  }

  showDetail(rec: any): void { this.selectedRec = rec; }
  closeDetail(): void        { this.selectedRec = null; }

  getStatusClass(statut: string): string {
    switch (statut) {
      case 'En attente': return 'bg-warning-subtle text-warning';
      case 'En cours':   return 'bg-info-subtle text-info';
      case 'Résolue':    return 'bg-success-subtle text-success';
      case 'Rejetée':    return 'bg-danger-subtle text-danger';
      default:           return 'bg-secondary-subtle text-secondary';
    }
  }

  getRoleClass(role: string): string {
    return role === 'Vendeur' ? 'bg-primary-subtle text-primary' : 'bg-secondary-subtle text-secondary';
  }

  get countByStatut() {
    return {
      attente: this.reclamations.filter(r => r.statut === 'En attente').length,
      cours:   this.reclamations.filter(r => r.statut === 'En cours').length,
      resolue: this.reclamations.filter(r => r.statut === 'Résolue').length,
      rejetee: this.reclamations.filter(r => r.statut === 'Rejetée').length,
    };
  }
}
