import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

export interface Product {
  id: number;
  name: string;
  category: string;
  category_name?: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  image: string;
  image_url?: string;
  badge?: string;
  badgeClass?: string;
  stock: number;
  vendor: string;
  vendor_name?: string;
  vendor_id?: number;
}

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  standalone: false
})
export class ProductsComponent implements OnInit {

  breadCrumbItems = [
    { label: 'Tijara' },
    { label: 'Boutique', active: true }
  ];

  viewMode: 'grid' | 'list' = 'grid';
  searchTerm = '';
  selectedCategory = 'Tous';
  sortBy = 'default';
  currentPage = 1;
  itemsPerPage = 9;
  loading = true;

  categories: string[] = ['Tous'];

  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  cartItems: { product: Product; qty: number }[] = [];

  constructor(private router: Router, private api: TijaraApiService) {}

  ngOnInit(): void {
    this.loadCart();
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.api.getProducts().subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : (res.data || []);
        this.allProducts = data.map((p: any) => ({
          id:          p.id,
          name:        p.name,
          category:    p.category_name || 'Autre',
          category_name: p.category_name,
          price:       parseFloat(p.price),
          rating:      p.avg_rating || 0,
          reviewCount: p.review_count || 0,
          image:       p.image_url || 'assets/images/products/img-1.png',
          image_url:   p.image_url,
          stock:       p.stock || 0,
          vendor:      p.vendor_name || p.shop_name || 'Vendeur',
          vendor_name: p.vendor_name,
          vendor_id:   p.vendor_id,
        }));
        // Build category list from products
        const cats = [...new Set(this.allProducts.map(p => p.category).filter(Boolean))];
        this.categories = ['Tous', ...cats];
        this.loading = false;
        this.applyFilters();
      },
      error: () => { this.loading = false; }
    });
  }

  loadCart() {
    const saved = localStorage.getItem('tijara_cart');
    this.cartItems = saved ? JSON.parse(saved) : [];
  }

  get pagedProducts(): Product[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredProducts.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  applyFilters() {
    let result = [...this.allProducts];
    if (this.selectedCategory !== 'Tous') {
      result = result.filter(p => p.category === this.selectedCategory);
    }
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.vendor.toLowerCase().includes(term)
      );
    }
    switch (this.sortBy) {
      case 'price_asc':  result.sort((a, b) => a.price - b.price); break;
      case 'price_desc': result.sort((a, b) => b.price - a.price); break;
      case 'rating':     result.sort((a, b) => b.rating - a.rating); break;
      case 'newest':     result.sort((a, b) => b.id - a.id); break;
    }
    this.filteredProducts = result;
    this.currentPage = 1;
  }

  selectCategory(cat: string) {
    this.selectedCategory = cat;
    this.applyFilters();
  }

  getStars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  addToCart(product: Product) {
    const existing = this.cartItems.find(i => i.product.id === product.id);
    if (existing) { existing.qty++; } else { this.cartItems.push({ product, qty: 1 }); }
    localStorage.setItem('tijara_cart', JSON.stringify(this.cartItems));
    const btn = document.getElementById('cart-btn-' + product.id);
    if (btn) {
      btn.classList.add('btn-success');
      btn.innerHTML = '<i class="ri-check-line"></i>';
      setTimeout(() => {
        btn.classList.remove('btn-success');
        btn.innerHTML = '<i class="ri-shopping-cart-line"></i>';
      }, 1200);
    }
  }

  isInCart(productId: number): boolean {
    return this.cartItems.some(i => i.product.id === productId);
  }

  goDetail(id: number) { this.router.navigate(['/shop/product-detail', id]); }
  goCart() { this.router.navigate(['/shop/cart']); }
  goSeller(vendorId: number) { this.router.navigate(['/shop/seller-details', vendorId]); }

  get cartCount(): number {
    return this.cartItems.reduce((sum, i) => sum + i.qty, 0);
  }
}
