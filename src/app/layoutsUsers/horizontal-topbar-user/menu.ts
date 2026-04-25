import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [

  // ─── GÉNÉRAL ─────────────────────────────────────────────────────────────
  { id: 1, label: 'MENUITEMS.GENERAL.TEXT', isTitle: true },
  {
    id: 2,
    label: 'Tableau de bord',
    icon: 'ri-dashboard-2-line',
    link: '/users/dashboard',
  },

  // ─── BOUTIQUE ─────────────────────────────────────────────────────────────
  { id: 10, label: 'MENUITEMS.SHOP.TEXT', isTitle: true },
  {
    id: 11,
    label: 'Boutique',
    icon: 'ri-store-2-line',
    subItems: [
      { id: 111, label: 'Tous les produits', link: '/shop/products', parentId: 11 },
      { id: 112, label: 'Mes favoris',        link: '/users/wishlist', parentId: 11 },
      { id: 113, label: 'Mon panier',         link: '/shop/cart',      parentId: 11 },
    ],
  },

  // ─── MES ACHATS ───────────────────────────────────────────────────────────
  { id: 20, label: 'Mes achats', isTitle: true },
  {
    id: 21,
    label: 'Mes commandes',
    icon: 'ri-file-list-3-line',
    subItems: [
      { id: 211, label: 'Commandes',    link: '/users/orders',        parentId: 21 },
      { id: 212, label: 'Factures',     link: '/users/my-invoices',   parentId: 21 },
      { id: 213, label: 'Livraisons',   link: '/users/my-deliveries', parentId: 21 },
    ],
  },

  // ─── MES PUBLICATIONS (annonces perso) ───────────────────────────────────
  { id: 25, label: 'Mes publications', isTitle: true },
  {
    id: 26,
    label: 'Mes annonces',
    icon: 'ri-megaphone-line',
    subItems: [
      { id: 261, label: 'Publier / Parcourir',  link: '/users/annonces',    parentId: 26 },
      { id: 262, label: 'Mes annonces publiées', link: '/users/my-products', parentId: 26 },
      { id: 263, label: 'Mes avis',              link: '/users/my-reviews',  parentId: 26 },
    ],
  },

  // ─── COMMUNAUTÉ ───────────────────────────────────────────────────────────
  { id: 30, label: 'MENUITEMS.COMMUNITY.TEXT', isTitle: true },
  {
    id: 31,
    label: 'Messages',
    icon: 'ri-chat-3-line',
    link: '/users/messages',
  },

  // ─── MON COMPTE ───────────────────────────────────────────────────────────
  { id: 40, label: 'MENUITEMS.ACCOUNT.TEXT', isTitle: true },
  {
    id: 41,
    label: 'Mon profil',
    icon: 'ri-user-line',
    link: '/users/profile',
  },
  {
    id: 42,
    label: 'Réclamations',
    icon: 'ri-customer-service-2-line',
    link: '/users/reclamations',
  },
];
