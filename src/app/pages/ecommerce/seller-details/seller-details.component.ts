import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

@Component({
  selector: 'app-seller-details',
  templateUrl: './seller-details.component.html',
  styleUrls: ['./seller-details.component.scss'],
  standalone: false
})
export class SellerDetailsComponent implements OnInit {

  breadCrumbItems = [
    { label: 'Boutique', link: '/shop/products' },
    { label: 'Profil vendeur', active: true }
  ];

  vendor: any = null;
  products: any[] = [];
  loading = true;
  error = '';
  cartItems: any[] = [];

  // Contact form
  showContactForm = false;
  contactMessage  = '';
  contactSending  = false;
  contactSuccess  = '';
  contactError    = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: TijaraApiService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.error = 'Vendeur introuvable.'; this.loading = false; return; }
    const saved = localStorage.getItem('tijara_cart');
    this.cartItems = saved ? JSON.parse(saved) : [];

    this.api.getVendorProfile(id).subscribe({
      next: (res: any) => {
        this.vendor   = res.vendor;
        this.products = res.products;
        this.loading  = false;
      },
      error: () => { this.error = 'Vendeur introuvable.'; this.loading = false; }
    });
  }

  get vendorInitials(): string {
    if (!this.vendor) return '?';
    return ((this.vendor.first_name?.[0] || '') + (this.vendor.last_name?.[0] || '')).toUpperCase();
  }

  get displayName(): string {
    return this.vendor?.shop_name || `${this.vendor?.first_name} ${this.vendor?.last_name}`;
  }

  get memberSince(): string {
    if (!this.vendor?.created_at) return '';
    return new Date(this.vendor.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('currentUser');
  }

  getStars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  addToCart(product: any) {
    const existing = this.cartItems.find((i: any) => i.product.id === product.id);
    if (existing) { existing.qty++; } else { this.cartItems.push({ product, qty: 1 }); }
    localStorage.setItem('tijara_cart', JSON.stringify(this.cartItems));
  }

  goDetail(id: number) { this.router.navigate(['/shop/product-detail', id]); }

  sendContactMessage(): void {
    if (!this.contactMessage.trim()) return;
    if (!this.isLoggedIn) { this.router.navigate(['/auth/login']); return; }

    this.contactSending = true;
    this.contactError   = '';
    this.api.startConversation({
      vendor_id: this.vendor.id,
      content:   this.contactMessage.trim()
    }).subscribe({
      next: () => {
        this.contactSuccess  = 'Message envoyé ! Le vendeur vous répondra bientôt.';
        this.contactMessage  = '';
        this.contactSending  = false;
        this.showContactForm = false;
        setTimeout(() => this.contactSuccess = '', 4000);
      },
      error: () => {
        this.contactError   = 'Impossible d\'envoyer le message.';
        this.contactSending = false;
      }
    });
  }
}
