import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

@Component({
    selector: 'app-public-detail',
    templateUrl: './detail.component.html',
    styleUrls: ['./detail.component.scss'],
    standalone: false
})
export class PublicDetailComponent implements OnInit {

    type: 'annonces' | 'deals' | 'produits' = 'produits';
    item: any = null;
    similar: any[] = [];
    loading = true;
    showLoginToast = false;
    selectedImage = 0;
    qty = 1;

    private readonly PROD_COLORS = ['#6691e7','#f06548','#0ab39c','#405189','#f7b84b','#299cdb'];

    get isLoggedIn(): boolean {
        try { return !!localStorage.getItem('currentUser'); } catch { return false; }
    }

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private api: TijaraApiService
    ) {}

    ngOnInit(): void {
        this.route.data.subscribe(d => { if (d['listingType']) this.type = d['listingType']; });
        this.route.params.subscribe(p => { if (p['id']) this.load(+p['id']); });
    }

    private load(id: number): void {
        this.loading = true;
        const call = this.type === 'annonces' ? this.api.getAnnonce(id)
                   : this.type === 'deals'    ? this.api.getDeal(id)
                   : this.api.getProduct(id);

        call.subscribe({
            next: (r: any) => {
                this.item = this.mapItem(r, 0);
                this.loadSimilar();
                this.checkWishlistState(id);
                this.loadReviews(id);
                this.loading = false;
            },
            error: () => {
                this.item = this.getDemoItem(id);
                this.similar = this.getDemoSimilar();
                this.loading = false;
            }
        });
    }

    private loadSimilar(): void {
        const call = this.type === 'annonces' ? this.api.getAnnonces()
                   : this.type === 'deals'    ? this.api.getDeals()
                   : this.api.getProducts({ limit: 6 });

        call.subscribe({
            next: (r: any) => {
                const raw: any[] = Array.isArray(r) ? r : (r?.data || r?.products || r?.deals || r?.ads || []);
                this.similar = raw
                    .filter(x => (x.id || x.IdDeal || x.IdProduct) !== this.item?.id)
                    .slice(0, 4)
                    .map((x, i) => this.mapItem(x, i + 1));
            },
            error: () => { this.similar = this.getDemoSimilar(); }
        });
    }

    private mapItem(item: any, i: number): any {
        const price = parseFloat(item.price || item.Price || '0') || 0;
        return {
            id:          item.id || item.IdDeal || item.IdProduct || i + 1,
            title:       item.title || item.name || 'Sans titre',
            description: item.description || '',
            details:     item.details || '',
            price,
            oldPrice:    item.original_price ? parseFloat(item.original_price) : null,
            discount:    item.discount ? parseFloat(item.discount) : null,
            images:      item.images || (item.image ? [item.image] : []),
            image:       item.image || item.image_url || null,
            category:    item.category || item.category_name || '',
            vendor:      item.vendor_name || item.shop_name || '',
            vendorId:    item.vendor_id || item.id_user || null,
            location:    item.city || item.location || '',
            date:        item.created_at || item.date_publication || '',
            rating:      parseFloat(item.rating || item.avg_rating || '0') || 0,
            reviews:     item.review_count || 0,
            badge:       item.is_boost ? 'Boost' : item.discount ? `-${Math.round(parseFloat(item.discount))}%` : null,
            bgColor:     this.PROD_COLORS[i % this.PROD_COLORS.length],
            stock:       item.quantity || item.qte || null,
            phone:       item.phone || item.Telephone || '',
        };
    }

    getStars(r: number): number[] { return Array(Math.min(5, Math.floor(r))).fill(0); }
    getEmptyStars(r: number): number[] { return Array(5 - Math.min(5, Math.floor(r))).fill(0); }

    formatPrice(p: number): string {
        return new Intl.NumberFormat('fr-TN', { minimumFractionDigits: 2 }).format(p);
    }

    formatDate(d: string): string {
        if (!d) return '';
        const dt = new Date(d);
        return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    }

    // ── Wishlist ──────────────────────────────────────────────
    isWishlisted = false;
    wishlistLoading = false;

    checkWishlistState(id: number): void {
        if (!this.isLoggedIn) return;
        const adId   = this.type === 'annonces' ? id : undefined;
        const dealId = this.type !== 'annonces'  ? id : undefined;
        this.api.checkWishlist(adId, dealId).subscribe({
            next: (r: any) => {
                this.isWishlisted = this.type === 'annonces' ? r.ad_liked : r.deal_liked;
            }
        });
    }

    toggleWishlist(): void {
        if (!this.isLoggedIn) { this.showLoginToast = true; setTimeout(() => this.showLoginToast = false, 4000); return; }
        const wType  = this.type === 'annonces' ? 'ads' : 'deals';
        this.wishlistLoading = true;
        if (this.isWishlisted) {
            this.api.removeFromWishlist(wType, this.item.id).subscribe({
                next: () => { this.isWishlisted = false; this.wishlistLoading = false; }
            });
        } else {
            this.api.addToWishlist(wType, this.item.id).subscribe({
                next: () => { this.isWishlisted = true; this.wishlistLoading = false; }
            });
        }
    }

    // ── Reviews ───────────────────────────────────────────────
    reviews: any[]      = [];
    reviewSummary: any  = { total: 0, average: 0 };
    showReviewForm      = false;
    reviewRating        = 5;
    reviewComment       = '';
    reviewSubmitting    = false;
    reviewError         = '';

    loadReviews(id: number): void {
        const t = this.type === 'annonces' ? 'ad' : this.type === 'deals' ? 'deal' : 'product';
        this.api.getReviews(t, id).subscribe({
            next: (r: any[]) => { this.reviews = r; }
        });
        this.api.getReviewSummary(t, id).subscribe({
            next: (s: any) => { this.reviewSummary = s; }
        });
    }

    submitReview(): void {
        if (!this.isLoggedIn) { this.showLoginToast = true; setTimeout(() => this.showLoginToast = false, 4000); return; }
        this.reviewSubmitting = true;
        this.reviewError      = '';
        const t = this.type === 'annonces' ? 'ad' : this.type === 'deals' ? 'deal' : 'product';
        this.api.addReviewGeneric(t, this.item.id, { rating: this.reviewRating, comment: this.reviewComment })
            .subscribe({
                next: () => {
                    this.reviewSubmitting = false;
                    this.showReviewForm   = false;
                    this.reviewComment    = '';
                    this.reviewRating     = 5;
                    this.loadReviews(this.item.id);
                },
                error: (e: any) => {
                    this.reviewSubmitting = false;
                    this.reviewError = e?.error?.message || 'Erreur lors de la soumission.';
                }
            });
    }

    setRating(n: number): void { this.reviewRating = n; }

    addToCart(): void {
        if (!this.isLoggedIn) { this.showLoginToast = true; setTimeout(() => this.showLoginToast = false, 4000); }
        else this.router.navigate(['/users/dashboard']);
    }

    goSimilar(item: any): void {
        this.router.navigate([`/landing/${this.type}/${item.id}`])
            .then(() => { this.load(item.id); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    }

    back(): void { this.router.navigate([`/landing/${this.type}`]); }

    private getDemoItem(id: number): any {
        return {
            id, title: 'Article de démonstration', description: 'Description complète de cet article disponible sur Tijara.',
            details: 'Cet article est en excellent état. Livraison possible sur toute la Tunisie.',
            price: 299, oldPrice: 350, discount: 15, images: [], image: null,
            category: 'Électronique', vendor: 'TechShop Tijara', vendorId: 1,
            location: 'Tunis', date: new Date().toISOString(),
            rating: 4.5, reviews: 32, badge: '-15%',
            bgColor: '#405189', stock: 5, phone: '+216 99 000 000',
        };
    }

    private getDemoSimilar(): any[] {
        return Array.from({ length: 4 }, (_, i) => ({
            id: i + 100, title: `Article similaire ${i + 1}`,
            price: 100 + i * 50, oldPrice: null, discount: null,
            image: null, category: 'Électronique',
            vendor: 'TechShop', location: 'Tunis',
            date: new Date().toISOString(), rating: 4, reviews: 10,
            badge: null, bgColor: this.PROD_COLORS[i % this.PROD_COLORS.length],
        }));
    }
}
