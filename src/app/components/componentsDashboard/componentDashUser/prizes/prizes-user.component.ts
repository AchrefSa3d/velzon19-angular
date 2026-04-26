import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

interface Prize {
  id: number;
  title: string;
  description: string;
  image: string;
  datePrize: string | null;
  winnerName: string;
  isAttributed: boolean;
}

interface Winner { id: number; fullName: string; prizeTitle: string; prizeImage: string; }

@Component({
  selector: 'app-prizes-user',
  standalone: false,
  template: `
<app-breadcrumbs title="Prix & Tirages" [breadcrumbItems]="breadCrumbItems"></app-breadcrumbs>

<div class="card border-0 shadow-sm mb-4 overflow-hidden"
     style="background:linear-gradient(135deg,#f7b84b 0%,#0ab39c 100%)">
  <div class="card-body text-white py-4">
    <div class="d-flex flex-wrap align-items-center gap-3">
      <div class="avatar-lg rounded-3 d-flex align-items-center justify-content-center"
           style="background:rgba(255,255,255,.2)">
        <i class="ri-trophy-fill fs-1"></i>
      </div>
      <div class="flex-grow-1">
        <h3 class="text-white mb-1">Prix & cadeaux à gagner 🎁</h3>
        <p class="text-white-50 mb-0">Découvrez les prix et les gagnants de la communauté Tijara.</p>
      </div>
    </div>
  </div>
</div>

<!-- Prix disponibles -->
<div class="card border-0 shadow-sm mb-4">
  <div class="card-header bg-transparent py-3">
    <h6 class="mb-0 fw-semibold">
      <i class="ri-gift-line me-2 text-warning"></i>Prix disponibles
      <span class="badge bg-warning-subtle text-warning ms-2">{{ prizes.length }}</span>
    </h6>
  </div>
  <div class="card-body">
    @if (loading) { <div class="text-center py-3"><div class="spinner-border text-warning"></div></div> }
    @else if (prizes.length === 0) {
      <p class="text-center text-muted fs-13 py-4 mb-0">Aucun prix actif pour le moment.</p>
    } @else {
      <div class="row g-3">
        @for (p of prizes; track p.id) {
          <div class="col-md-6 col-xl-4">
            <div class="card border-0 shadow-sm h-100">
              <div class="position-relative">
                @if (p.image) {
                  <img [src]="p.image" alt="" class="card-img-top"
                       style="height:180px;object-fit:cover" (error)="p.image=''" />
                } @else {
                  <div class="card-img-top bg-warning-subtle d-flex align-items-center justify-content-center"
                       style="height:180px">
                    <i class="ri-gift-line text-warning" style="font-size:60px"></i>
                  </div>
                }
                <div class="position-absolute top-0 end-0 m-2">
                  @if (p.isAttributed) {
                    <span class="badge bg-success">Attribué</span>
                  } @else {
                    <span class="badge bg-warning">À gagner</span>
                  }
                </div>
              </div>
              <div class="card-body">
                <h6 class="fw-semibold mb-1">{{ p.title }}</h6>
                <p class="text-muted fs-12 mb-2">{{ p.description || '—' }}</p>
                @if (p.datePrize) {
                  <div class="fs-11 text-muted"><i class="ri-calendar-line"></i> {{ formatDate(p.datePrize) }}</div>
                }
                @if (p.isAttributed && p.winnerName) {
                  <div class="mt-2 fs-12 text-success fw-semibold">
                    <i class="ri-trophy-line"></i> Gagné par {{ p.winnerName }}
                  </div>
                }
              </div>
            </div>
          </div>
        }
      </div>
    }
  </div>
</div>

<!-- Hall of fame -->
@if (winners.length > 0) {
  <div class="card border-0 shadow-sm">
    <div class="card-header bg-transparent py-3">
      <h6 class="mb-0 fw-semibold">
        <i class="ri-trophy-fill me-2 text-warning"></i>Mur des gagnants
        <span class="badge bg-warning-subtle text-warning ms-2">{{ winners.length }}</span>
      </h6>
    </div>
    <div class="card-body">
      <div class="row g-3">
        @for (w of winners; track w.id) {
          <div class="col-md-6 col-xl-4">
            <div class="d-flex align-items-center gap-3 p-3 rounded bg-light">
              @if (w.prizeImage) {
                <img [src]="w.prizeImage" alt="" class="rounded" width="60" height="60" style="object-fit:cover" />
              } @else {
                <div class="rounded bg-warning-subtle text-warning d-flex align-items-center justify-content-center"
                     style="width:60px;height:60px"><i class="ri-trophy-line fs-22"></i></div>
              }
              <div class="flex-grow-1 min-w-0">
                <div class="fw-semibold fs-13 text-truncate">{{ w.fullName || '—' }}</div>
                <div class="fs-11 text-muted">a gagné</div>
                <div class="fs-12 text-warning fw-semibold text-truncate">{{ w.prizeTitle || '—' }}</div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  </div>
}
`,
})
export class PrizesUserComponent implements OnInit {
  breadCrumbItems = [{ label: 'Compte' }, { label: 'Prix & tirages', active: true }];

  prizes: Prize[]   = [];
  winners: Winner[] = [];
  loading = true;

  constructor(private api: TijaraApiService) {}

  ngOnInit(): void {
    forkJoin({
      prizes:  this.api.getPublicPrizes().pipe(catchError(() => of([] as any[]))),
      winners: this.api.getPublicWinners().pipe(catchError(() => of([] as any[]))),
    }).subscribe(({ prizes, winners }) => {
      this.prizes = (prizes || []).map((p: any) => ({
        id:           +(p.id_prize ?? p.idPrize ?? 0),
        title:         p.title       ?? '',
        description:   p.description ?? '',
        image:         p.image       ?? '',
        datePrize:     p.date_prize  ?? p.datePrize  ?? null,
        winnerName:    p.winner_name ?? p.winnerName ?? '',
        isAttributed: !!(p.id_user   ?? p.idUser),
      }));
      this.winners = (winners || []).map((w: any) => ({
        id:         +(w.id_winner ?? w.idWinner ?? 0),
        fullName:    w.full_name   ?? w.fullName   ?? '',
        prizeTitle:  w.prize_title ?? w.prizeTitle ?? '',
        prizeImage:  w.prize_image ?? w.prizeImage ?? '',
      }));
      this.loading = false;
    });
  }

  formatDate(d: string | null): string {
    if (!d) return '';
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? '' : dt.toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' });
  }
}
