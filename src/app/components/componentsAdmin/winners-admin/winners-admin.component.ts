import { Component, OnInit } from '@angular/core';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

interface WinnerRow {
  id: number;
  idUser: number | null;
  idPrize: number | null;
  idOrder: number | null;
  fullName: string;
  email: string;
  phone: string;
  note: string;
  active: boolean;
  userName: string;
  prizeTitle: string;
}

@Component({
  selector: 'app-winners-admin',
  standalone: false,
  template: `
<app-breadcrumbs title="Gagnants" [breadcrumbItems]="breadCrumbItems"></app-breadcrumbs>

<div class="row g-3 mb-4">
  <div class="col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid #f7b84b">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-warning-subtle d-flex align-items-center justify-content-center">
          <i class="ri-trophy-line fs-22 text-warning"></i>
        </div>
        <div><h3 class="mb-0 fw-bold text-warning">{{ items.length }}</h3>
        <p class="mb-0 fs-12 text-muted">Total gagnants</p></div>
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
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid #564ab1">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 d-flex align-items-center justify-content-center" style="background:#564ab120">
          <i class="ri-user-star-line fs-22" style="color:#564ab1"></i>
        </div>
        <div><h3 class="mb-0 fw-bold" style="color:#564ab1">{{ withUserCount }}</h3>
        <p class="mb-0 fs-12 text-muted">Comptes liés</p></div>
      </div>
    </div>
  </div>
  <div class="col-md-3">
    <div class="card border-0 shadow-sm h-100" style="border-left:4px solid #299cdb">
      <div class="card-body d-flex align-items-center gap-3 py-3">
        <div class="avatar-md rounded-3 bg-info-subtle d-flex align-items-center justify-content-center">
          <i class="ri-mail-line fs-22 text-info"></i>
        </div>
        <div><h3 class="mb-0 fw-bold text-info">{{ withEmailCount }}</h3>
        <p class="mb-0 fs-12 text-muted">Avec email</p></div>
      </div>
    </div>
  </div>
</div>

<div class="card border-0 shadow-sm">
  <div class="card-header bg-transparent d-flex flex-wrap align-items-center gap-2 py-3">
    <h6 class="mb-0 fw-semibold flex-grow-1">
      <i class="ri-trophy-line me-2 text-warning"></i>Liste des gagnants
      <span class="badge bg-warning-subtle text-warning ms-2">{{ filtered.length }}</span>
    </h6>
    <div class="input-group input-group-sm" style="max-width:240px">
      <span class="input-group-text bg-white border-end-0"><i class="ri-search-line"></i></span>
      <input type="text" class="form-control border-start-0" placeholder="Nom, email, prix…"
             [(ngModel)]="search" (input)="applyFilter()" />
    </div>
    <button class="btn btn-sm btn-warning" (click)="openAdd()">
      <i class="ri-add-line me-1"></i>Nouveau gagnant
    </button>
  </div>

  <div class="card-body p-0">
    @if (loading) { <div class="text-center py-5"><div class="spinner-border text-warning"></div></div> }
    @else if (filtered.length === 0) {
      <div class="text-center py-5">
        <i class="ri-trophy-line display-3 text-muted opacity-50"></i>
        <p class="text-muted mt-2 mb-3">Aucun gagnant.</p>
        <button class="btn btn-warning" (click)="openAdd()"><i class="ri-add-line"></i> Ajouter le premier</button>
      </div>
    } @else {
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-3">Gagnant</th>
              <th>Contact</th>
              <th>Prix</th>
              <th>Commande</th>
              <th class="text-center">Statut</th>
              <th class="text-end pe-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (w of filtered; track w.id) {
              <tr>
                <td class="ps-3">
                  <div class="d-flex align-items-center gap-2">
                    <div class="avatar-sm rounded-circle bg-warning-subtle text-warning
                                d-flex align-items-center justify-content-center fw-bold fs-13">
                      {{ getInitials(w.fullName || w.userName) }}
                    </div>
                    <div class="min-w-0">
                      <div class="fs-13 fw-semibold">{{ w.fullName || w.userName || '—' }}</div>
                      @if (w.idUser) { <div class="fs-11 text-muted">User #{{ w.idUser }}</div> }
                    </div>
                  </div>
                </td>
                <td class="fs-12">
                  @if (w.email) { <div><i class="ri-mail-line text-muted me-1"></i>{{ w.email }}</div> }
                  @if (w.phone) { <div class="text-muted"><i class="ri-phone-line"></i> {{ w.phone }}</div> }
                </td>
                <td>
                  @if (w.prizeTitle) {
                    <span class="badge bg-warning-subtle text-warning">
                      <i class="ri-gift-line me-1"></i>{{ w.prizeTitle }}
                    </span>
                  } @else if (w.idPrize) {
                    <span class="badge bg-light text-muted">Prix #{{ w.idPrize }}</span>
                  } @else { <span class="text-muted fs-11">—</span> }
                </td>
                <td class="fs-12">
                  @if (w.idOrder) {
                    <span class="badge bg-info-subtle text-info">#{{ w.idOrder }}</span>
                  } @else { <span class="text-muted">—</span> }
                </td>
                <td class="text-center">
                  @if (w.active) { <span class="badge bg-success-subtle text-success">Actif</span> }
                  @else { <span class="badge bg-secondary-subtle text-secondary">Inactif</span> }
                </td>
                <td class="text-end pe-3">
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-light" (click)="openEdit(w)" title="Modifier">
                      <i class="ri-edit-2-line text-info"></i>
                    </button>
                    <button class="btn btn-light" (click)="toggleActive(w)" [title]="w.active ? 'Désactiver' : 'Activer'">
                      <i [class]="w.active ? 'ri-pause-circle-line text-warning' : 'ri-play-circle-line text-success'"></i>
                    </button>
                    <button class="btn btn-light" (click)="remove(w)" title="Supprimer">
                      <i class="ri-delete-bin-line text-danger"></i>
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  </div>
</div>

@if (showForm) {
  <div class="modal fade show d-block" tabindex="-1" style="background:rgba(0,0,0,.5)" (click)="cancel($event)">
    <div class="modal-dialog modal-lg modal-dialog-centered" (click)="$event.stopPropagation()">
      <div class="modal-content border-0 shadow-lg">
        <div class="modal-header bg-warning-subtle">
          <h5 class="modal-title fw-bold text-warning">
            <i class="ri-trophy-line me-2"></i>{{ editingId ? 'Modifier le gagnant' : 'Nouveau gagnant' }}
          </h5>
          <button type="button" class="btn-close" (click)="cancel()"></button>
        </div>
        <div class="modal-body">
          @if (saveError) {
            <div class="alert alert-danger fs-13"><i class="ri-error-warning-line me-2"></i>{{ saveError }}</div>
          }
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fs-12 fw-semibold">Nom complet *</label>
              <input class="form-control form-control-sm" [(ngModel)]="form.fullName" placeholder="Ex : Saad Achraf" />
            </div>
            <div class="col-md-6">
              <label class="form-label fs-12 fw-semibold">Email</label>
              <input type="email" class="form-control form-control-sm" [(ngModel)]="form.email" />
            </div>
            <div class="col-md-4">
              <label class="form-label fs-12 fw-semibold">Téléphone</label>
              <input class="form-control form-control-sm" [(ngModel)]="form.phone" />
            </div>
            <div class="col-md-4">
              <label class="form-label fs-12 fw-semibold">ID utilisateur (option.)</label>
              <input type="number" min="0" class="form-control form-control-sm" [(ngModel)]="form.idUser" />
            </div>
            <div class="col-md-4">
              <label class="form-label fs-12 fw-semibold">ID prix</label>
              <input type="number" min="0" class="form-control form-control-sm" [(ngModel)]="form.idPrize" />
            </div>
            <div class="col-md-6">
              <label class="form-label fs-12 fw-semibold">ID commande (option.)</label>
              <input type="number" min="0" class="form-control form-control-sm" [(ngModel)]="form.idOrder" />
            </div>
            <div class="col-md-6 d-flex align-items-end">
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="winner-active" [(ngModel)]="form.active" />
                <label class="form-check-label fs-13" for="winner-active">Actif</label>
              </div>
            </div>
            <div class="col-12">
              <label class="form-label fs-12 fw-semibold">Note interne</label>
              <textarea class="form-control form-control-sm" rows="2" [(ngModel)]="form.note"></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-light" (click)="cancel()" [disabled]="saving">Annuler</button>
          <button class="btn btn-warning" (click)="save()" [disabled]="saving">
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
export class WinnersAdminComponent implements OnInit {
  breadCrumbItems = [{ label: 'Admin' }, { label: 'Gagnants', active: true }];

  items: WinnerRow[]    = [];
  filtered: WinnerRow[] = [];
  search = '';
  loading = true;

  showForm = false;
  saving   = false;
  saveError = '';
  editingId: number | null = null;
  form: any = { fullName: '', email: '', phone: '', idUser: null, idPrize: null, idOrder: null, note: '', active: true };

  get activeCount(): number     { return this.items.filter(w => w.active).length; }
  get withUserCount(): number   { return this.items.filter(w => !!w.idUser).length; }
  get withEmailCount(): number  { return this.items.filter(w => !!w.email).length; }

  constructor(private api: TijaraApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.adminList('winners').subscribe({
      next: (data: any[]) => {
        this.items = (data || []).map((w: any) => ({
          id:        +(w.id_winner ?? w.IdWinner ?? w.id ?? 0),
          idUser:   (w.id_user    ?? w.IdUser    ?? null),
          idPrize:  (w.id_prize   ?? w.IdPrize   ?? null),
          idOrder:  (w.id_order   ?? w.IdOrder   ?? null),
          fullName:  w.full_name   ?? w.FullName  ?? '',
          email:     w.email       ?? w.Email     ?? '',
          phone:     w.phone       ?? w.Phone     ?? '',
          note:      w.note        ?? w.Note      ?? '',
          active:  !!(w.active     ?? w.Active    ?? true),
          userName:  w.user_name   ?? w.UserName  ?? '',
          prizeTitle:w.prize_title ?? w.PrizeTitle?? '',
        }));
        this.applyFilter();
        this.loading = false;
      },
      error: () => { this.loading = false; alert('Chargement impossible.'); }
    });
  }

  applyFilter(): void {
    const s = this.search.trim().toLowerCase();
    this.filtered = this.items.filter(w =>
      !s || `${w.fullName} ${w.userName} ${w.email} ${w.prizeTitle}`.toLowerCase().includes(s));
  }

  openAdd(): void {
    this.editingId = null; this.saveError = '';
    this.form = { fullName: '', email: '', phone: '', idUser: null, idPrize: null, idOrder: null, note: '', active: true };
    this.showForm = true;
  }
  openEdit(w: WinnerRow): void {
    this.editingId = w.id; this.saveError = '';
    this.form = {
      fullName: w.fullName, email: w.email, phone: w.phone,
      idUser: w.idUser, idPrize: w.idPrize, idOrder: w.idOrder,
      note: w.note, active: w.active,
    };
    this.showForm = true;
  }
  cancel(_ev?: Event): void { this.showForm = false; this.saving = false; this.saveError = ''; }

  save(): void {
    if (!this.form.fullName?.trim()) { this.saveError = 'Le nom est requis.'; return; }
    this.saving = true; this.saveError = '';
    const payload = {
      IdUser: this.form.idUser || null, IdPrize: this.form.idPrize || null, IdOrder: this.form.idOrder || null,
      FullName: this.form.fullName, Email: this.form.email, Phone: this.form.phone,
      Note: this.form.note, Active: this.form.active,
    };
    const op = this.editingId
      ? this.api.adminUpdate('winners', this.editingId, payload)
      : this.api.adminCreate('winners', payload);
    op.subscribe({
      next: () => { this.saving = false; this.showForm = false; this.load(); },
      error: (err) => { this.saving = false; this.saveError = err?.error?.message || 'Erreur d\'enregistrement.'; },
    });
  }

  toggleActive(w: WinnerRow): void {
    this.api.adminPatch(`winners/${w.id}/toggle`).subscribe({
      next: () => { w.active = !w.active; this.applyFilter(); },
      error: () => alert('Action impossible.'),
    });
  }
  remove(w: WinnerRow): void {
    if (!confirm(`Supprimer le gagnant "${w.fullName || w.userName}" ?`)) return;
    this.api.adminDelete('winners', w.id).subscribe({
      next: () => { this.items = this.items.filter(x => x.id !== w.id); this.applyFilter(); },
      error: () => alert('Suppression impossible.'),
    });
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').filter(Boolean).map(w => w[0]).join('').substring(0, 2).toUpperCase();
  }
}
