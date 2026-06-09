import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  items = signal<AppNotification[]>([]);

  constructor(private http: HttpClient) {}

  load() {
    this.http.get<AppNotification[]>(`${environment.apiUrl}/notifications`).subscribe({
      next: (items) => this.items.set(items ?? []),
      error: () => this.items.set([])
    });
  }

  markRead(id: string) {
    this.http.patch(`${environment.apiUrl}/notifications/${id}/read`, {}).subscribe(() => this.load());
  }

  unreadCount() {
    return this.items().filter((item) => !item.read).length;
  }
}
