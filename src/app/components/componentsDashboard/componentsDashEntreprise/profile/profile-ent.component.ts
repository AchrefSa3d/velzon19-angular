import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

@Component({
  selector: 'app-profile-ent',
  templateUrl: './profile-ent.component.html',
  styleUrls: ['./profile-ent.component.scss'],
  standalone: false
})
export class ProfileEntComponent implements OnInit {

  breadCrumbItems = [
    { label: 'Vendeur' },
    { label: 'Mon Profil', active: true }
  ];

  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  submitted = false;
  pwdSubmitted = false;
  saveSuccess = false;
  pwdSuccess = false;
  showPwd = false;
  showNewPwd = false;
  activeTab = 'infos';

  wilayas = [
    'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Sousse', 'Sfax',
    'Monastir', 'Mahdia', 'Kairouan', 'Bizerte', 'Béja', 'Jendouba',
    'Gabès', 'Médenine', 'Gafsa', 'Tozeur', 'Kébili', 'Tataouine', 'Kasserine'
  ];

  categories = ['Électronique', 'Mode', 'Maison', 'Sport', 'Beauté', 'Jouets', 'Alimentation', 'Autre'];

  stats = [
    { label: 'Produits en ligne', value: 12,        icon: 'ri-box-3-line',          color: 'primary' },
    { label: 'Commandes totales', value: 48,         icon: 'ri-shopping-bag-3-line', color: 'success' },
    { label: 'Note moyenne',      value: '4.7 / 5',  icon: 'ri-star-fill',           color: 'warning' },
    { label: 'Membre depuis',     value: 'Jan 2026', icon: 'ri-calendar-check-line', color: 'info'    },
  ];

  constructor(private fb: FormBuilder, private api: TijaraApiService) {}

  ngOnInit(): void {
    const user = JSON.parse(sessionStorage.getItem('currentUser') || '{}');

    this.profileForm = this.fb.group({
      firstName:   [user.firstName || user.first_name || '',  [Validators.required]],
      lastName:    [user.lastName  || user.last_name  || '',  [Validators.required]],
      email:       [user.email     || '',  [Validators.required, Validators.email]],
      phone:       [user.phone     || '',  [Validators.required, Validators.pattern(/^[2459]\d{7}$/)]],
      shopName:    ['', [Validators.required, Validators.minLength(3)]],
      category:    ['', Validators.required],
      wilaya:      [user.city || '', Validators.required],
      description: [''],
      website:     [''],
    });

    // Charger depuis le vrai backend
    this.api.getMe().subscribe({
      next: (u: any) => {
        this.profileForm.patchValue({
          firstName: u.first_name || u.firstName || '',
          lastName:  u.last_name  || u.lastName  || '',
          email:     u.email || '',
          phone:     u.phone || '',
          wilaya:    u.city  || '',
        });
      }
    });

    this.passwordForm = this.fb.group({
      currentPwd: ['', Validators.required],
      newPwd:     ['', [Validators.required, Validators.minLength(6)]],
      confirmPwd: ['', Validators.required],
    });
  }

  get f()  { return this.profileForm.controls; }
  get fp() { return this.passwordForm.controls; }

  saveProfile() {
    this.submitted = true;
    if (this.profileForm.invalid) return;
    // Mise à jour sessionStorage
    const user = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    const updated = { ...user, ...this.profileForm.value };
    sessionStorage.setItem('currentUser', JSON.stringify(updated));
    this.saveSuccess = true;
    setTimeout(() => this.saveSuccess = false, 3000);
    this.submitted = false;
  }

  changePassword() {
    this.pwdSubmitted = true;
    if (this.passwordForm.invalid) return;
    if (this.fp['newPwd'].value !== this.fp['confirmPwd'].value) return;
    this.pwdSuccess = true;
    this.passwordForm.reset();
    this.pwdSubmitted = false;
    setTimeout(() => this.pwdSuccess = false, 3000);
  }

  get pwdMismatch(): boolean {
    return this.pwdSubmitted &&
      this.fp['newPwd'].value !== this.fp['confirmPwd'].value;
  }
}
