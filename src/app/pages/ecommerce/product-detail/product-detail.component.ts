import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../products/products.component';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
  standalone: false
})
export class ProductDetailComponent implements OnInit {

  breadCrumbItems = [
    { label: 'Boutique', link: '/shop/products' },
    { label: 'Détail produit', active: true }
  ];

  product!: Product;
  quantity = 1;
  selectedImage = '';
  activeTab = 'description';
  cartItems: { product: Product; qty: number }[] = [];
  addedToCart = false;

  // Catalogue fictif (même données que products)
  allProducts: Product[] = [
    { id: 1,  name: 'Écouteurs Bluetooth Pro',     category: 'Électronique', price: 4500,  oldPrice: 6000,  discount: 25, rating: 4, reviewCount: 128, image: 'assets/images/products/img-1.png',  badge: 'Promo',    badgeClass: 'bg-danger',  stock: 15, vendor: 'TechStore' },
    { id: 2,  name: 'Montre Connectée Sport',       category: 'Électronique', price: 8900,  oldPrice: 11000, discount: 19, rating: 5, reviewCount: 84,  image: 'assets/images/products/img-2.png',  badge: 'Nouveau',  badgeClass: 'bg-success', stock: 8,  vendor: 'SmartGadget' },
    { id: 3,  name: 'Veste en Cuir Homme',           category: 'Mode',         price: 12500, oldPrice: 15000, discount: 17, rating: 4, reviewCount: 56,  image: 'assets/images/products/img-3.png',  badge: '',         badgeClass: '',           stock: 20, vendor: 'FashionHub' },
    { id: 4,  name: 'Canapé Modulable 3 Places',    category: 'Maison',       price: 45000, oldPrice: 55000, discount: 18, rating: 5, reviewCount: 32,  image: 'assets/images/products/img-4.png',  badge: 'Promo',    badgeClass: 'bg-danger',  stock: 3,  vendor: 'MaisonDeco' },
    { id: 5,  name: 'Vélo de Route Carbon',          category: 'Sport',        price: 35000, oldPrice: 42000, discount: 17, rating: 4, reviewCount: 47,  image: 'assets/images/products/img-5.png',  badge: '',         badgeClass: '',           stock: 5,  vendor: 'SportPro' },
    { id: 6,  name: 'Crème Hydratante Bio',          category: 'Beauté',       price: 890,   oldPrice: 1200,  discount: 26, rating: 4, reviewCount: 210, image: 'assets/images/products/img-6.png',  badge: 'Bio',      badgeClass: 'bg-success', stock: 50, vendor: 'NatureCare' },
    { id: 7,  name: 'Tablette Enfant Éducative',     category: 'Jouets',       price: 5500,  oldPrice: 7000,  discount: 21, rating: 5, reviewCount: 98,  image: 'assets/images/products/img-7.png',  badge: 'Top vente',badgeClass: 'bg-warning', stock: 12, vendor: 'KidsWorld' },
    { id: 8,  name: 'Café Arabica Premium 500g',     category: 'Alimentation', price: 950,   oldPrice: 1200,  discount: 21, rating: 5, reviewCount: 175, image: 'assets/images/products/img-8.png',  badge: 'Top vente',badgeClass: 'bg-warning', stock: 100,vendor: 'GourmetShop' },
    { id: 9,  name: 'Smartphone 128GB',              category: 'Électronique', price: 28000, oldPrice: 32000, discount: 13, rating: 4, reviewCount: 312, image: 'assets/images/products/img-9.png',  badge: '',         badgeClass: '',           stock: 25, vendor: 'TechStore' },
    { id: 10, name: 'Sac à Main Femme Cuir',         category: 'Mode',         price: 7500,  oldPrice: 9500,  discount: 21, rating: 4, reviewCount: 67,  image: 'assets/images/products/img-10.png', badge: 'Promo',    badgeClass: 'bg-danger',  stock: 18, vendor: 'FashionHub' },
    { id: 11, name: 'Aspirateur Robot WiFi',         category: 'Maison',       price: 18000, oldPrice: 22000, discount: 18, rating: 5, reviewCount: 89,  image: 'assets/images/products/img-1.png',  badge: 'Nouveau',  badgeClass: 'bg-success', stock: 7,  vendor: 'MaisonDeco' },
    { id: 12, name: 'Tapis de Yoga Antidérapant',    category: 'Sport',        price: 1800,  oldPrice: 2500,  discount: 28, rating: 4, reviewCount: 143, image: 'assets/images/products/img-2.png',  badge: 'Promo',    badgeClass: 'bg-danger',  stock: 40, vendor: 'SportPro' },
  ];

  reviews = [
    { author: 'Amina B.', date: '12 mars 2026', rating: 5, comment: 'Excellent produit, livraison rapide. Je recommande vivement !' },
    { author: 'Karim M.', date: '8 mars 2026',  rating: 4, comment: 'Très bon rapport qualité/prix. Conforme à la description.' },
    { author: 'Sara L.',  date: '2 mars 2026',  rating: 4, comment: 'Bon produit, emballage soigné. Satisfaite de mon achat.' },
  ];

  relatedProducts: Product[] = [];

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id')) || 1;
    this.product = this.allProducts.find(p => p.id === id) ?? this.allProducts[0];
    this.selectedImage = this.product.image;
    this.relatedProducts = this.allProducts
      .filter(p => p.category === this.product.category && p.id !== this.product.id)
      .slice(0, 4);
    const saved = sessionStorage.getItem('tijara_cart');
    this.cartItems = saved ? JSON.parse(saved) : [];
    this.addedToCart = this.cartItems.some(i => i.product.id === this.product.id);
  }

  getStars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  increaseQty() { if (this.quantity < this.product.stock) this.quantity++; }
  decreaseQty() { if (this.quantity > 1) this.quantity--; }

  addToCart() {
    const existing = this.cartItems.find(i => i.product.id === this.product.id);
    if (existing) {
      existing.qty += this.quantity;
    } else {
      this.cartItems.push({ product: this.product, qty: this.quantity });
    }
    sessionStorage.setItem('tijara_cart', JSON.stringify(this.cartItems));
    this.addedToCart = true;
  }

  buyNow() {
    this.addToCart();
    this.router.navigate(['/shop/cart']);
  }

  goBack() {
    this.router.navigate(['/shop/products']);
  }

  goRelated(id: number) {
    this.router.navigate(['/shop/product-detail', id]);
  }
}
