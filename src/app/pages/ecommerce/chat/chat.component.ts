import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';

interface Message {
  from: 'user' | 'vendor';
  text: string;
  time: string;
}

interface Vendor {
  id: number;
  name: string;
  shop: string;
  avatar: string;
  category: string;
  online: boolean;
  messages: Message[];
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  standalone: false
})
export class ChatComponent implements OnInit {

  breadCrumbItems = [
    { label: 'Boutique', link: '/shop/products' },
    { label: 'Chat Vendeurs', active: true }
  ];

  currentUser: any = {};
  newMessage = '';
  activeVendorId = 1;

  vendors: Vendor[] = [
    {
      id: 1, name: 'Achraf Saad', shop: 'TechTunis', avatar: 'AS',
      category: 'Électronique', online: true,
      messages: [
        { from: 'vendor', text: 'Bonjour ! Comment puis-je vous aider ?', time: '10:00' },
      ]
    },
    {
      id: 2, name: 'Aziz Tarchoun', shop: 'ModeTN', avatar: 'AT',
      category: 'Mode', online: true,
      messages: [
        { from: 'vendor', text: 'Bienvenue sur ModeTN ! Nos nouvelles collections sont arrivées.', time: '09:30' },
      ]
    },
    {
      id: 3, name: 'Ghaith Slimi', shop: 'SportZone', avatar: 'GS',
      category: 'Sport', online: false,
      messages: [
        { from: 'vendor', text: 'Bonjour, je suis actuellement hors ligne. Je vous répondrai dès que possible.', time: 'Hier' },
      ]
    },
    {
      id: 4, name: 'Amine Touati', shop: 'MaisonDeco', avatar: 'AM',
      category: 'Maison', online: true,
      messages: [
        { from: 'vendor', text: 'Bonjour ! Nous avons de nouvelles promotions sur les meubles cette semaine.', time: '08:15' },
      ]
    },
  ];

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  ngOnInit(): void {
    const stored = sessionStorage.getItem('currentUser');
    this.currentUser = stored ? JSON.parse(stored) : { firstName: 'Vous' };

    // Charger les messages sauvegardés
    const savedChats = sessionStorage.getItem('tijara_chats');
    if (savedChats) {
      const chats = JSON.parse(savedChats);
      this.vendors.forEach(v => {
        if (chats[v.id]) v.messages = chats[v.id];
      });
    }
  }

  get activeVendor(): Vendor {
    return this.vendors.find(v => v.id === this.activeVendorId)!;
  }

  selectVendor(id: number) {
    this.activeVendorId = id;
    setTimeout(() => this.scrollBottom(), 50);
  }

  sendMessage() {
    const text = this.newMessage.trim();
    if (!text || !this.activeVendor) return;

    const now = new Date();
    const time = now.getHours() + ':' + now.getMinutes().toString().padStart(2, '0');

    this.activeVendor.messages.push({ from: 'user', text, time });
    this.newMessage = '';
    this.saveChats();
    setTimeout(() => this.scrollBottom(), 50);

    // Réponse automatique du vendeur
    setTimeout(() => {
      const responses = [
        'Merci pour votre message ! Je vous réponds dans les plus brefs délais.',
        'Bien reçu ! Pouvez-vous me donner plus de détails ?',
        'Bonjour ! Oui, ce produit est disponible. Souhaitez-vous commander ?',
        'Nous pouvons vous livrer sous 2-3 jours ouvrables sur Tunis.',
        'Ce produit est en stock. Le prix affiché inclut la TVA.',
      ];
      const resp = responses[Math.floor(Math.random() * responses.length)];
      const respTime = new Date();
      this.activeVendor.messages.push({
        from: 'vendor',
        text: resp,
        time: respTime.getHours() + ':' + respTime.getMinutes().toString().padStart(2, '0')
      });
      this.saveChats();
      setTimeout(() => this.scrollBottom(), 50);
    }, 1200);
  }

  saveChats() {
    const chats: any = {};
    this.vendors.forEach(v => { chats[v.id] = v.messages; });
    sessionStorage.setItem('tijara_chats', JSON.stringify(chats));
  }

  scrollBottom() {
    if (this.messagesContainer) {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  onEnter(event: Event) {
    event.preventDefault();
    this.sendMessage();
  }

  get lastMessage(): (v: Vendor) => string {
    return (v: Vendor) =>
      v.messages.length > 0 ? v.messages[v.messages.length - 1].text : '';
  }

  clearChat() {
    if (this.activeVendor) {
      this.activeVendor.messages = [];
      this.saveChats();
    }
  }
}
