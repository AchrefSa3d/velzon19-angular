import { Component, OnInit } from '@angular/core';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

interface BoostPackRow {
  id: number;
  title: string;
  price: number;
  discount: number;
  maxDuration: number;
  ordersCount: number;
  sliders: boolean;
  sideBar: boolean;
  footer: boolean;
  relatedPost: boolean;
  firstLogin: boolean;
  links: boolean;
  active: boolean;
}

@Component({
  selector: 'app-boost-packs-admin',
  standalone: false,
  template: `
<app-breadcrumbs title="Packs Boost Ads" [breadcrumbItems]="breadCrumbItems"></app-breadcrumbs>

<div class="row g-3 mb-4">
  <div class="col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid #f06548">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-danger-subtle d-flex align-items-center justify-content-center">
          <i class="ri-rocket-2-line fs-22 text-danger"></i>
        </div>
        <div><h3 class="mb-0 fw-bold text-danger">{{ items.length }}</h3>
        <p class="mb-0 fs-12 text-muted">Total packs</p></div>
      </div>
    </div>
  </div>
  <div class="col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid #0ab39c">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-success-subtle d-flex align-items-center justify-content-center">
          <i class="ri-checkbox-circle-line fs-22 text-success"></i>
        </div>
        <div><h3 class="mb-0 fw-bold text-success">{{ activeCount }}</h3>
        <p class="mb-0 fs-12 text-muted">Actifs</p></div>
      </div>
    </div>
  </div>
  <div class="col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid #f7b84b">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-warning-subtle d-flex align-items-center justify-content-center">
          <i class="ri-money-dollar-circle-line fs-22 text-warning"></i>
        </div>
        <div><h3 class="mb-0 fw-bold text-warning">{{ avgPrice | number:'1.0-0' }}</h3>
        <p class="mb-0 fs-12 text-muted">Prix moyen (TND)</p></div>
      </div>
    </div>
  </div>
  <div class="col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid #299cdb">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-info-subtle d-flex align-items-center justify-content-center">
          <i class="ri-percent-line fs-22 text-info"></i>
        </div>
        <div><h3 class="mb-0 fw-bold text-info">{{ withDiscountCount }}</h3>
        <p class="mb-0 fs-12 text-muted">Avec remise</p></div>
      </div>
    </div>
  </div>
</div>

<div class="card border-0 shadow-sm">
  <div class="card-header bg-transparent d-flex flex-wrap align-items-center gap-2 py-3">
    <h6 class="mb-0 fw-semibold flex-grow-1">
      <i class="ri-rocket-2-line me-2 text-danger"></i>Packs disponibles
      <span class="badge bg-danger-subtle text-danger ms-2">{{ filtered.length }}</span>
    </h6>
    <div class="input-group input-group-sm" style="max-width:240px">
      <span class="input-group-text bg-white border-end-0"><i class="ri-search-line"></i></span>
      <input type="text" class="form-control border-start-0" placeholder="Nom du pack…"
             [(ngModel)]="search" (input)="applyFilter()" />
    </div>
    <button class="btn btn-sm btn-danger" (click)="openAdd()">
      <i class="ri-add-line me-1"></i>Nouveau pack
    </button>
  </div>

  <div class="card-body p-0">
    @if (loading) { <div class="text-center py-5"><div class="spinner-border text-danger"></div></div> }
    @else if (filtered.length === 0) {
      <div class="text-center py-5">
        <i class="ri-rocket-line display-3 text-muted opacity-50"></i>
        <p class="text-muted mt-2 mb-3">Aucun pack.</p>
        <button class="btn btn-danger" (click)="openAdd()"><i class="ri-add-line"></i> Créer le premier</button>
      </div>
    } @else {
      <div class="row g-3 p-3">
        @for (p of filtered; track p.id) {
          <div class="col-md-6 col-xl-4">
            <div class="card border-0 shadow-sm h-100" [style.opacity]="p.active ? 1 : 0.6">
              <div class="card-header bg-danger-subtle d-flex align-items-center justify-content-between">
                <h6 class="mb-0 fw-bold text-danger">
                  <i class="ri-rocket-2-line me-1"></i>{{ p.title }}
                </h6>
                @if (p.active) { <span class="badge bg-success">Actif</span> }
                @else { <span class="badge bg-secondary">Inactif</span> }
              </div>
              <div class="card-body">
                <div class="d-flex align-items-baseline gap-2 mb-3">
                  <h2 class="mb-0 fw-bold text-success">{{ p.price | number:'1.0-2' }}</h2>
                  <span class="text-muted">TND</span>
                  @if (p.discount > 0) {
                    <span class="badge bg-danger ms-auto">-{{ p.discount }}%</span>
                  }
                </div>
                <div class="d-flex align-items-center gap-2 mb-3 fs-12">
                  <i class="ri-time-line text-muted"></i>
                  <span>Jusqu'à <strong>{{ p.maxDuration }}</strong> jours</span>
                  @if (p.ordersCount > 0) {
                    <span class="ms-auto badge bg-info-subtle text-info">{{ p.ordersCount }} cmd</span>
                  }
                </div>
                <ul class="list-unstyled fs-12 mb-0">
                  @if (p.sliders)     { <li class="text-success mb-1"><i class="ri-check-line"></i> Slider accueil</li> }
                  @if (p.sideBar)     { <li class="text-success mb-1"><i class="ri-check-line"></i> Sidebar</li> }
                  @if (p.footer)      { <li class="text-success mb-1"><i class="ri-check-line"></i> Footer</li> }
                  @if (p.relatedPost) { <li class="text-success mb-1"><i class="ri-check-line"></i> Posts similaires</li> }
                  @if (p.firstLogin)  { <li class="text-success mb-1"><i class="ri-check-line"></i> Box 1ère connexion</li> }
                  @if (p.links)       { <li class="text-success mb-1"><i class="ri-check-line"></i> Liens ajoutés</li> }
                </ul>
              </div>
              <div class="card-footer bg-white border-top d-flex gap-2">
                <button class="btn btn-sm btn-light flex-fill" (click)="openEdit(p)">
                  <i class="ri-edit-2-line text-info"></i> Modifier
                </button>
                <button class="btn btn-sm btn-light" (click)="toggleActive(p)" [title]="p.active ? 'Désactiver' : 'Activer'">
                  <i [class]="p.active ? 'ri-pause-circle-line text-warning' : 'ri-play-circle-line text-success'"></i>
                </button>
                <button class="btn btn-sm btn-light" (click)="remove(p)" title="Supprimer">
                  <i class="ri-delete-bin-line text-danger"></i>
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    }
  </div>
</div>

@if (showForm) {
  <div class="modal fade show d-block" tabindex="-1" style="background:rgba(0,0,0,.5)" (click)="cancel($event)">
    <div class="modal-dialog modal-lg modal-dialog-centered" (click)="$event.stopPropagation()">
      <div class="modal-content border-0 shadow-lg">
        <div class="modal-header bg-danger-subtle">
          <h5 class="modal-title fw-bold text-danger">
            <i class="ri-rocket-2-line me-2"></i>{{ editingId ? 'Modifier le pack' : 'Nouveau pack Boost' }}
          </h5>
          <button type="button" class="btn-close" (click)="cancel()"></button>
        </div>
        <div class="modal-body">
          @if (saveError) {
            <div class="alert alert-danger fs-13"><i class="ri-error-warning-line me-2"></i>{{ saveError }}</div>
          }
          <div class="row g-3">
            <div class="col-md-8">
              <label class="form-label fs-12 fw-semibold">Nom du pack *</label>
              <input class="form-control form-control-sm" [(ngModel)]="form.title" placeholder="Ex : Pack Premium" />
            </div>
            <div class="col-md-4">
              <label class="form-label fs-12 fw-semibold">Durée max (jours)</label>
              <input type="number" min="1" max="366" class="form-control form-control-sm" [(ngModel)]="form.maxDuration" />
            </div>
            <div class="col-md-4">
              <label class="form-label fs-12 fw-semibold">Prix (TND) *</label>
              <input type="number" min="0" step="0.01" class="form-control form-control-sm" [(ngModel)]="form.price" />
            </div>
            <div class="col-md-4">
              <label class="form-label fs-12 fw-semibold">Remise (%)</label>
              <input type="number" min="0" max="100" step="0.01" class="form-control form-control-sm" [(ngModel)]="form.discount" />
            </div>
            <div class="col-md-4">
              <label class="form-label fs-12 fw-semibold">Nombre de commandes</label>
              <input type="number" min="0" class="form-control form-control-sm" [(ngModel)]="form.ordersCount" />
            </div>
            <div class="col-12">
              <hr class="my-2" />
              <h6 class="fs-13 fw-bold mb-2 text-danger"><i class="ri-bullseye-line me-1"></i>Emplacements de l'annonce</h6>
            </div>
            <div class="col-md-4">
              <div class="form-check"><input class="form-check-input" type="checkbox" id="bp-sl" [(ngModel)]="form.sliders" />
                <label class="form-check-label fs-13" for="bp-sl">Slider accueil</label></div>
            </div>
            <div class="col-md-4">
              <div class="form-check"><input class="form-check-input" type="checkbox" id="bp-sb" [(ngModel)]="form.sideBar" />
                <label class="form-check-label fs-13" for="bp-sb">Sidebar</label></div>
            </div>
            <div class="col-md-4">
              <div class="form-check"><input class="form-check-input" type="checkbox" id="bp-ft" [(ngModel)]="form.footer" />
                <label class="form-check-label fs-13" for="bp-ft">Footer</label></div>
            </div>
            <div class="col-md-4">
              <div class="form-check"><input class="form-check-input" type="checkbox" id="bp-rp" [(ngModel)]="form.relatedPost" />
                <label class="form-check-label fs-13" for="bp-rp">Posts similaires</label></div>
            </div>
            <div class="col-md-4">
              <div class="form-check"><input class="form-check-input" type="checkbox" id="bp-fl" [(ngModel)]="form.firstLogin" />
                <label class="form-check-label fs-13" for="bp-fl">Box 1ère connexion</label></div>
            </div>
            <div class="col-md-4">
              <div class="form-check"><input class="form-check-input" type="checkbox" id="bp-lk" [(ngModel)]="form.links" />
                <label class="form-check-label fs-13" for="bp-lk">Liens ajoutés</label></div>
            </div>
            <div class="col-12">
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="bp-act" [(ngModel)]="form.active" />
                <label class="form-check-label fs-13" for="bp-act">Pack actif</label>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-light" (click)="cancel()" [disabled]="saving">Annuler</button>
          <button class="btn btn-danger" (click)="save()" [disabled]="saving">
            @if (saving) { <span class="spinner-border spinner-border-sm me-1"></span> }
            <i class="ri-save-line me-1"></i> Enregistrer
          </button>
        </div>
      </div>
    </div>
  </div>
}
`,
})
export class BoostPacksAdminComponent implements OnInit {
  breadCrumbItems = [{ label: 'Admin' }, { label: 'Packs Boost', active: true }];

