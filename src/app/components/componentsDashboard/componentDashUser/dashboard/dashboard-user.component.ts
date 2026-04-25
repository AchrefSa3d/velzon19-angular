import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

@Component({
  selector: 'app-dashboard-user',
  templateUrl: './dashboard-user.component.html',
  standalone: false,
})
export class DashboardUserComponent implements OnInit {

  userName = '';
  today    = new Date();

  totalOrders       = 0;
  deliveredOrders   = 0;
  pendingOrders     = 0;
  reclamationsCount = 0;
  wishlistCount     = 0;
  myProductsCount   = 0;
  invoicesCount     = 0;
  unreadMessages    = 0;

  breadcrumbItems = [
    { label: 'Mon Espace' },
    { label: 'Tableau de bord', active: true },
  ];

  stats: Array<{ icon: string; label: string; value: string; color: string; link: string }> = [
    { icon: 'ri-shopping-bag-3-line',    label: 'Commandes',        value: '0', color: 'primary', link: '/users/orders' },
    { icon: 'ri-truck-line',             label: 'Livrées',          value: '0', color: 'success', link: '/users/my-deliveries' },
    { icon: 'ri-time-line',              label: 'En cours',         value: '0', color: 'warning', link: '/users/orders' },
    { icon: 'ri-heart-3-line',           label: 'Favoris',          value: '0', color: 'danger',  link: '/users/wishlist' },
    { icon: 'ri-file-text-line',         label: 'Factures',         value: '0', color: 'info',    link: '/users/my-invoices' },
    { icon: 'ri-megaphone-line',         label: 'Mes annonces',     value: '0', color: 'secondary',link: '/users/my-products' },
    { icon: 'ri-chat-3-line',            label: 'Messages',         value: '0', color: 'dark',    link: '/users/messages' },
    { icon: 'ri-customer-service-2-line',label: 'Réclamations',     value: '0', color: 'warning', link: '/users/reclamations' },
  ];

  recentOrders: any[] = [];

  categories = [
    { icon: 'ri-computer-line',   label: 'Électronique', color: 'primary',   count: '—' },
    { icon: 'ri-t-shirt-line',    label: 'Mode',         color: 'info',      count: '—' },
    { icon: 'ri-run-line',        label: 'Sport',        color: 'success',   count: '—' },
    { icon: 'ri-home-2-line',     label: 'Maison',       color: 'warning',   count: '—' },
    { icon: 'ri-leaf-line',       label: 'Bien-être',    color: 'danger',    count: '—' },
    { icon: 'ri-restaurant-line', label: 'Alimentation', color: 'secondary', count: '—' },
  ];

  get deliveryRate(): number {
    return this.totalOrders > 0 ? Math.round((this.deliveredOrders / this.totalOrders) * 100) : 0;
  }

  constructor(private api: TijaraApiService) {}

  ngOnInit(): void {
    const stored = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.userName = stored.firstName || stored.first_name || stored.email || 'Utilisateur';

    forkJoin({
      orders:       this.api.getOrders().pipe(catchError(() => of([] as any[]))),
      reclamations: this.api.getReclamations().pipe(catchError(() => of([] as any[]))),
      wishlistAds:  this.api.getWishlistAds().pipe(catchError(() => of([] as any[]))),
      wishlistDeals:this.api.getWishlistDeals().pipe(catchError(() => of([] as any[]))),
      myProducts:   this.api.getMyProducts().pipe(catchError(() => of([] as any[]))),
      invoices:     this.api.getInvoices().pipe(catchError(() => of([] as any[]))),
      categories:   this.api.getCategories().pipe(catchError(() => of([] as any[]))),
    }).subscribe(({ orders, reclamations, wishlistAds, wishlistDeals, myProducts, invoices, categories }) => {
      const wishlist = [...(wishlistAds || []), ...(wishlistDeals || [])];
      const os = orders || [];
      this.totalOrders     = os.length;
      this.deliveredOrders = os.filter((o: any) => o.status === 'delivered').length;
      this.pendingOrders   = os.filter((o: any) => ['pending','confirmed','shipped'].includes(o.status)).length;
      this.reclamationsCount = (reclamations || []).length;
      this.wishlistCount     = (wishlist     || []).length;
      this.myProductsCount   = (myProducts   || []).length;
      this.invoicesCount     = (invoices     || []).length;

      // Update stat cards
      this.stats[0].value = String(this.totalOrders);
      this.stats[1].value = String(this.deliveredOrders);
      this.stats[2].value = String(this.pendingOrders);
      this.stats[3].value = String(this.wishlistCount);
      this.stats[4].value = String(this.invoicesCount);
      this.stats[5].value = String(this.myProductsCount);
      this.stats[6].value = String(this.unreadMessages);
      this.stats[7].value = String(this.reclamationsCount);

      this.recentOrders = os.slice(0, 5).map((o: any) => ({
        id:     `#${o.id}`,
        date:   o.created_at ? new Date(o.created_at).toLocaleDateString('fr-FR') : '—',
        vendor: o.vendor_name || 'Tijara',
        total:  +o.total_amount || 0,
        status: this.mapStatus(o.status),
      }));

      (categories || []).slice(0, 6).forEach((cat: any, i: number) => {
        if (this.categories[i]) {
          this.categories[i].label = cat.name  || this.categories[i].label;
          this.categories[i].count = String(cat.product_count ?? 0);
        }
      });
    });
  }

  private mapStatus(s: string): string {
    const map: Record<string, string> = {
      pending: 'En attente', confirmed: 'Confirmée',
      shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée',
    };
    return map[s] || s || '—';
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Livrée':     'badge bg-success-subtle text-success',
      'Expédiée':   'badge bg-info-subtle text-info',
      'Confirmée':  'badge bg-primary-subtle text-primary',
      'En attente': 'badge bg-warning-subtle text-warning',
      'Annulée':    'badge bg-danger-subtle text-danger',
    };
    return map[status] || 'badge bg-secondary-subtle text-secondary';
  }
}
