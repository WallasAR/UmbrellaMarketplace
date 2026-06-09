import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Subscription {
  id: string;
  medicine_id: number;
  quantity: number;
  status: string;
  interval_days: number;
  next_delivery_at?: string;
  Medicine?: {
    id: number;
    name: string;
    price: number;
    discount: number;
    Images?: { thumb_img: string }[];
  };
}

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  constructor(private http: HttpClient) {}

  list(): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(`${environment.apiUrl}/subscriptions`);
  }

  subscribe(medicineId: number, quantity = 1): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(`${environment.apiUrl}/subscriptions/medicine/${medicineId}`, { quantity });
  }

  cancel(id: string) {
    return this.http.delete(`${environment.apiUrl}/subscriptions/${id}`);
  }
}
