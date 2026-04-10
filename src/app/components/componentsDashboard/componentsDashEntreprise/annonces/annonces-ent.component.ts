import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

@Component({
  selector: 'app-annonces-ent',
  templateUrl: './annonces-ent.component.html',
  standalone: false
})
export class AnnoncesEntComponent implements OnInit {

  breadCrumbItems = [
    { label: 'Vendeur' },
    { label: 'Mes Annonces', active: true }
  ];

  myAnnonces: any[] = [];
  publicAnnonces: any[] = [];
  activeTab: 'miennes' | 'toutes' = 'miennes';
  loading       = true;
  showForm      = false;
  submitting    = false;
  submitSuccess = '';
  submitError   = '';
  imagePreview  = '';
  expandedComments: Record<number, boolean> = {};
  comments: Record<number, any[]>           = {};
  commentText: Record<number, string>       = {};
  annonceForm!: FormGroup;

  constructor(private api: TijaraApiService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadMine();
    this.loadPublic();
    this.initForm();
  }

  initForm(type = 'annonce' as string): void {
    this.annonceForm = this.fb.group({
      title:   ['', [Validators.required, Validators.minLength(5)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      type:    [type],
    });
  }

  get f() { return this.annonceForm.controls; }

  loadMine(): void {
    this.loading = true;
    this.api.getMyAnnonces().subscribe({
      next: (data: any[]) => { this.myAnnonces = data.filter((a: any) => a.type === 'annonce'); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  loadPublic(): void {
    this.api.getAnnonces().subscribe({
      next: (data: any[]) => { this.publicAnnonces = data.filter((a: any) => a.type === 'annonce'); }
    });
  }

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
    const payload = { ...this.annonceForm.value, image_url: this.imagePreview || null };
    this.api.createAnnonce(payload).subscribe({
      next: () => {
        this.submitting    = false;
        this.showForm      = false;
        this.submitSuccess = 'Soumis avec succès ! En attente de validation admin.';
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
    if (!confirm('Supprimer ?')) return;
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
