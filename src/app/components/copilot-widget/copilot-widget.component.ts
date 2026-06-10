import { Component, signal } from '@angular/core';
import { CopilotService, CopilotResponse } from '../../services/copilot.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Product } from '../../models/product.model';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  products?: Product[];
}

@Component({
  selector: 'app-copilot-widget',
  standalone: false,
  templateUrl: './copilot-widget.component.html',
  styleUrl: './copilot-widget.component.css'
})
export class CopilotWidgetComponent {
  open = signal(false);
  loading = false;
  input = '';
  scanMode = false;
  prescriptionText = '';
  messages: ChatMessage[] = [
    { role: 'assistant', text: 'Olá! Posso ajudar com sintomas, busca de medicamentos ou leitura de receita.' }
  ];

  constructor(
    private copilotService: CopilotService,
    private authService: AuthService,
    private router: Router
  ) {}

  toggle() {
    this.open.update((value) => !value);
  }

  send() {
    if (!this.input.trim() || this.loading) return;

    if (!this.authService.getToken()) {
      this.router.navigate(['/auth']);
      return;
    }

    const message = this.input.trim();
    this.messages.push({ role: 'user', text: message });
    this.input = '';
    this.loading = true;

    this.copilotService.chat(message).subscribe({
      next: (res) => this.handleResponse(res),
      error: () => {
        this.loading = false;
        this.messages.push({ role: 'assistant', text: 'Não foi possível processar sua mensagem agora.' });
      }
    });
  }

  scanPrescription() {
    if (!this.prescriptionText.trim() || this.loading) return;

    if (!this.authService.getToken()) {
      this.router.navigate(['/auth']);
      return;
    }

    this.loading = true;
    this.messages.push({ role: 'user', text: 'Escanear receita (texto colado)' });

    this.copilotService.scanPrescription({ text: this.prescriptionText.trim() }).subscribe({
      next: (res) => {
        this.scanMode = false;
        this.prescriptionText = '';
        this.handleResponse(res);
      },
      error: () => {
        this.loading = false;
        this.messages.push({ role: 'assistant', text: 'Não foi possível ler a receita. Cole o texto dos medicamentos.' });
      }
    });
  }

  private handleResponse(res: CopilotResponse) {
    this.loading = false;
    this.messages.push({
      role: 'assistant',
      text: res.reply,
      products: res.products
    });
  }
}
