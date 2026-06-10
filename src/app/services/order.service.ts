import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Order, OrderGroup } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private http: HttpClient) {}

  listOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${environment.apiUrl}/orders`);
  }

  listOrderGroups(): Observable<OrderGroup[]> {
    return this.http.get<OrderGroup[]>(`${environment.apiUrl}/orders/groups`);
  }

  getOrder(sessionId: string): Observable<Order> {
    return this.http.get<Order>(`${environment.apiUrl}/orders/${sessionId}`);
  }
}
