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
    link: '/ent/dashboard',
  },

  // ─── CATALOGUE ────────────────────────────────────────────────────────────
  {
    id: 10,
    label: 'MENUITEMS.CATALOGUE.TEXT',
    isTitle: true
  },
  {
    id: 11,
    label: 'MENUITEMS.PRODUCTS.TEXT',
    icon: 'ri-shopping-bag-3-line',
    subItems: [
      {
        id: 12,
        label: 'MENUITEMS.PRODUCTS.LIST.ALL',
        link: '/ent/products',
        parentId: 11
      },
      {
        id: 13,
        label: 'MENUITEMS.PRODUCTS.LIST.ADD',
        link: '/ent/products/add',
        parentId: 11
      }
    ]
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
    link: '/ent/orders',
  },

  // ─── MESSAGES ─────────────────────────────────────────────────────────────
  {
    id: 30,
    label: 'MENUITEMS.CHAT.TEXT',
    icon: 'ri-chat-3-line',
    link: '/ent/messages',
  },

  // ─── ANNONCES & DEALS ─────────────────────────────────────────────────────
  {
    id: 35,
    label: 'MENUITEMS.ANNONCES.TEXT',
    isTitle: true
  },
  {
    id: 36,
    label: 'Annonces',
    icon: 'ri-megaphone-line',
    link: '/ent/annonces',
  },
  {
    id: 37,
    label: 'Deals & Promos',
    icon: 'ri-price-tag-3-line',
    link: '/ent/deals',
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
    link: '/ent/reclamations',
  },
];
