import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

@Component({
  selector: 'app-annonces-user',
  templateUrl: './annonces-user.component.html',
  standalone: false
})
export class AnnoncesUserComponent implements OnInit {

  breadcrumbItems = [
    { label: 'Mon Espace' },
    { label: 'Annonces', active: true }
  ];

  annonces: any[]      = [];
  myAnnonces: any[]    = [];
  activeTab: 'toutes' | 'miennes' = 'toutes';
  loading              = true;
  showForm             = false;
  submitting           = false;
  submitSuccess        = '';
  submitError          = '';
  imagePreview         = '';
  expandedComments: Record<number, boolean> = {};
  comments: Record<number, any[]>           = {};
  commentText: Record<number, string>       = {};
  currentUserId        = 0;
  annonceForm!: FormGroup;

  constructor(private api: TijaraApiService, private fb: FormBuilder) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.currentUserId = user.id || 0;
    this.loadAll();
    this.loadMine();
    this.initForm();
  }

  initForm(): void {
    this.annonceForm = this.fb.group({
      title:   ['', [Validators.required, Validators.minLength(5)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  loadAll(): void {
    this.loading = true;
    this.api.getAnnonces().subscribe({
      next: (data: any[]) => { this.annonces = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  loadMine(): void {
    this.api.getMyAnnonces().subscribe({
      next: (data: any[]) => { this.myAnnonces = data; }
    });
  }

  get f() { return this.annonceForm.controls; }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Max 2 MB'); return; }
    const reader = new FileReader();
    reader.onload = (e: any) => { this.imagePreview = e.target.result; };
    reader.readAsDataURL(file);
  }

  submit(): void {
    if (this.annonceForm.invalid) return;
    this.submitting = true;
    this.submitError = '';
    const payload = { ...this.annonceForm.value, image_url: this.imagePreview || null, type: 'annonce' };
    this.api.createAnnonce(payload).subscribe({
      next: () => {
        this.submitting    = false;
        this.showForm      = false;
        this.submitSuccess = 'Annonce soumise avec succès ! Elle sera visible après validation par l\'administrateur.';
        this.imagePreview  = '';
        this.annonceForm.reset();
        this.loadMine();
        setTimeout(() => { this.submitSuccess = ''; }, 6000);
      },
      error: (err: any) => {
        this.submitting  = false;
        this.submitError = err?.error?.message || 'Erreur lors de la soumission.';
      }
    });
  }

  deleteAnnonce(id: number): void {
    if (!confirm('Supprimer cette annonce ?')) return;
    this.api.deleteAnnonce(id).subscribe({
      next: () => { this.myAnnonces = this.myAnnonces.filter(a => a.id !== id); }
    });
  }

  like(ann: any): void {
    this.api.toggleLike(ann.id).subscribe({
      next: (r: any) => { ann.likes_count += r.liked ? 1 : -1; }
    });
  }

  toggleComments(ann: any): void {
    this.expandedComments[ann.id] = !this.expandedComments[ann.id];
    if (this.expandedComments[ann.id] && !this.comments[ann.id]) {
      this.api.getComments(ann.id).subscribe({
        next: (data: any[]) => { this.comments[ann.id] = data; }
      });
    }
  }

  postComment(ann: any): void {
    const text = (this.commentText[ann.id] || '').trim();
    if (!text) return;
    this.api.addComment(ann.id, text).subscribe({
      next: (c: any) => {
        if (!this.comments[ann.id]) this.comments[ann.id] = [];
        this.comments[ann.id].push(c);
        ann.comments_count++;
        this.commentText[ann.id] = '';
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
      case 'approved': return 'Approuvée';
      case 'pending':  return 'En attente';
      case 'rejected': return 'Rejetée';
      default:         return s;
    }
  }
}
