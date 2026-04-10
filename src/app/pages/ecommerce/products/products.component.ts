import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  image: string;
  badge?: string;
  badgeClass?: string;
  stock: number;
  vendor: string;
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

  categories = ['Tous', 'Électronique', 'Mode', 'Maison', 'Sport', 'Beauté', 'Jouets', 'Alimentation'];

  allProducts: Product[] = [
    { id: 1,  name: 'Écouteurs Bluetooth Pro',     category: 'Électronique', price: 130,  oldPrice: 175,  discount: 25, rating: 4, reviewCount: 128, image: 'assets/images/products/img-1.png',  badge: 'Promo',     badgeClass: 'bg-danger',  stock: 15, vendor: 'TechTunis'    },
    { id: 2,  name: 'Montre Connectée Sport',       category: 'Électronique', price: 250,  oldPrice: 310,  discount: 19, rating: 5, reviewCount: 84,  image: 'assets/images/products/img-2.png',  badge: 'Nouveau',   badgeClass: 'bg-success', stock: 8,  vendor: 'SmartGadget'  },
    { id: 3,  name: 'Veste en Cuir Homme',          category: 'Mode',         price: 350,  oldPrice: 420,  discount: 17, rating: 4, reviewCount: 56,  image: 'assets/images/products/img-3.png',  badge: '',          badgeClass: '',           stock: 20, vendor: 'ModeTN'       },
    { id: 4,  name: 'Canapé Modulable 3 Places',   category: 'Maison',       price: 1200, oldPrice: 1450, discount: 17, rating: 5, reviewCount: 32,  image: 'assets/images/products/img-4.png',  badge: 'Promo',     badgeClass: 'bg-danger',  stock: 3,  vendor: 'MaisonDeco'   },
    { id: 5,  name: 'Vélo de Route Carbon',         category: 'Sport',        price: 950,  oldPrice: 1150, discount: 17, rating: 4, reviewCount: 47,  image: 'assets/images/products/img-5.png',  badge: '',          badgeClass: '',           stock: 5,  vendor: 'SportZone'    },
    { id: 6,  name: 'Crème Hydratante Bio',         category: 'Beauté',       price: 25,   oldPrice: 35,   discount: 28, rating: 4, reviewCount: 210, image: 'assets/images/products/img-6.png',  badge: 'Bio',       badgeClass: 'bg-success', stock: 50, vendor: 'NatureCare'   },
    { id: 7,  name: 'Tablette Enfant Éducative',    category: 'Jouets',       price: 150,  oldPrice: 190,  discount: 21, rating: 5, reviewCount: 98,  image: 'assets/images/products/img-7.png',  badge: 'Top vente', badgeClass: 'bg-warning', stock: 12, vendor: 'KidsWorld'    },
    { id: 8,  name: 'Café Arabica Premium 500g',    category: 'Alimentation', price: 25,   oldPrice: 32,   discount: 21, rating: 5, reviewCount: 175, image: 'assets/images/products/img-8.png',  badge: 'Top vente', badgeClass: 'bg-warning', stock: 100,vendor: 'GourmetTN'    },
    { id: 9,  name: 'Smartphone 128GB',             category: 'Électronique', price: 750,  oldPrice: 870,  discount: 13, rating: 4, reviewCount: 312, image: 'assets/images/products/img-9.png',  badge: '',          badgeClass: '',           stock: 25, vendor: 'TechTunis'    },
    { id: 10, name: 'Sac à Main Femme Cuir',        category: 'Mode',         price: 200,  oldPrice: 260,  discount: 23, rating: 4, reviewCount: 67,  image: 'assets/images/products/img-10.png', badge: 'Promo',     badgeClass: 'bg-danger',  stock: 18, vendor: 'ModeTN'       },
    { id: 11, name: 'Aspirateur Robot WiFi',        category: 'Maison',       price: 480,  oldPrice: 590,  discount: 18, rating: 5, reviewCount: 89,  image: 'assets/images/products/img-1.png',  badge: 'Nouveau',   badgeClass: 'bg-success', stock: 7,  vendor: 'MaisonDeco'   },
    { id: 12, name: 'Tapis de Yoga Antidérapant',   category: 'Sport',        price: 50,   oldPrice: 70,   discount: 28, rating: 4, reviewCount: 143, image: 'assets/images/products/img-2.png',  badge: 'Promo',     badgeClass: 'bg-danger',  stock: 40, vendor: 'SportZone'    },
  ];

  filteredProducts: Product[] = [];
  cartItems: { product: Product; qty: number }[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadCart();
    this.applyFilters();
  }

  loadCart() {
    const saved = sessionStorage.getItem('tijara_cart');
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
    sessionStorage.setItem('tijara_cart', JSON.stringify(this.cartItems));
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

  get cartCount(): number {
    return this.cartItems.reduce((sum, i) => sum + i.qty, 0);
  }
}
