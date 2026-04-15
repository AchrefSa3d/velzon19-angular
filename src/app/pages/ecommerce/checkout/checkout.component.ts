import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartItem } from '../cart/cart.component';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

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
  submitted    = false;
  loading      = false;
  orderPlaced  = false;
  orderNumber  = '';
  errorMsg     = '';
  paymentMethod = 'livraison';

  villes = [
    'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Hammamet', 'Zaghouan',
    'Bizerte', 'Béja', 'Jendouba', 'Le Kef', 'Siliana', 'Sousse', 'Monastir',
    'Mahdia', 'Sfax', 'Kairouan', 'Kasserine', 'Sidi Bouzid', 'Gabès',
    'Médenine', 'Tataouine', 'Gafsa', 'Tozeur', 'Kébili', 'La Marsa'
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private api: TijaraApiService
  ) {}

  ngOnInit(): void {
    const saved = localStorage.getItem('tijara_cart');
    this.cartItems = saved ? JSON.parse(saved) : [];
    if (this.cartItems.length === 0) {
      this.router.navigate(['/shop/cart']);
      return;
    }

    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
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
    this.errorMsg  = '';
    if (this.checkoutForm.invalid) return;

    // Vérifier que l'utilisateur est connecté
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser?.token) {
      this.errorMsg = 'Vous devez être connecté pour passer une commande.';
      return;
    }

    const v = this.checkoutForm.value;
    const shippingAddress = `${v.firstName} ${v.lastName}, ${v.address}, ${v.ville} — Tél: ${v.phone}`;

    const orderPayload = {
      items: this.cartItems.map((i: CartItem) => ({
        product_id: i.product.id,
        quantity:   i.qty
      })),
      shipping_address: shippingAddress,
      notes: v.notes || null
    };

    this.loading = true;
    this.api.createOrder(orderPayload).subscribe({
      next: (res: any) => {
        this.loading    = false;
        this.orderNumber = `TJR-${String(res.id).padStart(6, '0')}`;
        localStorage.removeItem('tijara_cart');
        this.cartItems  = [];
        this.orderPlaced = true;
      },
      error: (err: any) => {
        this.loading  = false;
        this.errorMsg = err?.error?.message || 'Erreur lors de la commande. Veuillez réessayer.';
      }
    });
  }

  goShop()   { this.router.navigate(['/shop/products']); }
  goOrders() { this.router.navigate(['/users/orders']); }
}
