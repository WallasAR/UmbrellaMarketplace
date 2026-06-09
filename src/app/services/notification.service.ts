import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
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

  async enablePushNotifications(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return false;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;

    const { publicKey } = await firstValueFrom(
      this.http.get<{ publicKey: string | null }>(`${environment.apiUrl}/notifications/vapid-public-key`)
    );

    if (!publicKey) return false;

    const registration = await navigator.serviceWorker.register('/sw.js');
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.urlBase64ToUint8Array(publicKey)
    });

    await firstValueFrom(
      this.http.post(`${environment.apiUrl}/notifications/push-subscribe`, subscription.toJSON())
    );

    return true;
  }

  private urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64);
    return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
  }
}
