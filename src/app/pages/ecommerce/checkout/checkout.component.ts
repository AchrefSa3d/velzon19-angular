import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartItem } from '../cart/cart.component';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  standalone: false
})
export class CheckoutComponent implements OnInit {

  breadCrumbItems = [
    { label: 'Boutique', link: '/shop/products' },
    { label: 'Panier', link: '/shop/cart' },
    { label: 'Commande', active: true }
  ];

  checkoutForm!: FormGroup;
  cartItems: CartItem[] = [];
  submitted = false;
  orderPlaced = false;
  orderNumber = '';
  paymentMethod = 'livraison';

  villes = [
    'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Hammamet', 'Zaghouan',
    'Bizerte', 'Béja', 'Jendouba', 'Le Kef', 'Siliana', 'Sousse', 'Monastir',
    'Mahdia', 'Sfax', 'Kairouan', 'Kasserine', 'Sidi Bouzid', 'Gabès',
    'Médenine', 'Tataouine', 'Gafsa', 'Tozeur', 'Kébili', 'La Marsa'
  ];

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    const saved = sessionStorage.getItem('tijara_cart');
    this.cartItems = saved ? JSON.parse(saved) : [];
    if (this.cartItems.length === 0) {
      this.router.navigate(['/shop/cart']);
      return;
    }
    const user = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    this.checkoutForm = this.fb.group({
      firstName: [user.firstName || '', [Validators.required, Validators.minLength(2)]],
      lastName:  [user.lastName  || '', [Validators.required, Validators.minLength(2)]],
      email:     [user.email     || '', [Validators.required, Validators.email]],
      phone:     ['', [Validators.required, Validators.pattern(/^[2459]\d{7}$/)]],
      ville:     ['', Validators.required],
      address:   ['', [Validators.required, Validators.minLength(8)]],
      notes:     [''],
    });
  }

  get f() { return this.checkoutForm.controls; }

  get subtotal(): number {
    return this.cartItems.reduce((s, i) => s + i.product.price * i.qty, 0);
  }

  get shipping(): number { return this.subtotal > 100 ? 0 : 7; }
  get total(): number { return this.subtotal + this.shipping; }

  placeOrder() {
    this.submitted = true;
    if (this.checkoutForm.invalid) return;

    this.orderNumber = 'TJR-' + Date.now().toString().slice(-6);

    const order = {
      orderNumber: this.orderNumber,
      date: new Date().toLocaleDateString('fr-FR'),
      items: this.cartItems,
      total: this.total,
      address: this.checkoutForm.value,
      payment: this.paymentMethod,
      status: 'En attente'
    };
    const orders = JSON.parse(sessionStorage.getItem('tijara_orders') || '[]');
    orders.unshift(order);
    sessionStorage.setItem('tijara_orders', JSON.stringify(orders));

    sessionStorage.removeItem('tijara_cart');
    this.cartItems = [];
    this.orderPlaced = true;
  }

  goShop() { this.router.navigate(['/shop/products']); }
  goOrders() { this.router.navigate(['/shop/orders']); }
}
