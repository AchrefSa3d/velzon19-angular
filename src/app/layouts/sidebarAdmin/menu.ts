import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [

  // ─── GÉNÉRAL ─────────────────────────────────────────────────────────────
  {
    id: 1,
    label: 'MENUITEMS.GENERAL.TEXT',
    isTitle: true
  },
  {
    id: 2,
    label: 'MENUITEMS.DASHBOARD.TEXT',
    icon: 'ri-dashboard-2-line',
    link: '/admin/dashboard',
  },

  // ─── CATALOGUE ────────────────────────────────────────────────────────────
  {
    id: 10,
    label: 'MENUITEMS.CATALOGUE.TEXT',
    isTitle: true
  },
  {
    id: 11,
    label: 'MENUITEMS.CATEGORIES.TEXT',
    icon: 'ri-list-check-2',
    link: '/admin/categories',
  },

  // ─── COMMANDES ────────────────────────────────────────────────────────────
  {
    id: 20,
    label: 'MENUITEMS.ORDERS_SECTION.TEXT',
    isTitle: true
  },
  {
    id: 21,
    label: 'MENUITEMS.ORDERS.TEXT',
    icon: 'ri-file-list-3-line',
    link: '/admin/orders',
  },

  // ─── UTILISATEURS ─────────────────────────────────────────────────────────
  {
    id: 30,
    label: 'MENUITEMS.USERS_SECTION.TEXT',
    isTitle: true
  },
  {
    id: 31,
    label: 'MENUITEMS.USERS.TEXT',
    icon: 'ri-group-line',
    link: '/admin/users',
  },
  {
    id: 32,
    label: 'MENUITEMS.VENDORS.TEXT',
    icon: 'ri-store-2-line',
    link: '/admin/vendors',
  },

  // ─── MODÉRATION ───────────────────────────────────────────────────────────
  {
    id: 50,
    label: 'MENUITEMS.MODERATION.TEXT',
    isTitle: true
  },
  {
    id: 51,
    label: 'Annonces',
    icon: 'ri-megaphone-line',
    link: '/admin/annonces',
  },
  {
    id: 52,
    label: 'Produits',
    icon: 'ri-box-3-line',
    link: '/admin/products',
  },

  // ─── SUPPORT ──────────────────────────────────────────────────────────────
  {
    id: 40,
    label: 'MENUITEMS.SUPPORT.TEXT',
    isTitle: true
  },
  {
    id: 41,
    label: 'MENUITEMS.RECLAMATIONS.TEXT',
    icon: 'ri-customer-service-2-line',
    link: '/admin/reclamations',
  },
];
