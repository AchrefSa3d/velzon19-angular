import { Component, OnInit, OnDestroy, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

@Component({
  selector: 'app-messages-user',
  templateUrl: './messages-user.component.html',
  styleUrls: ['./messages-user.component.scss'],
  standalone: false
})
export class MessagesUserComponent implements OnInit, OnDestroy, AfterViewChecked {

  @ViewChild('msgContainer') msgContainer!: ElementRef;

  breadCrumbItems = [
    { label: 'Mon Espace' },
    { label: 'Mes Messages', active: true }
  ];

  conversations: any[] = [];
  selectedConv: any    = null;
  messages: any[]      = [];
  newMessage           = '';
  searchTerm           = '';
  loading              = true;
  sending              = false;
  private shouldScroll = false;
  private pollTimer: any;
  currentUserId: number | null = null;

  constructor(private api: TijaraApiService) {}

  ngOnInit(): void {
    const raw = localStorage.getItem('currentUser');
    if (raw) { try { this.currentUserId = JSON.parse(raw).id; } catch {} }
    this.loadConversations();
    this.pollTimer = setInterval(() => this.pollMessages(), 8000);
  }

  ngOnDestroy(): void {
    if (this.pollTimer) clearInterval(this.pollTimer);
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) { this.scrollBottom(); this.shouldScroll = false; }
  }

  loadConversations(): void {
    this.api.getConversations().subscribe({
      next: (data: any[]) => {
        this.conversations = data;
        this.loading = false;
        if (data.length > 0 && !this.selectedConv) {
          this.selectConv(data[0]);
        }
      },
      error: () => { this.loading = false; }
    });
  }

  selectConv(conv: any): void {
    this.selectedConv = conv;
    this.messages = [];
    this.loadMessages(conv.id);
  }

  loadMessages(convId: number): void {
    this.api.getConversationMessages(convId).subscribe({
      next: (res: any) => {
        this.messages = res.messages || [];
        this.shouldScroll = true;
        const c = this.conversations.find(c => c.id === convId);
        if (c) c.unread_count = 0;
      }
    });
  }

  pollMessages(): void {
    if (!this.selectedConv) return;
    this.api.getConversationMessages(this.selectedConv.id).subscribe({
      next: (res: any) => {
        const newMsgs = res.messages || [];
        if (newMsgs.length !== this.messages.length) {
          this.messages = newMsgs;
          this.shouldScroll = true;
        }
      }
    });
  }

  sendMessage(): void {
    const text = this.newMessage.trim();
    if (!text || !this.selectedConv || this.sending) return;
    this.sending = true;
    this.api.sendMessage(this.selectedConv.id, text).subscribe({
      next: (msg: any) => {
        this.messages.push(msg);
        this.newMessage   = '';
        this.sending      = false;
        this.shouldScroll = true;
        const c = this.conversations.find(c => c.id === this.selectedConv.id);
        if (c) c.last_message = text;
      },
      error: () => { this.sending = false; }
    });
  }

  onEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  get filteredConversations(): any[] {
    if (!this.searchTerm.trim()) return this.conversations;
    const t = this.searchTerm.toLowerCase();
    return this.conversations.filter(c =>
      c.vendor_name?.toLowerCase().includes(t) ||
      c.product_name?.toLowerCase().includes(t) ||
      c.last_message?.toLowerCase().includes(t)
    );
  }

  get totalUnread(): number {
    return this.conversations.reduce((s, c) => s + (c.unread_count || 0), 0);
  }

  isMyMessage(msg: any): boolean {
    return msg.sender_id === this.currentUserId;
  }

  getOtherName(conv: any): string {
    return conv.vendor_name || conv.vendor_email || 'Vendeur';
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase();
  }

  getAvatarColor(idx: number): string {
    const colors = ['#405189','#0ab39c','#f7b84b','#f06548','#299cdb'];
    return colors[idx % colors.length];
  }

  private scrollBottom(): void {
    try {
      const el = this.msgContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }
}
