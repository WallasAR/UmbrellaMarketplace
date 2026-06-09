import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'info';
  text: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  messages = signal<ToastMessage[]>([]);
  private counter = 0;

  show(text: string, type: ToastMessage['type'] = 'info') {
    const id = ++this.counter;
    this.messages.update((items) => [...items, { id, type, text }]);
    setTimeout(() => this.dismiss(id), 4000);
  }

  dismiss(id: number) {
    this.messages.update((items) => items.filter((item) => item.id !== id));
  }
}
