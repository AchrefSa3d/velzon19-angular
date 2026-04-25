import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [

  // ─── GÉNÉRAL ─────────────────────────────────────────────────────────────
  { id: 1, label: 'MENUITEMS.GENERAL.TEXT', isTitle: true },
  {
    id: 2,
    label: 'MENUITEMS.DASHBOARD.TEXT',
    icon: 'ri-dashboard-2-line',
    link: '/ent/dashboard',
  },

  // ─── CATALOGUE ────────────────────────────────────────────────────────────
  { id: 10, label: 'MENUITEMS.CATALOGUE.TEXT', isTitle: true },
  {
    id: 11,
    label: 'MENUITEMS.PRODUCTS.TEXT',
    icon: 'ri-shopping-bag-3-line',
    subItems: [
      { id: 12, label: 'MENUITEMS.PRODUCTS.LIST.ALL', link: '/ent/products', parentId: 11 },
      { id: 13, label: 'MENUITEMS.PRODUCTS.LIST.ADD', link: '/ent/products?action=add', parentId: 11 },
    ],
  },
  {
    id: 14,
    label: 'Annonces & Deals',
    icon: 'ri-megaphone-line',
    subItems: [
      { id: 141, label: 'Annonces',      link: '/ent/annonces', parentId: 14 },
      { id: 142, label: 'Deals & Promos', link: '/ent/deals',    parentId: 14 },
    ],
  },

  // ─── VENTES & LIVRAISONS ─────────────────────────────────────────────────
  { id: 20, label: 'Ventes & Livraisons', isTitle: true },
  {
    id: 21,
    label: 'Commandes',
    icon: 'ri-file-list-3-line',
    link: '/ent/orders',
  },
  {
    id: 22,
    label: 'Livraisons',
    icon: 'ri-truck-line',
    link: '/ent/deliveries',
  },
  {
    id: 23,
    label: 'Factures',
    icon: 'ri-file-text-line',
    link: '/ent/invoices',
  },

  // ─── COMMUNAUTÉ ──────────────────────────────────────────────────────────
  { id: 30, label: 'Communauté', isTitle: true },
  {
    id: 31,
    label: 'MENUITEMS.CHAT.TEXT',
    icon: 'ri-chat-3-line',
    link: '/ent/messages',
  },
  {
    id: 32,
    label: 'Mes Abonnés',
    icon: 'ri-user-heart-line',
    link: '/ent/followers',
  },

  // ─── MON COMPTE ───────────────────────────────────────────────────────────
  { id: 40, label: 'MENUITEMS.ACCOUNT.TEXT', isTitle: true },
  {
    id: 41,
    label: 'Mon Profil',
    icon: 'ri-user-settings-line',
    link: '/ent/profile',
  },
  {
    id: 42,
    label: 'MENUITEMS.RECLAMATIONS.TEXT',
    icon: 'ri-customer-service-2-line',
    link: '/ent/reclamations',
  },
];
