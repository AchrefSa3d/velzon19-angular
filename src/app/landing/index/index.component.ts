import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-index',
    templateUrl: './index.component.html',
    styleUrls: ['./index.component.scss'],
    standalone: false
})
export class IndexComponent implements OnInit {

    currentSection = 'hero';
    searchQuery = '';
    selectedCategory = '';
    year = new Date().getFullYear();

    categories = [
        { name: 'Électronique',    icon: 'ri-computer-line',         color: 'primary',  count: 248 },
        { name: 'Mode & Vêtements',icon: 'ri-t-shirt-line',          color: 'success',  count: 195 },
        { name: 'Maison & Jardin', icon: 'ri-home-2-line',           color: 'warning',  count: 162 },
        { name: 'Voitures',        icon: 'ri-car-line',              color: 'danger',   count: 87  },
        { name: 'Sports & Loisirs',icon: 'ri-run-line',              color: 'info',     count: 134 },
        { name: 'Livres',          icon: 'ri-book-open-line',        color: 'secondary',count: 210 },
        { name: 'Beauté & Santé',  icon: 'ri-heart-line',            color: 'danger',   count: 176 },
        { name: 'Immobilier',      icon: 'ri-building-line',         color: 'dark',     count: 53  },
    ];

    featuredProducts = [
        { id: 1, name: 'iPhone 14 Pro',            category: 'Électronique', price: 1200, oldPrice: 1400, seller: 'TechShop',    rating: 4.8, reviews: 124, badge: 'Nouveau',    bgColor: '#6691e7' },
        { id: 2, name: 'Veste en Cuir Noir',       category: 'Mode',         price: 189,  oldPrice: 250,  seller: 'FashionHub',  rating: 4.5, reviews: 67,  badge: '-25%',       bgColor: '#f06548' },
        { id: 3, name: 'Canapé Moderne 3 places',  category: 'Maison',       price: 850,  oldPrice: null, seller: 'DecoStore',   rating: 4.7, reviews: 42,  badge: null,         bgColor: '#0ab39c' },
        { id: 4, name: 'Samsung Galaxy S23',       category: 'Électronique', price: 980,  oldPrice: 1100, seller: 'MobilePro',   rating: 4.6, reviews: 98,  badge: 'Populaire',  bgColor: '#405189' },
        { id: 5, name: 'Nike Air Max 270',          category: 'Sports',       price: 149,  oldPrice: 180,  seller: 'SportZone',   rating: 4.9, reviews: 213, badge: '-17%',       bgColor: '#f7b84b' },
        { id: 6, name: 'MacBook Air M2',           category: 'Électronique', price: 1350, oldPrice: 1500, seller: 'TechShop',    rating: 4.9, reviews: 87,  badge: 'Top vente',  bgColor: '#299cdb' },
    ];

    steps = [
        { step: '01', icon: 'ri-search-2-line',        title: 'Parcourez',  desc: 'Explorez des milliers de produits dans toutes les catégories.' },
        { step: '02', icon: 'ri-message-3-line',       title: 'Contactez',  desc: 'Discutez directement avec le vendeur et négociez le meilleur prix.' },
        { step: '03', icon: 'ri-secure-payment-line',  title: 'Achetez',    desc: 'Finalisez votre achat en toute sécurité avec nos moyens de paiement.' },
    ];

    stats = [
        { value: '12 500+', label: 'Produits publiés',   icon: 'ri-shopping-bag-3-line' },
        { value: '3 200+',  label: 'Vendeurs actifs',    icon: 'ri-store-2-line'        },
        { value: '45 000+', label: 'Acheteurs inscrits', icon: 'ri-group-line'          },
        { value: '98%',     label: 'Satisfaction',       icon: 'ri-star-line'           },
    ];

    testimonials = [
        { name: 'Sami B.',    role: 'Acheteur',  rating: 5, text: 'Excellente plateforme, j\'ai trouvé ce que je cherchais en quelques minutes. Livraison rapide !' },
        { name: 'Mariam K.',  role: 'Vendeuse',  rating: 5, text: 'J\'ai ouvert ma boutique il y a 3 mois. Le dashboard vendeur est simple et mes ventes ont décollé.' },
        { name: 'Karim T.',   role: 'Acheteur',  rating: 4, text: 'Prix très compétitifs et messagerie pratique avec les vendeurs. Je recommande vivement Tijara.' },
    ];

    ngOnInit(): void {}

    windowScroll() {
        const navbar = document.getElementById('navbar');
        if (document.body.scrollTop > 40 || document.documentElement.scrollTop > 40) {
            navbar?.classList.add('is-sticky');
        } else {
            navbar?.classList.remove('is-sticky');
        }
        const btn = document.getElementById('back-to-top') as HTMLElement;
        if (btn) btn.style.display = (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) ? 'block' : 'none';
    }

    onSectionChange(sectionId: string) { this.currentSection = sectionId; }

    toggleMenu() { document.getElementById('navbarSupportedContent')?.classList.toggle('show'); }

    topFunction() {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }

    getStars(rating: number): number[] { return Array(Math.floor(rating)).fill(0); }
}
