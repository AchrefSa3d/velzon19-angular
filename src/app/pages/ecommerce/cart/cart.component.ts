import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from '../products/products.component';

export interface CartItem {
  product: Product;
  qty: number;
}

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
  standalone: false
})
export class CartComponent implements OnInit {

  breadCrumbItems = [
    { label: 'Boutique', link: '/shop/products' },
    { label: 'Panier', active: true }
  ];

  cartItems: CartItem[] = [];
  promoCode = '';
  promoApplied = false;
  promoDiscount = 0;
  promoError = '';

  constructor(private router: Router) {}

  ngOnInit(): void { this.loadCart(); }

  loadCart() {
    const saved = sessionStorage.getItem('tijara_cart');
    this.cartItems = saved ? JSON.parse(saved) : [];
  }

  saveCart() {
    sessionStorage.setItem('tijara_cart', JSON.stringify(this.cartItems));
  }

  increase(item: CartItem) {
    if (item.qty < item.product.stock) { item.qty++; this.saveCart(); }
  }

  decrease(item: CartItem) {
    if (item.qty > 1) { item.qty--; this.saveCart(); }
  }

  remove(index: number) { this.cartItems.splice(index, 1); this.saveCart(); }
  clearCart() { this.cartItems = []; this.saveCart(); }

  applyPromo() {
    this.promoError = '';
    const code = this.promoCode.trim().toUpperCase();
    if (code === 'TIJARA10') {
      this.promoDiscount = 10; this.promoApplied = true;
    } else if (code === 'TIJARA20') {
      this.promoDiscount = 20; this.promoApplied = true;
    } else {
      this.promoError = 'Code promo invalide. Essayez TIJARA10 ou TIJARA20';
      this.promoApplied = false; this.promoDiscount = 0;
    }
  }

  get subtotal(): number {
    return this.cartItems.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  }

  get discount(): number {
    return Math.round(this.subtotal * this.promoDiscount / 100);
  }

  get shipping(): number {
    return this.subtotal > 100 ? 0 : 7;
  }

  get total(): number {
    return this.subtotal - this.discount + this.shipping;
  }

  goShop() { this.router.navigate(['/shop/products']); }
  goCheckout() { this.router.navigate(['/shop/checkout']); }
}