  items: BoostPackRow[]    = [];
  filtered: BoostPackRow[] = [];
  search = '';
  loading = true;

  showForm = false;
  saving   = false;
  saveError = '';
  editingId: number | null = null;
  form = {
    title: '', price: 0, discount: 0, maxDuration: 30, ordersCount: 0,
    sliders: false, sideBar: false, footer: false, relatedPost: false, firstLogin: false, links: false, active: true,
  };

  get activeCount(): number       { return this.items.filter(p => p.active).length; }
  get withDiscountCount(): number { return this.items.filter(p => p.discount > 0).length; }
  get avgPrice(): number {
    return this.items.length ? this.items.reduce((s, p) => s + p.price, 0) / this.items.length : 0;
  }

  constructor(private api: TijaraApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.adminList('boost-packs').subscribe({
      next: (data: any[]) => {
        this.items = (data || []).map((p: any) => ({
          id:          +(p.id_boost ?? p.IdBoost ?? p.id ?? 0),
          title:        p.title       ?? p.Title       ?? '',
          price:       +(p.price       ?? p.Price       ?? 0),
          discount:    +(p.discount    ?? p.Discount    ?? 0),
          maxDuration:+(p.max_duration ?? p.MaxDuration ?? 30),
          ordersCount:+(p.orders_count ?? p.OrdersCount ?? 0),
          sliders:    !!(p.sliders     ?? p.Sliders     ?? false),
          sideBar:    !!(p.side_bar    ?? p.SideBar     ?? false),
          footer:     !!(p.footer      ?? p.Footer      ?? false),
          relatedPost:!!(p.related_post?? p.RelatedPost ?? false),
          firstLogin: !!(p.first_login ?? p.FirstLogin  ?? false),
          links:      !!(p.links       ?? p.Links       ?? false),
          active:     !!(p.active      ?? p.Active      ?? true),
        }));
        this.applyFilter();
        this.loading = false;
      },
      error: () => { this.loading = false; alert('Chargement impossible.'); }
    });
  }

