import { Component, OnInit } from '@angular/core';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

@Component({
  selector: 'app-viewreclamations-user',
  standalone: false,
  templateUrl: './viewreclamations.html',
  styleUrl: './viewreclamations.scss',
})
export class ViewreclamationsExtern implements OnInit {

  breadCrumbItems = [
    { label: 'Mon Compte' },
    { label: 'Mes Réclamations', active: true }
  ];

  showForm     = false;
  submitting   = false;
  submitSuccess = false;
  loading      = true;

  newSujet   = '';
  newMessage = '';

  reclamations: any[] = [];

  constructor(private api: TijaraApiService) {}

  ngOnInit(): void { this.loadReclamations(); }

  loadReclamations(): void {
    this.loading = true;
    this.api.getReclamations().subscribe({
      next: (data: any[]) => {
        this.reclamations = data.map(r => ({
          id:      r.id,
          sujet:   r.subject,
          message: r.description,
          date:    new Date(r.created_at).toLocaleDateString('fr-FR'),
          statut:  this.mapStatus(r.status),
        }));
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  submitReclamation(): void {
    if (!this.newSujet.trim() || !this.newMessage.trim()) return;
    this.submitting = true;

    this.api.createReclamation({
      subject:     this.newSujet.trim(),
      description: this.newMessage.trim(),
    }).subscribe({
      next: (rec: any) => {
        this.reclamations.unshift({
          id:      rec.id,
          sujet:   rec.subject,
          message: rec.description,
          date:    new Date(rec.created_at).toLocaleDateString('fr-FR'),
          statut:  'En attente',
        });
        this.newSujet   = '';
        this.newMessage = '';
        this.showForm   = false;
        this.submitting = false;
        this.submitSuccess = true;
        setTimeout(() => this.submitSuccess = false, 3000);
      },
      error: () => { this.submitting = false; }
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

  getStatusClass(statut: string): string {
    switch (statut) {
      case 'En attente': return 'bg-warning-subtle text-warning';
      case 'En cours':   return 'bg-info-subtle text-info';
      case 'Résolue':    return 'bg-success-subtle text-success';
      case 'Rejetée':    return 'bg-danger-subtle text-danger';
      default:           return 'bg-secondary-subtle text-secondary';
    }
  }

  getStatusIcon(statut: string): string {
    switch (statut) {
      case 'En attente': return 'ri-time-line';
      case 'En cours':   return 'ri-loader-4-line';
      case 'Résolue':    return 'ri-checkbox-circle-line';
      case 'Rejetée':    return 'ri-close-circle-line';
      default:           return 'ri-question-line';
    }
  }
}
