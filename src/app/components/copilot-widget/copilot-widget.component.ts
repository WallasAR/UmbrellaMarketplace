import { Component, OnInit, signal } from '@angular/core';
import { CopilotMessage, CopilotResponse, CopilotService, CopilotSession } from '../../services/copilot.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Router } from '@angular/router';
import { Product } from '../../models/product.model';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  products?: Product[];
  canAddToCart?: boolean;
}

@Component({
  selector: 'app-copilot-widget',
  standalone: false,
  templateUrl: './copilot-widget.component.html',
  styleUrl: './copilot-widget.component.css'
})
export class CopilotWidgetComponent implements OnInit {
  open = signal(false);
  showHistory = false;
  loading = false;
  input = '';
  scanMode = false;
  prescriptionText = '';
  sessionId?: string;
  sessions: CopilotSession[] = [];
  lastScanProducts: Product[] = [];
  messages: ChatMessage[] = [
    { role: 'assistant', text: 'Olá! Posso ajudar com sintomas, busca de medicamentos ou leitura de receita.' }
  ];

  constructor(
    private copilotService: CopilotService,
    private cartService: CartService,
    private authService: AuthService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.authService.getToken()) {
      this.loadSessions();
    }
  }

  toggle() {
    this.open.update((value) => !value);
    if (this.open() && this.authService.getToken()) {
      this.loadSessions();
    }
  }

  loadSessions() {
    this.copilotService.listSessions().subscribe({
      next: (items) => this.sessions = items ?? [],
      error: () => this.sessions = []
    });
  }

  startNewSession() {
    this.sessionId = undefined;
    this.lastScanProducts = [];
    this.messages = [
      { role: 'assistant', text: 'Nova conversa iniciada. Como posso ajudar?' }
    ];
  }

  openSession(session: CopilotSession) {
    this.sessionId = session.id;
    this.showHistory = false;
    this.loading = true;

    this.copilotService.getSessionMessages(session.id).subscribe({
      next: (items) => {
        this.messages = (items ?? []).map((msg) => this.mapStoredMessage(msg));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private mapStoredMessage(msg: CopilotMessage): ChatMessage {
    const products = (msg.metadata?.products || []) as Product[];
    return {
      role: msg.role,
      text: msg.content,
      products: products.length ? products as Product[] : undefined,
      canAddToCart: msg.role === 'assistant' && products.length > 0
    };
  }

  send() {
    if (!this.input.trim() || this.loading) return;
    if (!this.requireAuth()) return;

    const message = this.input.trim();
    this.messages.push({ role: 'user', text: message });
    this.input = '';
    this.loading = true;

    this.copilotService.chat(message, this.sessionId).subscribe({
      next: (res) => this.handleResponse(res),
      error: () => {
        this.loading = false;
        this.messages.push({ role: 'assistant', text: 'Não foi possível processar sua mensagem agora.' });
      }
    });
  }

  scanPrescription() {
    if (!this.prescriptionText.trim() || this.loading) return;
    if (!this.requireAuth()) return;

    this.loading = true;
    this.messages.push({ role: 'user', text: 'Escanear receita (texto colado)' });

    this.copilotService.scanPrescription({
      text: this.prescriptionText.trim(),
      session_id: this.sessionId
    }).subscribe({
      next: (res) => {
        this.scanMode = false;
        this.prescriptionText = '';
        this.handleResponse(res, true);
      },
      error: () => {
        this.loading = false;
        this.messages.push({ role: 'assistant', text: 'Não foi possível ler a receita. Cole o texto dos medicamentos.' });
      }
    });
  }

  addScanToCart(products?: Product[]) {
    const items = (products || this.lastScanProducts).map((p) => ({
      medicine_id: p.id,
      quantity: 1
    }));

    if (!items.length) return;

    this.loading = true;
    this.copilotService.prescriptionToCart({ items }).subscribe({
      next: (res) => {
        this.loading = false;
        this.cartService.loadCart();
        this.toast.show(res.message, 'success');
        this.messages.push({
          role: 'assistant',
          text: `${res.message}. Você pode ir ao carrinho para finalizar.`
        });
      },
      error: () => {
        this.loading = false;
        this.toast.show('Não foi possível adicionar os itens ao carrinho.', 'error');
      }
    });
  }

  private requireAuth(): boolean {
    if (!this.authService.getToken()) {
      this.router.navigate(['/auth']);
      return false;
    }
    return true;
  }

  private handleResponse(res: CopilotResponse, fromScan = false) {
    this.loading = false;
    if (res.session_id) this.sessionId = res.session_id;
    if (fromScan && res.products?.length) this.lastScanProducts = res.products;

    this.messages.push({
      role: 'assistant',
      text: res.reply,
      products: res.products,
      canAddToCart: fromScan && !!res.products?.length
    });

    this.loadSessions();
  }
}
