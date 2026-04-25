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
  {
    id: 12,
    label: 'Marques',
    icon: 'ri-price-tag-3-line',
    link: '/admin/brands',
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
  {
    id: 53,
    label: 'Deals',
    icon: 'ri-price-tag-3-line',
    link: '/admin/deals',
  },
  {
    id: 54,
    label: 'Gagnants',
    icon: 'ri-trophy-line',
    link: '/admin/winners',
  },

  // ─── INTELLIGENCE ARTIFICIELLE ───────────────────────────────────────────
  {
    id: 60,
    label: 'Intelligence Artificielle',
    isTitle: true
  },
  {
    id: 61,
    label: 'Dashboard IA',
    icon: 'ri-robot-line',
    link: '/admin/ia',
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

  // ─── RÉFÉRENTIEL ──────────────────────────────────────────────────────────
  {
    id: 80,
    label: 'Référentiel',
    isTitle: true
  },
  {
    id: 81,
    label: 'Pays',
    icon: 'ri-flag-2-line',
    link: '/admin/countries',
  },
  {
    id: 82,
    label: 'Villes',
    icon: 'ri-building-line',
    link: '/admin/cities',
  },
  {
    id: 83,
    label: 'Causes de réclamation',
    icon: 'ri-error-warning-line',
    link: '/admin/causes',
  },

  // ─── MARKETING & PROMOTIONS ───────────────────────────────────────────────
  {
    id: 90,
    label: 'Marketing',
    isTitle: true
  },
  {
    id: 91,
    label: 'Coupons',
    icon: 'ri-coupon-2-line',
    link: '/admin/coupons',
  },
  {
    id: 92,
    label: 'Prix & cadeaux',
    icon: 'ri-gift-line',
    link: '/admin/prizes',
  },
  {
    id: 93,
    label: 'Packs Boost Ads',
    icon: 'ri-rocket-2-line',
    link: '/admin/boost-packs',
  },

  // ─── LOGISTIQUE & FINANCE (LOT 3 + 6) ─────────────────────────────────────
  { id: 100, label: 'Logistique & Finance', isTitle: true },
  { id: 101, label: 'Transporteurs', icon: 'ri-truck-line',       link: '/admin/transports'  },
  { id: 102, label: 'Livraisons',    icon: 'ri-route-line',       link: '/admin/deliveries'  },
  { id: 103, label: 'Paiements',     icon: 'ri-bank-card-line',   link: '/admin/payments'    },
  { id: 104, label: 'Factures',      icon: 'ri-file-text-line',   link: '/admin/invoices'    },
  { id: 105, label: 'Rapports',      icon: 'ri-line-chart-line',  link: '/admin/reports'     },

  // ─── SÉCURITÉ ─────────────────────────────────────────────────────────────
  { id: 110, label: 'Sécurité', isTitle: true },
  { id: 111, label: 'Permissions', icon: 'ri-shield-keyhole-line', link: '/admin/permissions' },

  // ─── CONFIGURATION ────────────────────────────────────────────────────────
  { id: 70, label: 'Configuration', isTitle: true },
  { id: 71, label: 'Paramètres',    icon: 'ri-settings-3-line',   link: '/admin/settings'    },
];
