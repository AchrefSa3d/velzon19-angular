import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';

interface Message {
  id: number;
  from: 'client' | 'vendor';
  text: string;
  time: string;
  read: boolean;
}

interface Conversation {
  id: number;
  clientName: string;
  clientEmail: string;
  avatar: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  product: string;
  messages: Message[];
}

@Component({
  selector: 'app-messages-ent',
  templateUrl: './messages-ent.component.html',
  styleUrls: ['./messages-ent.component.scss'],
  standalone: false
})
export class MessagesEntComponent implements OnInit, AfterViewChecked {

  @ViewChild('msgContainer') msgContainer!: ElementRef;

  breadCrumbItems = [
    { label: 'Vendeur' },
    { label: 'Messages', active: true }
  ];

  searchTerm = '';
  newMessage = '';
  selectedConv: Conversation | null = null;
  private shouldScroll = false;

  conversations: Conversation[] = [
    {
      id: 1,
      clientName: 'Amine Touati',
      clientEmail: 'user@tijara.tn',
      avatar: 'AT',
      product: 'Écouteurs Bluetooth Pro',
      lastMessage: 'Bonjour, est-ce que cet article est encore disponible ?',
      lastTime: '09:42',
      unread: 2,
      messages: [
        { id: 1, from: 'client', text: 'Bonjour, est-ce que les écouteurs sont encore disponibles ?', time: '09:40', read: true },
        { id: 2, from: 'client', text: 'Bonjour, est-ce que cet article est encore disponible ?', time: '09:42', read: false },
      ]
    },
    {
      id: 2,
      clientName: 'Ghaith Slimi',
      clientEmail: 'ghaith@gmail.com',
      avatar: 'GS',
      product: 'Smartphone 128GB',
      lastMessage: 'Merci pour la livraison rapide !',
      lastTime: 'Hier',
      unread: 0,
      messages: [
        { id: 1, from: 'client', text: 'Bonjour, quel est le délai de livraison pour Sousse ?', time: '14:10', read: true },
        { id: 2, from: 'vendor', text: 'Bonjour Ghaith ! La livraison à Sousse prend 24 à 48h.', time: '14:25', read: true },
        { id: 3, from: 'client', text: 'Parfait, je passe commande maintenant.', time: '14:30', read: true },
        { id: 4, from: 'vendor', text: 'Votre commande TJR-003 est confirmée. Bon shopping !', time: '14:32', read: true },
        { id: 5, from: 'client', text: 'Merci pour la livraison rapide !', time: 'Hier', read: true },
      ]
    },
    {
      id: 3,
      clientName: 'Inès Karray',
      clientEmail: 'ines@gmail.com',
      avatar: 'IK',
      product: 'Montre Connectée Sport',
      lastMessage: 'Avez-vous ce modèle en noir ?',
      lastTime: 'Hier',
      unread: 1,
      messages: [
        { id: 1, from: 'client', text: 'Avez-vous ce modèle en noir ?', time: 'Hier', read: false },
      ]
    },
    {
      id: 4,
      clientName: 'Maroua Ben Salah',
      clientEmail: 'maroua@gmail.com',
      avatar: 'MB',
      product: 'Smartphone 128GB',
      lastMessage: 'Le produit est conforme à la description, bravo !',
      lastTime: 'Lun',
      unread: 0,
      messages: [
        { id: 1, from: 'client', text: 'Bonjour, c\'est possible de payer à la livraison ?', time: 'Lun 10:00', read: true },
        { id: 2, from: 'vendor', text: 'Bonjour ! Oui, nous acceptons le paiement à la livraison partout en Tunisie.', time: 'Lun 10:15', read: true },
        { id: 3, from: 'client', text: 'Super, je commande tout de suite.', time: 'Lun 10:18', read: true },
        { id: 4, from: 'client', text: 'Le produit est conforme à la description, bravo !', time: 'Lun 16:30', read: true },
      ]
    },
  ];

  get filteredConversations(): Conversation[] {
    if (!this.searchTerm.trim()) return this.conversations;
    const t = this.searchTerm.toLowerCase();
    return this.conversations.filter(c =>
      c.clientName.toLowerCase().includes(t) ||
      c.product.toLowerCase().includes(t) ||
      c.lastMessage.toLowerCase().includes(t)
    );
  }

  get totalUnread(): number {
    return this.conversations.reduce((s, c) => s + c.unread, 0);
  }

  ngOnInit(): void {
    this.selectedConv = this.conversations[1]; // ouvrir la 2ème conv par défaut
    this.markRead(this.selectedConv);
    this.loadFromStorage();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollBottom();
      this.shouldScroll = false;
    }
  }

  selectConv(conv: Conversation): void {
    this.selectedConv = conv;
    this.markRead(conv);
    this.shouldScroll = true;
  }

  markRead(conv: Conversation): void {
    conv.messages.forEach(m => m.read = true);
    conv.unread = 0;
  }

  sendMessage(): void {
    const text = this.newMessage.trim();
    if (!text || !this.selectedConv) return;

    const now = new Date();
    const time = now.getHours() + ':' + now.getMinutes().toString().padStart(2, '0');

    this.selectedConv.messages.push({
      id: Date.now(),
      from: 'vendor',
      text,
      time,
      read: true
    });
    this.selectedConv.lastMessage = text;
    this.selectedConv.lastTime = time;
    this.newMessage = '';
    this.shouldScroll = true;
    this.saveToStorage();

    // Auto-réponse client
    setTimeout(() => {
      const replies = [
        'Merci pour votre réponse rapide !',
        'D\'accord, je vais passer commande.',
        'Parfait, merci beaucoup !',
        'Très bien, je vous recontacte si besoin.',
      ];
      const reply = replies[Math.floor(Math.random() * replies.length)];
      this.selectedConv!.messages.push({
        id: Date.now() + 1,
        from: 'client',
        text: reply,
        time: new Date().getHours() + ':' + new Date().getMinutes().toString().padStart(2, '0'),
        read: true
      });
      this.selectedConv!.lastMessage = reply;
      this.shouldScroll = true;
      this.saveToStorage();
    }, 1500);
  }

  onEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private scrollBottom(): void {
    try {
      const el = this.msgContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }

  private saveToStorage(): void {
    sessionStorage.setItem('tijara_vendor_chats', JSON.stringify(this.conversations));
  }

  private loadFromStorage(): void {
    const stored = sessionStorage.getItem('tijara_vendor_chats');
    if (stored) {
      try { this.conversations = JSON.parse(stored); } catch {}
    }
  }

  getAvatarColor(idx: number): string {
    const colors = ['#405189', '#0ab39c', '#f7b84b', '#f06548', '#299cdb'];
    return colors[idx % colors.length];
  }
}