  applyFilter(): void {
    const s = this.search.trim().toLowerCase();
    this.filtered = this.items.filter(p => !s || p.title.toLowerCase().includes(s));
  }

  openAdd(): void {
    this.editingId = null; this.saveError = '';
    this.form = {
      title: '', price: 0, discount: 0, maxDuration: 30, ordersCount: 0,
      sliders: false, sideBar: false, footer: false, relatedPost: false, firstLogin: false, links: false, active: true,
    };
    this.showForm = true;
  }
  openEdit(p: BoostPackRow): void {
    this.editingId = p.id; this.saveError = '';
    this.form = { title: p.title, price: p.price, discount: p.discount, maxDuration: p.maxDuration, ordersCount: p.ordersCount,
      sliders: p.sliders, sideBar: p.sideBar, footer: p.footer, relatedPost: p.relatedPost, firstLogin: p.firstLogin, links: p.links, active: p.active };
    this.showForm = true;
  }
  cancel(_ev?: Event): void { this.showForm = false; this.saving = false; this.saveError = ''; }

  save(): void {
    if (!this.form.title.trim()) { this.saveError = 'Le nom est requis.'; return; }
    this.saving = true; this.saveError = '';
    const payload = {
      Title: this.form.title, Price: +this.form.price, Discount: +this.form.discount,
      MaxDuration: +this.form.maxDuration, OrdersCount: +this.form.ordersCount,
      Sliders: this.form.sliders, SideBar: this.form.sideBar, Footer: this.form.footer,
      RelatedPost: this.form.relatedPost, FirstLogin: this.form.firstLogin, Links: this.form.links,
      Active: this.form.active,
    };
    const op = this.editingId
      ? this.api.adminUpdate('boost-packs', this.editingId, payload)
      : this.api.adminCreate('boost-packs', payload);
    op.subscribe({
      next: () => { this.saving = false; this.showForm = false; this.load(); },
      error: (err) => { this.saving = false; this.saveError = err?.error?.message || 'Erreur d\'enregistrement.'; },
    });
  }

  toggleActive(p: BoostPackRow): void {
    this.api.adminUpdate('boost-packs', p.id, {
      Title: p.title, Price: p.price, Discount: p.discount, MaxDuration: p.maxDuration, OrdersCount: p.ordersCount,
      Sliders: p.sliders, SideBar: p.sideBar, Footer: p.footer, RelatedPost: p.relatedPost,
      FirstLogin: p.firstLogin, Links: p.links, Active: !p.active,
    }).subscribe({
      next: () => { p.active = !p.active; this.applyFilter(); },
      error: () => alert('Action impossible.'),
    });
  }
  remove(p: BoostPackRow): void {
    if (!confirm(`Supprimer le pack "${p.title}" ?`)) return;
    this.api.adminDelete('boost-packs', p.id).subscribe({
      next: () => { this.items = this.items.filter(x => x.id !== p.id); this.applyFilter(); },
      error: () => alert('Suppression impossible.'),
    });
  }
}
