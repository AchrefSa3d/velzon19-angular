import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [

  // ═══════════════════════════════════════════════════════════════════════
  // 🏠 PILOTAGE
  // ═══════════════════════════════════════════════════════════════════════
  { id: 1, label: 'Pilotage', isTitle: true },
  {
    id: 2,
    label: 'Tableau de bord',
    icon: 'ri-dashboard-2-line',
    link: '/ent/dashboard',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 📦 CATALOGUE
  // ═══════════════════════════════════════════════════════════════════════
  { id: 10, label: 'Catalogue', isTitle: true },
  {
    id: 11,
    label: 'Mes produits',
    icon: 'ri-shopping-bag-3-line',
    subItems: [
      { id: 111, label: 'Tous mes produits',  link: '/ent/products',                  parentId: 11 },
      { id: 112, label: 'Ajouter un produit', link: '/ent/products?action=add', parentId: 11 },
    ],
  },
  {
    id: 12,
    label: 'Annonces & Deals',
    icon: 'ri-megaphone-line',
    badge: { variant: 'bg-info-subtle text-info', text: 'PROMO' },
    subItems: [
      { id: 121, label: 'Mes annonces',     icon: 'ri-article-line',     link: '/ent/annonces', parentId: 12 },
      { id: 122, label: 'Deals & promos',   icon: 'ri-flashlight-line',  link: '/ent/deals',    parentId: 12 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 🛒 VENTES
  // ═══════════════════════════════════════════════════════════════════════
  { id: 20, label: 'Ventes & Logistique', isTitle: true },
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
    label: 'Facturation',
    icon: 'ri-file-text-line',
    link: '/ent/invoices',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 🚀 MARKETING
  // ═══════════════════════════════════════════════════════════════════════
  { id: 30, label: 'Marketing & Visibilité', isTitle: true },
  {
    id: 31,
    label: 'Packs Boost',
    icon: 'ri-rocket-2-line',
    badge: { variant: 'bg-danger-subtle text-danger', text: 'NEW' },
    link: '/ent/boost-packs',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 💬 COMMUNAUTÉ
  // ═══════════════════════════════════════════════════════════════════════
  { id: 40, label: 'Communauté', isTitle: true },
  {
    id: 41,
    label: 'Messagerie',
    icon: 'ri-chat-3-line',
    link: '/ent/messages',
  },
  {
    id: 42,
    label: 'Mes abonnés',
    icon: 'ri-user-heart-line',
    link: '/ent/followers',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 👤 MON COMPTE
  // ═══════════════════════════════════════════════════════════════════════
  { id: 50, label: 'Mon compte', isTitle: true },
  {
    id: 51,
    label: 'Profil boutique',
    icon: 'ri-store-2-line',
    link: '/ent/profile',
  },
  {
    id: 52,
    label: 'Réclamations',
    icon: 'ri-customer-service-2-line',
    link: '/ent/reclamations',
  },
];
