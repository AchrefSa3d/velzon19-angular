import { Component, OnInit } from '@angular/core';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

@Component({
  selector: 'app-profile-user',
  templateUrl: './profile-user.component.html',
  standalone: false
})
export class ProfileUserComponent implements OnInit {

  activeTab: 'info' | 'security' | 'prefs' = 'info';
  editMode    = false;
  saveSuccess = false;
  pwdSuccess  = false;
  pwdError    = '';
  loading     = true;

  breadcrumbItems = [
    { label: 'Mon Espace' },
    { label: 'Mon Profil', active: true }
  ];

  profile = {
    firstName:     '',
    lastName:      '',
    email:         '',
    phone:         '',
    address:       '',
    city:          '',
    postalCode:    '',
    country:       'Tunisie',
    birthDate:     '',
    gender:        '',
    newsletter:    true,
    notifications: true,
  };

  editData = { ...this.profile };
  passwords = { current: '', newPwd: '', confirm: '' };
  showCurrent = false;
  showNew     = false;

  ordersStats = { total: 0, delivered: 0, pending: 0, totalSpent: 0 };

  constructor(private api: TijaraApiService) {}

  ngOnInit(): void {
    try {
      const raw = localStorage.getItem('currentUser');
      if (raw) {
        const user = JSON.parse(raw);
        this.profile.firstName = user.firstName || user.first_name || '';
        this.profile.lastName  = user.lastName  || user.last_name  || '';
        this.profile.email     = user.email || '';
        this.profile.phone     = user.phone || '';
        this.profile.city      = user.city  || '';
        this.editData = { ...this.profile };
        this.loading = false;
      }
    } catch {}

    this.api.getMe().subscribe({
      next: (user: any) => {
        this.profile.firstName = user.first_name || user.firstName || '';
        this.profile.lastName  = user.last_name  || user.lastName  || '';
        this.profile.email     = user.email  || '';
        this.profile.phone     = user.phone  || '';
        this.profile.city      = user.city   || '';
        this.editData = { ...this.profile };
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });

    this.api.getOrders().subscribe({
      next: (orders: any[]) => {
        this.ordersStats.total     = orders.length;
        this.ordersStats.delivered = orders.filter((o: any) => o.status === 'delivered').length;
        this.ordersStats.pending   = orders.filter((o: any) => o.status === 'pending').length;
        this.ordersStats.totalSpent = orders.reduce((s: number, o: any) => s + (+o.total_amount || 0), 0);
      },
      error: () => {}
    });
  }

  get initials(): string {
    const f = this.profile.firstName?.[0] || '?';
    const l = this.profile.lastName?.[0]  || '';
    return `${f}${l}`.toUpperCase();
  }

  get fullName(): string {
    return `${this.profile.firstName} ${this.profile.lastName}`.trim() || 'Client';
  }

  startEdit(): void {
    this.editData = { ...this.profile };
    this.editMode = true;
    this.saveSuccess = false;
  }

  cancelEdit(): void { this.editMode = false; }

  saveProfile(): void {
    this.profile  = { ...this.editData };
    this.editMode = false;
    this.saveSuccess = true;
    setTimeout(() => (this.saveSuccess = false), 3500);
  }

  savePassword(): void {
    this.pwdError = '';
    if (!this.passwords.current) {
      this.pwdError = 'Veuillez saisir votre mot de passe actuel.'; return;
    }
    if (this.passwords.newPwd.length < 6) {
      this.pwdError = 'Le nouveau mot de passe doit comporter au moins 6 caractères.'; return;
    }
    if (this.passwords.newPwd !== this.passwords.confirm) {
      this.pwdError = 'Les mots de passe ne correspondent pas.'; return;
    }
    this.pwdSuccess   = true;
    this.passwords    = { current: '', newPwd: '', confirm: '' };
    setTimeout(() => (this.pwdSuccess = false), 3500);
  }
}
