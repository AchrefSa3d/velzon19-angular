import { Component, OnInit } from '@angular/core';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

interface BoostPack {
  id: number;
  title: string;
  price: number;
  discount: number;
  maxDuration: number;
  sliders: boolean;
  sideBar: boolean;
  footer: boolean;
  relatedPost: boolean;
  firstLogin: boolean;
  links: boolean;
}

@Component({
  selector: 'app-boost-packs-ent',
  standalone: false,
  template: `
<app-breadcrumbs title="Packs de boost" [breadcrumbItems]="breadCrumbItems"></app-breadcrumbs>

<div class="card border-0 shadow-sm mb-4 overflow-hidden"
     style="background:linear-gradient(135deg,#f06548 0%,#f7b84b 100%)">
  <div class="card-body text-white py-4">
    <div class="d-flex flex-wrap align-items-center gap-3">
      <div class="avatar-lg rounded-3 d-flex align-items-center justify-content-center"
           style="background:rgba(255,255,255,.2)">
        <i class="ri-rocket-2-line fs-1"></i>
      </div>
      <div class="flex-grow-1">
        <h3 class="text-white mb-1">Boostez votre visibilité 🚀</h3>
        <p class="text-white-50 mb-0">Choisissez un pack pour mettre en avant vos annonces sur Tijara.</p>
      </div>
    </div>
  </div>
</div>

@if (loading) {
  <div class="text-center py-5"><div class="spinner-border text-danger"></div></div>
} @else if (packs.length === 0) {
  <div class="card border-0 shadow-sm">
    <div class="card-body text-center py-5">
      <i class="ri-rocket-line display-3 text-muted opacity-50"></i>
      <p class="text-muted mt-2 mb-0">Aucun pack disponible pour le moment.</p>
    </div>
  </div>
} @else {
  <div class="row g-3">
    @for (p of packs; track p.id) {
      <div class="col-md-6 col-xl-4">
        <div class="card border-0 shadow-sm h-100 pack-card">
          <div class="card-header bg-danger-subtle text-center py-3">
            <h5 class="mb-0 fw-bold text-danger">
              <i class="ri-rocket-2-line me-1"></i>{{ p.title }}
            </h5>
          </div>
          <div class="card-body text-center">
            <div class="d-flex align-items-baseline justify-content-center gap-2 mb-2">
              <h2 class="mb-0 fw-bold text-success">{{ p.price | number:'1.0-2' }}</h2>
              <span class="text-muted">TND</span>
            </div>
            @if (p.discount > 0) {
              <span class="badge bg-danger mb-3">-{{ p.discount }}%</span>
            }
            <p class="text-muted fs-12 mb-3">
              <i class="ri-time-line"></i> Durée max <strong>{{ p.maxDuration }}</strong> jours
            </p>
            <ul class="list-unstyled fs-13 text-start mb-0">
              @if (p.sliders)     { <li class="text-success mb-1"><i class="ri-check-double-line me-1"></i>Slider d'accueil</li> }
              @if (p.sideBar)     { <li class="text-success mb-1"><i class="ri-check-double-line me-1"></i>Sidebar</li> }
              @if (p.footer)      { <li class="text-success mb-1"><i class="ri-check-double-line me-1"></i>Footer</li> }
              @if (p.relatedPost) { <li class="text-success mb-1"><i class="ri-check-double-line me-1"></i>Posts similaires</li> }
              @if (p.firstLogin)  { <li class="text-success mb-1"><i class="ri-check-double-line me-1"></i>Box 1ère connexion</li> }
              @if (p.links)       { <li class="text-success mb-1"><i class="ri-check-double-line me-1"></i>Liens premium</li> }
            </ul>
          </div>
          <div class="card-footer bg-white border-top">
            <button class="btn btn-danger w-100" (click)="subscribe(p)">
              <i class="ri-shopping-cart-line me-1"></i>Souscrire
            </button>
          </div>
        </div>
      </div>
    }
  </div>
}
`,
  styles: [`.pack-card { transition: transform .15s, box-shadow .15s; }
            .pack-card:hover { transform: translateY(-4px); box-shadow: 0 .8rem 1.5rem rgba(0,0,0,.12) !important; }`]
})
export class BoostPacksEntComponent implements OnInit {
  breadCrumbItems = [{ label: 'Vendeur' }, { label: 'Packs Boost', active: true }];

  packs: BoostPack[] = [];
  loading = true;

  constructor(private api: TijaraApiService) {}

  ngOnInit(): void {
    this.api.getPublicBoostPacks().subscribe({
      next: (data: any[]) => {
        this.packs = (data || []).map((p: any) => ({
          id:          +(p.id_boost ?? p.idBoost ?? 0),
          title:        p.title       ?? '',
          price:       +(p.price       ?? 0),
          discount:    +(p.discount    ?? 0),
          maxDuration:+(p.max_duration ?? p.maxDuration ?? 0),
          sliders:    !!(p.sliders     ?? false),
          sideBar:    !!(p.side_bar    ?? p.sideBar    ?? false),
          footer:     !!(p.footer      ?? false),
          relatedPost:!!(p.related_post?? p.relatedPost?? false),
          firstLogin: !!(p.first_login ?? p.firstLogin ?? false),
          links:      !!(p.links       ?? false),
        }));
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  subscribe(p: BoostPack): void {
    if (confirm(`Souscrire au pack "${p.title}" pour ${p.price} TND ?`)) {
      alert(`Demande de souscription au pack "${p.title}" envoyée. L'admin vous contactera bientôt.`);
    }
  }
}
