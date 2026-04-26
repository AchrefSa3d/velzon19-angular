import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [

  // ═══════════════════════════════════════════════════════════════════════
  // 🏠 ESPACE PERSONNEL
  // ═══════════════════════════════════════════════════════════════════════
  { id: 1, label: 'Espace personnel', isTitle: true },
  {
    id: 2,
    label: 'Tableau de bord',
    icon: 'ri-dashboard-2-line',
    link: '/users/dashboard',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 🛍️ BOUTIQUE
  // ═══════════════════════════════════════════════════════════════════════
  { id: 10, label: 'Boutique', isTitle: true },
  {
    id: 11,
    label: 'Parcourir',
    icon: 'ri-store-2-line',
    subItems: [
      { id: 111, label: 'Tous les produits', icon: 'ri-shopping-bag-3-line', link: '/landing/produits',  parentId: 11 },
      { id: 112, label: 'Annonces',          icon: 'ri-megaphone-line',      link: '/landing/annonces',  parentId: 11 },
      { id: 113, label: 'Deals & Promos',    icon: 'ri-flashlight-line',     link: '/landing/deals',     parentId: 11 },
      { id: 114, label: 'Vendeurs',          icon: 'ri-store-3-line',        link: '/landing/vendeurs',  parentId: 11 },
    ],
  },
  {
    id: 12,
    label: 'Mon panier',
    icon: 'ri-shopping-cart-2-line',
    link: '/shop/cart',
  },
  {
    id: 13,
    label: 'Mes favoris',
    icon: 'ri-heart-line',
    link: '/users/wishlist',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 🛒 MES ACHATS
  // ═══════════════════════════════════════════════════════════════════════
  { id: 20, label: 'Mes achats', isTitle: true },
  {
    id: 21,
    label: 'Mes commandes',
    icon: 'ri-file-list-3-line',
    subItems: [
      { id: 211, label: 'Commandes',  icon: 'ri-shopping-bag-3-line', link: '/users/orders',        parentId: 21 },
      { id: 212, label: 'Factures',   icon: 'ri-file-text-line',      link: '/users/my-invoices',   parentId: 21 },
      { id: 213, label: 'Livraisons', icon: 'ri-truck-line',          link: '/users/my-deliveries', parentId: 21 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 📢 MES PUBLICATIONS
  // ═══════════════════════════════════════════════════════════════════════
  { id: 25, label: 'Mes publications', isTitle: true },
  {
    id: 26,
    label: 'Mes annonces',
    icon: 'ri-megaphone-line',
    subItems: [
      { id: 261, label: 'Publier / Parcourir',   icon: 'ri-add-circle-line',    link: '/users/annonces',    parentId: 26 },
      { id: 262, label: 'Mes annonces publiées', icon: 'ri-article-line',       link: '/users/my-products', parentId: 26 },
      { id: 263, label: 'Mes avis',              icon: 'ri-star-line',          link: '/users/my-reviews',  parentId: 26 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 🎁 AVANTAGES
  // ═══════════════════════════════════════════════════════════════════════
  { id: 27, label: 'Avantages', isTitle: true },
  {
    id: 28,
    label: 'Coupons',
    icon: 'ri-coupon-2-line',
    badge: { variant: 'bg-warning-subtle text-warning', text: 'PROMO' },
    link: '/users/coupons',
  },
  {
    id: 29,
    label: 'Prix & tirages',
    icon: 'ri-trophy-line',
    link: '/users/prizes',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 💬 COMMUNAUTÉ
  // ═══════════════════════════════════════════════════════════════════════
  { id: 30, label: 'Communauté', isTitle: true },
  {
    id: 31,
    label: 'Messagerie',
    icon: 'ri-chat-3-line',
    link: '/users/messages',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 👤 MON COMPTE
  // ═══════════════════════════════════════════════════════════════════════
  { id: 40, label: 'Mon compte', isTitle: true },
  {
    id: 41,
    label: 'Mon profil',
    icon: 'ri-user-settings-line',
    link: '/users/profile',
  },
  {
    id: 42,
    label: 'Réclamations',
    icon: 'ri-customer-service-2-line',
    link: '/users/reclamations',
  },
];
